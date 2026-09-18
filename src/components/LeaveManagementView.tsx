import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  BellRing,
  User,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { LeaveRequest, LeaveType, UserRole } from '../types';
import { formatDateIndo } from '../utils/formatters';

interface LeaveManagementViewProps {
  leaves: LeaveRequest[];
  currentUserRole: UserRole;
  currentUserId: string;
  currentUserName: string;
  currentUserDept: string;
  leaveBalance: number;
  onRequestLeave: (newRequest: Omit<LeaveRequest, 'id' | 'status' | 'appliedDate'>) => void;
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
}

export const LeaveManagementView: React.FC<LeaveManagementViewProps> = ({
  leaves,
  currentUserRole,
  currentUserId,
  currentUserName,
  currentUserDept,
  leaveBalance,
  onRequestLeave,
  onApproveLeave,
  onRejectLeave,
}) => {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('TAHUNAN');
  const [startDate, setStartDate] = useState('2026-09-21');
  const [endDate, setEndDate] = useState('2026-09-22');
  const [reason, setReason] = useState('');
  const [daysCount, setDaysCount] = useState(2);

  const canApprove = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'HR_ADMIN';

  // Filter leaves that will happen in the near future (Leave Reminder!)
  const upcomingLeaves = leaves.filter(
    (l) => l.status === 'APPROVED' && l.startDate >= '2026-09-11'
  );

  const handleSubmitApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Harap masukkan alasan pengajuan cuti.');
      return;
    }

    onRequestLeave({
      employeeId: currentUserId,
      employeeName: currentUserName,
      department: currentUserDept,
      leaveType,
      startDate,
      endDate,
      daysCount: Math.max(1, daysCount),
      reason,
    });

    setShowApplyModal(false);
    setReason('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Manajemen & Pengingat Cuti Karyawan
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pengajuan cuti online, persetujuan atasan, saldo kuota cuti, dan pengingat jadwal libur tim
          </p>
        </div>

        <button
          id="open-apply-leave-btn"
          onClick={() => setShowApplyModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajukan Cuti Baru</span>
        </button>
      </div>

      {/* Prominent Leave Reminder Alert Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 dark:border-amber-500/20 space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/30">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900 dark:text-amber-200 text-sm">
              Pengingat Cuti Tim Mendatang (Upcoming Leave Alert)
            </h3>
            <p className="text-xs text-amber-700/80 dark:text-amber-300/80">
              Notifikasi otomatis untuk manajer dan tim agar mempermudah pendelegasian tugas
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {upcomingLeaves.map((l) => (
            <div
              key={l.id}
              className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-amber-200 dark:border-amber-900/40 shadow-sm text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">
                  {l.employeeName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                  {l.daysCount} Hari ({l.leaveType})
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {l.department} • "{l.reason}"
              </div>
              <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400 mt-2 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDateIndo(l.startDate)} s/d {formatDateIndo(l.endDate)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Balance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Sisa Kuota Cuti Anda</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {leaveBalance} Hari
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Dari 12 hari hak cuti tahunan</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Pengajuan Cuti</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {leaves.length} Pengajuan
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Seluruh riwayat pengajuan</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Menunggu Persetujuan</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {leaves.filter((l) => l.status === 'PENDING').length} Menunggu
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Membutuhkan aksi HR / Manajer</span>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Daftar Permohonan Cuti
          </h3>
          <span className="text-xs text-slate-400">
            {canApprove ? 'Mode Otorisasi: Anda memiliki hak menyetujui cuti' : 'Mode Karyawan: Melihat status'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-bold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Nama Karyawan</th>
                <th className="px-4 py-3">Jenis Cuti</th>
                <th className="px-4 py-3">Rentang Tanggal</th>
                <th className="px-4 py-3">Durasi</th>
                <th className="px-4 py-3">Alasan / Catatan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {leaves.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {l.employeeName}
                    </div>
                    <div className="text-[10px] text-slate-400">{l.department}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                    {l.leaveType}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDateIndo(l.startDate)} s/d {formatDateIndo(l.endDate)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-bold">
                    {l.daysCount} Hari Kerja
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate" title={l.reason}>
                    {l.reason}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        l.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : l.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {l.status === 'APPROVED' ? 'DISETUJUI' : l.status === 'REJECTED' ? 'DITOLAK' : 'MENUNGGU'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {canApprove && l.status === 'PENDING' ? (
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          id={`approve-leave-${l.id}`}
                          onClick={() => onApproveLeave(l.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center space-x-1 shadow-sm"
                        >
                          <Check className="w-3 h-3" />
                          <span>Setujui</span>
                        </button>
                        <button
                          id={`reject-leave-${l.id}`}
                          onClick={() => onRejectLeave(l.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold flex items-center space-x-1 shadow-sm"
                        >
                          <X className="w-3 h-3" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        {l.status === 'APPROVED' ? `Disetujui: ${l.approvedBy || 'HR'}` : '-'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Formulir Pengajuan Cuti
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitApply} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jenis Cuti
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="TAHUNAN">Cuti Tahunan (Memotong Saldo)</option>
                  <option value="SAKIT">Cuti Sakit (Surat Dokter)</option>
                  <option value="MELAHIRKAN">Cuti Melahirkan / Bersalin</option>
                  <option value="PENTING">Cuti Keperluan Mendesak / Menikah</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Hari Kerja
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={daysCount}
                  onChange={(e) => setDaysCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alasan & Keterangan Pengajuan
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Jelaskan keperluan cuti dan PIC delegasi tugas..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-600/20"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
