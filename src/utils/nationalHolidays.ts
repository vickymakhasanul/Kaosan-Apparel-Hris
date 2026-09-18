import { AttendanceRecord, NationalHoliday, OfficeConfig, User } from '../types';
import { DEFAULT_OFFICE } from './geoUtils';

/**
 * Daftar Hari Libur Nasional & Cuti Bersama Resmi Indonesia (SKB 3 Menteri)
 * Meliputi tahun 2025, 2026, dan 2027
 */
export const INDONESIA_NATIONAL_HOLIDAYS: NationalHoliday[] = [
  // 2025
  { date: '2025-01-01', name: 'Tahun Baru 2025 Masehi', type: 'HARI_LIBUR_NASIONAL', description: 'Tahun Baru Kalender Masehi' },
  { date: '2025-01-27', name: 'Isra Mi\'raj Nabi Muhammad SAW', type: 'HARI_LIBUR_NASIONAL', description: 'Peringatan Isra Mi\'raj' },
  { date: '2025-01-29', name: 'Tahun Baru Imlek 2576 Kongzili', type: 'HARI_LIBUR_NASIONAL', description: 'Tahun Baru Kalender Imlek' },
  { date: '2025-03-29', name: 'Hari Suci Nyepi (Tahun Baru Saka 1947)', type: 'HARI_LIBUR_NASIONAL', description: 'Hari Suci Nyepi' },
  { date: '2025-03-31', name: 'Hari Raya Idul Fitri 1446 H (Hari 1)', type: 'HARI_LIBUR_NASIONAL', description: 'Hari Raya Idul Fitri' },
  { date: '2025-04-01', name: 'Hari Raya Idul Fitri 1446 H (Hari 2)', type: 'HARI_LIBUR_NASIONAL', description: 'Hari Raya Idul Fitri' },
  { date: '2025-04-18', name: 'Wafat Yesus Kristus (Jumat Agung)', type: 'HARI_LIBUR_NASIONAL', description: 'Wafat Isa Al-Masih' },
  { date: '2025-04-20', name: 'Hari Paskah', type: 'HARI_LIBUR_NASIONAL', description: 'Kebangkitan Isa Al-Masih' },
  { date: '2025-05-01', name: 'Hari Buruh Internasional', type: 'HARI_LIBUR_NASIONAL', description: 'May Day' },
  { date: '2025-05-12', name: 'Hari Raya Waisak 2569 BE', type: 'HARI_LIBUR_NASIONAL', description: 'Hari Raya Trisuci Waisak' },
  { date: '2025-05-29', name: 'Kenaikan Yesus Kristus', type: 'HARI_LIBUR_NASIONAL', description: 'Kenaikan Isa Al-Masih' },
  { date: '2025-06-01', name: 'Hari Lahir Pancasila', type: 'HARI_LIBUR_NASIONAL', description: 'Peringatan Hari Lahir Pancasila' },
  { date: '2025-06-07', name: 'Hari Raya Idul Adha 1446 H', type: 'HARI_LIBUR_NASIONAL', description: 'Hari Raya Kurban' },
  { date: '2025-06-27', name: 'Tahun Baru Islam 1447 H', type: 'HARI_LIBUR_NASIONAL', description: '1 Muharram 1447 Hijriyah' },
  { date: '2025-08-17', name: 'Hari Kemerdekaan Republik Indonesia Ke-80', type: 'HARI_LIBUR_NASIONAL', description: 'HUT Proklamasi Kemerdekaan RI' },
  { date: '2025-09-05', name: 'Maulid Nabi Muhammad SAW', type: 'HARI_LIBUR_NASIONAL', description: 'Peringatan Kelahiran Nabi Muhammad SAW' },
  { date: '2025-12-25', name: 'Hari Raya Natal', type: 'HARI_LIBUR_NASIONAL', description: 'Kelahiran Yesus Kristus' },

  // 2026 (Tahun Aktif Aplikasi)
  { date: '2026-01-01', name: 'Tahun Baru 2026 Masehi', type: 'HARI_LIBUR_NASIONAL', description: 'Tahun Baru Kalender Masehi' },
  { date: '2026-01-16', name: 'Isra Mi\'raj Nabi Muhammad SAW', type: 'HARI_LIBUR_NASIONAL', description: 'Peringatan Isra Mi\'raj 1447 H' },
  { date: '2026-02-17', name: 'Tahun Baru Imlek 2577 Kongzili', type: 'HARI_LIBUR_NASIONAL', description: 'Tahun Baru Imlek (Tahun Kuda Api)' },
  { date: '2026-03-20', name: 'Hari Suci Nyepi (Tahun Baru Saka 1948)', type: 'HARI_LIBUR_NASIONAL', description: 'Hari Raya Nyepi' },
  { date: '2026-03-20', name: 'Hari Raya Idul Fitri 1447 H (Hari 1)', type: 'HARI_LIBUR_NASIONAL', description: 'Hari Raya Idul Fitri 1 Syawal 1447 H' },
  { date: '2026-03-21', name: 'Hari Raya Idul Fitri 1447 H (Hari 2)', type: 'HARI_LIBUR_NASIONAL', description: 'Hari Raya Idul Fitri 2 Syawal 1447 H' },
  { date: '2026-03-23', name: 'Cuti Bersama Idul Fitri 1447 H', type: 'CUTI_BERSAMA', description: 'Cuti Bersama Pemerintah' },
  { date: '2026-03-24', name: 'Cuti Bersama Idul Fitri 1447 H', type: 'CUTI_BERSAMA', description: 'Cuti Bersama Pemerintah' },
  { date: '2026-04-03', name: 'Wafat Yesus Kristus (Jumat Agung)', type: 'HARI_LIBUR_NASIONAL', description: 'Peringatan Wafat Yesus Kristus' },
  { date: '2026-04-05', name: 'Hari Paskah', type: 'HARI_LIBUR_NASIONAL', description: 'Hari Raya Paskah' },
  { date: '2026-05-01', name: 'Hari Buruh Internasional', type: 'HARI_LIBUR_NASIONAL', description: 'Hari Buruh Sedunia (May Day)' },
  { date: '2026-05-14', name: 'Kenaikan Yesus Kristus', type: 'HARI_LIBUR_NASIONAL', description: 'Peringatan Kenaikan Yesus Kristus' },
  { date: '2026-05-27', name: 'Hari Raya Idul Adha 1447 H', type: 'HARI_LIBUR_NASIONAL', description: 'Hari Raya Qurban 10 Dzulhijjah 1447 H' },
  { date: '2026-05-31', name: 'Hari Raya Waisak 2570 BE', type: 'HARI_LIBUR_NASIONAL', description: 'Peringatan Hari Raya Tri Suci Waisak' },
  { date: '2026-06-01', name: 'Hari Lahir Pancasila', type: 'HARI_LIBUR_NASIONAL', description: 'Peringatan Hari Lahir Ideologi Pancasila' },
  { date: '2026-06-16', name: 'Tahun Baru Islam 1448 H', type: 'HARI_LIBUR_NASIONAL', description: '1 Muharram Tahun Baru Hijriyah 1448 H' },
  { date: '2026-08-17', name: 'Hari Kemerdekaan Republik Indonesia Ke-81', type: 'HARI_LIBUR_NASIONAL', description: 'HUT Kemerdekaan Proklamasi RI' },
  { date: '2026-08-25', name: 'Maulid Nabi Muhammad SAW 1448 H', type: 'HARI_LIBUR_NASIONAL', description: 'Peringatan Kelahiran Nabi Muhammad SAW' },
  { date: '2026-09-04', name: 'Maulid Nabi Muhammad SAW (Kalender Kerja)', type: 'HARI_LIBUR_NASIONAL', description: 'Hari Libur Nasional Keagamaan Resmi' },
  { date: '2026-12-24', name: 'Cuti Bersama Hari Raya Natal', type: 'CUTI_BERSAMA', description: 'Cuti Bersama Menjelang Natal' },
  { date: '2026-12-25', name: 'Hari Raya Natal', type: 'HARI_LIBUR_NASIONAL', description: 'Peringatan Hari Kelahiran Yesus Kristus' },

  // 2027
  { date: '2027-01-01', name: 'Tahun Baru 2027 Masehi', type: 'HARI_LIBUR_NASIONAL', description: 'Tahun Baru Kalender Masehi' },
  { date: '2027-01-05', name: 'Isra Mi\'raj Nabi Muhammad SAW', type: 'HARI_LIBUR_NASIONAL', description: 'Peringatan Isra Mi\'raj 1448 H' },
  { date: '2027-02-06', name: 'Tahun Baru Imlek 2578 Kongzili', type: 'HARI_LIBUR_NASIONAL', description: 'Tahun Baru Imlek' },
  { date: '2027-03-09', name: 'Hari Raya Idul Fitri 1448 H', type: 'HARI_LIBUR_NASIONAL', description: 'Hari Raya Idul Fitri 1448 H' },
  { date: '2027-03-10', name: 'Hari Raya Idul Fitri 1448 H (Hari 2)', type: 'HARI_LIBUR_NASIONAL', description: 'Hari Raya Idul Fitri 1448 H' },
  { date: '2027-03-26', name: 'Wafat Yesus Kristus', type: 'HARI_LIBUR_NASIONAL', description: 'Wafat Isa Al-Masih' },
  { date: '2027-05-01', name: 'Hari Buruh Internasional', type: 'HARI_LIBUR_NASIONAL', description: 'Hari Buruh' },
  { date: '2027-08-17', name: 'Hari Kemerdekaan Republik Indonesia Ke-82', type: 'HARI_LIBUR_NASIONAL', description: 'HUT Proklamasi RI' },
  { date: '2027-12-25', name: 'Hari Raya Natal', type: 'HARI_LIBUR_NASIONAL', description: 'Hari Natal' },
];

