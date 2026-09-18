import React, { useState, useEffect } from 'react';
import {
  Bell,
  Moon,
  Sun,
  Cloud,
  CheckCircle2,
  Shield,
  ChevronDown,
  Building2,
  Menu,
  X,
  Clock,
  Camera,
  Settings,
  UserCheck,
} from 'lucide-react';
import { CompanyRole, NotificationItem, OfficeConfig, SystemAccessLevel, User, UserRole } from '../types';
import { formatDateTimeIndo } from '../utils/formatters';
import { INITIAL_USERS } from '../data/initialData';

export interface NavbarProps {
  currentUser?: User;
  activeUser?: User;
  users?: User[];
  allUsers?: User[];
  roles?: CompanyRole[];
  officeConfig?: OfficeConfig;
  onSelectUser?: (user: User) => void;
  onSwitchUser?: (userId: string) => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  notifications?: NotificationItem[];
  onMarkNotificationRead?: (id: string) => void;
  onMarkAllNotificationsAsRead?: () => void;
  onOpenCloudSync?: () => void;
  onOpenAttendanceModal?: () => void;
  lastCloudSync?: string;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeUser,
  users,
  allUsers,
  roles = [],
  officeConfig,
  onSelectUser,
  onSwitchUser,
  darkMode = false,
  onToggleDarkMode,
  notifications = [],
  onMarkNotificationRead,
  onMarkAllNotificationsAsRead,
  onOpenCloudSync,
  onOpenAttendanceModal,
  lastCloudSync,
  activeTab,
  onSelectTab,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Safely resolve the active user with fallback to prevent undefined role access
  const safeUser: User =
    activeUser ||
    currentUser ||
    (allUsers && allUsers[0]) ||
    (users && users[0]) ||
    INITIAL_USERS[0];

  const safeUsersList: User[] = (allUsers && allUsers.length > 0)
    ? allUsers
    : (users && users.length > 0)
    ? users
    : INITIAL_USERS;

  // Resolve system access level from custom role or standard role
  const resolveSystemAccess = (userRole?: string): SystemAccessLevel => {
    if (!userRole) return 'SUPER_ADMIN';
    if (userRole === 'SUPER_ADMIN' || userRole === 'HR_ADMIN' || userRole === 'FINANCE' || userRole === 'EMPLOYEE') {
      return userRole;
    }
    const matched = roles.find((r) => r.name.toLowerCase() === userRole.toLowerCase() || r.id === userRole);
    if (matched) return matched.systemAccess;
    return 'EMPLOYEE';
  };

