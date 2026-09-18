import { AttendanceRecord, AuditLog, CompanyDepartment, CompanyRole, LeaveRequest, NotificationItem, OfficeConfig, PayrollItem, PayrollPeriod, SocialPost, User } from '../types';
import { INITIAL_ATTENDANCE, INITIAL_AUDIT_LOGS, INITIAL_DEPARTMENTS, INITIAL_LEAVE_REQUESTS, INITIAL_NOTIFICATIONS, INITIAL_ROLES, INITIAL_USERS } from '../data/initialData';
import { INITIAL_SOCIAL_POSTS } from '../data/socialData';
import { DEFAULT_OFFICE } from './geoUtils';
import { calculateMonthlyPayroll } from './payrollCalculator';

const STORAGE_KEYS = {
  USERS: 'hr_payroll_users_v1',
  ROLES: 'hr_payroll_roles_v1',
  DEPARTMENTS: 'hr_payroll_departments_v1',
  ATTENDANCE: 'hr_payroll_attendance_v1',
  LEAVES: 'hr_payroll_leaves_v1',
  PAYROLL_PERIODS: 'hr_payroll_periods_v1',
  PAYROLL_ITEMS: 'hr_payroll_items_v1',
  OFFICE_CONFIG: 'hr_payroll_office_config_v1',
  AUDIT_LOGS: 'hr_payroll_audit_logs_v1',
  NOTIFICATIONS: 'hr_payroll_notifications_v1',
  ACTIVE_USER_ID: 'hr_payroll_active_user_id_v1',
  DARK_MODE: 'hr_payroll_dark_mode_v1',
  LAST_CLOUD_SYNC: 'hr_payroll_last_cloud_sync_v1',
  SOCIAL_POSTS: 'hr_payroll_social_posts_v1',
};

