import React from 'react';
import {
  Download,
  Send,
  Printer,
  X,
  Building2,
  CheckCircle2,
  Calendar,
  User,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { PayrollItem, PayrollPeriod, OfficeConfig } from '../types';
import { formatDateIndo, formatRupiah, numberToWordsIndo } from '../utils/formatters';
import { exportPayslipPDF } from '../utils/exportUtils';

interface PayslipDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: PayrollItem | null;
  period: PayrollPeriod;
  onSendNotification: (item: PayrollItem) => void;
  officeConfig?: OfficeConfig;
}

export const PayslipDetailModal: React.FC<PayslipDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  period,
  onSendNotification,
  officeConfig,
}) => {
  if (!isOpen || !item) return null;

  const companyName = officeConfig?.companyName || 'Kaosan Apparel';
  const companyAddress = officeConfig?.address || 'Gedung Menara Thamrin Lt. 18, Jl. M.H. Thamrin No. 3, Jakarta Pusat';
  const companyContact = `Email: ${officeConfig?.email || 'halo@kaosanapparel.com'} | Telp: ${officeConfig?.phone || '0812-3456-7890'}`;

  const handleDownloadPDF = () => {
    exportPayslipPDF(item, period, officeConfig);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none">
        {/* Top Control Bar (Hidden on Print) */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Slip Gaji Digital Resmi
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {item.paymentStatus === 'PAID' ? 'LUNAS / DICAIRKAN' : 'STATUS: DISETUJUI'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="print-payslip-btn"
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Cetak Dokumen"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              id="download-payslip-pdf-btn"
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm shadow-indigo-600/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh PDF</span>
            </button>
            <button
              id="close-payslip-modal-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Company Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-200 dark:border-slate-800 gap-4">
            <div className="flex items-start space-x-3">
              {officeConfig?.companyLogo ? (
                <img
                  src={officeConfig.companyLogo}
                  alt={companyName}
                  className="w-12 h-12 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-md shrink-0 bg-white"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Building2 className="w-6 h-6" />
                </div>
              )}
              <div>
                <h2 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight uppercase">
                  {companyName}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {companyAddress}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  {companyContact}
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                Slip Gaji Karyawan
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                Periode: {period.name}
              </span>
              <span className="text-[11px] text-slate-400 font-mono block">
                Ref: SLIP-{period.id.slice(-6).toUpperCase()}-{item.employeeId.slice(-4)}
              </span>
            </div>
          </div>

          {/* Employee & Bank Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div className="space-y-1.5 text-xs">
              <div className="flex">
                <span className="w-32 text-slate-500 dark:text-slate-400">Nama Karyawan</span>
                <span className="font-semibold text-slate-900 dark:text-white">: {item.employeeName}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 dark:text-slate-400">ID Karyawan</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">: {item.employeeId}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 dark:text-slate-400">Departemen</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">: {item.department}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 dark:text-slate-400">Posisi / Jabatan</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">: {item.position}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex">
                <span className="w-32 text-slate-500 dark:text-slate-400">Bank Transfer</span>
                <span className="font-semibold text-slate-900 dark:text-white">: {item.bankName}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 dark:text-slate-400">No. Rekening</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">: {item.accountNumber}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 dark:text-slate-400">Atas Nama</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">: {item.accountHolder || item.employeeName}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 dark:text-slate-400">Metode Bayar</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">: Corporate BI-FAST / Xendit</span>
              </div>
            </div>
          </div>

          {/* Attendance Stats Bar */}
          <div className="p-3 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-indigo-900 dark:text-indigo-300">Rekap Presensi:</span>
            <span>Hari Kerja: <strong>{item.workDays}</strong></span>
            <span>•</span>
            <span>Hadir: <strong className="text-emerald-600">{item.presentDays}</strong></span>
            <span>•</span>
            <span>Terlambat: <strong className="text-amber-600">{item.lateDays}x ({item.lateMinutesTotal}m)</strong></span>
            <span>•</span>
            <span>Lembur: <strong className="text-blue-600">{item.overtimeHoursTotal} Jam</strong></span>
            <span>•</span>
            <span>Cuti: <strong>{item.leaveDays}</strong></span>
            <span>•</span>
            <span>Alpha: <strong className="text-rose-600">{item.absentDays}</strong></span>
          </div>

          {/* Earnings & Deductions Dual Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800">
                Penerimaan / Pendapatan
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Gaji Pokok</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatRupiah(item.baseSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Tunjangan Hadir & Makan</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatRupiah(item.allowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Uang Lembur ({item.overtimeHoursTotal} Jam)</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatRupiah(item.overtimePay)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Bonus & Insentif Kinerja</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatRupiah(item.bonus)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Total Pendapatan Kotor</span>
                  <span>{formatRupiah(item.grossSalary)}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-800">
                Potongan Gaji
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Potongan Terlambat ({item.lateDays}x)</span>
                  <span className="font-medium text-rose-600">{formatRupiah(item.lateDeduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Potongan Mangkir ({item.absentDays} hr)</span>
                  <span className="font-medium text-rose-600">{formatRupiah(item.absentDeduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">BPJS Ketenagakerjaan (3%)</span>
                  <span className="font-medium text-rose-600">{formatRupiah(item.bpjsKetenagakerjaan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">BPJS Kesehatan (1%)</span>
                  <span className="font-medium text-rose-600">{formatRupiah(item.bpjsKesehatan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">PPh 21 (Pajak Penghasilan)</span>
                  <span className="font-medium text-rose-600">{formatRupiah(item.taxDeduction)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-rose-600">
                  <span>Total Potongan</span>
                  <span>- {formatRupiah(item.totalDeductions)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Pay (Take Home Pay) Highlight Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                Gaji Bersih (Take Home Pay)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                Terbilang: {numberToWordsIndo(item.netSalary)}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
                {formatRupiah(item.netSalary)}
              </span>
            </div>
          </div>

          {/* Verification & Signatures */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center space-x-1.5 text-slate-800 dark:text-slate-200 font-bold mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verifikasi Digital Sistem</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Dokumen ini digenerate secara otomatis oleh sistem absensi & payroll cloud PT Nusantara Digital Kreasi dan sah tanpa cap/tanda tangan basah.
              </p>
              <div className="mt-2 text-[10px] font-mono text-slate-400">
                HASH: SHA256-{(item.id + item.netSalary).slice(0, 16).toUpperCase()}
              </div>
            </div>

            <div className="text-center sm:text-right flex flex-col justify-end">
              <span className="text-[11px] text-slate-400">Jakarta, {formatDateIndo(new Date().toISOString())}</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-6">
                Hendra Kurniawan, S.E.
              </span>
              <span className="text-[11px] text-slate-500">Chief People & Culture</span>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
          <button
            type="button"
            id="notify-employee-slip-btn"
            onClick={() => onSendNotification(item)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-indigo-500" />
            <span>Kirim Notifikasi ke Karyawan</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh File PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
