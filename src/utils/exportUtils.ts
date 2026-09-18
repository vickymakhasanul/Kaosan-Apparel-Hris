import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { AttendanceRecord, PayrollItem, PayrollPeriod, OfficeConfig } from '../types';
import { formatDateTimeIndo, formatDateIndo, formatRupiah, numberToWordsIndo } from './formatters';

const DEFAULT_COMPANY_NAME = 'Kaosan Apparel';
const DEFAULT_COMPANY_ADDRESS = 'Gedung Menara Thamrin Lt. 18, Jl. M.H. Thamrin No. 3, Jakarta Pusat 10340';
const DEFAULT_COMPANY_CONTACT = 'Email: halo@kaosanapparel.com | Telp: 0812-3456-7890';

/**
 * Generate Individual Official Payslip PDF
 */
export function exportPayslipPDF(
  item: PayrollItem,
  period: PayrollPeriod,
  officeConfig?: Partial<OfficeConfig>
): void {
  const companyName = (officeConfig?.companyName || DEFAULT_COMPANY_NAME).toUpperCase();
  const companyAddress = officeConfig?.address || DEFAULT_COMPANY_ADDRESS;
  const companyContact = officeConfig
    ? `Email: ${officeConfig.email || 'halo@kaosanapparel.com'} | Telp: ${officeConfig.phone || '0812-3456-7890'}`
    : DEFAULT_COMPANY_CONTACT;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header Background
  doc.setFillColor(30, 41, 59); // Dark slate
  doc.rect(0, 0, 210, 32, 'F');

  // Company Header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, 14, 13);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(companyAddress, 14, 20);
  doc.text(companyContact, 14, 25);

  // Document Title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('SLIP GAJI KARYAWAN', 14, 43);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Periode: ${period.name} | No. Ref: SLIP-${period.id.toUpperCase()}-${item.employeeId.slice(-4).toUpperCase()}`, 14, 49);

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 53, 196, 53);

  // Employee Information Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 57, 182, 28, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 57, 182, 28, 2, 2, 'S');

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('Nama Karyawan:', 18, 64);
  doc.text('ID / Departemen:', 18, 71);
  doc.text('Jabatan / Posisi:', 18, 78);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(item.employeeName, 52, 64);
  doc.text(`${item.employeeId} / ${item.department}`, 52, 71);
  doc.text(item.position, 52, 78);

  // Bank Info (Right Column)
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Bank Transfer:', 115, 64);
  doc.text('No. Rekening:', 115, 71);
  doc.text('Nama Pemilik:', 115, 78);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(item.bankName, 145, 64);
  doc.text(item.accountNumber, 145, 71);
  doc.text(item.accountHolder || item.employeeName, 145, 78);

  // Attendance Summary Box
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 90, 182, 12, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Rekap Absensi: Hari Kerja: ${item.workDays} hr | Hadir: ${item.presentDays} hr | Terlambat: ${item.lateDays}x (${item.lateMinutesTotal} mnt) | Cuti: ${item.leaveDays} hr | Alpha: ${item.absentDays} hr | Lembur: ${item.overtimeHoursTotal} jam`,
    18,
    97.5
  );

  // Table Headers
  let y = 110;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 90, 8, 'F');
  doc.rect(106, y, 90, 8, 'F');

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('PENERIMAAN / PENDAPATAN', 18, y + 5.5);
  doc.text('POTONGAN', 110, y + 5.5);

  y += 13;
  const earnings = [
    { label: 'Gaji Pokok', val: item.baseSalary },
    { label: 'Tunjangan Makan & Transport', val: item.allowance },
    { label: `Uang Lembur (${item.overtimeHoursTotal} Jam)`, val: item.overtimePay },
    { label: 'Bonus Kinerja & Insentif', val: item.bonus },
  ];

  const deductions = [
    { label: `Potongan Terlambat (${item.lateDays}x)`, val: item.lateDeduction },
    { label: `Potongan Mangkir/Alpha (${item.absentDays} hr)`, val: item.absentDeduction },
    { label: 'BPJS Ketenagakerjaan (3%)', val: item.bpjsKetenagakerjaan },
    { label: 'BPJS Kesehatan (1%)', val: item.bpjsKesehatan },
    { label: 'Pajak Penghasilan (PPh 21)', val: item.taxDeduction },
  ];

  const maxRows = Math.max(earnings.length, deductions.length);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');

  for (let i = 0; i < maxRows; i++) {
    if (earnings[i]) {
      doc.setTextColor(71, 85, 105);
      doc.text(earnings[i].label, 18, y);
      doc.setTextColor(15, 23, 42);
      doc.text(formatRupiah(earnings[i].val), 100, y, { align: 'right' });
    }

    if (deductions[i]) {
      doc.setTextColor(71, 85, 105);
      doc.text(deductions[i].label, 110, y);
      doc.setTextColor(185, 28, 28); // Red for deduction
      doc.text(formatRupiah(deductions[i].val), 192, y, { align: 'right' });
    }
    y += 7.5;
  }

  // Divider lines
  y += 2;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 104, y);
  doc.line(106, y, 196, y);

  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Total Pendapatan Kotor:', 18, y);
  doc.text(formatRupiah(item.grossSalary), 100, y, { align: 'right' });

  doc.setTextColor(185, 28, 28);
  doc.text('Total Potongan:', 110, y);
  doc.text(formatRupiah(item.totalDeductions), 192, y, { align: 'right' });

  // Net Pay Highlight Box
  y += 12;
  doc.setFillColor(240, 253, 244); // light green
  doc.roundedRect(14, y, 182, 22, 2, 2, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, y, 182, 22, 2, 2, 'S');

  doc.setFontSize(10);
  doc.setTextColor(22, 101, 52); // green 800
  doc.setFont('helvetica', 'bold');
  doc.text('GAJI BERSIH (TAKE HOME PAY):', 20, y + 8);

  doc.setFontSize(15);
  doc.text(formatRupiah(item.netSalary), 190, y + 10, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(71, 85, 105);
  doc.text(`Terbilang: ${numberToWordsIndo(item.netSalary)}`, 20, y + 16);

  // Signatures & QR stamp
  y += 30;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Jakarta, ${formatDateIndo(new Date().toISOString())}`, 140, y);
  doc.text('Disetujui oleh Finance / HRD,', 140, y + 5);

  // Digital verification stamp
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 75, 26, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, 75, 26, 2, 2, 'S');

  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('[ VERIFIKASI DIGITAL PAYROLL ]', 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Status: ${item.paymentStatus === 'PAID' ? 'LUNAS / DICAIRKAN' : 'DISETUJUI'}`, 18, y + 11);
  doc.text(`Ref Gateway: ${item.referenceNo || 'XND-PAY-' + item.id.slice(-6)}`, 18, y + 16);
  doc.text('Dokumen ini sah tanpa tanda tangan basah.', 18, y + 21);

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('Hendra Kurniawan, S.E.', 140, y + 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Head of Finance & People Ops', 140, y + 29);

  // Footer Note
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Slip gaji ini adalah dokumen rahasia (Strictly Confidential). Dicetak otomatis melalui Sistem Absensi & Payroll PT Nusantara Digital Kreasi.',
    14,
    285
  );

  doc.save(`Slip_Gaji_${item.employeeName.replace(/\s+/g, '_')}_${period.name.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Generate Complete Monthly Payroll Audit Report PDF
 */
export function exportMonthlyPayrollPDF(
  period: PayrollPeriod,
  items: PayrollItem[],
  officeConfig?: Partial<OfficeConfig>
): void {
  const companyName = (officeConfig?.companyName || DEFAULT_COMPANY_NAME).toUpperCase();

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 297, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`LAPORAN AUDIT PENGGAJIAN (PAYROLL) - ${period.name.toUpperCase()}`, 14, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`${companyName} | Waktu Ekspor: ${formatDateTimeIndo(new Date().toISOString())}`, 14, 18);

  // Summary Metrics Bar
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 28, 269, 12, 'F');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(
    `Total Karyawan: ${items.length} org  |  Total Gaji Kotor: ${formatRupiah(period.totalGross)}  |  Total Potongan: ${formatRupiah(period.totalDeductions)}  |  Total Netto (Pencairan): ${formatRupiah(period.totalNet)}  |  Status: ${period.status}`,
    18,
    35.5
  );

  // Table Column definitions
  const headers = [
    'No',
    'Nama Karyawan',
    'Departemen',
    'Hadir / T / A',
    'Gaji Pokok',
    'Tunjangan',
    'Lembur',
    'Potongan',
    'Gaji Bersih (Net)',
    'Bank & Rekening',
    'Status Bayar',
  ];

  const colX = [14, 24, 70, 102, 126, 150, 172, 192, 216, 244, 272];
  let y = 46;

  // Header row
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, 269, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');

  headers.forEach((h, i) => {
    doc.text(h, colX[i] + 1, y + 5.5);
  });

  y += 10;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');

  items.forEach((item, index) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
      // re-draw table header
      doc.setFillColor(30, 41, 59);
      doc.rect(14, y, 269, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      headers.forEach((h, i) => {
        doc.text(h, colX[i] + 1, y + 5.5);
      });
      y += 10;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
    }

    // Row zebra striping
    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 4, 269, 7.5, 'F');
    }

    doc.setTextColor(30, 41, 59);
    doc.text(String(index + 1), colX[0] + 1, y);
    doc.text(item.employeeName.slice(0, 24), colX[1] + 1, y);
    doc.text(item.department.slice(0, 16), colX[2] + 1, y);
    doc.text(`${item.presentDays}/${item.lateDays}/${item.absentDays}`, colX[3] + 1, y);
    doc.text(formatRupiah(item.baseSalary), colX[4] + 1, y);
    doc.text(formatRupiah(item.allowance), colX[5] + 1, y);
    doc.text(formatRupiah(item.overtimePay), colX[6] + 1, y);
    doc.setTextColor(185, 28, 28);
    doc.text(formatRupiah(item.totalDeductions), colX[7] + 1, y);
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(formatRupiah(item.netSalary), colX[8] + 1, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(`${item.bankName} ${item.accountNumber}`, colX[9] + 1, y);
    doc.text(item.paymentStatus, colX[10] + 1, y);

    y += 7.5;
  });

  // Footer totals
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 283, y);
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL KESELURUHAN:', 14, y);
  doc.text(formatRupiah(period.totalNet), colX[8] + 1, y);

  doc.save(`Laporan_Audit_Payroll_${period.name.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Generate Attendance Audit Report PDF
 */
export function exportAttendanceAuditPDF(
  attendances: AttendanceRecord[],
  title: string = 'Rekap Absensi',
  officeConfig?: Partial<OfficeConfig>
): void {
  const companyName = (officeConfig?.companyName || DEFAULT_COMPANY_NAME).toUpperCase();

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 297, 24, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`LAPORAN AUDIT PRESENSI & LOKASI GPS - ${title.toUpperCase()}`, 14, 11);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`${companyName} | Tercatat Otomatis dengan Verifikasi Wajah & Radius Kantor`, 14, 18);

  const headers = ['No', 'Tanggal', 'Nama Karyawan', 'Dept', 'Jam Masuk', 'Jam Pulang', 'Status', 'Terlambat', 'Jarak GPS', 'Verifikasi Lokasi'];
  const colX = [14, 24, 48, 92, 122, 142, 164, 184, 204, 238];

  let y = 36;
  doc.setFillColor(30, 41, 59);
  doc.rect(14, y, 269, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  headers.forEach((h, i) => doc.text(h, colX[i] + 1, y + 5.5));

  y += 10;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');

  attendances.forEach((att, index) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
      doc.setFillColor(30, 41, 59);
      doc.rect(14, y, 269, 8, 'F');
      doc.setTextColor(255, 255, 255);
      headers.forEach((h, i) => doc.text(h, colX[i] + 1, y + 5.5));
      y += 10;
    }

    if (index % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y - 4, 269, 7.5, 'F');
    }

    doc.setTextColor(30, 41, 59);
    doc.text(String(index + 1), colX[0] + 1, y);
    doc.text(att.date, colX[1] + 1, y);
    doc.text(att.employeeName.slice(0, 22), colX[2] + 1, y);
    doc.text(att.department.slice(0, 14), colX[3] + 1, y);
    doc.text(att.checkInTime || '-', colX[4] + 1, y);
    doc.text(att.checkOutTime || '-', colX[5] + 1, y);
    doc.text(att.status, colX[6] + 1, y);
    doc.text(att.lateMinutes > 0 ? `${att.lateMinutes} mnt` : '-', colX[7] + 1, y);
    doc.text(`${att.checkInLocation.distanceToOffice} m`, colX[8] + 1, y);
    doc.text(att.checkInLocation.isWithinRadius ? 'Valid (Dalam Radius)' : 'Luar Radius', colX[9] + 1, y);

    y += 7.5;
  });

  doc.save(`Laporan_Audit_Presensi_${title.replace(/\s+/g, '_')}.pdf`);
}

/**
 * Real Excel Export (.xlsx) for Payroll & Audit
 */
export function exportPayrollExcel(
  period: PayrollPeriod,
  items: PayrollItem[],
  officeConfig?: Partial<OfficeConfig>
): void {
  const companyName = officeConfig?.companyName || DEFAULT_COMPANY_NAME;

  // 1. Data Sheet: Rekap Penggajian
  const payrollRows = items.map((item, index) => ({
    'No': index + 1,
    'ID Karyawan': item.employeeId,
    'Nama Lengkap': item.employeeName,
    'Departemen': item.department,
    'Jabatan': item.position,
    'Hari Kerja': item.workDays,
    'Hari Hadir': item.presentDays,
    'Terlambat (Kali)': item.lateDays,
    'Total Terlambat (Menit)': item.lateMinutesTotal,
    'Hari Mangkir/Alpha': item.absentDays,
    'Hari Cuti': item.leaveDays,
    'Jam Lembur': item.overtimeHoursTotal,
    'Gaji Pokok (Rp)': item.baseSalary,
    'Tunjangan Hadir (Rp)': item.allowance,
    'Uang Lembur (Rp)': item.overtimePay,
    'Bonus & Insentif (Rp)': item.bonus,
    'Gaji Kotor (Rp)': item.grossSalary,
    'Potongan Terlambat (Rp)': item.lateDeduction,
    'Potongan Alpha (Rp)': item.absentDeduction,
    'BPJS Ketenagakerjaan (Rp)': item.bpjsKetenagakerjaan,
    'BPJS Kesehatan (Rp)': item.bpjsKesehatan,
    'Pajak PPh 21 (Rp)': item.taxDeduction,
    'Total Potongan (Rp)': item.totalDeductions,
    'Gaji Bersih / THP (Rp)': item.netSalary,
    'Bank Tujuan': item.bankName,
    'Nomor Rekening': item.accountNumber,
    'Nama Pemilik Rekening': item.accountHolder,
    'Status Pembayaran': item.paymentStatus,
  }));

  // 2. Summary Sheet: Ringkasan Audit
  const auditSummaryRows = [
    { Parameter: 'Nama Perusahaan', Nilai: companyName },
    { Parameter: 'Periode Payroll', Nilai: period.name },
    { Parameter: 'Tanggal Perhitungan', Nilai: period.calculatedAt ? formatDateTimeIndo(period.calculatedAt) : '-' },
    { Parameter: 'Total Karyawan Diproses', Nilai: items.length },
    { Parameter: 'Total Biaya Gaji Kotor', Nilai: period.totalGross },
    { Parameter: 'Total Potongan Karyawan', Nilai: period.totalDeductions },
    { Parameter: 'Total Dana Yang Harus Dicairkan (Net)', Nilai: period.totalNet },
    { Parameter: 'Status Periode', Nilai: period.status },
  ];

  const wb = XLSX.utils.book_new();

  const wsPayroll = XLSX.utils.json_to_sheet(payrollRows);
  const wsSummary = XLSX.utils.json_to_sheet(auditSummaryRows);

  XLSX.utils.book_append_sheet(wb, wsPayroll, 'Rekap Penggajian');
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Audit');

  XLSX.writeFile(wb, `Payroll_${companyName.replace(/\s+/g, '_')}_${period.name.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Real Excel Export (.xlsx) for Attendance Records
 */
export function exportAttendanceExcel(attendances: AttendanceRecord[], title: string = 'Presensi'): void {
  const attendanceRows = attendances.map((att, index) => ({
    'No': index + 1,
    'Tanggal': att.date,
    'ID Karyawan': att.employeeId,
    'Nama Karyawan': att.employeeName,
    'Departemen': att.department,
    'Jam Masuk': att.checkInTime,
    'Jam Keluar': att.checkOutTime || '-',
    'Status Kehadiran': att.status,
    'Menit Terlambat': att.lateMinutes,
    'Jam Lembur': att.overtimeHours,
    'Jarak ke Kantor (Meter)': att.checkInLocation.distanceToOffice,
    'Validasi Radius Geofence': att.checkInLocation.isWithinRadius ? 'Dalam Radius' : 'Luar Radius',
    'Latitude Masuk': att.checkInLocation.lat,
    'Longitude Masuk': att.checkInLocation.lng,
    'Catatan / Alasan': att.notes || '-',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(attendanceRows);
  XLSX.utils.book_append_sheet(wb, ws, 'Data Presensi');

  XLSX.writeFile(wb, `Rekap_Presensi_${title.replace(/\s+/g, '_')}.xlsx`);
}
