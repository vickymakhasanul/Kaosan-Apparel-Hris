export type SystemAccessLevel = 'SUPER_ADMIN' | 'HR_ADMIN' | 'FINANCE' | 'EMPLOYEE';

export type UserRole = SystemAccessLevel | string;

export interface CompanyRole {
  id: string;
  name: string;
  description?: string;
  systemAccess: SystemAccessLevel;
  badgeColor?: string;
  isSystem?: boolean;
}

export interface CompanyDepartment {
  id: string;
  name: string;
  description?: string;
  headOfDepartment?: string;
  color?: string;
}

export type AttendanceStatus = 'HADIR' | 'TERLAMBAT' | 'IZIN' | 'SAKIT' | 'CUTI' | 'ALPHA' | 'LIBUR_NASIONAL';

export interface NationalHoliday {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'HARI_LIBUR_NASIONAL' | 'CUTI_BERSAMA';
  description?: string;
}

export type LeaveType = 'TAHUNAN' | 'SAKIT' | 'MELAHIRKAN' | 'PENTING' | 'ALASAN_KHUSUS';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type PaymentGateway = 'XENDIT' | 'MIDTRANS' | 'BI_FAST';

export type PaymentStatus = 'UNPAID' | 'PROCESSING' | 'PAID' | 'FAILED';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string; // Foto karyawan (URL atau base64)
  role: UserRole; // Peran perusahaan (dapat disesuaikan)
  department: string; // Departemen perusahaan (dapat disesuaikan)
  position: string;
  employeeId: string;
  phone: string;
  address?: string; // Alamat lengkap domisili karyawan
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  baseSalary: number; // Gaji Pokok
  fixedAllowance: number; // Tunjangan Tetap (Transport + Makan)
  leaveBalance: number; // Sisa Kuota Cuti
  joinedDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  address?: string;
  distanceToOffice: number; // in meters
  isWithinRadius: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkInTime: string; // HH:mm:ss
  checkOutTime?: string; // HH:mm:ss
  checkInPhoto: string; // base64 / data URL or photo preview
  checkOutPhoto?: string;
  checkInLocation: LocationCoordinates;
  checkOutLocation?: LocationCoordinates;
  status: AttendanceStatus;
  lateMinutes: number;
  overtimeHours: number;
  notes?: string;
  verifiedBy?: string;
  isFlaggedForReview?: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approvedBy?: string;
  approvalDate?: string;
  notes?: string;
}

export interface PayrollItem {
  id: string;
  periodId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  
  // Attendance stats for this period
  workDays: number;
  presentDays: number;
  lateDays: number;
  lateMinutesTotal: number;
  overtimeHoursTotal: number;
  absentDays: number;
  leaveDays: number;
  
  // Salary calculations
  baseSalary: number;
  allowance: number; // Tunjangan makan & transport based on present days
  overtimePay: number; // Uang lembur
  bonus: number; // Bonus kinerja
  
  // Deductions
  lateDeduction: number; // Potongan terlambat
  absentDeduction: number; // Potongan mangkir/alpha
  bpjsKetenagakerjaan: number; // 3%
  bpjsKesehatan: number; // 1%
  taxDeduction: number; // PPh 21 perkiraan
  otherDeductions: number;
  
  // Totals
  grossSalary: number;
  totalDeductions: number;
  netSalary: number; // Take Home Pay
  
  // Payment status
  paymentStatus: PaymentStatus;
  disbursementId?: string;
  paidAt?: string;
  paymentGateway?: PaymentGateway;
  referenceNo?: string;
  slipNotificationSent: boolean;
  notifiedAt?: string;
}

export interface PayrollPeriod {
  id: string;
  name: string; // e.g., "September 2026"
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  totalEmployees: number;
  totalGross: number;
  totalNet: number;
  totalDeductions: number;
  status: 'DRAFT' | 'CALCULATED' | 'APPROVED' | 'DISBURSED';
  calculatedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  disbursedAt?: string;
}

export interface DisbursementBatch {
  id: string;
  periodId: string;
  gateway: PaymentGateway;
  totalAmount: number;
  totalRecipients: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  referenceNo: string;
  createdAt: string;
  completedAt?: string;
  authorizedBy: string;
  notes: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  category: 'ATTENDANCE' | 'PAYROLL' | 'LEAVE' | 'PAYOUT' | 'USER_MANAGEMENT' | 'SYSTEM';
  action: string;
  details: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  recipientRole?: UserRole | 'ALL';
  recipientId?: string;
  title: string;
  message: string;
  type: 'LEAVE_REMINDER' | 'PAYSLIP_ISSUED' | 'DISBURSEMENT_SUCCESS' | 'ATTENDANCE_ALERT' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface OfficeConfig {
  name: string; // Nama gedung / cabang / workshop
  companyName: string; // Nama resmi perusahaan (contoh: "Kaosan Apparel")
  companyLogo?: string; // URL atau base64 foto/logo perusahaan
  companyPhoto?: string; // URL atau base64 foto gedung / kantor / workshop perusahaan
  tagline?: string; // Slogan perusahaan (contoh: "Premium Custom Apparel & Garment Production")
  industry?: string; // Bidang usaha (contoh: "Tekstil, Konveksi & Fashion Apparel")
  email?: string; // Email resmi kantor
  phone?: string; // Nomor telepon kantor / WhatsApp
  website?: string; // Website resmi
  taxId?: string; // NPWP Perusahaan
  address: string;
  lat: number;
  lng: number;
  radiusMeters: number; // default 150m
  shiftStartTime: string; // "08:30"
  shiftEndTime: string; // "17:30"
  lateGracePeriodMinutes: number; // e.g. 15 mins
  latePenaltyPerOccurrence: number; // e.g. 25000
  overtimeHourlyRate: number; // e.g. 35000
}

export interface SocialComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole?: string;
  userDepartment?: string;
  content: string;
  createdAt: string; // ISO string
}

export interface SocialPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: string;
  userDepartment: string;
  caption: string;
  photoUrl: string; // Base64 or Unsplash photo URL
  locationTag?: string; // e.g. "Workshop Sablon", "Studio Desain", "Pantry", etc.
  moodTag?: string; // e.g. "Semangat Pagi", "Lagi Rehat", "Lembur Ceria", etc.
  likes: string[]; // array of userIds who liked this post
  comments: SocialComment[];
  createdAt: string; // ISO string
}
