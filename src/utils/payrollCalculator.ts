import { AttendanceRecord, PayrollItem, PayrollPeriod, User, OfficeConfig } from '../types';
import { DEFAULT_OFFICE } from './geoUtils';

export function calculateMonthlyPayroll(
  period: PayrollPeriod,
  users: User[],
  attendances: AttendanceRecord[],
  officeConfig: OfficeConfig = DEFAULT_OFFICE
): { period: PayrollPeriod; items: PayrollItem[] } {
  const standardWorkDays = 22; // Hari kerja efektif dalam 1 bulan
  const items: PayrollItem[] = [];

  let totalGross = 0;
  let totalNet = 0;
  let totalDeductions = 0;

  users.forEach((user) => {
    // Filter attendance for this user and this month
    const userAttendances = attendances.filter((att) => {
      if (att.employeeId !== user.id) return false;
      const attDate = new Date(att.date);
      return (
        attDate.getFullYear() === period.year &&
        attDate.getMonth() + 1 === period.month
      );
    });

    let presentDays = 0;
    let lateDays = 0;
    let lateMinutesTotal = 0;
    let overtimeHoursTotal = 0;
    let absentDays = 0;
    let leaveDays = 0;
    let holidayDays = 0;

    userAttendances.forEach((att) => {
      if (att.status === 'HADIR') {
        presentDays++;
      } else if (att.status === 'TERLAMBAT') {
        presentDays++;
        lateDays++;
        lateMinutesTotal += att.lateMinutes || 0;
      } else if (att.status === 'CUTI' || att.status === 'SAKIT' || att.status === 'IZIN') {
        leaveDays++;
      } else if (att.status === 'ALPHA') {
        absentDays++;
      } else if (att.status === 'LIBUR_NASIONAL') {
        holidayDays++;
      }

      if (att.overtimeHours) {
        overtimeHoursTotal += att.overtimeHours;
      }
    });

    // If attendance entries are fewer than standard workdays and not recorded as leave or holiday,
    // count missing days as absent (only if past today or simulated month)
    const recordedDays = presentDays + leaveDays + absentDays + holidayDays;
    if (recordedDays < standardWorkDays && period.status !== 'DRAFT') {
      const remainingUnrecorded = standardWorkDays - recordedDays;
      absentDays += Math.min(remainingUnrecorded, 1); // moderate deduction
    }

    // 1. Tunjangan Kehadiran (Makan & Transport dibayar proporsional hari hadir)
    const dailyAllowance = user.fixedAllowance / standardWorkDays;
    const proratedAllowance = Math.round(dailyAllowance * presentDays);

    // 2. Uang Lembur
    const overtimePay = Math.round(overtimeHoursTotal * officeConfig.overtimeHourlyRate);

    // 3. Bonus Kinerja (default 0 or small perk based on zero lates)
    const bonus = lateDays === 0 && presentDays >= 20 ? 250000 : 0;

    // 4. Potongan Keterlambatan
    const lateDeduction = Math.round(lateDays * officeConfig.latePenaltyPerOccurrence);

    // 5. Potongan Alpha / Tanpa Keterangan
    const dailyBaseSalary = user.baseSalary / standardWorkDays;
    const absentDeduction = Math.round(absentDays * dailyBaseSalary);

    // 6. BPJS Ketenagakerjaan (3% ditanggung pekerja) & BPJS Kesehatan (1% ditanggung pekerja)
    const bpjsKetenagakerjaan = Math.round(user.baseSalary * 0.03);
    const bpjsKesehatan = Math.round(user.baseSalary * 0.01);

    // 7. Estimasi PPh 21 (Pajak Penghasilan)
    // Sederhana: PTKP standard ~ Rp 4.500.000/bln, tarif 5% atas kelebihan
    const taxableBase = Math.max(0, user.baseSalary + proratedAllowance - 4500000);
    const taxDeduction = Math.round(taxableBase * 0.05);

    const grossSalary = user.baseSalary + proratedAllowance + overtimePay + bonus;
    const totalItemDeductions =
      lateDeduction + absentDeduction + bpjsKetenagakerjaan + bpjsKesehatan + taxDeduction;
    const netSalary = Math.max(0, grossSalary - totalItemDeductions);

    totalGross += grossSalary;
    totalNet += netSalary;
    totalDeductions += totalItemDeductions;

    items.push({
      id: `pay-${period.id}-${user.id}`,
      periodId: period.id,
      employeeId: user.id,
      employeeName: user.name,
      department: user.department,
      position: user.position,
      bankName: user.bankName,
      accountNumber: user.accountNumber,
      accountHolder: user.accountHolder,
      workDays: standardWorkDays,
      presentDays,
      lateDays,
      lateMinutesTotal,
      overtimeHoursTotal,
      absentDays,
      leaveDays,
      baseSalary: user.baseSalary,
      allowance: proratedAllowance,
      overtimePay,
      bonus,
      lateDeduction,
      absentDeduction,
      bpjsKetenagakerjaan,
      bpjsKesehatan,
      taxDeduction,
      otherDeductions: 0,
      grossSalary,
      totalDeductions: totalItemDeductions,
      netSalary,
      paymentStatus: 'UNPAID',
      slipNotificationSent: false,
    });
  });

  const updatedPeriod: PayrollPeriod = {
    ...period,
    totalEmployees: users.length,
    totalGross,
    totalNet,
    totalDeductions,
    status: 'CALCULATED',
    calculatedAt: new Date().toISOString(),
  };

  return { period: updatedPeriod, items };
}
