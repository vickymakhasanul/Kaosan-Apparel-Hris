import React, { useState } from 'react';
import {
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  CreditCard,
  TrendingUp,
  Bell,
  Eye,
  CheckCircle2,
  RefreshCw,
  Search,
  Building2,
  Send,
  AlertCircle,
} from 'lucide-react';
import { PayrollItem, PayrollPeriod, User, OfficeConfig } from '../types';
import { formatDateTimeIndo, formatRupiah } from '../utils/formatters';
import { exportMonthlyPayrollPDF, exportPayrollExcel, exportPayslipPDF } from '../utils/exportUtils';
import { PayslipDetailModal } from './PayslipDetailModal';

interface PayrollModuleViewProps {
  period: PayrollPeriod;
  items: PayrollItem[];
  officeConfig?: OfficeConfig;
  onRecalculatePayroll: () => void;
  onOpenDisbursement: () => void;
  onSendAllPayslipNotifications: () => void;
  onSendSingleNotification: (item: PayrollItem) => void;
}

export const PayrollModuleView: React.FC<PayrollModuleViewProps> = ({
  period,
  items,
  officeConfig,
  onRecalculatePayroll,
  onOpenDisbursement,
  onSendAllPayslipNotifications,
  onSendSingleNotification,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedItemForPayslip, setSelectedItemForPayslip] = useState<PayrollItem | null>(null);

  const departments = Array.from(new Set(items.map((i) => i.department)));

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || item.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleExportPDF = () => {
    exportMonthlyPayrollPDF(period, filteredItems, officeConfig);
  };

  const handleExportExcel = () => {
    exportPayrollExcel(period, filteredItems, officeConfig);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Manajemen Payroll & Perhitungan Gaji Otomatis
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Periode: {period.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gaji pokok, tunjangan kehadiran, potongan keterlambatan, lembur, dan BPJS dikalkulasi otomatis dari data absensi harian
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="recalc-payroll-btn"
            onClick={onRecalculatePayroll}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
            <span>Hitung Ulang Otomatis</span>
          </button>

          <button
            id="export-payroll-pdf-view-btn"
            onClick={handleExportPDF}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center space-x-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-rose-500" />
            <span>Laporan PDF</span>
          </button>

          <button
            id="export-payroll-excel-view-btn"
            onClick={handleExportExcel}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 flex items-center space-x-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Excel (.xlsx)</span>
          </button>

          <button
            id="send-payslip-notifs-btn"
            onClick={onSendAllPayslipNotifications}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Kirim Notifikasi Slip Gaji</span>
          </button>

          <button
            id="open-disbursement-modal-btn"
            onClick={onOpenDisbursement}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Cairkan Gaji (Xendit/BI-FAST)</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Gaji Bersih (Take Home Pay)
          </span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {formatRupiah(period.totalNet)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Total dana yang harus dicairkan ke karyawan
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Gaji Pokok & Tunjangan
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {formatRupiah(period.totalGross)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Termasuk tunjangan kehadiran & insentif lembur
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Potongan Karyawan
          </span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">
            - {formatRupiah(period.totalDeductions)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Terlambat, mangkir, BPJS & PPh 21
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Status Batch Pembayaran
            </span>
            <span className="inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {period.status === 'DISBURSED' ? 'LUNAS DICAIRKAN' : 'DISETUJUI & SIAP CAIR'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            {period.totalEmployees} rekening bank terdaftar
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            id="search-payroll-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama karyawan / NIK..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          id="filter-payroll-dept"
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">Semua Departemen</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Detailed Payroll Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Karyawan</th>
                <th className="px-4 py-3">Presensi (H / T / A)</th>
                <th className="px-4 py-3">Gaji Pokok</th>
                <th className="px-4 py-3">Tunjangan Hadir</th>
                <th className="px-4 py-3">Uang Lembur</th>
                <th className="px-4 py-3">Potongan</th>
                <th className="px-4 py-3">Gaji Bersih (THP)</th>
                <th className="px-4 py-3">Rekening Bank</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {item.employeeName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.position} • {item.department}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">
                    <span className="text-emerald-600">{item.presentDays} Hadir</span> /{' '}
                    <span className="text-amber-600">{item.lateDays} Telat</span> /{' '}
                    <span className="text-rose-600">{item.absentDays} Alpha</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium">
                    {formatRupiah(item.baseSalary)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-emerald-600 font-medium">
                    +{formatRupiah(item.allowance)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-blue-600 font-medium">
                    +{formatRupiah(item.overtimePay)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-rose-600 font-medium">
                    -{formatRupiah(item.totalDeductions)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-extrabold text-emerald-700 dark:text-emerald-400">
                    {formatRupiah(item.netSalary)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.bankName}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {item.accountNumber}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {item.paymentStatus === 'PAID' ? 'LUNAS' : 'SIAP CAIR'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                    <button
                      id={`view-slip-${item.employeeId}`}
                      onClick={() => setSelectedItemForPayslip(item)}
                      className="px-2.5 py-1 text-xs rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-semibold transition-colors"
                      title="Lihat Slip Gaji Digital"
                    >
                      Slip Gaji
                    </button>
                    <button
                      id={`download-slip-pdf-${item.employeeId}`}
                      onClick={() => exportPayslipPDF(item, period)}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Unduh Slip Gaji PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slip Gaji Detail Modal */}
      <PayslipDetailModal
        isOpen={!!selectedItemForPayslip}
        onClose={() => setSelectedItemForPayslip(null)}
        item={selectedItemForPayslip}
        period={period}
        officeConfig={officeConfig}
        onSendNotification={(item) => onSendSingleNotification(item)}
      />
    </div>
  );
};