  const effectiveAccess: SystemAccessLevel = resolveSystemAccess(safeUser?.role);
  const currentRole: UserRole = safeUser?.role || 'SUPER_ADMIN';

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' WIB'
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const getRoleBadge = (role?: UserRole) => {
    if (!role) return { label: 'User', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };

    const matched = roles.find((r) => r.name.toLowerCase() === role.toLowerCase() || r.id === role);
    if (matched) {
      const colorMap: Record<string, string> = {
        rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
        indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
        emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
        amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
        purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
        teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
        orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
        sky: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      };
      return {
        label: matched.name,
        color: colorMap[matched.badgeColor || 'indigo'] || colorMap.indigo,
      };
    }

    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' };
      case 'FINANCE':
        return { label: 'Finance & Payroll', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' };
      case 'HR_ADMIN':
        return { label: 'HR Admin', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300' };
      case 'EMPLOYEE':
        return { label: 'Karyawan', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' };
      default:
        return { label: role, color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', roles: ['SUPER_ADMIN', 'HR_ADMIN', 'FINANCE'] },
    { id: 'feed', label: 'Feed Kerja', roles: ['SUPER_ADMIN', 'HR_ADMIN', 'FINANCE', 'EMPLOYEE'] },
    { id: 'attendance', label: 'Presensi & GPS', roles: ['SUPER_ADMIN', 'HR_ADMIN', 'FINANCE', 'EMPLOYEE'] },
    { id: 'payroll', label: 'Payroll & Gaji', roles: ['SUPER_ADMIN', 'FINANCE', 'HR_ADMIN'] },
    { id: 'leaves', label: 'Pengingat Cuti', roles: ['SUPER_ADMIN', 'HR_ADMIN', 'FINANCE', 'EMPLOYEE'] },
    { id: 'company', label: 'Pengaturan Perusahaan', roles: ['SUPER_ADMIN'] },
    { id: 'users', label: 'Data Karyawan & Peran', roles: ['SUPER_ADMIN', 'HR_ADMIN'] },
    { id: 'account', label: 'Pengaturan Akun', roles: ['SUPER_ADMIN', 'HR_ADMIN', 'FINANCE', 'EMPLOYEE'] },
    { id: 'portal', label: 'Portal Saya', roles: ['EMPLOYEE'] },
  ];

  const visibleTabs = navTabs.filter((tab) => tab.roles.includes(effectiveAccess));

  const handleUserSelect = (targetUser: User) => {
    if (onSelectUser) {
      onSelectUser(targetUser);
    } else if (onSwitchUser) {
      onSwitchUser(targetUser.id);
    }
    setShowUserMenu(false);
  };

  const handleMarkAllRead = () => {
    if (onMarkAllNotificationsAsRead) {
      onMarkAllNotificationsAsRead();
    } else if (onMarkNotificationRead) {
      notifications.forEach((n) => onMarkNotificationRead(n.id));
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Company Name */}
          <div className="flex items-center space-x-3">
            {officeConfig?.companyLogo ? (
              <img
                src={officeConfig.companyLogo}
                alt={officeConfig.companyName || 'Logo Perusahaan'}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-md shrink-0 bg-white"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight truncate max-w-[180px] sm:max-w-xs">
                  {officeConfig?.companyName || 'Kaosan Apparel'}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 hidden sm:inline-block">
                  HRIS & Payroll
                </span>
              </div>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-2">
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{currentTime || '11:11 WIB'}</span>
                <span>•</span>
                <span className="truncate max-w-[130px] sm:max-w-[200px]">
                  {officeConfig?.name || 'Head Office & Workshop'}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {visibleTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Actions & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Selfie Attendance Button */}
            {onOpenAttendanceModal && (
              <button
                id="quick-attendance-btn"
                onClick={onOpenAttendanceModal}
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Absen Selfie</span>
              </button>
            )}

            {/* Cloud Sync Status Button */}
            {onOpenCloudSync && (
              <button
                id="cloud-sync-btn"
                onClick={onOpenCloudSync}
                title="Status Sinkronisasi Cloud"
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Cloud className="w-3.5 h-3.5 text-emerald-500" />
                <span className="hidden xl:inline">Cloud:</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3 inline" />
                  <span className="hidden sm:inline">Sinkron</span>
                </span>
              </button>
            )}

            {/* Dark Mode Toggle */}
            {onToggleDarkMode && (
              <button
                id="dark-mode-toggle"
                onClick={onToggleDarkMode}
                title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="notifications-btn"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Notifikasi & Pengingat ({unreadNotifs.length})
                    </span>
                    <button
                      type="button"
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                      onClick={handleMarkAllRead}
                    >
                      Tandai semua dibaca
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">Tidak ada notifikasi baru</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => onMarkNotificationRead && onMarkNotificationRead(n.id)}
                          className={`p-3 text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                            !n.read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                              {n.title}
                            </span>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {formatDateTimeIndo(n.timestamp)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Role Switcher & Active User Selector */}
            <div className="relative">
              <button
                id="user-profile-menu"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors"
              >
                <img
                  src={safeUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={safeUser?.name || 'User'}
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    {safeUser?.name || 'Pengguna'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {getRoleBadge(safeUser?.role).label}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User switcher dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Simulasi Hak Akses (RBAC)
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Pilih profil untuk menguji tampilan Super Admin, Finance, HR, atau Karyawan:
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto py-1">
                    {safeUsersList.map((u) => {
                      const isCurrent = u.id === safeUser?.id;
                      const badge = getRoleBadge(u.role);
                      return (
                        <button
                          key={u.id}
                          id={`switch-user-${u.id}`}
                          onClick={() => handleUserSelect(u)}
                          className={`w-full px-4 py-2.5 flex items-center space-x-3 text-left transition-colors ${
                            isCurrent
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-medium'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold truncate text-slate-900 dark:text-white">
                              {u.name}
                            </div>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${badge.color}`}>
                                {badge.label}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate">
                                {u.department}
                              </span>
                            </div>
                          </div>
                          {isCurrent && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Pengaturan Akun & Perusahaan Shortcuts */}
                  <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 px-2 space-y-1">
                    <button
                      type="button"
                      id="dropdown-account-settings-btn"
                      onClick={() => {
                        onSelectTab('account');
                        setShowUserMenu(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2.5 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Pengaturan Akun & Foto Profil</span>
                    </button>

                    {currentRole === 'SUPER_ADMIN' && (
                      <button
                        type="button"
                        id="dropdown-company-settings-btn"
                        onClick={() => {
                          onSelectTab('company');
                          setShowUserMenu(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center space-x-2.5 transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Pengaturan & Foto Perusahaan</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              id="mobile-nav-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-tab-${tab.id}`}
                onClick={() => {
                  onSelectTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
