import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  Lock,
  Download,
  Upload,
  RefreshCw,
  X,
  ShieldCheck,
  Server,
  Database,
  FileJson,
} from 'lucide-react';
import { AppState, exportCloudBackupJSON } from '../utils/storage';
import { formatDateTimeIndo } from '../utils/formatters';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppState;
  onRestoreState: (newState: AppState) => void;
  onSyncNow: () => void;
  isSyncing: boolean;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  appState,
  onRestoreState,
  onSyncNow,
  isSyncing,
}) => {
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && parsed.data && parsed.data.users) {
          onRestoreState(parsed.data);
          setRestoreSuccess(true);
          setRestoreError(null);
          setTimeout(() => setRestoreSuccess(false), 3000);
        } else if (parsed && parsed.users) {
          onRestoreState(parsed);
          setRestoreSuccess(true);
          setRestoreError(null);
          setTimeout(() => setRestoreSuccess(false), 3000);
        } else {
          setRestoreError('Format file backup JSON tidak valid.');
        }
      } catch (err) {
        setRestoreError('Gagal membaca file JSON. Pastikan file backup valid.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Sinkronisasi Cloud & Keamanan Data
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Penyimpanan cloud terenkripsi & pencadangan data otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Real-time Status Card */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Cloud Database Terhubung & Tersinkronisasi
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                AES-256 ENCRYPTED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-emerald-200/40 dark:border-emerald-900/30">
              <div>
                <span className="block text-[11px] text-slate-400">Sinkronisasi Terakhir:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {formatDateTimeIndo(appState.lastCloudSync)}
                </span>
              </div>
              <div>
                <span className="block text-[11px] text-slate-400">Server Cluster:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  asia-southeast2 (Jakarta)
                </span>
              </div>
            </div>
          </div>

          {/* Cloud Sync Manual Trigger */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                Sinkronisasi Data Manual
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pembaruan data absensi, payroll, dan pengajuan cuti ke server cloud
              </p>
            </div>
            <button
              id="trigger-cloud-sync-btn"
              onClick={onSyncNow}
              disabled={isSyncing}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkron Sekarang'}</span>
            </button>
          </div>

          {/* Backup & Restore Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Pencadangan & Pemulihan (Backup & Restore)
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="export-json-backup-btn"
                onClick={() => exportCloudBackupJSON(appState)}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-all group"
              >
                <Download className="w-5 h-5 text-indigo-600 mb-2 group-hover:-translate-y-0.5 transition-transform" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">Unduh Backup JSON</div>
                <p className="text-[10px] text-slate-500 mt-0.5">Ekspor snapshot data lengkap</p>
              </button>

              <label
                htmlFor="restore-json-input"
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-all cursor-pointer group"
              >
                <Upload className="w-5 h-5 text-emerald-600 mb-2 group-hover:-translate-y-0.5 transition-transform" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">Pulihkan Backup</div>
                <p className="text-[10px] text-slate-500 mt-0.5">Restore dari file JSON</p>
                <input
                  id="restore-json-input"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {restoreSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Data berhasil dipulihkan dari file backup!</span>
              </div>
            )}

            {restoreError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs">
                {restoreError}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center space-x-1">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Kepatuhan Audit UU PDP Indonesia No. 27/2022</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
