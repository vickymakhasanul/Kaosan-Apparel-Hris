/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AppState,
  loadAppState,
  saveAppState,
} from './utils/storage';
import {
  AttendanceRecord,
  CompanyDepartment,
  CompanyRole,
  LeaveRequest,
  PaymentGateway,
  PayrollItem,
  PayrollPeriod,
  SocialPost,
  User,
  UserRole,
  OfficeConfig,
} from './types';
import { calculateMonthlyPayroll } from './utils/payrollCalculator';
import { INITIAL_USERS } from './data/initialData';
import { Navbar } from './components/Navbar';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AttendanceManagementView } from './components/AttendanceManagementView';
import { PayrollModuleView } from './components/PayrollModuleView';
import { LeaveManagementView } from './components/LeaveManagementView';
import { UserManagementView } from './components/UserManagementView';
import { EmployeePortalView } from './components/EmployeePortalView';
import { AccountSettingsView } from './components/AccountSettingsView';
import { CompanySettingsView } from './components/CompanySettingsView';
import { SocialFeedView } from './components/SocialFeedView';
import { AttendanceCaptureModal } from './components/AttendanceCaptureModal';
import { ThirdPartyPayoutModal } from './components/ThirdPartyPayoutModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { formatRupiah } from './utils/formatters';
import { applyNationalHolidayToAttendance, checkIsNationalHoliday } from './utils/nationalHolidays';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [activeUser, setActiveUser] = useState<User>(() => {
    const loaded = loadAppState();
    const found = loaded.users?.find((u) => u.id === loaded.activeUserId) || loaded.users?.[0] || INITIAL_USERS[0];
    return found;
  });
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [toastMessage, setToastMessage] = useState<{ id: number; text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Modals state
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Sync dark mode class on <html> document element
  useEffect(() => {
    if (appState.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appState.darkMode]);

  const handleToggleDarkMode = () => {
    setAppState((prev) => ({
      ...prev,
      darkMode: !prev.darkMode,
    }));
  };

  // Persist to local state whenever appState updates
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Keep activeUser updated if appState.users change
  useEffect(() => {
    if (!activeUser?.id) return;
    const updated = appState.users?.find((u) => u.id === activeUser.id);
    if (updated) {
      setActiveUser(updated);
    }
  }, [appState.users, activeUser?.id]);

  // Adjust active tab if user switches role to EMPLOYEE and current tab is admin-only
  useEffect(() => {
    const allowedEmployeeTabs = ['portal', 'feed', 'attendance', 'leaves', 'account'];
    if (activeUser?.role === 'EMPLOYEE' && !allowedEmployeeTabs.includes(currentTab)) {
      setCurrentTab('portal');
    }
  }, [activeUser?.role, currentTab]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setToastMessage({ id, text, type });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.id === id ? null : cur));
    }, 4500);
  };

  // Switch Active User / Role
  const handleSelectUser = (user: User) => {
    setActiveUser(user);
    if (user.role === 'EMPLOYEE') {
      setCurrentTab('portal');
    } else if (currentTab === 'portal') {
      setCurrentTab('dashboard');
    }
    showToast(`Beralih ke akun: ${user.name} (${user.role})`, 'info');
  };

  // Current active payroll period
  const currentPeriod = appState.payrollPeriods[0] || {
    id: 'period-2026-09',
    name: 'September 2026',
    month: 9,
    year: 2026,
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    totalEmployees: appState.users.length,
    totalGross: 0,
    totalNet: 0,
    totalDeductions: 0,
    status: 'CALCULATED',
    calculatedAt: new Date().toISOString(),
  };

  // Trigger Payroll Recalculation based on attendance
  const handleRecalculatePayroll = () => {
    const { items, period } = calculateMonthlyPayroll(
      currentPeriod,
      appState.users,
      appState.attendance,
      appState.officeConfig
    );

    setAppState((prev) => ({
      ...prev,
      payrollItems: items,
      payrollPeriods: [period, ...prev.payrollPeriods.slice(1)],
      lastCloudSync: new Date().toISOString(),
    }));

    showToast(`Perhitungan gaji otomatis selesai: Total ${formatRupiah(period.totalNet)} untuk ${items.length} karyawan.`);
  };

  // Handle new attendance record from camera & GPS capture
  const handleAttendanceSuccess = (record: AttendanceRecord) => {
    const updatedAttendances = [record, ...appState.attendance.filter((a) => a.id !== record.id)];

    // Automatically recalculate payroll so that attendance directly impacts salary
    const { items, period } = calculateMonthlyPayroll(
      currentPeriod,
      appState.users,
      updatedAttendances,
      appState.officeConfig
    );

    const newNotification = {
      id: `notif-${Date.now()}`,
      userId: record.employeeId,
      title: 'Presensi Selfie Berhasil',
      message: `Presensi ${record.status} tercatat pada ${record.checkInTime} WIB (Jarak: ${record.checkInLocation.distanceToOffice}m).`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'ATTENDANCE' as const,
    };

    setAppState((prev) => ({
      ...prev,
      attendance: updatedAttendances,
      payrollItems: items,
      payrollPeriods: [period, ...prev.payrollPeriods.slice(1)],
      notifications: [newNotification, ...prev.notifications],
      lastCloudSync: new Date().toISOString(),
    }));

    showToast(`Presensi berhasil dicatat! Status: ${record.status} (${record.checkInLocation.distanceToOffice}m dari kantor)`);
  };

  // Handle Third-party Disbursement Completion (Xendit / Midtrans)
  const handleDisbursementComplete = (gateway: PaymentGateway, referenceNo: string) => {
    const updatedItems = appState.payrollItems.map((item) => ({
      ...item,
      paymentStatus: 'PAID' as const,
      paymentMethod: gateway,
      disbursementReference: referenceNo,
      paidAt: new Date().toISOString(),
    }));

    const updatedPeriod: PayrollPeriod = {
      ...currentPeriod,
      status: 'DISBURSED' as const,
    };

    const newNotifications = appState.users.map((u) => ({
      id: `notif-payout-${u.id}-${Date.now()}`,
      userId: u.id,
      title: 'Gaji Telah Ditransfer ke Rekening Anda',
      message: `Gaji periode ${updatedPeriod.name} telah dicairkan via ${gateway} Batch Transfer (Ref: ${referenceNo}).`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'PAYROLL' as const,
    }));

    setAppState((prev) => ({
      ...prev,
      payrollItems: updatedItems,
      payrollPeriods: [updatedPeriod, ...prev.payrollPeriods.slice(1)],
      notifications: [...newNotifications, ...prev.notifications],
      lastCloudSync: new Date().toISOString(),
    }));

    showToast(`Pencairan batch via ${gateway} sukses! Seluruh gaji telah berstatus LUNAS.`);
  };

  // Send all payslip notifications to employees
  const handleSendAllPayslipNotifications = () => {
    const newNotifs = appState.users.map((u) => ({
      id: `notif-slip-${u.id}-${Date.now()}`,
      userId: u.id,
      title: 'Notifikasi Slip Gaji Otomatis',
      message: `Slip gaji resmi periode ${currentPeriod.name} telah tersedia untuk dilihat dan diunduh.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'PAYROLL' as const,
    }));

    setAppState((prev) => ({
      ...prev,
      notifications: [...newNotifs, ...prev.notifications],
    }));

    showToast(`Notifikasi slip gaji berhasil dikirimkan ke ${appState.users.length} karyawan!`);
  };

  // Send single payslip notification
  const handleSendSingleNotification = (item: PayrollItem) => {
    const newNotif = {
      id: `notif-single-${item.employeeId}-${Date.now()}`,
      userId: item.employeeId,
      title: 'Notifikasi Slip Gaji Personal',
      message: `Slip gaji ${currentPeriod.name} telah dikirim ke portal Anda (Net: ${formatRupiah(item.netSalary)}).`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'PAYROLL' as const,
    };

    setAppState((prev) => ({
      ...prev,
      notifications: [newNotif, ...prev.notifications],
    }));

    showToast(`Notifikasi slip gaji terkirim ke ${item.employeeName}.`);
  };


  // Mark all notifications as read
  const handleMarkAllNotificationsAsRead = () => {
    setAppState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  // Handle Leave Request
  const handleRequestLeave = (newReqData: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => {
    const newReq: LeaveRequest = {
      ...newReqData,
      id: `leave-${Date.now().toString().slice(-4)}`,
      status: 'PENDING',
      appliedDate: new Date().toISOString().slice(0, 10),
    };

    const newNotif = {
      id: `notif-leave-${Date.now()}`,
      userId: activeUser.id,
      title: 'Permohonan Cuti Diajukan',
      message: `Pengajuan cuti ${newReq.leaveType} (${newReq.daysCount} hari) telah dikirim dan menunggu persetujuan HR.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'LEAVE' as const,
    };

    setAppState((prev) => ({
      ...prev,
      leaves: [newReq, ...prev.leaves],
      notifications: [newNotif, ...prev.notifications],
    }));

    showToast(`Permohonan cuti (${newReq.daysCount} hari) berhasil diajukan.`);
  };

  // Approve Leave Request
  const handleApproveLeave = (id: string) => {
    const targetLeave = appState.leaves.find((l) => l.id === id);
    if (!targetLeave) return;

    const updatedLeaves = appState.leaves.map((l) =>
      l.id === id ? { ...l, status: 'APPROVED' as const, approvedBy: activeUser.name } : l
    );

    // Deduct leave balance if leaveType is TAHUNAN
    const updatedUsers = appState.users.map((u) => {
      if (u.id === targetLeave.employeeId && targetLeave.leaveType === 'TAHUNAN') {
        return { ...u, leaveBalance: Math.max(0, u.leaveBalance - targetLeave.daysCount) };
      }
      return u;
    });

    const notif = {
      id: `notif-leave-approved-${Date.now()}`,
      userId: targetLeave.employeeId,
      title: 'Permohonan Cuti Disetujui',
      message: `Pengajuan cuti ${targetLeave.leaveType} Anda tanggal ${targetLeave.startDate} telah disetujui oleh ${activeUser.name}.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'LEAVE' as const,
    };

    setAppState((prev) => ({
      ...prev,
      leaves: updatedLeaves,
      users: updatedUsers,
      notifications: [notif, ...prev.notifications],
    }));

    showToast(`Pengajuan cuti ${targetLeave.employeeName} disetujui.`);
  };

  // Reject Leave Request
  const handleRejectLeave = (id: string) => {
    const targetLeave = appState.leaves.find((l) => l.id === id);
    if (!targetLeave) return;

    const updatedLeaves = appState.leaves.map((l) =>
      l.id === id ? { ...l, status: 'REJECTED' as const } : l
    );

    setAppState((prev) => ({
      ...prev,
      leaves: updatedLeaves,
    }));

    showToast(`Pengajuan cuti ditolak.`, 'info');
  };

  // Add User
  const handleAddUser = (newUser: User) => {
    const updatedUsers = [...appState.users, newUser];
    const { items, period } = calculateMonthlyPayroll(
      currentPeriod,
      updatedUsers,
      appState.attendance,
      appState.officeConfig
    );

    setAppState((prev) => ({
      ...prev,
      users: updatedUsers,
      payrollItems: items,
      payrollPeriods: [period, ...prev.payrollPeriods.slice(1)],
    }));

    showToast(`Karyawan baru ${newUser.name} berhasil ditambahkan ke sistem.`);
  };

  // Update User
  const handleUpdateUser = (updatedUser: User) => {
    const updatedUsers = appState.users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    const { items, period } = calculateMonthlyPayroll(
      currentPeriod,
      updatedUsers,
      appState.attendance,
      appState.officeConfig
    );

    setAppState((prev) => ({
      ...prev,
      users: updatedUsers,
      payrollItems: items,
      payrollPeriods: [period, ...prev.payrollPeriods.slice(1)],
    }));

    showToast(`Profil & payroll ${updatedUser.name} berhasil diperbarui.`);
  };

  // Delete User
  const handleDeleteUser = (userId: string) => {
    const updatedUsers = appState.users.filter((u) => u.id !== userId);
    const { items, period } = calculateMonthlyPayroll(
      currentPeriod,
      updatedUsers,
      appState.attendance,
      appState.officeConfig
    );

    setAppState((prev) => ({
      ...prev,
      users: updatedUsers,
      payrollItems: items,
      payrollPeriods: [period, ...prev.payrollPeriods.slice(1)],
    }));
  };

  // Roles CRUD
  const handleAddRole = (newRole: CompanyRole) => {
    setAppState((prev) => ({
      ...prev,
      roles: [...prev.roles, newRole],
    }));
  };

  const handleUpdateRole = (updatedRole: CompanyRole) => {
    const oldRole = appState.roles.find((r) => r.id === updatedRole.id);
    setAppState((prev) => {
      let updatedUsers = prev.users;
      if (oldRole && oldRole.name !== updatedRole.name) {
        updatedUsers = prev.users.map((u) => (u.role === oldRole.name ? { ...u, role: updatedRole.name } : u));
      }
      return {
        ...prev,
        roles: prev.roles.map((r) => (r.id === updatedRole.id ? updatedRole : r)),
        users: updatedUsers,
      };
    });
  };

  const handleDeleteRole = (roleId: string) => {
    setAppState((prev) => ({
      ...prev,
      roles: prev.roles.filter((r) => r.id !== roleId),
    }));
  };

  // Departments CRUD
  const handleAddDepartment = (newDept: CompanyDepartment) => {
    setAppState((prev) => ({
      ...prev,
      departments: [...prev.departments, newDept],
    }));
  };

  const handleUpdateDepartment = (updatedDept: CompanyDepartment, oldName?: string) => {
    setAppState((prev) => {
      let updatedUsers = prev.users;
      const targetOldName = oldName || prev.departments.find((d) => d.id === updatedDept.id)?.name;
      if (targetOldName && targetOldName !== updatedDept.name) {
        updatedUsers = prev.users.map((u) => (u.department === targetOldName ? { ...u, department: updatedDept.name } : u));
      }
      return {
        ...prev,
        departments: prev.departments.map((d) => (d.id === updatedDept.id ? updatedDept : d)),
        users: updatedUsers,
      };
    });
  };

  const handleDeleteDepartment = (deptId: string) => {
    setAppState((prev) => ({
      ...prev,
      departments: prev.departments.filter((d) => d.id !== deptId),
    }));
  };

  // Cloud Sync Simulator
  const handleTriggerCloudSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setAppState((prev) => ({
        ...prev,
        lastCloudSync: new Date().toISOString(),
      }));
      showToast('Data berhasil disinkronkan ke server Cloud terenkripsi (AES-256).');
    }, 1200);
  };

  // Update Office Config (Perusahaan & Koordinat GPS)
  const handleUpdateOfficeConfig = (newConfig: OfficeConfig) => {
    setAppState((prev) => ({
      ...prev,
      officeConfig: newConfig,
    }));
    showToast(`Pengaturan perusahaan "${newConfig.companyName}" dan koordinat GPS berhasil disimpan!`);
  };

  // Update Profile & Photo for any account
  const handleUpdateAccountProfile = (updatedUser: User) => {
    setAppState((prev) => ({
      ...prev,
      users: prev.users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
    }));
    setActiveUser(updatedUser);
    showToast('Profil akun dan foto berhasil diperbarui!', 'success');
  };

  // Terapkan status libur nasional ke absensi karyawan
  const handleApplyHolidayAttendance = (holidayDate: string, holidayName: string) => {
    const updated = applyNationalHolidayToAttendance(holidayDate, holidayName, appState.users, appState.attendance);
    setAppState((prev) => ({
      ...prev,
      attendance: updated,
    }));
    showToast(`Presensi libur nasional "${holidayName}" (${holidayDate}) berhasil disinkronkan!`, 'success');
  };

  // Social Feed Handlers
  const handleCreateSocialPost = (newPostData: Omit<SocialPost, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
    const newPost: SocialPost = {
      ...newPostData,
      id: `post-${Date.now()}`,
      likes: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };

    setAppState((prev) => ({
      ...prev,
      socialPosts: [newPost, ...(prev.socialPosts || [])],
    }));
  };

  const handleToggleLikePost = (postId: string) => {
    if (!activeUser) return;
    setAppState((prev) => ({
      ...prev,
      socialPosts: (prev.socialPosts || []).map((p) => {
        if (p.id !== postId) return p;
        const hasLiked = p.likes.includes(activeUser.id);
        const newLikes = hasLiked
          ? p.likes.filter((uid) => uid !== activeUser.id)
          : [...p.likes, activeUser.id];
        return { ...p, likes: newLikes };
      }),
    }));
  };

  const handleAddSocialComment = (postId: string, content: string) => {
    if (!activeUser) return;
    const newComment = {
      id: `comm-${Date.now()}`,
      postId,
      userId: activeUser.id,
      userName: activeUser.name,
      userAvatar: activeUser.avatar,
      userRole: activeUser.role,
      userDepartment: activeUser.department,
      content,
      createdAt: new Date().toISOString(),
    };

    setAppState((prev) => ({
      ...prev,
      socialPosts: (prev.socialPosts || []).map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: [...p.comments, newComment],
        };
      }),
    }));
  };

  const handleDeleteSocialComment = (postId: string, commentId: string) => {
    setAppState((prev) => ({
      ...prev,
      socialPosts: (prev.socialPosts || []).map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: p.comments.filter((c) => c.id !== commentId),
        };
      }),
    }));
  };

  const handleDeleteSocialPost = (postId: string) => {
    setAppState((prev) => ({
      ...prev,
      socialPosts: (prev.socialPosts || []).filter((p) => p.id !== postId),
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentUser={activeUser}
        activeUser={activeUser}
        users={appState.users}
        allUsers={appState.users}
        roles={appState.roles}
        officeConfig={appState.officeConfig}
        darkMode={appState.darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        notifications={appState.notifications}
        activeTab={currentTab}
        onSelectTab={setCurrentTab}
        onSelectUser={handleSelectUser}
        onSwitchUser={(userId) => {
          const found = appState.users.find((u) => u.id === userId);
          if (found) handleSelectUser(found);
        }}
        onOpenCloudSync={() => setIsCloudSyncModalOpen(true)}
        onOpenAttendanceModal={() => setIsAttendanceModalOpen(true)}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
      />

      {/* Main Content View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Toast Alert Banner */}
        {toastMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-indigo-900 text-white shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
            <div className="flex items-center space-x-2.5 text-xs font-semibold">
              {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toastMessage.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
              {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{toastMessage.text}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-lg text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* View Switcher */}
        {currentTab === 'dashboard' && (
          <AdminDashboardView
            users={appState.users}
            attendances={appState.attendance}
            payrollPeriod={currentPeriod}
            payrollItems={appState.payrollItems}
            leaves={appState.leaves}
            onOpenAttendanceCapture={() => setIsAttendanceModalOpen(true)}
            onNavigateTab={setCurrentTab}
            onTriggerPayrollCalc={handleRecalculatePayroll}
            onSendAllPayslipNotifications={handleSendAllPayslipNotifications}
            onOpenDisbursement={() => setIsPayoutModalOpen(true)}
          />
        )}

        {currentTab === 'feed' && (
          <SocialFeedView
            currentUser={activeUser}
            posts={appState.socialPosts || []}
            users={appState.users}
            departments={appState.departments}
            roles={appState.roles}
            onCreatePost={handleCreateSocialPost}
            onToggleLikePost={handleToggleLikePost}
            onAddComment={handleAddSocialComment}
            onDeleteComment={handleDeleteSocialComment}
            onDeletePost={handleDeleteSocialPost}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'attendance' && (
          <AttendanceManagementView
            attendances={appState.attendance}
            users={appState.users}
            onOpenAttendanceCapture={() => setIsAttendanceModalOpen(true)}
            onApplyHolidayAttendance={handleApplyHolidayAttendance}
          />
        )}

        {currentTab === 'payroll' && (
          <PayrollModuleView
            period={currentPeriod}
            items={appState.payrollItems}
            officeConfig={appState.officeConfig}
            onRecalculatePayroll={handleRecalculatePayroll}
            onOpenDisbursement={() => setIsPayoutModalOpen(true)}
            onSendAllPayslipNotifications={handleSendAllPayslipNotifications}
            onSendSingleNotification={handleSendSingleNotification}
          />
        )}

        {currentTab === 'leaves' && (
          <LeaveManagementView
            leaves={appState.leaves}
            currentUserRole={activeUser?.role || 'SUPER_ADMIN'}
            currentUserId={activeUser?.id || 'usr-001'}
            currentUserName={activeUser?.name || 'User'}
            currentUserDept={activeUser?.department || 'Executive'}
            leaveBalance={activeUser?.leaveBalance ?? 12}
            onRequestLeave={handleRequestLeave}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
          />
        )}

        {currentTab === 'company' && (
          <CompanySettingsView
            officeConfig={appState.officeConfig}
            onUpdateOfficeConfig={handleUpdateOfficeConfig}
            users={appState.users}
            attendances={appState.attendance}
            onApplyHolidayAttendance={handleApplyHolidayAttendance}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'users' && (
          <UserManagementView
            users={appState.users}
            roles={appState.roles}
            departments={appState.departments}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            onAddRole={handleAddRole}
            onUpdateRole={handleUpdateRole}
            onDeleteRole={handleDeleteRole}
            onAddDepartment={handleAddDepartment}
            onUpdateDepartment={handleUpdateDepartment}
            onDeleteDepartment={handleDeleteDepartment}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'account' && (
          <AccountSettingsView
            currentUser={activeUser}
            onUpdateUser={handleUpdateAccountProfile}
            onShowToast={showToast}
          />
        )}

        {currentTab === 'portal' && (
          <EmployeePortalView
            currentUser={activeUser}
            attendances={appState.attendance}
            payrollItems={appState.payrollItems}
            payrollPeriod={currentPeriod}
            leaves={appState.leaves}
            officeConfig={appState.officeConfig}
            onOpenAttendanceCapture={() => setIsAttendanceModalOpen(true)}
            onOpenApplyLeave={() => setCurrentTab('leaves')}
            onNavigateFeed={() => setCurrentTab('feed')}
          />
        )}
      </main>

      {/* Attendance Modal (Camera Selfie + GPS Geofencing) */}
      <AttendanceCaptureModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        currentUser={activeUser}
        officeConfig={appState.officeConfig}
        onSuccess={handleAttendanceSuccess}
      />

      {/* Third-party Batch Disbursement Modal (Xendit / Midtrans / BI-FAST) */}
      <ThirdPartyPayoutModal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        period={currentPeriod}
        items={appState.payrollItems}
        onDisbursementComplete={handleDisbursementComplete}
      />


      {/* Cloud Sync & Backup / Restore Modal */}
      <CloudSyncModal
        isOpen={isCloudSyncModalOpen}
        onClose={() => setIsCloudSyncModalOpen(false)}
        appState={appState}
        onRestoreState={(newState) => {
          setAppState(newState);
          showToast('Data aplikasi berhasil dipulihkan dari backup!');
        }}
        onSyncNow={handleTriggerCloudSync}
        isSyncing={isSyncing}
      />
    </div>
  );
}

