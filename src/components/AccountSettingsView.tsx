import React, { useState, useRef } from 'react';
import {
  User as UserIcon,
  Upload,
  Camera,
  Check,
  Building,
  Phone,
  Mail,
  CreditCard,
  Shield,
  Briefcase,
  Sparkles,
  Save,
  RotateCcw,
} from 'lucide-react';
import { User } from '../types';

interface AccountSettingsViewProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

// Koleksi preset avatar profesional Indonesia untuk opsi instan
const PRESET_AVATARS = [
  {
    id: 'avatar-1',
    label: 'Pria Profesional (Jas)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-2',
    label: 'Wanita Profesional (Blazer)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-3',
    label: 'Pria Eksekutif',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-4',
    label: 'Wanita Kreatif',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-5',
    label: 'Pria Modern',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-6',
    label: 'Wanita Hijab Profesional',
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80',
  },
];

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({
  currentUser,
  onUpdateUser,
  onShowToast,
}) => {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone || '081234567890',
    avatar: currentUser.avatar,
    bankName: currentUser.bankName || 'BCA',
    accountNumber: currentUser.accountNumber || '8280192831',
    accountHolder: currentUser.accountHolder || currentUser.name,
  });

  const [avatarMode, setAvatarMode] = useState<'upload' | 'preset' | 'camera'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Tangani upload foto dari perangkat lokal
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Batasi ukuran file hingga 5MB
    if (file.size > 5 * 1024 * 1024) {
      onShowToast('Ukuran file foto maksimal 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({
          ...prev,
          avatar: reader.result as string,
        }));
        onShowToast('Foto profil berhasil diunggah! Klik Simpan untuk menerapkan.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  // Mulai kamera untuk foto profil langsung
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      onShowToast('Tidak dapat mengakses kamera perangkat. Silakan gunakan unggah foto.', 'error');
    }
  };

  // Ambil jepretan foto dari kamera
  const captureFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 400, 400);
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setFormData((prev) => ({
        ...prev,
        avatar: photoDataUrl,
      }));
      stopCamera();
      onShowToast('Foto berhasil dijepret dari kamera!', 'success');
    }
  };

  // Matikan kamera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Pilih avatar dari template
  const handleSelectPreset = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      avatar: url,
    }));
    onShowToast('Preset avatar dipilih!', 'info');
  };

  // Simpan perubahan ke akun
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      onShowToast('Nama lengkap tidak boleh kosong', 'error');
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      avatar: formData.avatar,
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      accountHolder: formData.accountHolder,
    };

    onUpdateUser(updatedUser);
    onShowToast('Pengaturan akun dan foto profil berhasil diperbarui!', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Halaman */}
      <div className="mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Pengaturan Akun & Profil
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Kelola foto profil, data pribadi, nomor kontak, dan informasi rekening pencairan gaji Anda.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bagian 1: Foto Profil Utama */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Foto Profil Akun</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Foto ini digunakan pada kartu karyawan, avatar di dashboard, dan verifikasi absensi harian.
          </p>

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Pratinjau Foto Profil */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <img
                  src={formData.avatar}
                  alt={formData.name}
                  className="w-36 h-36 rounded-3xl object-cover ring-4 ring-indigo-500/20 shadow-xl"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-950/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"
                  title="Klik untuk ganti foto"
                >
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-[11px] font-semibold">Ganti Foto</span>
                </button>
              </div>
              <span className="mt-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Pratinjau Foto Aktif
              </span>
            </div>

            {/* Kontrol Penggantian Foto */}
            <div className="flex-1 w-full">
              {/* Tab Metode Ganti Foto */}
              <div className="flex space-x-2 mb-4 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
                <button
                  type="button"
                  onClick={() => {
                    setAvatarMode('upload');
                    stopCamera();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    avatarMode === 'upload'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Unggah dari Perangkat
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarMode('preset');
                    stopCamera();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    avatarMode === 'preset'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Pilih dari Koleksi Avatar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarMode('camera');
                    startCamera();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    avatarMode === 'camera'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Ambil dengan Kamera
                </button>
              </div>

              {/* Mode: Unggah File */}
              {avatarMode === 'upload' && (
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="profile-photo-upload"
                  />
                  <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3">
                    <Upload className="w-6 h-6" />
                  </div>
                  <label
                    htmlFor="profile-photo-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors mb-2"
                  >
                    Pilih File Foto
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Format yang didukung: JPG, PNG, atau WebP (Maksimal 5MB).
                  </p>
                </div>
              )}

              {/* Mode: Preset Avatar */}
              {avatarMode === 'preset' && (
                <div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {PRESET_AVATARS.map((preset) => {
                      const isSelected = formData.avatar === preset.url;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleSelectPreset(preset.url)}
                          className={`relative group rounded-2xl overflow-hidden aspect-square border-2 transition-all ${
                            isSelected
                              ? 'border-indigo-600 ring-2 ring-indigo-500/30'
                              : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                              <Check className="w-5 h-5 text-white stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Pilih salah satu avatar profesional di atas untuk langsung mengganti foto profil Anda.
                  </p>
                </div>
              )}

              {/* Mode: Kamera */}
              {avatarMode === 'camera' && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/40">
                  {isCameraActive ? (
                    <div className="flex flex-col items-center">
                      <div className="relative w-64 h-64 rounded-2xl overflow-hidden bg-black mb-4 shadow-md">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={captureFromCamera}
                          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Jepret Foto Sekarang</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-300 transition-colors"
                        >
                          Tutup Kamera
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <button
                        type="button"
                        onClick={startCamera}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Buka Kamera Perangkat</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bagian 2: Data Informasi Pribadi */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center space-x-2">
            <UserIcon className="w-4 h-4 text-indigo-500" />
            <span>Informasi Identitas & Kontak</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Data ini digunakan untuk komunikasi internal, verifikasi slip gaji, dan dokumen kepegawaian.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Nama Lengkap
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Masukkan nama lengkap"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="nama@nusantaradigital.co.id"
                />
              </div>
            </div>

            {/* Nomor Telepon / WhatsApp */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Nomor Telepon / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="0812-xxxx-xxxx"
                />
              </div>
            </div>

            {/* Departemen & Jabatan (Read-Only) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Posisi & Departemen (Ditetapkan Perusahaan)
              </label>
              <div className="flex items-center space-x-2 py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-white">
                  {currentUser.position}
                </span>
                <span>•</span>
                <span className="text-slate-500">{currentUser.department}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bagian 3: Rekening Bank Pencairan Payroll */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span>Informasi Rekening Bank Pencairan Gaji</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Gaji bulanan dan uang lembur akan ditransfer ke rekening bank resmi di bawah ini.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Nama Bank */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Nama Bank
              </label>
              <select
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                <option value="BCA">Bank Central Asia (BCA)</option>
                <option value="MANDIRI">Bank Mandiri</option>
                <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
                <option value="BNI">Bank Negara Indonesia (BNI)</option>
                <option value="CIMB">CIMB Niaga</option>
                <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                <option value="PERMATA">Bank Permata</option>
              </select>
            </div>

            {/* Nomor Rekening */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Nomor Rekening
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  placeholder="Contoh: 8280192831"
                />
              </div>
            </div>

            {/* Nama Pemilik Rekening */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Nama Pemilik Rekening
              </label>
              <input
                type="text"
                required
                value={formData.accountHolder}
                onChange={(e) => setFormData({ ...formData, accountHolder: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Sesuai buku tabungan"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setFormData({
                name: currentUser.name,
                email: currentUser.email,
                phone: currentUser.phone || '081234567890',
                avatar: currentUser.avatar,
                bankName: currentUser.bankName || 'BCA',
                accountNumber: currentUser.accountNumber || '8280192831',
                accountHolder: currentUser.accountHolder || currentUser.name,
              });
              onShowToast('Data formulir dikembalikan ke profil awal', 'info');
            }}
            className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            type="submit"
            id="save-account-settings-btn"
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/35"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Akun</span>
          </button>
        </div>
      </form>
    </div>
  );
};
