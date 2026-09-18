import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Eye,
  Plus,
  Compass,
  X,
  Calendar,
  Sparkles,
  CalendarDays,
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, User } from '../types';
import { formatDateIndo } from '../utils/formatters';
import { exportAttendanceAuditPDF, exportAttendanceExcel } from '../utils/exportUtils';
import { checkIsNationalHoliday, getUpcomingNationalHolidays } from '../utils/nationalHolidays';

interface AttendanceManagementViewProps {
  attendances: AttendanceRecord[];
  users: User[];
  onOpenAttendanceCapture: () => void;
  onUpdateAttendanceStatus?: (recordId: string, status: AttendanceStatus) => void;
  onApplyHolidayAttendance?: (holidayDate: string, holidayName: string) => void;
}

export const AttendanceManagementView: React.FC<AttendanceManagementViewProps> = ({
  attendances,
  users,
  onOpenAttendanceCapture,
  onApplyHolidayAttendance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedRadius, setSelectedRadius] = useState<string>('ALL');
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<AttendanceRecord | null>(null);

  const departments = Array.from(new Set(users.map((u) => u.department)));

  const filteredAttendances = attendances.filter((att) => {
    const matchesSearch =
      att.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'ALL' || att.status === selectedStatus;
    const matchesDept = selectedDept === 'ALL' || att.department === selectedDept;
    const matchesRadius =
      selectedRadius === 'ALL' ||
      (selectedRadius === 'INSIDE' && att.checkInLocation.isWithinRadius) ||
      (selectedRadius === 'OUTSIDE' && !att.checkInLocation.isWithinRadius);

    return matchesSearch && matchesStatus && matchesDept && matchesRadius;
  });

  const handleExportPDF = () => {
    exportAttendanceAuditPDF(filteredAttendances, 'Laporan Presensi');
  };

  const handleExportExcel = () => {
    exportAttendanceExcel(filteredAttendances, 'Laporan Presensi');
  };

  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todayHolidayInfo = checkIsNationalHoliday(todayDateStr);
  const upcomingHolidays = getUpcomingNationalHolidays(2);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Data Presensi & Verifikasi Geofence
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rekap absensi masuk & pulang dengan bukti foto selfie, koordinat GPS kantor, dan kalender libur nasional
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="export-att-pdf-btn"
            onClick={handleExportPDF}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-rose-500" />
            <span>Ekspor PDF</span>
          </button>
          <button
            id="export-att-excel-btn"
            onClick={handleExportExcel}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center space-x-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>
          <button
            id="manual-clockin-btn"
            onClick={onOpenAttendanceCapture}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Presensi Selfie (GPS)</span>
          </button>
        </div>
      </div>

      {/* Banner Kalender Libur Nasional (SKB 3 Menteri) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-transparent border border-purple-200 dark:border-purple-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Kalender Libur Nasional Terhubung
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                SKB 3 Menteri
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {todayHolidayInfo.isHoliday ? (
                <span className="text-purple-700 dark:text-purple-300 font-semibold">
                  Hari ini Libur: {todayHolidayInfo.holiday?.name}
                </span>
              ) : (
                <span>
                  Libur Nasional Mendatang:{' '}
                  {upcomingHolidays[0] ? `${upcomingHolidays[0].name} (${formatDateIndo(upcomingHolidays[0].date)})` : 'Tidak ada'}
                </span>
              )}
            </p>
          </div>
        </div>

        {onApplyHolidayAttendance && (
          <button
            type="button"
            id="apply-today-holiday-btn"
            onClick={() => {
              if (todayHolidayInfo.holiday) {
                onApplyHolidayAttendance(todayHolidayInfo.holiday.date, todayHolidayInfo.holiday.name);
              } else if (upcomingHolidays[0]) {
                onApplyHolidayAttendance(upcomingHolidays[0].date, upcomingHolidays[0].name);
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-colors shrink-0"
          >
            {todayHolidayInfo.isHoliday
              ? 'Set Seluruh Karyawan Libur Hari Ini'
              : `Set Presensi Libur: ${upcomingHolidays[0]?.name.slice(0, 18)}...`}
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            id="search-attendance-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama karyawan / ID..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <select
          id="filter-attendance-status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">Semua Status Presensi</option>
          <option value="HADIR">Hadir Tepat Waktu</option>
          <option value="TERLAMBAT">Terlambat</option>
          <option value="LIBUR_NASIONAL">Libur Nasional</option>
          <option value="CUTI">Cuti / Izin</option>
          <option value="ALPHA">Alpha / Mangkir</option>
        </select>

        {/* Department Filter */}
        <select
          id="filter-attendance-dept"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">Semua Departemen</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Radius Geofence Filter */}
        <select
          id="filter-attendance-radius"
          value={selectedRadius}
          onChange={(e) => setSelectedRadius(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">Semua Radius Lokasi</option>
          <option value="INSIDE">Dalam Radius Kantor (&le;150m)</option>
          <option value="OUTSIDE">Di Luar Radius Kantor</option>
        </select>
      </div>

      {/* Table of Records */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Foto Selfie</th>
                <th className="px-4 py-3">Nama Karyawan</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jam Masuk</th>
                <th className="px-4 py-3">Jam Pulang</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Verifikasi GPS (Jarak)</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAttendances.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    Tidak ditemukan data presensi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredAttendances.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-2.5">
                      <div
                        onClick={() => setSelectedRecordForDetail(att)}
                        className="w-10 h-10 rounded-xl overflow-hidden cursor-pointer ring-1 ring-slate-200 dark:ring-slate-700 hover:opacity-90 relative group"
                        title="Klik untuk melihat foto selfie lengkap"
                      >
                        <img
                          src={att.checkInPhoto}
                          alt={att.employeeName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {att.employeeName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {att.department}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      {formatDateIndo(att.date)}
                    </td>
                    <td className="px-4 py-2.5 font-mono">
                      {att.checkInTime || '-'}
                    </td>
                    <td className="px-4 py-2.5 font-mono">
                      {att.checkOutTime || '-'}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          att.status === 'HADIR'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : att.status === 'TERLAMBAT'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : att.status === 'LIBUR_NASIONAL'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                            : att.status === 'CUTI'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {att.status === 'LIBUR_NASIONAL' ? 'LIBUR NASIONAL' : att.status} {att.lateMinutes > 0 && `(+${att.lateMinutes}m)`}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className={`w-3.5 h-3.5 ${att.checkInLocation.isWithinRadius ? 'text-emerald-500' : 'text-amber-500'}`} />
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {att.checkInLocation.distanceToOffice} m
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            att.checkInLocation.isWithinRadius
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          }`}
                        >
                          {att.checkInLocation.isWithinRadius ? 'Dalam Radius' : 'Luar Radius'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedRecordForDetail(att)}
                        className="px-2.5 py-1 text-xs rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-semibold transition-colors"
                      >
                        Detail Bukti
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* High-Resolution Selfie Preview & GPS Verification Modal */}
      {selectedRecordForDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Bukti Presensi Selfie & Titik GPS
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedRecordForDetail.employeeName} ({selectedRecordForDetail.department})
                </p>
              </div>
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Selfie Image */}
              <div className="relative w-full aspect-4/3 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-inner">
                <img
                  src={selectedRecordForDetail.checkInPhoto}
                  alt="Selfie Presensi"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs">
                  <div className="font-bold">
                    {selectedRecordForDetail.employeeName} • {selectedRecordForDetail.status}
                  </div>
                  <div className="text-[10px] text-slate-300">
                    Jam: {selectedRecordForDetail.checkInTime} WIB • Tanggal: {formatDateIndo(selectedRecordForDetail.date)}
                  </div>
                </div>
              </div>

              {/* GPS Geofence details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Jarak ke Kantor:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedRecordForDetail.checkInLocation.distanceToOffice} Meter
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Geofence:</span>
                  <span className={`font-bold ${selectedRecordForDetail.checkInLocation.isWithinRadius ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {selectedRecordForDetail.checkInLocation.isWithinRadius ? 'Valid: Dalam Radius Kantor (150m)' : 'Di Luar Radius Kantor'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Koordinat Satelit:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {selectedRecordForDetail.checkInLocation.lat.toFixed(5)}, {selectedRecordForDetail.checkInLocation.lng.toFixed(5)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alamat Deteksi:</span>
                  <span className="text-slate-700 dark:text-slate-300 text-right max-w-[240px] truncate">
                    {selectedRecordForDetail.checkInLocation.address || 'Gedung Menara Thamrin'}
                  </span>
                </div>
                {selectedRecordForDetail.notes && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50">
                    <span className="text-slate-500 block">Keterangan / Catatan:</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">
                      "{selectedRecordForDetail.notes}"
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
              <button
                onClick={() => setSelectedRecordForDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl"
              >
                Tutup Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