/**
 * Cek apakah sebuah tanggal tertentu (YYYY-MM-DD) merupakan Hari Libur Nasional / Cuti Bersama
 */
export function checkIsNationalHoliday(dateStr: string): { isHoliday: boolean; holiday?: NationalHoliday } {
  // Normalize string to YYYY-MM-DD format
  const normalizedDate = dateStr.slice(0, 10);
  const holiday = INDONESIA_NATIONAL_HOLIDAYS.find((h) => h.date === normalizedDate);
  return {
    isHoliday: !!holiday,
    holiday,
  };
}

/**
 * Ambil daftar hari libur nasional untuk tahun tertentu (default: tahun berjalan)
 */
export function getHolidaysForYear(year: number = 2026): NationalHoliday[] {
  const yearStr = String(year);
  return INDONESIA_NATIONAL_HOLIDAYS.filter((h) => h.date.startsWith(yearStr));
}

/**
 * Ambil hari libur yang akan datang dari tanggal acuan
 */
export function getUpcomingNationalHolidays(
  fromDateOrLimit?: string | number,
  limitCount: number = 5
): (NationalHoliday & { daysUntil: number })[] {
  let fromDateStr = new Date().toISOString().slice(0, 10);
  let limit = limitCount;

  if (typeof fromDateOrLimit === 'number') {
    limit = fromDateOrLimit;
  } else if (typeof fromDateOrLimit === 'string') {
    fromDateStr = fromDateOrLimit;
  }

  const fromDate = new Date(fromDateStr);
  fromDate.setHours(0, 0, 0, 0);

  return INDONESIA_NATIONAL_HOLIDAYS.map((holiday) => {
    const holidayDate = new Date(holiday.date);
    holidayDate.setHours(0, 0, 0, 0);
    const diffTime = holidayDate.getTime() - fromDate.getTime();
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      ...holiday,
      daysUntil,
    };
  })
    .filter((h) => h.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, limit);
}