export interface AppState {
  users: User[];
  roles: CompanyRole[];
  departments: CompanyDepartment[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  payrollPeriods: PayrollPeriod[];
  payrollItems: PayrollItem[];
  officeConfig: OfficeConfig;
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  activeUserId: string;
  darkMode: boolean;
  lastCloudSync: string;
  socialPosts: SocialPost[];
}

export function loadInitialState(): AppState {
  try {
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const storedRoles = localStorage.getItem(STORAGE_KEYS.ROLES);
    const storedDepts = localStorage.getItem(STORAGE_KEYS.DEPARTMENTS);
    const storedAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
    const storedLeaves = localStorage.getItem(STORAGE_KEYS.LEAVES);
    const storedPeriods = localStorage.getItem(STORAGE_KEYS.PAYROLL_PERIODS);
    const storedItems = localStorage.getItem(STORAGE_KEYS.PAYROLL_ITEMS);
    const storedOffice = localStorage.getItem(STORAGE_KEYS.OFFICE_CONFIG);
    const storedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    const storedActiveUser = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
    const storedDarkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
    const storedSync = localStorage.getItem(STORAGE_KEYS.LAST_CLOUD_SYNC);
    const storedSocial = localStorage.getItem(STORAGE_KEYS.SOCIAL_POSTS);

    let users: User[] = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
    // Backfill address if missing from older stored state
    users = users.map((u) => {
      if (!u.address) {
        const initialMatch = INITIAL_USERS.find((init) => init.id === u.id);
        return {
          ...u,
          address: initialMatch?.address || 'Jl. Mampang Prapatan No. 28, Jakarta Selatan',
        };
      }
      return u;
    });

    const roles: CompanyRole[] = storedRoles ? JSON.parse(storedRoles) : INITIAL_ROLES;
    const departments: CompanyDepartment[] = storedDepts ? JSON.parse(storedDepts) : INITIAL_DEPARTMENTS;

    const attendance: AttendanceRecord[] = storedAttendance ? JSON.parse(storedAttendance) : INITIAL_ATTENDANCE;
    const leaves: LeaveRequest[] = storedLeaves ? JSON.parse(storedLeaves) : INITIAL_LEAVE_REQUESTS;
    const parsedOffice = storedOffice ? JSON.parse(storedOffice) : {};
    const officeConfig: OfficeConfig = {
      ...DEFAULT_OFFICE,
      ...parsedOffice,
      companyName: parsedOffice.companyName || DEFAULT_OFFICE.companyName,
      companyLogo: parsedOffice.companyLogo || DEFAULT_OFFICE.companyLogo,
      companyPhoto: parsedOffice.companyPhoto || DEFAULT_OFFICE.companyPhoto,
      tagline: parsedOffice.tagline || DEFAULT_OFFICE.tagline,
      industry: parsedOffice.industry || DEFAULT_OFFICE.industry,
    };
    const auditLogs: AuditLog[] = storedAudit ? JSON.parse(storedAudit) : INITIAL_AUDIT_LOGS;
    const notifications: NotificationItem[] = storedNotifs ? JSON.parse(storedNotifs) : INITIAL_NOTIFICATIONS;
    const activeUserId: string = storedActiveUser || 'usr-001'; // Default to Super Admin Hendra Kurniawan
    const darkMode: boolean = storedDarkMode ? JSON.parse(storedDarkMode) : false;
    const lastCloudSync: string = storedSync || new Date().toISOString();
    const socialPosts: SocialPost[] = storedSocial ? JSON.parse(storedSocial) : INITIAL_SOCIAL_POSTS;

    let payrollPeriods: PayrollPeriod[] = storedPeriods ? JSON.parse(storedPeriods) : [];
    let payrollItems: PayrollItem[] = storedItems ? JSON.parse(storedItems) : [];

    if (payrollPeriods.length === 0) {
      const defaultPeriod: PayrollPeriod = {
        id: 'period-2026-09',
        name: 'September 2026',
        month: 9,
        year: 2026,
        startDate: '2026-09-01',
        endDate: '2026-09-30',
        totalEmployees: users.length,
        totalGross: 0,
        totalNet: 0,
        totalDeductions: 0,
        status: 'CALCULATED',
        calculatedAt: '2026-09-11T09:00:00.000Z',
      };

      const calculated = calculateMonthlyPayroll(defaultPeriod, users, attendance, officeConfig);
      payrollPeriods = [calculated.period];
      payrollItems = calculated.items;
    }

    return {
      users,
      roles,
      departments,
      attendance,
      leaves,
      payrollPeriods,
      payrollItems,
      officeConfig,
      auditLogs,
      notifications,
      activeUserId,
      darkMode,
      lastCloudSync,
      socialPosts,
    };
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    // Fallback to fresh defaults
    const defaultPeriod: PayrollPeriod = {
      id: 'period-2026-09',
      name: 'September 2026',
      month: 9,
      year: 2026,
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      totalEmployees: INITIAL_USERS.length,
      totalGross: 0,
      totalNet: 0,
      totalDeductions: 0,
      status: 'CALCULATED',
      calculatedAt: new Date().toISOString(),
    };
    const calculated = calculateMonthlyPayroll(defaultPeriod, INITIAL_USERS, INITIAL_ATTENDANCE, DEFAULT_OFFICE);

    return {
      users: INITIAL_USERS,
      roles: INITIAL_ROLES,
      departments: INITIAL_DEPARTMENTS,
      attendance: INITIAL_ATTENDANCE,
      leaves: INITIAL_LEAVE_REQUESTS,
      payrollPeriods: [calculated.period],
      payrollItems: calculated.items,
      officeConfig: DEFAULT_OFFICE,
      auditLogs: INITIAL_AUDIT_LOGS,
      notifications: INITIAL_NOTIFICATIONS,
      activeUserId: 'usr-001',
      darkMode: false,
      lastCloudSync: new Date().toISOString(),
      socialPosts: INITIAL_SOCIAL_POSTS,
    };
  }
}

export function saveStateToStorage(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(state.users));
    localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(state.roles || []));
    localStorage.setItem(STORAGE_KEYS.DEPARTMENTS, JSON.stringify(state.departments || []));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(state.attendance));
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(state.leaves));
    localStorage.setItem(STORAGE_KEYS.PAYROLL_PERIODS, JSON.stringify(state.payrollPeriods));
    localStorage.setItem(STORAGE_KEYS.PAYROLL_ITEMS, JSON.stringify(state.payrollItems));
    localStorage.setItem(STORAGE_KEYS.OFFICE_CONFIG, JSON.stringify(state.officeConfig));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(state.auditLogs));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(state.notifications));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, state.activeUserId);
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(state.darkMode));
    localStorage.setItem(STORAGE_KEYS.LAST_CLOUD_SYNC, state.lastCloudSync);
    localStorage.setItem(STORAGE_KEYS.SOCIAL_POSTS, JSON.stringify(state.socialPosts || []));
  } catch (err) {
    console.error('Error saving state to localStorage', err);
  }
}

export const loadAppState = loadInitialState;
export const saveAppState = saveStateToStorage;

/**
 * Export complete application data backup as JSON file
 */
export function exportCloudBackupJSON(state: AppState): void {
  const backup = {
    appName: 'Absensi & Payroll Perusahaan',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    encryption: 'AES-256-GCM-SIMULATED',
    data: state,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `Cloud_Backup_Payroll_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
