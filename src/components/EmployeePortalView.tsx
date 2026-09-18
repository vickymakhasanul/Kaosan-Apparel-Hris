import React, { useState } from 'react';
import {
  Camera,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  FileText,
  MapPin,
  TrendingUp,
  DollarSign,
  ChevronRight,
  Eye,
  Plus,
} from 'lucide-react';
import { AttendanceRecord, LeaveRequest, PayrollItem, PayrollPeriod, User, OfficeConfig } from '../types';
import { formatDateIndo, formatRupiah } from '../utils/formatters';
import { exportPayslipPDF } from '../utils/exportUtils';
import { PayslipDetailModal } from './PayslipDetailModal';

interface EmployeePortalViewProps {
  currentUser: User;
  attendances: AttendanceRecord[];
  payrollItems: PayrollItem[];
  payrollPeriod: PayrollPeriod;
  leaves: LeaveRequest[];
  officeConfig?: OfficeConfig;
  onOpenAttendanceCapture: () => void;
  onOpenApplyLeave: () => void;
  onNavigateFeed?: () => void;
}

export const EmployeePortalView: React.FC<EmployeePortalViewProps> = ({
  currentUser,
  attendances,
  payrollItems,
  payrollPeriod,
  leaves,
  officeConfig,
  onOpenAttendanceCapture,
  onOpenApplyLeave,
  onNavigateFeed,
}) => {
  const [selectedSlip, setSelectedSlip] = useState<PayrollItem | null>(null);

  const todayStr = '2026-09-11';
  const myAttendances = attendances.filter((a) => a.employeeId === currentUser.id);
  const myTodayAttendance = myAttendances.find((a) => a.date === todayStr);

  const myPayslip = payrollItems.find((p) => p.employeeId === currentUser.id);
  const myLeaves = leaves.filter((l) => l.employeeId === currentUser.id);

  const presentDays = myAttendances.filter((a) => a.status === 'HADIR').length;
  const lateDays = myAttendances.filter((a) => a.status === 'TERLAMBAT').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-400 shadow-md"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/40 text-indigo-200">
                Portal Karyawan
              </span>
              <span className="text-xs text-indigo-300 font-mono">{currentUser.employeeId}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black mt-0.5">
              Halo, {currentUser.name}!
            </h1>
            <p className="text-xs text-indigo-200">
              {currentUser.position} • {currentUser.department}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="employee-quick-absen-btn"
            onClick={onOpenAttendanceCapture}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-indigo-950 font-bold text-xs flex items-center space-x-2 shadow-lg transition-transform active:scale-95"
          >
            <Camera className="w-4 h-4 text-indigo-600" />
            <span>
              {myTodayAttendance ? 'Presensi Pulang / Absen Ulang' : 'Presensi Masuk Sekarang (Selfie)'}
            </span>
          </button>
          <button
            id="employee-quick-leave-btn"
            onClick={onOpenApplyLeave}
            className="px-4 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold text-xs border border-indigo-500/30 flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajukan Cuti</span>
          </button>
          {onNavigateFeed && (
            <button
              id="employee-quick-feed-btn"
              onClick={onNavigateFeed}
              className="px-4 py-2.5 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/50 text-white font-semibold text-xs border border-indigo-400/30 flex items-center space-x-1.5 transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span>Feed Kerja 📸</span>
            </button>
          )}
        </div>
      </div>

      {/* Today Status Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-2xl ${
            myTodayAttendance ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500">Status Presensi Hari Ini (11 September 2026):</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2 mt-0.5">
              {myTodayAttendance ? (
                <>
                  <span className="text-emerald-600">Sudah Absen Masuk ({myTodayAttendance.checkInTime} WIB)</span>
                  <span className="text-xs px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                    {myTodayAttendance.status}
                  </span>
                </>
              ) : (
                <span className="text-amber-600">Anda belum melakukan presensi masuk hari ini.</span>
              )}
            </div>
          </div>
        </div>

        {myTodayAttendance && (
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Lokasi: {myTodayAttendance.checkInLocation.distanceToOffice}m dari kantor ({myTodayAttendance.checkInLocation.isWithinRadius ? 'Valid' : 'Luar Radius'})</span>
          </div>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Estimasi Gaji Bulan Ini */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Estimasi THP Bulan Ini</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {myPayslip ? formatRupiah(myPayslip.netSalary) : formatRupiah(currentUser.baseSalary)}
          </div>
          <div className="text-xs text-emerald-600 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Kalkulasi Otomatis Berdasarkan Presensi</span>
          </div>
        </div>

        {/* Kehadiran Bulan Ini */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Kehadiran Kerja</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {myAttendances.length} Hari
          </div>
          <div className="text-xs text-slate-500">
            {presentDays} tepat waktu, {lateDays} terlambat
          </div>
        </div>

        {/* Sisa Kuota Cuti */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Sisa Hak Cuti Anda</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {currentUser.leaveBalance} Hari
          </div>
          <div className="text-xs text-slate-500">
            Dari total 12 hari cuti tahunan
          </div>
        </div>
      </div>

      {/* Slip Gaji Saya Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Slip Gaji Digital Saya ({payrollPeriod.name})
            </h3>
          </div>
          {myPayslip && (
            <div className="flex items-center space-x-2">
              <button
                id="my-payslip-detail-btn"
                onClick={() => setSelectedSlip(myPayslip)}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100"
              >
                Lihat Detail Slip
              </button>
              <button
                id="my-payslip-download-pdf-btn"
                onClick={() => exportPayslipPDF(myPayslip, payrollPeriod, officeConfig)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh PDF</span>
              </button>
            </div>
          )}
        </div>

        {myPayslip ? (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Gaji Pokok:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatRupiah(myPayslip.baseSalary)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Tunjangan Kehadiran:</span>
              <span className="font-bold text-emerald-600">+{formatRupiah(myPayslip.allowance)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Potongan BPJS & Pajak:</span>
              <span className="font-bold text-rose-600">-{formatRupiah(myPayslip.totalDeductions)}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Take Home Pay (THP):</span>
              <span className="text-base font-extrabold text-emerald-600">{formatRupiah(myPayslip.netSalary)}</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 text-center py-4">
            Slip gaji bulan ini sedang dalam proses kalkulasi oleh Finance.
          </div>
        )}
      </div>

      {/* Riwayat Absensi Saya */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Riwayat Presensi Selfie & Lokasi Saya
          </h3>
          <span className="text-xs text-slate-400">Total {myAttendances.length} catatan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Foto Bukti</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jam Masuk</th>
                <th className="px-4 py-3">Jam Pulang</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Radius GPS</th>
                <th className="px-4 py-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myAttendances.map((att) => (
                <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-4 py-2.5">
                    <img
                      src={att.checkInPhoto}
                      alt="Selfie"
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap font-medium">
                    {formatDateIndo(att.date)}
                  </td>
                  <td className="px-4 py-2.5 font-mono">
                    {att.checkInTime || '-'}
                  </td>
                  <td className="px-4 py-2.5 font-mono">
                    {att.checkOutTime || '-'}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      att.status === 'HADIR'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {att.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {att.checkInLocation.distanceToOffice}m
                    </span>{' '}
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      ({att.checkInLocation.isWithinRadius ? 'Valid' : 'Luar Radius'})
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {att.notes || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payslip Modal */}
      <PayslipDetailModal
        isOpen={!!selectedSlip}
        onClose={() => setSelectedSlip(null)}
        item={selectedSlip}
        period={payrollPeriod}
        officeConfig={officeConfig}
        onSendNotification={() => {}}
      />
    </div>
  );
};
