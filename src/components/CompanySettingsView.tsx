import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  MapPin,
  Compass,
  Clock,
  Calendar,
  ShieldCheck,
  Save,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Sliders,
  DollarSign,
  Coffee,
  Info,
  CalendarDays,
  Check,
  Upload,
  Image as ImageIcon,
  Camera,
  Trash2,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  FileText,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { OfficeConfig, User, AttendanceRecord } from '../types';
import { INDONESIA_NATIONAL_HOLIDAYS, applyNationalHolidayToAttendance, checkIsNationalHoliday } from '../utils/nationalHolidays';
import { formatDateIndo } from '../utils/formatters';

interface CompanySettingsViewProps {
  officeConfig: OfficeConfig;
  onUpdateOfficeConfig: (newConfig: OfficeConfig) => void;
  users: User[];
  attendances: AttendanceRecord[];
  onApplyHolidayAttendance: (holidayDate: string, holidayName: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

// Preset foto workshop dan kantor apparel
const WORKSHOP_PHOTO_PRESETS = [
  {
    title: 'Workshop Sablon & Jahit Kaos',
    desc: 'Lantai produksi konveksi & cetak sablon',
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&auto=format&fit=crop&q=80',
  },
  {
    title: 'Studio Display & Galeri Apparel',
    desc: 'Showroom display t-shirt & produk apparel',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80',
  },
  {
    title: 'Meja Desain & Pemotongan Pola',
    desc: 'Creative workspace fabric cutting',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000&auto=format&fit=crop&q=80',
  },
  {
    title: 'Head Office Menara Thamrin',
    desc: 'Gedung kantor pusat & administrasi',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1000&auto=format&fit=crop&q=80',
  },
];

// Preset logo perusahaan
const LOGO_PRESETS = [
  {
    title: 'Kaosan Apparel Icon',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80',
  },
  {
    title: 'Monogram K Minimalist',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
  },
  {
    title: 'Indigo Geometric Shield',
    url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=200&auto=format&fit=crop&q=80',
  },
];

// Preset titik koordinat kantor bisnis populer di Indonesia
const POPULAR_OFFICE_PRESETS = [
  {
    name: 'Menara Thamrin, Jakarta Pusat (Default)',
    address: 'Gedung Menara Thamrin Lt. 18, Jl. M.H. Thamrin No. 3, Jakarta Pusat 10340',
    lat: -6.1869,
    lng: 106.8236,
  },
  {
    name: 'Pacific Century Place, SCBD Sudirman',
    address: 'SCBD Lot 10, Jl. Jend. Sudirman Kav. 52-53, Senayan, Jakarta Selatan',
    lat: -6.2267,
    lng: 106.8091,
  },
  {
    name: 'Menara BTPN, Mega Kuningan',
    address: 'Kawasan Mega Kuningan Jl. Dr. Ide Anak Agung Gde Agung Kav. 5.5, Jakarta Selatan',
    lat: -6.2301,
    lng: 106.8276,
  },
  {
    name: 'South Quarter, TB Simatupang',
    address: 'Jl. R.A. Kartini Kav. 8, Cilandak Barat, Jakarta Selatan',
    lat: -6.2925,
    lng: 106.7869,
  },
  {
    name: 'BSD Green Office Park, Tangerang',
    address: 'GOP 9, Jl. Grand Boulevard BSD City, Sampora, Cisauk, Tangerang',
    lat: -6.3032,
    lng: 106.6534,
  },
  {
    name: 'Pakuwon Tower, Tunjungan Surabaya',
    address: 'Jl. Embong Malang No. 21-31, Kedungdoro, Tegalsari, Surabaya',
    lat: -7.2618,
    lng: 112.7388,
  },
];

type SettingsTab = 'profile' | 'coordinates' | 'holidays' | 'hours';

export const CompanySettingsView: React.FC<CompanySettingsViewProps> = ({
  officeConfig,
  onUpdateOfficeConfig,
  users,
  attendances,
  onApplyHolidayAttendance,
  onShowToast,
}) => {
  const [config, setConfig] = useState<OfficeConfig>({ ...officeConfig });
  const [isLocating, setIsLocating] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [autoSyncHolidays, setAutoSyncHolidays] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [photoUrlInput, setPhotoUrlInput] = useState<string>('');
  const [logoUrlInput, setLogoUrlInput] = useState<string>('');

  const filePhotoInputRef = useRef<HTMLInputElement>(null);
  const fileLogoInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever officeConfig prop changes
  useEffect(() => {
    setConfig({ ...officeConfig });
  }, [officeConfig]);

  // Upload file foto perusahaan (gedung/workshop)
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onShowToast('Ukuran file foto maksimal 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setConfig((prev) => ({
        ...prev,
        companyPhoto: result,
      }));
      onShowToast('Foto perusahaan/workshop berhasil diunggah!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Upload file logo resmi perusahaan
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      onShowToast('Ukuran file logo maksimal 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setConfig((prev) => ({
        ...prev,
        companyLogo: result,
      }));
      onShowToast('Logo perusahaan berhasil diunggah!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Terapkan URL foto
  const handleApplyPhotoUrl = () => {
    if (!photoUrlInput.trim()) {
      onShowToast('Masukkan URL gambar foto yang valid', 'error');
      return;
    }
    setConfig((prev) => ({
      ...prev,
      companyPhoto: photoUrlInput.trim(),
    }));
    setPhotoUrlInput('');
    onShowToast('URL foto perusahaan berhasil diterapkan!', 'success');
  };

  // Terapkan URL logo
  const handleApplyLogoUrl = () => {
    if (!logoUrlInput.trim()) {
      onShowToast('Masukkan URL logo yang valid', 'error');
      return;
    }
    setConfig((prev) => ({
      ...prev,
      companyLogo: logoUrlInput.trim(),
    }));
    setLogoUrlInput('');
    onShowToast('URL logo perusahaan berhasil diterapkan!', 'success');
  };

  // Preset Kaosan Apparel
  const handleApplyKaosanApparelPreset = () => {
    setConfig((prev) => ({
      ...prev,
      companyName: 'Kaosan Apparel',
      tagline: 'Custom Apparel & Premium Garment Production',
      industry: 'Tekstil, Konveksi & Fashion Apparel',
      companyLogo: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80',
      companyPhoto: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&auto=format&fit=crop&q=80',
      email: 'halo@kaosanapparel.com',
      phone: '0812-3456-7890',
      website: 'https://kaosanapparel.com',
      taxId: '01.234.567.8-901.000',
      name: 'Head Office & Production Workshop',
      address: 'Gedung Menara Thamrin Lt. 18, Jl. M.H. Thamrin No. 3, Jakarta Pusat',
    }));
    onShowToast('Preset identitas dan foto Kaosan Apparel berhasil diterapkan!', 'success');
  };

  // Ambil lokasi GPS perangkat saat ini
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      onShowToast('Browser tidak mendukung Geolocation API', 'error');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLat = Number(position.coords.latitude.toFixed(6));
        const currentLng = Number(position.coords.longitude.toFixed(6));
        setConfig((prev) => ({
          ...prev,
          lat: currentLat,
          lng: currentLng,
        }));
        setIsLocating(false);
        onShowToast(
          `Koordinat berhasil diambil dari GPS: ${currentLat}, ${currentLng}`,
          'success'
        );
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        onShowToast(
          'Tidak dapat membaca sinyal GPS otomatis. Silakan masukkan koordinat secara manual atau pilih preset.',
          'error'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Pilih preset kantor
  const handleSelectPreset = (preset: typeof POPULAR_OFFICE_PRESETS[0]) => {
    setConfig((prev) => ({
      ...prev,
      name: preset.name,
      address: preset.address,
      lat: preset.lat,
      lng: preset.lng,
    }));
    onShowToast(`Preset lokasi terpilih: ${preset.name}`, 'info');
  };

  // Simpan pengaturan perusahaan
  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!config.companyName || !config.companyName.trim()) {
      onShowToast('Nama perusahaan tidak boleh kosong', 'error');
      return;
    }

    if (isNaN(config.lat) || isNaN(config.lng)) {
      onShowToast('Titik koordinat Latitude dan Longitude harus berupa angka desimal valid', 'error');
      return;
    }

    if (config.radiusMeters < 10 || config.radiusMeters > 5000) {
      onShowToast('Radius geofence harus antara 10 meter hingga 5000 meter', 'error');
      return;
    }

    onUpdateOfficeConfig(config);
    onShowToast(`Pengaturan perusahaan "${config.companyName}" dan koordinat berhasil disimpan!`, 'success');
  };

  // Filter daftar libur nasional berdasarkan tahun
  const filteredHolidays = INDONESIA_NATIONAL_HOLIDAYS.filter((h) =>
    h.date.startsWith(String(selectedYear))
  );

  // Hari ini
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayHolidayCheck = checkIsNationalHoliday(todayStr);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Halaman */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Pengaturan Perusahaan & Koordinat GPS
                </h1>
                <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Super Admin Only
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Atur titik koordinat GPS kantor pusat/cabang, radius geofence presensi selfie, dan integrasi kalender libur nasional resmi.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-500/20 transition-all self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>

        {/* Tab Navigasi Sub-Pengaturan */}
        <div className="flex space-x-2 mt-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-1">
          <button
            type="button"
            id="tab-company-profile-btn"
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Profil & Foto Perusahaan</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              {config.companyName || 'Kaosan Apparel'}
            </span>
          </button>
          <button
            type="button"
            id="tab-company-coordinates-btn"
            onClick={() => setActiveTab('coordinates')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'coordinates'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Lokasi GPS & Geofence</span>
          </button>
          <button
            type="button"
            id="tab-company-holidays-btn"
            onClick={() => setActiveTab('holidays')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'holidays'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Kalender Libur Nasional (SKB 3 Menteri)</span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </button>
          <button
            type="button"
            id="tab-company-hours-btn"
            onClick={() => setActiveTab('hours')}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-all flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'hours'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Jam Kerja & Kebijakan Absensi</span>
          </button>
        </div>
      </div>

      {/* Hidden File Inputs for Direct Upload */}
      <input
        type="file"
        ref={filePhotoInputRef}
        onChange={handlePhotoFileUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={fileLogoInputRef}
        onChange={handleLogoFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Konten Tab 0: Profil & Foto Perusahaan */}
      {activeTab === 'profile' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Quick Preset Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-2 backdrop-blur-sm border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Pengaturan Branding & Legalitas Terintegrasi</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {config.companyName || 'Kaosan Apparel'}
              </h2>
              <p className="text-xs text-indigo-200/90 mt-1 leading-relaxed">
                Kelola nama resmi perusahaan, foto gedung workshop / konveksi, logo resmi, dan informasi kontak bisnis.
                Perubahan otomatis langsung dicetak pada kop slip gaji seluruh karyawan, dokumen PDF/Excel, serta bilah navigasi aplikasi.
              </p>
            </div>

            <button
              type="button"
              id="btn-apply-kaosan-preset"
              onClick={handleApplyKaosanApparelPreset}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white text-indigo-900 text-xs font-bold shadow-lg hover:bg-indigo-50 transition-all self-start md:self-auto shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Gunakan Preset Kaosan Apparel</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Kolom Kiri: Form Nama & Identitas Perusahaan */}
            <div className="space-y-8">
              {/* Card 1: Nama Resmi & Legalitas */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-1">
                  <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Identitas & Nama Perusahaan</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Nama ini akan menjadi representasi resmi entitas bisnis pada slip gaji dan laporan absensi.
                </p>

                <div className="space-y-5">
                  {/* Nama Resmi Perusahaan */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <span>Nama Perusahaan (Official Brand Name)</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">Wajib diisi</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="company-name-input"
                        required
                        value={config.companyName || ''}
                        onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="Contoh: Kaosan Apparel"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 block">
                      Tercetak di: Bilah Navigasi Atas, Header Slip Gaji Karyawan, Lembar Rekap Excel (.xlsx), dan Laporan PDF.
                    </span>
                  </div>

                  {/* Slogan / Tagline */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Slogan / Tagline Bisnis
                    </label>
                    <input
                      type="text"
                      value={config.tagline || ''}
                      onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Contoh: Custom Apparel & Premium Garment Production"
                    />
                  </div>

                  {/* Bidang Usaha & NPWP */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Bidang Usaha / Industri
                      </label>
                      <input
                        type="text"
                        value={config.industry || ''}
                        onChange={(e) => setConfig({ ...config, industry: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="Contoh: Tekstil & Konveksi Kaos"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        NPWP Perusahaan (Tax ID)
                      </label>
                      <input
                        type="text"
                        value={config.taxId || ''}
                        onChange={(e) => setConfig({ ...config, taxId: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="01.234.567.8-901.000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Kontak & Alamat Kantor/Workshop */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-1">
                  <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>Kontak Resmi & Alamat Kantor</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                  Detail alamat dan nomor telepon yang tercantum pada footer dokumen perusahaan.
                </p>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Email Resmi Perusahaan
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          value={config.email || ''}
                          onChange={(e) => setConfig({ ...config, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder="halo@kaosanapparel.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Telepon / WhatsApp Kantor
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={config.phone || ''}
                          onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder="0812-3456-7890"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Website Resmi Perusahaan
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="url"
                        value={config.website || ''}
                        onChange={(e) => setConfig({ ...config, website: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="https://kaosanapparel.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Nama Gedung / Workshop Cabang
                    </label>
                    <input
                      type="text"
                      value={config.name}
                      onChange={(e) => setConfig({ ...config, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Head Office & Production Workshop"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Alamat Lengkap Perusahaan
                    </label>
                    <textarea
                      rows={2}
                      value={config.address}
                      onChange={(e) => setConfig({ ...config, address: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                      placeholder="Gedung Menara Thamrin Lt. 18, Jl. M.H. Thamrin No. 3, Jakarta Pusat"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Foto Perusahaan & Logo Perusahaan */}
            <div className="space-y-8">
              {/* Card 3: Foto Gedung / Workshop Perusahaan */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <ImageIcon className="w-5 h-5 text-rose-500" />
                      <span>Foto Gedung / Workshop Perusahaan</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Foto visual kantor, pabrik sablon, atau studio garment resmi perusahaan.
                    </p>
                  </div>

                  {config.companyPhoto && (
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, companyPhoto: undefined })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Pratinjau Foto Banner */}
                <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner group mb-4">
                  {config.companyPhoto ? (
                    <>
                      <img
                        src={config.companyPhoto}
                        alt={config.companyName || 'Foto Perusahaan'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex flex-col justify-end p-4 text-white">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                          Foto Resmi Entitas
                        </span>
                        <p className="text-sm font-bold truncate">{config.companyName || 'Kaosan Apparel'}</p>
                        <p className="text-xs text-slate-300 truncate">{config.address}</p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                      <Camera className="w-10 h-10 mb-2 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-semibold">Belum ada foto perusahaan</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Unggah foto workshop atau pilih preset di bawah</p>
                    </div>
                  )}
                </div>

                {/* Tombol Unggah File & URL */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      id="btn-upload-company-photo"
                      onClick={() => filePhotoInputRef.current?.click()}
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors border border-indigo-200 dark:border-indigo-800/60"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Unggah Foto dari File (Max 5MB)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          companyPhoto: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&auto=format&fit=crop&q=80',
                        })
                      }
                      className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Workshop Kaosan</span>
                    </button>
                  </div>

                  {/* Input URL Foto */}
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      placeholder="Atau tempelkan tautan URL gambar foto disini..."
                      value={photoUrlInput}
                      onChange={(e) => setPhotoUrlInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPhotoUrl}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors shrink-0"
                    >
                      Terapkan URL
                    </button>
                  </div>

                  {/* Preset Pilihan Foto Workshop */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                      Pilihan Preset Foto Workshop & Kantor:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {WORKSHOP_PHOTO_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setConfig({ ...config, companyPhoto: preset.url });
                            onShowToast(`Foto dipilih: ${preset.title}`, 'info');
                          }}
                          className={`p-2 rounded-xl text-left border text-xs transition-all flex items-center space-x-2 ${
                            config.companyPhoto === preset.url
                              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold ring-1 ring-indigo-500'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.title}
                            className="w-9 h-9 rounded-lg object-cover shrink-0"
                          />
                          <div className="truncate">
                            <p className="truncate font-semibold text-[11px]">{preset.title}</p>
                            <p className="truncate text-[10px] text-slate-400">{preset.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Logo Resmi Perusahaan */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <span>Logo Resmi Perusahaan</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Logo yang ditampilkan pada header bilah navigasi dan kop slip gaji karyawan.
                    </p>
                  </div>

                  {config.companyLogo && (
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, companyLogo: undefined })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Hapus logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5 mb-4">
                  {/* Pratinjau Logo */}
                  <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    {config.companyLogo ? (
                      <img
                        src={config.companyLogo}
                        alt="Logo Perusahaan"
                        className="w-full h-full object-cover rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2.5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        id="btn-upload-company-logo"
                        onClick={() => fileLogoInputRef.current?.click()}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Logo (PNG/JPG)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setConfig({
                            ...config,
                            companyLogo: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=200&auto=format&fit=crop&q=80',
                          })
                        }
                        className="inline-flex items-center space-x-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        <span>Logo Kaosan</span>
                      </button>
                    </div>

                    <div className="flex space-x-2">
                      <input
                        type="url"
                        placeholder="Atau URL logo (https://...)"
                        value={logoUrlInput}
                        onChange={(e) => setLogoUrlInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyLogoUrl}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors shrink-0"
                      >
                        Pasang
                      </button>
                    </div>
                  </div>
                </div>

                {/* Preset Pilihan Logo */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                    Preset Logo Apparel:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {LOGO_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setConfig({ ...config, companyLogo: preset.url });
                          onShowToast(`Logo diterapkan: ${preset.title}`, 'info');
                        }}
                        className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs border transition-all ${
                          config.companyLogo === preset.url
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <img src={preset.url} alt={preset.title} className="w-5 h-5 rounded-md object-cover" />
                        <span>{preset.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Live Mockup / Pratinjau Tampilan Kop Slip Gaji Karyawan */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pratinjau Live: Tampilan Kop Dokumen & Slip Gaji
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Pratinjau Nyata</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Berikut adalah simulasi bagaimana nama perusahaan "{config.companyName || 'Kaosan Apparel'}" dan logo Anda tampil di lembar slip gaji resmi karyawan:
            </p>

            {/* Simulasi Kop Surat */}
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 border-b pb-4 border-slate-300 dark:border-slate-700 text-center sm:text-left">
                {config.companyLogo ? (
                  <img
                    src={config.companyLogo}
                    alt="Company Logo"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-600 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-indigo-600 to-rose-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm">
                    {(config.companyName || 'KA').substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                    {config.companyName || 'KAOSAN APPAREL'}
                  </h4>
                  {config.tagline && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      {config.tagline}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {config.address}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-[10px] text-slate-400 mt-1.5 font-mono">
                    {config.phone && <span>Telp: {config.phone}</span>}
                    {config.email && <span>Email: {config.email}</span>}
                    {config.taxId && <span>NPWP: {config.taxId}</span>}
                  </div>
                </div>
              </div>

              <div className="pt-3 text-center">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wider uppercase">
                  SLIP GAJI KARYAWAN (PAYSLIP) - PERIODE SEPTEMBER 2026
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <p className="text-xs text-indigo-950 dark:text-indigo-200">
                Klik tombol di samping untuk menyimpan seluruh perubahan nama perusahaan, foto workshop, dan logo resmi ke sistem.
              </p>
            </div>

            <button
              type="button"
              id="btn-save-company-profile"
              onClick={handleSave}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-500/20 transition-all shrink-0 w-full sm:w-auto justify-center"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Identitas Perusahaan</span>
            </button>
          </div>
        </div>
      )}

      {/* Konten Tab 1: Koordinat GPS & Geofence */}
      {activeTab === 'coordinates' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Card 1: Form Titik Koordinat GPS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-rose-500" />
                  <span>Titik Koordinat Geografis Kantor (Latitude & Longitude)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Koordinat ini dipakai sebagai pusat lingkaran verifikasi (geofence) saat karyawan melakukan absensi selfie.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Navigation className={`w-3.5 h-3.5 text-indigo-500 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Mendeteksi GPS...' : 'Deteksi GPS Perangkat Saya'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Latitude */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Garis Lintang (Latitude)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs font-mono font-bold text-indigo-500">LAT</span>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={config.lat}
                    onChange={(e) => setConfig({ ...config, lat: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="-6.186900"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Format desimal (misal: -6.186900 untuk wilayah Jakarta)
                </span>
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Garis Bujur (Longitude)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs font-mono font-bold text-indigo-500">LNG</span>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={config.lng}
                    onChange={(e) => setConfig({ ...config, lng: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="106.823600"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Format desimal (misal: 106.823600 untuk wilayah Jakarta)
                </span>
              </div>
            </div>

            {/* Nama Kantor & Alamat Lengkap */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Nama Gedung / Kantor
                </label>
                <input
                  type="text"
                  required
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Gedung Menara Thamrin"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Alamat Lengkap Perusahaan
                </label>
                <input
                  type="text"
                  required
                  value={config.address}
                  onChange={(e) => setConfig({ ...config, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="Jl. M.H. Thamrin No. 3, Jakarta Pusat"
                />
              </div>
            </div>

            {/* Radius Geofence */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5">
                  <Compass className="w-4 h-4 text-emerald-500" />
                  <span>Radius Toleransi Geofence Absensi</span>
                </label>
                <span className="text-sm font-bold font-mono px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                  {config.radiusMeters} Meter
                </span>
              </div>
              <input
                type="range"
                min="25"
                max="1000"
                step="25"
                value={config.radiusMeters}
                onChange={(e) => setConfig({ ...config, radiusMeters: parseInt(e.target.value) || 150 })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>25 meter (Sangat Ketat)</span>
                <span>150 meter (Standar Gedung Kantor)</span>
                <span>500 meter (Kawasan Industri/Kampus)</span>
                <span>1000 meter (Maksimal)</span>
              </div>
            </div>
          </div>

          {/* Card 2: Visual Radar Preview Lokasi Kantor */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                    Radar Geofence Visualizer
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    {config.name}
                  </h3>
                  <p className="text-xs text-indigo-200/80 mt-1">
                    {config.address}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 self-start">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{config.lat.toFixed(6)}, {config.lng.toFixed(6)}</span>
                </div>
              </div>

              {/* Radar Circle Simulation */}
              <div className="flex items-center justify-center py-6">
                <div className="relative flex items-center justify-center">
                  {/* Outer ring */}
                  <div className="w-64 h-64 rounded-full border border-indigo-400/20 flex items-center justify-center animate-pulse">
                    {/* Middle Geofence Ring */}
                    <div className="w-48 h-48 rounded-full border-2 border-dashed border-emerald-400/60 bg-emerald-500/10 flex items-center justify-center relative">
                      <span className="absolute -top-3 text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500 text-slate-900">
                        Geofence: {config.radiusMeters}m
                      </span>

                      {/* Inner Ring */}
                      <div className="w-28 h-28 rounded-full border border-indigo-300/30 flex items-center justify-center">
                        {/* Office Pin Center */}
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/50 text-white">
                          <Building2 className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs mt-4 pt-4 border-t border-white/10">
                <div>
                  <span className="text-indigo-300 block">Status Validasi</span>
                  <span className="font-bold text-emerald-400 flex items-center justify-center space-x-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aktif Otomatis</span>
                  </span>
                </div>
                <div>
                  <span className="text-indigo-300 block">Jangkauan Presensi</span>
                  <span className="font-bold text-white mt-0.5 block">Radius {config.radiusMeters} Meter</span>
                </div>
                <div>
                  <span className="text-indigo-300 block">Anti-Fake GPS</span>
                  <span className="font-bold text-emerald-400 mt-0.5 block">Verifikasi Biometrik Selfie</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Preset Lokasi Bisnis Indonesia */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Pilih Cepat dari Preset Kawasan Bisnis Populer</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Klik salah satu preset di bawah untuk langsung menguji atau menyetel koordinat kantor cabang Anda:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {POPULAR_OFFICE_PRESETS.map((preset, idx) => {
                const isSelected =
                  Math.abs(config.lat - preset.lat) < 0.001 &&
                  Math.abs(config.lng - preset.lng) < 0.001;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-4 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {preset.address}
                    </p>
                    <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-2 font-semibold">
                      {preset.lat.toFixed(4)}, {preset.lng.toFixed(4)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Konten Tab 2: Kalender Libur Nasional (SKB 3 Menteri) */}
      {activeTab === 'holidays' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Banner Status Hari Ini */}
          <div className={`p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            todayHolidayCheck.isHoliday
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-950 dark:text-rose-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-950 dark:text-emerald-200'
          }`}>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 ${
                todayHolidayCheck.isHoliday ? 'bg-rose-600 shadow-rose-500/30' : 'bg-emerald-600 shadow-emerald-500/30'
              }`}>
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Status Kalender Hari Ini ({formatDateIndo(todayStr)})
                </span>
                <h3 className="text-lg font-bold">
                  {todayHolidayCheck.isHoliday
                    ? `Hari Libur Nasional: ${todayHolidayCheck.holiday?.name}`
                    : 'Hari Kerja Normal (Bukan Hari Libur Nasional)'}
                </h3>
                <p className="text-xs opacity-80 mt-0.5">
                  {todayHolidayCheck.isHoliday
                    ? 'Presensi seluruh karyawan dapat otomatis disinkronkan ke status "Libur Nasional" tanpa pemotongan gaji pokok.'
                    : 'Sistem presensi GPS dan toleransi jam masuk berjalan seperti biasa.'}
                </p>
              </div>
            </div>

            {todayHolidayCheck.isHoliday && (
              <button
                type="button"
                onClick={() => {
                  if (todayHolidayCheck.holiday) {
                    onApplyHolidayAttendance(todayHolidayCheck.holiday.date, todayHolidayCheck.holiday.name);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all shrink-0"
              >
                Terapkan Libur Nasional Hari Ini ke Seluruh Karyawan
              </button>
            )}
          </div>

          {/* Card Daftar Hari Libur Nasional */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <CalendarDays className="w-5 h-5 text-rose-500" />
                  <span>Daftar Hari Libur Nasional & Cuti Bersama (SKB 3 Menteri)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Terhubung ke kalender resmi Republik Indonesia. Karyawan yang libur pada tanggal ini tidak dipotong gaji atau dihitung mangkir/alpha.
                </p>
              </div>

              {/* Pemilih Tahun */}
              <div className="flex items-center space-x-2">
                {[2025, 2026, 2027].map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setSelectedYear(yr)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedYear === yr
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    Tahun {yr}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Tanggal Libur</th>
                    <th className="pb-3 font-semibold">Nama Hari Libur / Peringatan</th>
                    <th className="pb-3 font-semibold">Kategori</th>
                    <th className="pb-3 font-semibold">Keterangan</th>
                    <th className="pb-3 font-semibold text-right">Aksi Presensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredHolidays.map((holiday, idx) => {
                    const isPassed = new Date(holiday.date) < new Date(todayStr);
                    const isToday = holiday.date === todayStr;

                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 font-mono text-xs whitespace-nowrap">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {formatDateIndo(holiday.date)}
                          </div>
                          <span className="text-[10px] text-slate-400">{holiday.date}</span>
                        </td>
                        <td className="py-3 font-semibold text-slate-900 dark:text-slate-200">
                          <div className="flex items-center space-x-2">
                            <span>{holiday.name}</span>
                            {isToday && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500 text-white font-bold animate-pulse">
                                HARI INI
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 whitespace-nowrap">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            holiday.type === 'CUTI_BERSAMA'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {holiday.type === 'CUTI_BERSAMA' ? 'Cuti Bersama' : 'Libur Nasional'}
                          </span>
                        </td>
                        <td className="py-3 text-xs text-slate-500 dark:text-slate-400">
                          {holiday.description || '-'}
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onApplyHolidayAttendance(holiday.date, holiday.name)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Terapkan Status Libur</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Konten Tab 3: Jam Kerja & Kebijakan Gaji */}
      {activeTab === 'hours' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              <span>Jam Operasional Kerja & Kebijakan Keterlambatan</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Parameter ini mengontrol perhitungan otomatis jam terlambat, pemotongan gaji, dan insentif lembur.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Jam Masuk */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Jam Masuk Kerja (Shift Pagi)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="time"
                    required
                    value={config.shiftStartTime}
                    onChange={(e) => setConfig({ ...config, shiftStartTime: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Jam Pulang */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Jam Pulang Kerja (Shift Selesai)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="time"
                    required
                    value={config.shiftEndTime}
                    onChange={(e) => setConfig({ ...config, shiftEndTime: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Toleransi Menit Terlambat */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Toleransi Keterlambatan (Menit)
                </label>
                <div className="relative">
                  <Sliders className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    min="0"
                    max="60"
                    required
                    value={config.lateGracePeriodMinutes}
                    onChange={(e) => setConfig({ ...config, lateGracePeriodMinutes: parseInt(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Denda Keterlambatan per Kejadian */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Denda Keterlambatan per Kejadian (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={config.latePenaltyPerOccurrence}
                    onChange={(e) => setConfig({ ...config, latePenaltyPerOccurrence: parseInt(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Upah Lembur per Jam */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Tarif Upah Lembur per Jam (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={config.overtimeHourlyRate}
                    onChange={(e) => setConfig({ ...config, overtimeHourlyRate: parseInt(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
