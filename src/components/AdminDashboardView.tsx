import React from 'react';
import {
  Users,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Download,
  FileSpreadsheet,
  FileText,
  BellRing,
  CreditCard,
  Building2,
  TrendingUp,
  Send,
  MapPin,
  Camera,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { AttendanceRecord, LeaveRequest, PayrollItem, PayrollPeriod, User } from '../types';
import { formatDateTimeIndo, formatDateIndo, formatRupiah } from '../utils/formatters';
import { exportAttendanceAuditPDF, exportAttendanceExcel, exportMonthlyPayrollPDF, exportPayrollExcel } from '../utils/exportUtils';

interface AdminDashboardViewProps {
  users: User[];
  attendances: AttendanceRecord[];
  payrollPeriod: PayrollPeriod;
  payrollItems: PayrollItem[];
  leaves: LeaveRequest[];
  onOpenAttendanceCapture: () => void;
  onNavigateTab: (tab: string) => void;
  onTriggerPayrollCalc: () => void;
  onSendAllPayslipNotifications: () => void;
  onOpenDisbursement: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  users,
  attendances,
  payrollPeriod,
  payrollItems,
  leaves,
  onOpenAttendanceCapture,
  onNavigateTab,
  onTriggerPayrollCalc,
  onSendAllPayslipNotifications,
  onOpenDisbursement,
}) => {
  const todayStr = '2026-09-11';
  const todayAttendances = attendances.filter((a) => a.date === todayStr);

  const presentCount = todayAttendances.length;
  const onTimeCount = todayAttendances.filter((a) => a.status === 'HADIR').length;
  const lateCount = todayAttendances.filter((a) => a.status === 'TERLAMBAT').length;
  const attendanceRate = users.length > 0 ? Math.round((presentCount / users.length) * 100) : 0;

  // Upcoming leaves for Leave Reminder feature (next 7 days)
  const upcomingLeaves = leaves.filter((l) => {
    return l.status === 'APPROVED' && l.startDate >= '2026-09-11';
  });

  // Calculate department payroll breakdown
  const departmentBreakdown: { [key: string]: { totalNet: number; count: number } } = {};
  payrollItems.forEach((item) => {
    if (!departmentBreakdown[item.department]) {
      departmentBreakdown[item.department] = { totalNet: 0, count: 0 };
    }
    departmentBreakdown[item.department].totalNet += item.netSalary;
    departmentBreakdown[item.department].count += 1;
  });

  // Export handlers
  const handleExportPayrollPDF = () => {
    exportMonthlyPayrollPDF(payrollPeriod, payrollItems);
  };

  const handleExportPayrollExcel = () => {
    exportPayrollExcel(payrollPeriod, payrollItems);
  };

  const handleExportAttendancePDF = () => {
    exportAttendanceAuditPDF(attendances, 'September 2026');
  };

  const handleExportAttendanceExcel = () => {
    exportAttendanceExcel(attendances, 'September 2026');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-500/30">
              Live Monitoring Dashboard
            </span>
            <span className="text-xs text-slate-400">Periode: {payrollPeriod.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Ringkasan Kehadiran & Laporan Keuangan Real-Time
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl">
            Pantau kehadiran karyawan dengan verifikasi foto dan radius GPS, kelola perhitungan gaji otomatis, serta ekspor dokumen audit resmi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="admin-absen-now-btn"
            onClick={onOpenAttendanceCapture}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Presensi Selfie (WFO)</span>
          </button>

          <button
            id="admin-calculate-payroll-btn"
            onClick={onTriggerPayrollCalc}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Hitung Payroll Otomatis</span>
          </button>

          <button
            id="admin-disbursement-btn"
            onClick={onOpenDisbursement}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pencairan Gaji (Batch)</span>
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Kehadiran Hari Ini */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Tingkat Kehadiran Hari Ini
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {attendanceRate}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1.5">
              <span className="font-semibold text-emerald-600">{onTimeCount} Tepat Waktu</span>
              <span>•</span>
              <span className="font-semibold text-amber-600">{lateCount} Terlambat</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${attendanceRate}%` }} />
          </div>
        </div>

        {/* KPI 2: Total Pengeluaran Payroll */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Payroll Bulan Ini (Net)
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {formatRupiah(payrollPeriod.totalNet)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Gaji Kotor: <span className="font-medium text-slate-700 dark:text-slate-300">{formatRupiah(payrollPeriod.totalGross)}</span>
            </div>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Kalkulasi Otomatis Presensi Aktif</span>
          </div>
        </div>

        {/* KPI 3: Pengingat Cuti Aktif & Mendatang */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pengingat Cuti Mendatang
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {upcomingLeaves.length} Karyawan
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {upcomingLeaves.length > 0
                ? `${upcomingLeaves[0].employeeName} (${upcomingLeaves[0].daysCount} hr)`
                : 'Tidak ada cuti minggu ini'}
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('leaves')}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center space-x-1"
          >
            <span>Lihat Jadwal Cuti Tim</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* KPI 4: Status Pencairan Gaji */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Status Pencairan Gaji
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {payrollPeriod.status === 'DISBURSED' ? 'LUNAS DICAIRKAN' : 'SIAP DICAIRKAN'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Payment Gateway: <span className="font-semibold text-indigo-600">Xendit / BI-FAST</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500">
            Penerima: {payrollPeriod.totalEmployees} rekening bank
          </div>
        </div>
      </div>

      {/* Audit Export & Notification Action Bar */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
          <FileText className="w-4 h-4 text-indigo-500" />
          <span>Ekspor Dokumen Audit Perusahaan:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export Payroll PDF */}
          <button
            id="export-payroll-pdf-btn"
            onClick={handleExportPayrollPDF}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-rose-500" />
            <span>Payroll PDF</span>
          </button>

          {/* Export Payroll Excel */}
          <button
            id="export-payroll-excel-btn"
            onClick={handleExportPayrollExcel}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Payroll Excel (.xlsx)</span>
          </button>

          {/* Export Attendance PDF */}
          <button
            id="export-attendance-pdf-btn"
            onClick={handleExportAttendancePDF}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            <span>Presensi PDF</span>
          </button>

          {/* Export Attendance Excel */}
          <button
            id="export-attendance-excel-btn"
            onClick={handleExportAttendanceExcel}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-medium flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
            <span>Presensi Excel (.xlsx)</span>
          </button>

          {/* Send Slip Notification */}
          <button
            id="send-all-payslip-notif-btn"
            onClick={onSendAllPayslipNotifications}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm shadow-indigo-600/20 transition-all"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Kirim Notifikasi Slip Gaji</span>
          </button>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: 7-Day Attendance Trend */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Tren Kehadiran 7 Hari Terakhir
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Statistik rasio on-time, terlambat, dan lembur karyawan
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
                <span className="text-slate-600 dark:text-slate-400">Tepat Waktu</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                <span className="text-slate-600 dark:text-slate-400">Terlambat</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
                <span className="text-slate-600 dark:text-slate-400">Lembur</span>
              </span>
            </div>
          </div>

          {/* Visual SVG Chart */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2">
            {[
              { day: 'Jum (05/09)', onTime: 6, late: 1, ot: 2 },
              { day: 'Sen (08/09)', onTime: 7, late: 0, ot: 1 },
              { day: 'Sel (09/09)', onTime: 6, late: 1, ot: 0 },
              { day: 'Rab (10/09)', onTime: 5, late: 2, ot: 3 },
              { day: 'Kam (11/09)', onTime: 4, late: 1, ot: 0 },
            ].map((d, i) => {
              const maxVal = 7;
              const onTimeHeight = (d.onTime / maxVal) * 140;
              const lateHeight = (d.late / maxVal) * 140;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1.5 h-40">
                    <div
                      style={{ height: `${onTimeHeight}px` }}
                      className="w-5 sm:w-8 bg-indigo-600 rounded-t-md hover:opacity-90 transition-all cursor-pointer relative group"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        {d.onTime} hadir
                      </div>
                    </div>
                    {d.late > 0 && (
                      <div
                        style={{ height: `${lateHeight}px` }}
                        className="w-3 sm:w-5 bg-amber-500 rounded-t-md hover:opacity-90 transition-all cursor-pointer relative group"
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                          {d.late} telat
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Department Payroll Allocation */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Alokasi Gaji per Departemen
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribusi pengeluaran keuangan bulan berjalan
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {Object.entries(departmentBreakdown).map(([dept, data]) => {
              const percentage = payrollPeriod.totalNet > 0
                ? Math.round((data.totalNet / payrollPeriod.totalNet) * 100)
                : 0;
              return (
                <div key={dept} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {dept} ({data.count} org)
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatRupiah(data.totalNet)} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Columns: Leave Reminder Card & Recent Live Attendance Selfies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fitur Pengingat Cuti Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Pengingat Cuti Karyawan (Leave Reminders)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Karyawan yang akan cuti dalam 7-14 hari ke depan
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('leaves')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Kelola Cuti
            </button>
          </div>

          <div className="space-y-3">
            {upcomingLeaves.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Tidak ada pengajuan cuti yang disetujui dalam 7 hari ke depan.
              </div>
            ) : (
              upcomingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold text-xs flex items-center justify-center">
                      {leave.daysCount}d
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {leave.employeeName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {leave.department} • {leave.leaveType}
                      </div>
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                        Tanggal: {formatDateIndo(leave.startDate)} s/d {formatDateIndo(leave.endDate)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    DISETUJUI
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Attendance & Selfie Verification Log */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Presensi Masuk Terbaru (Selfie + GPS)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Foto selfie dan verifikasi radius geofence hari ini
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('attendance')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-3">
            {todayAttendances.slice(0, 4).map((att) => (
              <div
                key={att.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={att.checkInPhoto}
                    alt={att.employeeName}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <span>{att.employeeName}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        att.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {att.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Masuk: {att.checkInTime} WIB</span>
                      <span>•</span>
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{att.checkInLocation.distanceToOffice}m</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    att.checkInLocation.isWithinRadius
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    {att.checkInLocation.isWithinRadius ? 'Dalam Radius' : 'Luar Radius'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
