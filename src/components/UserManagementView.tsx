import React, { useState, useRef } from 'react';
import {
  Users,
  Shield,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Key,
  Building2,
  Mail,
  Phone,
  CreditCard,
  X,
  MapPin,
  Camera,
  Upload,
  Search,
  Filter,
  Eye,
  Briefcase,
  Layers,
  Sparkles,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { CompanyDepartment, CompanyRole, SystemAccessLevel, User, UserRole } from '../types';
import { formatRupiah } from '../utils/formatters';

export interface UserManagementViewProps {
  users: User[];
  roles: CompanyRole[];
  departments: CompanyDepartment[];
  onAddUser: (newUser: User) => void;
  onUpdateUser: (updatedUser: User) => void;
  onDeleteUser?: (userId: string) => void;
  onAddRole: (newRole: CompanyRole) => void;
  onUpdateRole: (updatedRole: CompanyRole) => void;
  onDeleteRole: (roleId: string) => void;
  onAddDepartment: (newDept: CompanyDepartment) => void;
  onUpdateDepartment: (updatedDept: CompanyDepartment, oldName?: string) => void;
  onDeleteDepartment: (deptId: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

// Preset photo options for quick avatar selection
const AVATAR_PRESETS = [
  { label: 'Pria 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80' },
  { label: 'Wanita 1', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80' },
  { label: 'Pria 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80' },
  { label: 'Pria 3', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80' },
  { label: 'Wanita 2', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80' },
  { label: 'Pria 4', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80' },
  { label: 'Pria 5', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80' },
  { label: 'Wanita 3', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80' },
];

const BADGE_COLORS: { id: string; label: string; class: string }[] = [
  { id: 'indigo', label: 'Indigo', class: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
  { id: 'rose', label: 'Rose / Merah', class: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
  { id: 'emerald', label: 'Emerald / Hijau', class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  { id: 'amber', label: 'Amber / Kuning', class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  { id: 'cyan', label: 'Cyan / Biru Muda', class: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' },
  { id: 'purple', label: 'Purple / Ungu', class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  { id: 'teal', label: 'Teal / Toska', class: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200 dark:border-teal-800' },
  { id: 'orange', label: 'Orange / Jingga', class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
  { id: 'sky', label: 'Sky / Biru Langit', class: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200 dark:border-sky-800' },
  { id: 'blue', label: 'Blue / Biru', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
];

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  roles,
  departments,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddRole,
  onUpdateRole,
  onDeleteRole,
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onShowToast,
}) => {
  // Navigation tabs within User Management
  const [activeTab, setActiveTab] = useState<'employees' | 'roles' | 'departments'>('employees');

  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [previewUserPhoto, setPreviewUserPhoto] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  // Role management state
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<CompanyRole | null>(null);
  const [deleteConfirmRole, setDeleteConfirmRole] = useState<CompanyRole | null>(null);

  // Department management state
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState<CompanyDepartment | null>(null);
  const [deleteConfirmDept, setDeleteConfirmDept] = useState<CompanyDepartment | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [filterDept, setFilterDept] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // File upload input refs
  const addFileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAvatar, setNewAvatar] = useState(AVATAR_PRESETS[0].url);
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<string>(roles[0]?.name || 'Operator Sablon & Printing');
  const [newDept, setNewDept] = useState<string>(departments[0]?.name || 'Produksi & Sablon');
  const [newPosition, setNewPosition] = useState('');
  const [newBank, setNewBank] = useState('BCA');
  const [newAccount, setNewAccount] = useState('');
  const [newAccountHolder, setNewAccountHolder] = useState('');
  const [newSalary, setNewSalary] = useState(8500000);
  const [newAllowance, setNewAllowance] = useState(1500000);
  const [newLeaveBalance, setNewLeaveBalance] = useState(12);

  // New role form state
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleAccess, setNewRoleAccess] = useState<SystemAccessLevel>('EMPLOYEE');
  const [newRoleColor, setNewRoleColor] = useState('indigo');

  // New department form state
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptHead, setNewDeptHead] = useState('');
  const [newDeptColor, setNewDeptColor] = useState('indigo');

  // Helper to get badge style for a role
  const getBadgeStyle = (roleName: string) => {
    const matched = roles.find((r) => r.name.toLowerCase() === roleName.toLowerCase() || r.id === roleName);
    if (matched) {
      const found = BADGE_COLORS.find((b) => b.id === (matched.badgeColor || 'indigo'));
      if (found) return found.class;
    }
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
  };

  // Helper to get department style
  const getDeptBadgeStyle = (deptName: string) => {
    const matched = departments.find((d) => d.name.toLowerCase() === deptName.toLowerCase() || d.id === deptName);
    if (matched) {
      const found = BADGE_COLORS.find((b) => b.id === (matched.color || 'indigo'));
      if (found) return found.class;
    }
    return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  // Filtered employees
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.address && u.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.position && u.position.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesDept = filterDept === 'ALL' || u.department === filterDept;
    const matchesStatus = filterStatus === 'ALL' || u.status === filterStatus;

    return matchesSearch && matchesRole && matchesDept && matchesStatus;
  });

  // Handle image upload from computer / camera
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      if (onShowToast) onShowToast('Ukuran foto terlalu besar! Maksimal 4MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (isEdit && editingUser) {
        setEditingUser({ ...editingUser, avatar: base64 });
      } else {
        setNewAvatar(base64);
      }
      if (onShowToast) onShowToast('Foto karyawan berhasil diunggah!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Create new user
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      if (onShowToast) onShowToast('Nama lengkap dan email wajib diisi.', 'error');
      return;
    }

    const id = `usr-${Date.now().toString().slice(-4)}`;
    const employeeId = `NDK-${String(users.length + 1).padStart(3, '0')}`;

    const created: User = {
      id,
      name: newName.trim(),
      email: newEmail.trim(),
      avatar: newAvatar || AVATAR_PRESETS[0].url,
      role: newRole || roles[0]?.name || 'EMPLOYEE',
      department: newDept || departments[0]?.name || 'Produksi & Sablon',
      position: newPosition.trim() || 'Staff',
      employeeId,
      phone: newPhone.trim() || '0812-3456-7890',
      address: newAddress.trim() || 'Jl. Mampang Prapatan No. 28, Jakarta Selatan',
      bankName: newBank,
      accountNumber: newAccount.trim() || '1234567890',
      accountHolder: newAccountHolder.trim() || newName.trim(),
      baseSalary: Number(newSalary) || 8500000,
      fixedAllowance: Number(newAllowance) || 1500000,
      leaveBalance: Number(newLeaveBalance) || 12,
      joinedDate: new Date().toISOString().slice(0, 10),
      status: 'ACTIVE',
    };

    onAddUser(created);
    setShowAddUserModal(false);

    // Reset fields
    setNewName('');
    setNewEmail('');
    setNewAddress('');
    setNewPhone('');
    setNewPosition('');
    setNewAccount('');
    setNewAccountHolder('');
    setNewAvatar(AVATAR_PRESETS[0].url);

    if (onShowToast) onShowToast(`Karyawan ${created.name} berhasil didaftarkan.`);
  };

  // Save edit user
  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    onUpdateUser(editingUser);
    setEditingUser(null);
    if (onShowToast) onShowToast(`Data karyawan ${editingUser.name} berhasil diperbarui.`);
  };

  // Delete user
  const handleConfirmDeleteUser = () => {
    if (!deleteConfirmUser) return;
    if (onDeleteUser) {
      onDeleteUser(deleteConfirmUser.id);
    } else {
      // Fallback: update status to INACTIVE
      onUpdateUser({ ...deleteConfirmUser, status: 'INACTIVE' });
    }
    setDeleteConfirmUser(null);
    if (onShowToast) onShowToast(`Karyawan ${deleteConfirmUser.name} berhasil dihapus.`);
  };

  // Create new role
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    const id = `role-${Date.now().toString().slice(-4)}`;
    const created: CompanyRole = {
      id,
      name: newRoleName.trim(),
      description: newRoleDesc.trim(),
      systemAccess: newRoleAccess,
      badgeColor: newRoleColor,
    };

    onAddRole(created);
    setShowAddRoleModal(false);
    setNewRoleName('');
    setNewRoleDesc('');
    setNewRoleAccess('EMPLOYEE');
    setNewRoleColor('indigo');

    if (onShowToast) onShowToast(`Peran baru "${created.name}" berhasil ditambahkan.`);
  };

  // Save edit role
  const handleSaveEditRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;
    onUpdateRole(editingRole);
    setEditingRole(null);
    if (onShowToast) onShowToast(`Peran "${editingRole.name}" berhasil diperbarui.`);
  };

  // Delete role
  const handleConfirmDeleteRole = () => {
    if (!deleteConfirmRole) return;
    const usersCount = users.filter((u) => u.role === deleteConfirmRole.name || u.role === deleteConfirmRole.id).length;
    if (usersCount > 0) {
      if (onShowToast) onShowToast(`Peran tidak dapat dihapus karena sedang digunakan oleh ${usersCount} karyawan! Silakan ubah peran karyawan terlebih dahulu.`, 'error');
      setDeleteConfirmRole(null);
      return;
    }

    onDeleteRole(deleteConfirmRole.id);
    setDeleteConfirmRole(null);
    if (onShowToast) onShowToast(`Peran "${deleteConfirmRole.name}" berhasil dihapus.`);
  };

  // Create new department
  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    const id = `dept-${Date.now().toString().slice(-4)}`;
    const created: CompanyDepartment = {
      id,
      name: newDeptName.trim(),
      description: newDeptDesc.trim(),
      headOfDepartment: newDeptHead.trim(),
      color: newDeptColor,
    };

    onAddDepartment(created);
    setShowAddDeptModal(false);
    setNewDeptName('');
    setNewDeptDesc('');
    setNewDeptHead('');
    setNewDeptColor('indigo');

    if (onShowToast) onShowToast(`Departemen baru "${created.name}" berhasil ditambahkan.`);
  };

  // Save edit department
  const handleSaveEditDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    const original = departments.find((d) => d.id === editingDept.id);
    onUpdateDepartment(editingDept, original?.name);
    setEditingDept(null);
    if (onShowToast) onShowToast(`Departemen "${editingDept.name}" berhasil diperbarui.`);
  };

  // Delete department
  const handleConfirmDeleteDept = () => {
    if (!deleteConfirmDept) return;
    const usersCount = users.filter((u) => u.department === deleteConfirmDept.name || u.department === deleteConfirmDept.id).length;
    if (usersCount > 0) {
      if (onShowToast) onShowToast(`Departemen tidak dapat dihapus karena masih terdapat ${usersCount} karyawan di dalamnya!`, 'error');
      setDeleteConfirmDept(null);
      return;
    }

    onDeleteDepartment(deleteConfirmDept.id);
    setDeleteConfirmDept(null);
    if (onShowToast) onShowToast(`Departemen "${deleteConfirmDept.name}" berhasil dihapus.`);
  };

  // Permissions matrix reference
  const permissionsMatrix = [
    { feature: 'Presensi Selfie & Verifikasi GPS Check-In', super: true, hr: true, finance: true, employee: true },
    { feature: 'Melihat Riwayat Presensi & Kalender Kerja Pribadi', super: true, hr: true, finance: true, employee: true },
    { feature: 'Melihat & Unduh Slip Gaji PDF Resmi Pribadi', super: true, hr: true, finance: true, employee: true },
    { feature: 'Pengajuan Cuti Online & Monitoring Kuota', super: true, hr: true, finance: true, employee: true },
    { feature: 'Verifikasi & Audit Presensi Seluruh Karyawan', super: true, hr: true, finance: true, employee: false },
    { feature: 'Menyetujui / Menolak Permohonan Cuti Karyawan', super: true, hr: true, finance: false, employee: false },
    { feature: 'Kalkulasi Otomatis Payroll Bulanan & Komponen Lembur', super: true, hr: true, finance: true, employee: false },
    { feature: 'Otorisasi Pencairan Gaji Pihak Ketiga (Xendit / BI-FAST)', super: true, hr: false, finance: true, employee: false },
    { feature: 'Ekspor Dokumen Audit Resmi (PDF & Excel)', super: true, hr: true, finance: true, employee: false },
    { feature: 'Konfigurasi Profil Perusahaan, Lokasi & Radius GPS', super: true, hr: false, finance: false, employee: false },
    { feature: 'Kelola Peran (Custom Roles) & Departemen Perusahaan', super: true, hr: true, finance: false, employee: false },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 flex items-center space-x-1">
              <Users className="w-3.5 h-3.5" />
              <span>Data Karyawan & Organisasi</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Total {users.length} Karyawan Terdaftar
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Manajemen Karyawan, Peran & Departemen Perusahaan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Kelola data karyawan lengkap dengan <strong>foto profil</strong> dan <strong>alamat domisili</strong>, sesuaikan <strong>peran-peran resmi</strong> di perusahaan, serta atur <strong>departemen</strong> sesuai struktur organisasi Anda.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="add-new-employee-btn"
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Karyawan Baru</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'employees'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Data Karyawan ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'roles'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Kelola Peran Perusahaan ({roles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-3 text-xs sm:text-sm font-bold flex items-center space-x-2 border-b-2 transition-all ${
            activeTab === 'departments'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Kelola Departemen ({departments.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DATA KARYAWAN (DAFTAR, FOTO & ALAMAT KARYAWAN)   */}
      {/* ======================================================== */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Total Karyawan
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {users.length} <span className="text-xs font-normal text-slate-400">Orang</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Karyawan Aktif
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {users.filter((u) => u.status === 'ACTIVE').length}{' '}
                <span className="text-xs font-normal text-slate-400">Aktif</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Peran Perusahaan
              </span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {roles.length} <span className="text-xs font-normal text-slate-400">Peran</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Departemen
              </span>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {departments.length} <span className="text-xs font-normal text-slate-400">Divisi</span>
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, NIK, alamat, posisi..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline font-medium">Filter:</span>
              </div>

              {/* Role filter */}
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="ALL">Semua Peran ({roles.length})</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>

              {/* Department filter */}
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="ALL">Semua Departemen ({departments.length})</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>

              {/* Status filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="ALL">Semua Status</option>
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Employee Table with Explicit Foto & Alamat Columns */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Daftar Karyawan Terdaftar ({filteredUsers.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Termasuk kolom foto profil karyawan dan data alamat domisili lengkap
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                {filteredUsers.length} dari {users.length} Karyawan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5 text-center w-16">Foto</th>
                    <th className="px-4 py-3.5">Nama & Identitas</th>
                    <th className="px-4 py-3.5 min-w-[200px]">Alamat Karyawan</th>
                    <th className="px-4 py-3.5">Peran Perusahaan</th>
                    <th className="px-4 py-3.5">Departemen</th>
                    <th className="px-4 py-3.5">Gaji Pokok</th>
                    <th className="px-4 py-3.5">Tunjangan</th>
                    <th className="px-4 py-3.5">Rekening Bank</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                        <p className="font-semibold text-sm">Tidak ada karyawan yang sesuai filter</p>
                        <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter peran/departemen</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const roleBadgeClass = getBadgeStyle(u.role);
                      const deptBadgeClass = getDeptBadgeStyle(u.department);
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          {/* Foto Karyawan Column */}
                          <td className="px-4 py-3 text-center">
                            <div className="relative inline-block group">
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/20 shadow-sm cursor-pointer transition-transform group-hover:scale-105"
                                onClick={() => setPreviewUserPhoto(u)}
                                title="Klik untuk memperbesar foto karyawan"
                              />
                              <button
                                onClick={() => setPreviewUserPhoto(u)}
                                className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                title="Pratinjau Foto"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>

                          {/* Nama & Identitas Karyawan */}
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                                <span>{u.name}</span>
                                {u.status === 'INACTIVE' && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                                    Nonaktif
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                                <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">{u.employeeId}</span>
                                <span>•</span>
                                <span>{u.position || 'Staff'}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center space-x-2 mt-0.5">
                                <span className="flex items-center space-x-1">
                                  <Mail className="w-2.5 h-2.5" />
                                  <span>{u.email}</span>
                                </span>
                                {u.phone && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center space-x-1">
                                      <Phone className="w-2.5 h-2.5" />
                                      <span>{u.phone}</span>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Alamat Karyawan Column (Requested Field) */}
                          <td className="px-4 py-3">
                            <div className="flex items-start space-x-1.5 max-w-xs">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                              <span className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed" title={u.address || 'Alamat belum diatur'}>
                                {u.address || <em className="text-slate-400 font-normal">Belum diatur</em>}
                              </span>
                            </div>
                          </td>

                          {/* Peran Perusahaan (Custom Role) */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${roleBadgeClass}`}>
                              {u.role}
                            </span>
                          </td>

                          {/* Departemen (Custom Department) */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border ${deptBadgeClass}`}>
                              {u.department}
                            </span>
                          </td>

                          {/* Gaji Pokok */}
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900 dark:text-white">
                            {formatRupiah(u.baseSalary)}
                          </td>

                          {/* Tunjangan Tetap */}
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-emerald-600 dark:text-emerald-400">
                            {formatRupiah(u.fixedAllowance)}
                          </td>

                          {/* Rekening Bank */}
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px]">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">
                              {u.bankName}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400">
                              {u.accountNumber}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {u.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                            </span>
                          </td>

                          {/* Aksi */}
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                id={`edit-user-btn-${u.id}`}
                                onClick={() => setEditingUser({ ...u })}
                                className="px-2.5 py-1 text-xs rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 font-semibold transition-colors flex items-center space-x-1"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit Data</span>
                              </button>

                              <button
                                id={`delete-user-btn-${u.id}`}
                                onClick={() => setDeleteConfirmUser(u)}
                                className="p-1 text-xs rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors"
                                title="Hapus Karyawan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: KELOLA PERAN PERUSAHAAN (CUSTOM ROLES)            */}
      {/* ======================================================== */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                <span>Peran Resmi Perusahaan (Company Roles)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Sesuaikan peran-peran di perusahaan Anda (misal: <em>Operator Sablon, Penjahit Konveksi, Desainer Apparel, Quality Control, HR Admin, Finance, Super Admin</em>). Setiap peran dapat diatur nama tugasnya, warna badge, serta hak akses ke modul sistem.
              </p>
            </div>

            <button
              onClick={() => setShowAddRoleModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Peran Baru</span>
            </button>
          </div>

          {/* Roles Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((r) => {
              const membersCount = users.filter((u) => u.role === r.name || u.role === r.id).length;
              const badgeClass = getBadgeStyle(r.name);
              return (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeClass}`}>
                        {r.name}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Akses: {r.systemAccess}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed min-h-[38px]">
                      {r.description || 'Tidak ada deskripsi peran.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-900 dark:text-white">{membersCount}</span> Karyawan
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditingRole({ ...r })}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 flex items-center space-x-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {!r.isSystem && (
                        <button
                          onClick={() => setDeleteConfirmRole(r)}
                          className="p-1 rounded-lg text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                          title="Hapus Peran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Access Control Matrix */}
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2">
              <Key className="w-4 h-4 text-indigo-500" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Matriks Hak Akses Sistem Berdasarkan Level Akses
                </h3>
                <p className="text-xs text-slate-400">
                  Setiap peran yang Anda buat dikaitkan ke salah satu dari 4 level hak akses ini:
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Fitur / Modul HRIS</th>
                    <th className="px-4 py-3 text-center">Super Admin</th>
                    <th className="px-4 py-3 text-center">HR Admin</th>
                    <th className="px-4 py-3 text-center">Finance Lead</th>
                    <th className="px-4 py-3 text-center">Karyawan / Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {permissionsMatrix.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">
                        {p.feature}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {p.super ? <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" /> : <XCircle className="w-4 h-4 text-slate-300 inline" />}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {p.hr ? <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" /> : <XCircle className="w-4 h-4 text-slate-300 inline" />}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {p.finance ? <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" /> : <XCircle className="w-4 h-4 text-slate-300 inline" />}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {p.employee ? <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" /> : <XCircle className="w-4 h-4 text-slate-300 inline" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: KELOLA DEPARTEMEN PERUSAHAAN (CUSTOM DEPARTMENTS) */}
      {/* ======================================================== */}
      {activeTab === 'departments' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                <span>Departemen & Divisi Perusahaan</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Sesuaikan departemen atau bagian divisi operasional perusahaan Anda (misal: <em>Produksi & Sablon, Penjahitan & Konveksi, Desain Grafis & Pola, Quality Control, Gudang & Logistik, Marketing, HR, Finance</em>).
              </p>
            </div>

            <button
              onClick={() => setShowAddDeptModal(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Departemen Baru</span>
            </button>
          </div>

          {/* Departments Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((d) => {
              const members = users.filter((u) => u.department === d.name || u.department === d.id);
              const deptClass = getDeptBadgeStyle(d.name);
              return (
                <div
                  key={d.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${deptClass}`}>
                        {d.name}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {members.length} Karyawan
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed min-h-[38px]">
                      {d.description || 'Divisi operasional perusahaan.'}
                    </p>

                    {d.headOfDepartment && (
                      <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Penanggung Jawab:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {d.headOfDepartment}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex -space-x-2 overflow-hidden">
                      {members.slice(0, 4).map((m) => (
                        <img
                          key={m.id}
                          src={m.avatar}
                          alt={m.name}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                          title={m.name}
                        />
                      ))}
                      {members.length > 4 && (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 ring-2 ring-white dark:ring-slate-900">
                          +{members.length - 4}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setEditingDept({ ...d })}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 flex items-center space-x-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => setDeleteConfirmDept(d)}
                        className="p-1 rounded-lg text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                        title="Hapus Departemen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH KARYAWAN BARU (FOTO & ALAMAT LENGKAP)      */}
      {/* ======================================================== */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Pendaftaran Karyawan Baru
                </h3>
                <p className="text-xs text-slate-400">
                  Lengkapi data profil, foto karyawan, alamat domisili, peran, dan payroll
                </p>
              </div>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-5 text-xs">
              {/* Section 1: Foto Karyawan */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <label className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Camera className="w-4 h-4 text-indigo-500" />
                  <span>Foto Karyawan (Avatar / Pas Foto)</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Avatar Preview */}
                  <div className="relative shrink-0">
                    <img
                      src={newAvatar}
                      alt="Preview Avatar"
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => addFileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow"
                      title="Unggah Foto dari Perangkat"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        ref={addFileInputRef}
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, false)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => addFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Pilih Foto dari Perangkat</span>
                      </button>
                      <span className="text-[10px] text-slate-400">JPG, PNG (Maks 4MB)</span>
                    </div>

                    {/* Quick Preset Photos */}
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                        Atau pilih foto preset:
                      </span>
                      <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
                        {AVATAR_PRESETS.map((p, idx) => (
                          <img
                            key={idx}
                            src={p.url}
                            alt={p.label}
                            onClick={() => setNewAvatar(p.url)}
                            className={`w-7 h-7 rounded-lg object-cover cursor-pointer ring-1 transition-all ${
                              newAvatar === p.url ? 'ring-2 ring-indigo-600 scale-110' : 'ring-slate-300 dark:ring-slate-700 opacity-70 hover:opacity-100'
                            }`}
                            title={p.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Identitas Pokok */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Nama Lengkap Karyawan *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Contoh: Dimas Ramadhan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Email Perusahaan *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="dimas@nusantaradigital.id"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0812-9876-5432"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Posisi / Jabatan Spesifik
                  </label>
                  <input
                    type="text"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    placeholder="Contoh: Lead Operator DTF & Sablon"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Section 3: Alamat Karyawan (Requested Field) */}
              <div>
                <label className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5 mb-1">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Alamat Domisili Karyawan (Lengkap) *</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Contoh: Jl. Otista Raya No. 88, RT 03/RW 05, Kel. Bidara Cina, Jatinegara, Jakarta Timur"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-[10px] text-slate-400">
                  Digunakan untuk kelengkapan arsip HRD, pengiriman surat tugas, dan dokumen payroll.
                </span>
              </div>

              {/* Section 4: Penempatan (Peran & Departemen Dinamis) */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                <div className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center space-x-1.5">
                  <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Peran & Departemen Perusahaan</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Pilih Peran Perusahaan
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name} ({r.systemAccess})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Pilih Departemen
                    </label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 5: Gaji & Rekening Payroll */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Gaji Pokok (Rp)
                  </label>
                  <input
                    type="number"
                    value={newSalary}
                    onChange={(e) => setNewSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Tunjangan Tetap (Rp)
                  </label>
                  <input
                    type="number"
                    value={newAllowance}
                    onChange={(e) => setNewAllowance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Saldo Kuota Cuti (Hari)
                  </label>
                  <input
                    type="number"
                    value={newLeaveBalance}
                    onChange={(e) => setNewLeaveBalance(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Bank Transfer
                  </label>
                  <select
                    value={newBank}
                    onChange={(e) => setNewBank(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="BCA">BCA</option>
                    <option value="Bank Mandiri">Bank Mandiri</option>
                    <option value="BNI">BNI</option>
                    <option value="BRI">BRI</option>
                    <option value="CIMB Niaga">CIMB Niaga</option>
                    <option value="Bank Syariah Indonesia">Bank Syariah Indonesia</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    value={newAccount}
                    onChange={(e) => setNewAccount(e.target.value)}
                    placeholder="Nomor rekening"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Atas Nama Rekening
                  </label>
                  <input
                    type="text"
                    value={newAccountHolder}
                    onChange={(e) => setNewAccountHolder(e.target.value)}
                    placeholder="Sesuai buku tabungan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20"
                >
                  Simpan & Daftarkan Karyawan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT DATA KARYAWAN (FOTO & ALAMAT LENGKAP)        */}
      {/* ======================================================== */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Ubah Data Karyawan: {editingUser.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Perbarui foto, alamat domisili, peran, departemen, dan komponen payroll
                </p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-6 space-y-5 text-xs">
              {/* Foto Karyawan Edit */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <label className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Camera className="w-4 h-4 text-indigo-500" />
                  <span>Foto Karyawan</span>
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={editingUser.avatar}
                      alt={editingUser.name}
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow"
                      title="Ganti Foto"
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        ref={editFileInputRef}
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, true)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => editFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Unggah Foto Baru</span>
                      </button>
                      <span className="text-[10px] text-slate-400">JPG, PNG (Maks 4MB)</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block mb-1">
                        Pilih dari foto preset:
                      </span>
                      <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
                        {AVATAR_PRESETS.map((p, idx) => (
                          <img
                            key={idx}
                            src={p.url}
                            alt={p.label}
                            onClick={() => setEditingUser({ ...editingUser, avatar: p.url })}
                            className={`w-7 h-7 rounded-lg object-cover cursor-pointer ring-1 transition-all ${
                              editingUser.avatar === p.url ? 'ring-2 ring-indigo-600 scale-110' : 'ring-slate-300 dark:ring-slate-700 opacity-70 hover:opacity-100'
                            }`}
                            title={p.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nama & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    type="tel"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Posisi / Jabatan
                  </label>
                  <input
                    type="text"
                    value={editingUser.position}
                    onChange={(e) => setEditingUser({ ...editingUser, position: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Alamat Domisili Karyawan (Requested Field) */}
              <div>
                <label className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5 mb-1">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>Alamat Domisili Karyawan (Lengkap) *</span>
                </label>
                <textarea
                  rows={2}
                  value={editingUser.address || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                  placeholder="Jl. Nama Jalan No. XX, RT/RW, Kecamatan, Kota"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Peran & Departemen */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Peran Perusahaan
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name} ({r.systemAccess})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Departemen
                  </label>
                  <select
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Status Karyawan
                  </label>
                  <select
                    value={editingUser.status}
                    onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="ACTIVE">Aktif Bekerja</option>
                    <option value="INACTIVE">Nonaktif / Resign</option>
                  </select>
                </div>
              </div>

              {/* Payroll Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Gaji Pokok (Rp)
                  </label>
                  <input
                    type="number"
                    value={editingUser.baseSalary}
                    onChange={(e) => setEditingUser({ ...editingUser, baseSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Tunjangan Tetap (Rp)
                  </label>
                  <input
                    type="number"
                    value={editingUser.fixedAllowance}
                    onChange={(e) => setEditingUser({ ...editingUser, fixedAllowance: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-emerald-600 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Sisa Kuota Cuti (Hari)
                  </label>
                  <input
                    type="number"
                    value={editingUser.leaveBalance}
                    onChange={(e) => setEditingUser({ ...editingUser, leaveBalance: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Bank
                  </label>
                  <input
                    type="text"
                    value={editingUser.bankName}
                    onChange={(e) => setEditingUser({ ...editingUser, bankName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    value={editingUser.accountNumber}
                    onChange={(e) => setEditingUser({ ...editingUser, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: PRATINJAU FOTO KARYAWAN (LIGHTBOX)                 */}
      {/* ======================================================== */}
      {previewUserPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setPreviewUserPhoto(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative aspect-square w-full bg-slate-900">
              <img
                src={previewUserPhoto.avatar}
                alt={previewUserPhoto.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 space-y-3">
              <div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {previewUserPhoto.name}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {previewUserPhoto.employeeId} • {previewUserPhoto.position}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getBadgeStyle(previewUserPhoto.role)}`}>
                  {previewUserPhoto.role}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium border ${getDeptBadgeStyle(previewUserPhoto.department)}`}>
                  {previewUserPhoto.department}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
                <div className="flex items-start space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-500 dark:text-slate-400 block text-[10px] uppercase">
                      Alamat Domisili Karyawan
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {previewUserPhoto.address || 'Belum diisi'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingUser({ ...previewUserPhoto });
                  setPreviewUserPhoto(null);
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Ubah Data / Foto Karyawan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH PERAN BARU                                 */}
      {/* ======================================================== */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Tambah Peran Perusahaan Baru
              </h3>
              <button onClick={() => setShowAddRoleModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Peran Perusahaan *
                </label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Contoh: Operator Sablon DTF, Penjahit Kaos..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Level Akses Sistem (System Access) *
                </label>
                <select
                  value={newRoleAccess}
                  onChange={(e) => setNewRoleAccess(e.target.value as SystemAccessLevel)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="EMPLOYEE">Karyawan (Akses Portal Pribadi & Presensi Selfie)</option>
                  <option value="HR_ADMIN">HR Admin (Kelola Karyawan, Presensi & Cuti)</option>
                  <option value="FINANCE">Finance Lead (Kalkulasi & Pencairan Payroll)</option>
                  <option value="SUPER_ADMIN">Super Admin (Akses Penuh Seluruh Sistem)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Deskripsi Tanggung Jawab Peran
                </label>
                <textarea
                  rows={2}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Penjelasan tugas pokok dan peran operasional..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Pilihan Warna Badge Tampilan
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {BADGE_COLORS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setNewRoleColor(b.id)}
                      className={`p-2 rounded-xl text-center border font-bold text-[10px] transition-all ${b.class} ${
                        newRoleColor === b.id ? 'ring-2 ring-indigo-600 scale-105 shadow-sm' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {b.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow"
                >
                  Tambahkan Peran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT PERAN                                        */}
      {/* ======================================================== */}
      {editingRole && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Edit Peran: {editingRole.name}
              </h3>
              <button onClick={() => setEditingRole(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditRole} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Peran Perusahaan
                </label>
                <input
                  type="text"
                  required
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Level Akses Sistem
                </label>
                <select
                  value={editingRole.systemAccess}
                  onChange={(e) => setEditingRole({ ...editingRole, systemAccess: e.target.value as SystemAccessLevel })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                >
                  <option value="EMPLOYEE">Karyawan (Akses Portal Pribadi & Presensi Selfie)</option>
                  <option value="HR_ADMIN">HR Admin (Kelola Karyawan, Presensi & Cuti)</option>
                  <option value="FINANCE">Finance Lead (Kalkulasi & Pencairan Payroll)</option>
                  <option value="SUPER_ADMIN">Super Admin (Akses Penuh Seluruh Sistem)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Deskripsi Peran
                </label>
                <textarea
                  rows={2}
                  value={editingRole.description || ''}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Warna Tampilan Badge
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {BADGE_COLORS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setEditingRole({ ...editingRole, badgeColor: b.id })}
                      className={`p-2 rounded-xl text-center border font-bold text-[10px] transition-all ${b.class} ${
                        (editingRole.badgeColor || 'indigo') === b.id ? 'ring-2 ring-indigo-600 scale-105 shadow-sm' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {b.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TAMBAH DEPARTEMEN BARU                            */}
      {/* ======================================================== */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Tambah Departemen / Divisi Baru
              </h3>
              <button onClick={() => setShowAddDeptModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDept} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Departemen / Divisi *
                </label>
                <input
                  type="text"
                  required
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="Contoh: Produksi & Sablon, Quality Control..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Penanggung Jawab / Kepala Departemen
                </label>
                <input
                  type="text"
                  value={newDeptHead}
                  onChange={(e) => setNewDeptHead(e.target.value)}
                  placeholder="Contoh: Hendra Kurniawan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Deskripsi Divisi Kerja
                </label>
                <textarea
                  rows={2}
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                  placeholder="Penjelasan cakupan kerja dan tugas divisi..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Warna Visual Departemen
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {BADGE_COLORS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setNewDeptColor(b.id)}
                      className={`p-2 rounded-xl text-center border font-bold text-[10px] transition-all ${b.class} ${
                        newDeptColor === b.id ? 'ring-2 ring-indigo-600 scale-105 shadow-sm' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {b.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddDeptModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow"
                >
                  Tambahkan Departemen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EDIT DEPARTEMEN                                   */}
      {/* ======================================================== */}
      {editingDept && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Edit Departemen: {editingDept.name}
              </h3>
              <button onClick={() => setEditingDept(null)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditDept} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nama Departemen / Divisi
                </label>
                <input
                  type="text"
                  required
                  value={editingDept.name}
                  onChange={(e) => setEditingDept({ ...editingDept, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Penanggung Jawab / Kepala Departemen
                </label>
                <input
                  type="text"
                  value={editingDept.headOfDepartment || ''}
                  onChange={(e) => setEditingDept({ ...editingDept, headOfDepartment: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Deskripsi Divisi Kerja
                </label>
                <textarea
                  rows={2}
                  value={editingDept.description || ''}
                  onChange={(e) => setEditingDept({ ...editingDept, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Warna Visual Departemen
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {BADGE_COLORS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setEditingDept({ ...editingDept, color: b.id })}
                      className={`p-2 rounded-xl text-center border font-bold text-[10px] transition-all ${b.class} ${
                        (editingDept.color || 'indigo') === b.id ? 'ring-2 ring-indigo-600 scale-105 shadow-sm' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {b.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: KONFIRMASI HAPUS KARYAWAN                         */}
      {/* ======================================================== */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hapus Data Karyawan?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus data <strong>{deleteConfirmUser.name}</strong> ({deleteConfirmUser.employeeId})?
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-600/20"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: KONFIRMASI HAPUS PERAN                            */}
      {/* ======================================================== */}
      {deleteConfirmRole && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hapus Peran Perusahaan?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Hapus peran <strong>{deleteConfirmRole.name}</strong> dari daftar peran resmi perusahaan?
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmRole(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteRole}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow"
              >
                Hapus Peran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: KONFIRMASI HAPUS DEPARTEMEN                       */}
      {/* ======================================================== */}
      {deleteConfirmDept && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hapus Departemen?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Hapus divisi <strong>{deleteConfirmDept.name}</strong> dari daftar departemen perusahaan?
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmDept(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteDept}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow"
              >
                Hapus Departemen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