/**
 * Terapkan status LIBUR_NASIONAL otomatis untuk seluruh karyawan pada tanggal libur nasional
 */
export function applyNationalHolidayToAttendance(
  holidayDate: string,
  holidayName: string,
  users: User[],
  currentAttendances: AttendanceRecord[],
  office: OfficeConfig = DEFAULT_OFFICE
): AttendanceRecord[] {
  const normalizedDate = holidayDate.slice(0, 10);
  const newRecords: AttendanceRecord[] = [];

  // Clone attendance list
  const updatedList = currentAttendances.map((att) => ({ ...att }));

  users.forEach((user) => {
    // Cek apakah karyawan sudah memiliki presensi pada tanggal tersebut
    const existing = updatedList.find(
      (att) => att.employeeId === user.id && att.date === normalizedDate
    );

    if (existing) {
      // Jika statusnya bukan HADIR atau lembur khusus, update menjadi LIBUR_NASIONAL
      if (existing.status !== 'HADIR') {
        existing.status = 'LIBUR_NASIONAL';
        existing.notes = `Hari Libur Nasional: ${holidayName}`;
      }
    } else {
      // Buat rekaman presensi otomatis berstatus LIBUR_NASIONAL
      newRecords.push({
        id: `att-holiday-${user.id}-${normalizedDate}`,
        employeeId: user.id,
        employeeName: user.name,
        department: user.department,
        date: normalizedDate,
        checkInTime: '00:00:00',
        checkOutTime: '00:00:00',
        checkInPhoto: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=200&auto=format&fit=crop&q=80',
        checkInLocation: {
          lat: office.lat,
          lng: office.lng,
          distanceToOffice: 0,
          isWithinRadius: true,
          address: `Hari Libur Nasional (${holidayName})`,
        },
        status: 'LIBUR_NASIONAL',
        lateMinutes: 0,
        overtimeHours: 0,
        notes: `Hari Libur Nasional: ${holidayName}`,
      });
    }
  });

  return [...newRecords, ...updatedList];
}
