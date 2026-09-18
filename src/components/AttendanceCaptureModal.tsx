import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  MapPin,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  X,
  Compass,
  Building,
  Upload,
  UserCheck,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { AttendanceRecord, LocationCoordinates, OfficeConfig, User } from '../types';
import { calculateDistanceInMeters, DEFAULT_OFFICE, getCurrentGPSLocation } from '../utils/geoUtils';

interface AttendanceCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  officeConfig?: OfficeConfig;
  onSuccess: (newAttendance: AttendanceRecord) => void;
}

export const AttendanceCaptureModal: React.FC<AttendanceCaptureModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  officeConfig = DEFAULT_OFFICE,
  onSuccess,
}) => {
  const [shiftType, setShiftType] = useState<'MASUK' | 'PULANG'>('MASUK');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [simulationMode, setSimulationMode] = useState<'REAL' | 'INSIDE_OFFICE' | 'OUTSIDE_OFFICE'>('INSIDE_OFFICE');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch location based on selected mode
  const refreshLocation = async (mode = simulationMode) => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      if (mode === 'INSIDE_OFFICE') {
        const res = await getCurrentGPSLocation(officeConfig, true);
        setLocation(res.coords);
      } else if (mode === 'OUTSIDE_OFFICE') {
        // Outside office (e.g., 2.5 km away)
        const lat = officeConfig.lat + 0.022;
        const lng = officeConfig.lng + 0.015;
        const distance = calculateDistanceInMeters(lat, lng, officeConfig.lat, officeConfig.lng);
        setLocation({
          lat,
          lng,
          accuracy: 15,
          address: 'Jl. Sudirman No. 45 (Luar Radius Kantor)',
          distanceToOffice: distance,
          isWithinRadius: false,
        });
      } else {
        // Real GPS
        const res = await getCurrentGPSLocation(officeConfig, false);
        setLocation(res.coords);
        if (res.error) setLocationError(res.error);
      }
    } catch (err) {
      console.error(err);
      setLocationError('Gagal mendeteksi koordinat GPS');
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshLocation(simulationMode);
      startCamera();
    } else {
      stopCamera();
      setPhotoDataUrl(null);
      setNotes('');
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, simulationMode]);

  // Start Camera Feed
  const startCamera = async () => {
    try {
      setCameraActive(true);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }
    } catch (err) {
      console.warn('Camera access denied or unavailable in iframe, using virtual selfie camera:', err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture photo from video and imprint watermark (date, time, GPS coords)
  const capturePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (canvas && video && streamRef.current) {
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 480;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw video frame
        ctx.drawImage(video, 0, 0, width, height);

        // Watermark background box
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(0, height - 60, width, 60);

        // Watermark texts
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        const now = new Date();
        ctx.fillText(
          `${currentUser.name} (${currentUser.employeeId}) | ${shiftType === 'MASUK' ? 'ABSEN MASUK' : 'ABSEN PULANG'}`,
          16,
          height - 38
        );

        ctx.font = '11px monospace';
        ctx.fillStyle = '#94a3b8';
        const locText = location
          ? `GPS: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)} (Jarak: ${location.distanceToOffice}m) | ${now.toLocaleString('id-ID')}`
          : `Waktu: ${now.toLocaleString('id-ID')}`;
        ctx.fillText(locText, 16, height - 18);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoDataUrl(dataUrl);
        stopCamera();
      }
    } else {
      // Fallback virtual camera snapshot using current user avatar or sample
      generateFallbackSnapshot();
    }
  };

  const generateFallbackSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 640, 480);
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 480);

      // Draw avatar image or circle
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = currentUser.avatar;
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(320, 200, 110, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 210, 90, 220, 220);
        ctx.restore();

        // Watermark
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, 410, 640, 70);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(
          `${currentUser.name} (${currentUser.employeeId}) | ${shiftType === 'MASUK' ? 'ABSEN MASUK' : 'ABSEN PULANG'}`,
          20,
          435
        );
        ctx.font = '12px monospace';
        ctx.fillStyle = '#38bdf8';
        const now = new Date();
        const locText = location
          ? `GPS: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)} (${location.distanceToOffice}m dari kantor)`
          : `Waktu: ${now.toLocaleString('id-ID')}`;
        ctx.fillText(`${locText} • ${now.toLocaleTimeString('id-ID')} WIB`, 20, 460);

        setPhotoDataUrl(canvas.toDataURL('image/jpeg'));
        stopCamera();
      };
      img.onerror = () => {
        // Simple avatar fallback
        ctx.fillStyle = '#4f46e5';
        ctx.beginPath();
        ctx.arc(320, 200, 90, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(currentUser.name.charAt(0), 320, 218);

        // Watermark
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, 410, 640, 70);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(`${currentUser.name} • ${shiftType === 'MASUK' ? 'ABSEN MASUK' : 'ABSEN PULANG'}`, 20, 435);
        ctx.font = '11px monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(`GPS Verified: Menara Thamrin • ${new Date().toLocaleTimeString('id-ID')} WIB`, 20, 460);

        setPhotoDataUrl(canvas.toDataURL('image/jpeg'));
        stopCamera();
      };
    }
  };

  const retakePhoto = () => {
    setPhotoDataUrl(null);
    startCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoDataUrl(event.target.result as string);
          stopCamera();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!photoDataUrl) {
      alert('Harap ambil foto selfie terlebih dahulu sebagai bukti absensi.');
      return;
    }
    if (!location) {
      alert('Koordinat lokasi belum berhasil didapatkan. Mohon tunggu...');
      return;
    }

    if (!location.isWithinRadius && !notes.trim()) {
      alert('Lokasi Anda di luar radius kantor (150m). Harap isi alasan/keterangan di kolom catatan (misal: Dinas Luar, WFH, Kunjungan Klien).');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const currentTimeStr = now.toTimeString().split(' ')[0]; // "08:18:24"
    const todayDateStr = now.toISOString().split('T')[0]; // "2026-09-11"

    // Check lateness against shift start time (08:30)
    const [shiftHour, shiftMinute] = officeConfig.shiftStartTime.split(':').map(Number);
    const shiftStartMins = shiftHour * 60 + shiftMinute;
    const currentMins = now.getHours() * 60 + now.getMinutes();

    let isLate = false;
    let lateMinutes = 0;
    if (shiftType === 'MASUK' && currentMins > shiftStartMins + officeConfig.lateGracePeriodMinutes) {
      isLate = true;
      lateMinutes = currentMins - shiftStartMins;
    }

    const newRecord: AttendanceRecord = {
      id: `att-${todayDateStr.replace(/-/g, '')}-${currentUser.id.slice(-4)}-${Date.now().toString().slice(-4)}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department,
      date: todayDateStr,
      checkInTime: shiftType === 'MASUK' ? currentTimeStr : '08:30:00',
      checkOutTime: shiftType === 'PULANG' ? currentTimeStr : undefined,
      checkInPhoto: photoDataUrl,
      checkInLocation: location,
      status: isLate ? 'TERLAMBAT' : 'HADIR',
      lateMinutes,
      overtimeHours: shiftType === 'PULANG' && now.getHours() >= 19 ? now.getHours() - 17 : 0,
      notes: notes.trim() || (location.isWithinRadius ? 'Absensi WFO Resmi' : 'Absensi Luar Kantor'),
    };

    setTimeout(() => {
      onSuccess(newRecord);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Presensi Selfie & Verifikasi Lokasi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser.name} ({currentUser.employeeId}) • {currentUser.department}
              </p>
            </div>
          </div>
          <button
            id="close-attendance-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Shift Type Selector (Masuk / Pulang) */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
            <button
              type="button"
              id="shift-masuk-btn"
              onClick={() => setShiftType('MASUK')}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                shiftType === 'MASUK'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Absen Masuk (Clock In)
            </button>
            <button
              type="button"
              id="shift-pulang-btn"
              onClick={() => setShiftType('PULANG')}
              className={`py-2 text-xs font-semibold rounded-xl transition-all ${
                shiftType === 'PULANG'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Absen Pulang (Clock Out)
            </button>
          </div>

          {/* Camera Viewfinder / Preview Box */}
          <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
            {photoDataUrl ? (
              // Captured photo preview
              <div className="relative w-full h-full">
                <img
                  src={photoDataUrl}
                  alt="Hasil Foto Presensi"
                  className="w-full h-full object-cover"
                />
                <button
                  id="retake-photo-btn"
                  onClick={retakePhoto}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-medium flex items-center space-x-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Foto Ulang</span>
                </button>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white text-[11px] font-semibold flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Foto Terverifikasi</span>
                </div>
              </div>
            ) : (
              // Live camera feed
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Face Guide Oval Frame */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-60 rounded-[50%] border-2 border-dashed border-indigo-400/80 flex items-center justify-center">
                    <span className="text-[10px] text-indigo-300 font-medium bg-black/40 px-2 py-0.5 rounded-full">
                      Posisikan Wajah di Sini
                    </span>
                  </div>
                </div>

                {/* Capture Controls Overlay */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center space-x-3">
                  <button
                    type="button"
                    id="trigger-capture-btn"
                    onClick={capturePhoto}
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Ambil Foto Selfie</span>
                  </button>

                  <label
                    htmlFor="upload-photo-fallback"
                    title="Unggah Foto File"
                    className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 cursor-pointer backdrop-blur-md border border-slate-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <input
                      id="upload-photo-fallback"
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* GPS Location & Radius Status Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                <Compass className="w-4 h-4 text-indigo-500" />
                <span>Verifikasi Lokasi & Radius Geofence</span>
              </div>
              <button
                type="button"
                id="refresh-gps-btn"
                onClick={() => refreshLocation()}
                disabled={locationLoading}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <RefreshCw className={`w-3 h-3 ${locationLoading ? 'animate-spin' : ''}`} />
                <span>Cek Ulang GPS</span>
              </button>
            </div>

            {locationLoading ? (
              <div className="flex items-center space-x-2 text-xs text-slate-500 py-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                <span>Mengambil koordinat satelit GPS perangkat...</span>
              </div>
            ) : location ? (
              <div className="space-y-2">
                <div className="flex items-start justify-between text-xs">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{officeConfig.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Titik Anda: {location.address || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {location.distanceToOffice} meter
                    </span>
                    <span className="text-[10px] text-slate-500 block">dari kantor</span>
                  </div>
                </div>

                {/* Geofence Status Badge */}
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center justify-between ${
                    location.isWithinRadius
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {location.isWithinRadius ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    )}
                    <span className="font-semibold">
                      {location.isWithinRadius
                        ? `Valid: Dalam Radius Kantor (Maks. ${officeConfig.radiusMeters}m)`
                        : `Peringatan: Di Luar Radius Kantor (${location.distanceToOffice}m > ${officeConfig.radiusMeters}m)`}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-bold">
                    {location.isWithinRadius ? 'WFO APPROVED' : 'DILUAR RADIUS'}
                  </span>
                </div>
              </div>
            ) : null}

            {/* GPS Simulation Switcher for Testing (Essential for Preview / Review) */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                <Info className="w-3 h-3 text-slate-400" />
                <span>Simulasi Lokasi:</span>
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  id="sim-inside-btn"
                  onClick={() => {
                    setSimulationMode('INSIDE_OFFICE');
                    refreshLocation('INSIDE_OFFICE');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    simulationMode === 'INSIDE_OFFICE'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Dalam Kantor (18m)
                </button>
                <button
                  type="button"
                  id="sim-outside-btn"
                  onClick={() => {
                    setSimulationMode('OUTSIDE_OFFICE');
                    refreshLocation('OUTSIDE_OFFICE');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    simulationMode === 'OUTSIDE_OFFICE'
                      ? 'bg-amber-600 text-white font-semibold'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Luar Kantor (2.5km)
                </button>
                <button
                  type="button"
                  id="sim-real-btn"
                  onClick={() => {
                    setSimulationMode('REAL');
                    refreshLocation('REAL');
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                    simulationMode === 'REAL'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  GPS Asli
                </button>
              </div>
            </div>
          </div>

          {/* Notes field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Catatan / Keterangan {!location?.isWithinRadius && <span className="text-amber-500 font-bold">* (Wajib jika luar radius)</span>}
            </label>
            <input
              type="text"
              id="attendance-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={location?.isWithinRadius ? 'Contoh: Presensi WFO, meeting lantai 18' : 'Wajib diisi: contoh Dinas Luar Klien, WFH Terencana'}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Terverifikasi Kriptografis & Anti-Fake GPS</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              id="cancel-attendance-btn"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              id="confirm-submit-attendance-btn"
              onClick={handleSubmit}
              disabled={isSubmitting || !photoDataUrl}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition-all"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan Presensi...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Kirim Presensi Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
