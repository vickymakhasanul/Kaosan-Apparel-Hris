import React, { useState } from 'react';
import {
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  Shield,
  ArrowRight,
  Lock,
  RefreshCw,
  X,
  ExternalLink,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { PaymentGateway, PayrollItem, PayrollPeriod } from '../types';
import { formatDateTimeIndo, formatRupiah } from '../utils/formatters';

interface ThirdPartyPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: PayrollPeriod;
  items: PayrollItem[];
  onDisbursementComplete: (gateway: PaymentGateway, referenceNo: string) => void;
}

export const ThirdPartyPayoutModal: React.FC<ThirdPartyPayoutModalProps> = ({
  isOpen,
  onClose,
  period,
  items,
  onDisbursementComplete,
}) => {
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('XENDIT');
  const [step, setStep] = useState<'REVIEW' | 'VERIFY' | 'PROCESSING' | 'SUCCESS'>('REVIEW');
  const [pin, setPin] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [progressIndex, setProgressIndex] = useState<number>(0);
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalDisbursement = items.reduce((sum, item) => sum + item.netSalary, 0);

  const handleStartVerification = () => {
    setStep('VERIFY');
    setErrorMsg(null);
  };

  const handleExecuteDisbursement = () => {
    if (pin.length < 6) {
      setErrorMsg('Harap masukkan 6 digit PIN Otorisasi Finance (Gunakan default: 123456).');
      return;
    }

    setStep('PROCESSING');
    setProgressIndex(0);
    setErrorMsg(null);

    const refNo = `${selectedGateway}-DISB-${Date.now().toString().slice(-8)}`;
    setReferenceNumber(refNo);

    // Step-by-step progress simulation through recipients
    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx <= items.length) {
        setProgressIndex(currentIdx);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setStep('SUCCESS');
          onDisbursementComplete(selectedGateway, refNo);
        }, 500);
      }
    }, 400);
  };

  const handleReset = () => {
    setStep('REVIEW');
    setPin('');
    setOtp('');
    setProgressIndex(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Pencairan Gaji (Batch Disbursement)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Integrasi Gateway Pembayaran Pihak Ketiga • Periode {period.name}
              </p>
            </div>
          </div>
          {step !== 'PROCESSING' && (
            <button
              id="close-payout-modal-btn"
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Content depending on step */}
        <div className="p-6 space-y-5">
          {step === 'REVIEW' && (
            <>
              {/* Payout Summary Metric */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/20 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-medium tracking-wider opacity-90 block">
                    Total Dana Bersih Yang Akan Ditransfer
                  </span>
                  <span className="text-2xl font-black tracking-tight mt-0.5 block">
                    {formatRupiah(totalDisbursement)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs opacity-90 block">Penerima Transfer</span>
                  <span className="text-lg font-bold block">{items.length} Karyawan</span>
                </div>
              </div>

              {/* Gateway Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Pilih Kanal Pembayaran Pihak Ketiga
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    id="select-gateway-xendit"
                    onClick={() => setSelectedGateway('XENDIT')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedGateway === 'XENDIT'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Xendit</span>
                      {selectedGateway === 'XENDIT' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Batch Disbursement API</p>
                    <span className="inline-block mt-2 text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                      API Online
                    </span>
                  </button>

                  <button
                    type="button"
                    id="select-gateway-midtrans"
                    onClick={() => setSelectedGateway('MIDTRANS')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedGateway === 'MIDTRANS'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                      <span>Midtrans Iris</span>
                      {selectedGateway === 'MIDTRANS' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Payout Host-to-Host</p>
                    <span className="inline-block mt-2 text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                      API Online
                    </span>
                  </button>

                  <button
                    type="button"
                    id="select-gateway-bifast"
                    onClick={() => setSelectedGateway('BI_FAST')}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedGateway === 'BI_FAST'
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                      <span>BI-FAST Direct</span>
                      {selectedGateway === 'BI_FAST' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Direct Bank Gateway</p>
                    <span className="inline-block mt-2 text-[9px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                      API Online
                    </span>
                  </button>
                </div>
              </div>

              {/* Recipient Account Preview List */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <span>Daftar Rekening Tujuan Transfer ({items.length})</span>
                  <span className="text-[11px] text-slate-400">Verifikasi Nomor Rekening Berhasil</span>
                </div>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {items.map((it) => (
                    <div key={it.id} className="p-2.5 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {it.employeeName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {it.bankName} • {it.accountNumber} ({it.accountHolder})
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatRupiah(it.netSalary)}
                        </span>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block flex items-center justify-end space-x-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 inline mr-0.5" />
                          <span>Siap Transfer</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 'VERIFY' && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start space-x-3">
                <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Otorisasi Keamanan Pembayaran (Dual Control)</span>
                  <span>
                    Pencairan dana sebesar <strong>{formatRupiah(totalDisbursement)}</strong> ke {items.length} rekening karyawan memerlukan verifikasi PIN Finance dan kode OTP perusahaan.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  6-Digit PIN Otorisasi Keuangan
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={6}
                    id="finance-pin-input"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Masukkan PIN (Default: 123456)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Petunjuk simulasi: Ketik <strong>123456</strong> untuk otorisasi.
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          )}

          {step === 'PROCESSING' && (
            <div className="py-8 text-center space-y-5">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin" />
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">
                  Sedang Memproses Pencairan ke Payment Gateway...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Menghubungi endpoint {selectedGateway} Batch Disbursement API
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((progressIndex / items.length) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Proses Transfer: {progressIndex} dari {items.length} rekening</span>
                  <span>{Math.min(100, Math.round((progressIndex / items.length) * 100))}%</span>
                </div>
              </div>

              {progressIndex > 0 && progressIndex <= items.length && (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                  Mengirim ke: {items[progressIndex - 1]?.employeeName} ({items[progressIndex - 1]?.bankName})... Berhasil!
                </div>
              )}
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="space-y-4 py-2 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-lg">
                  Pencairan Gaji Berhasil Diproses!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Seluruh dana telah berhasil ditransfer ke rekening bank masing-masing karyawan secara real-time.
                </p>
              </div>

              {/* Receipt Summary Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Referensi Batch:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway Pembayaran:</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">{selectedGateway} API</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Pencairan:</span>
                  <span className="font-bold text-emerald-600">{formatRupiah(totalDisbursement)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Waktu Eksekusi:</span>
                  <span>{formatDateTimeIndo(new Date().toISOString())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Transaksi:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    COMPLETED (SETTLED)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
          {step === 'REVIEW' && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
              >
                Tutup
              </button>
              <button
                type="button"
                id="proceed-verify-payout-btn"
                onClick={handleStartVerification}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm flex items-center space-x-1.5"
              >
                <span>Lanjut ke Verifikasi & PIN</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 'VERIFY' && (
            <>
              <button
                type="button"
                onClick={() => setStep('REVIEW')}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
              >
                Kembali
              </button>
              <button
                type="button"
                id="execute-disbursement-btn"
                onClick={handleExecuteDisbursement}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Otorisasi & Cairkan Sekarang</span>
              </button>
            </>
          )}

          {step === 'SUCCESS' && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                id="finish-payout-modal-btn"
                onClick={handleReset}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-sm"
              >
                Selesai & Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
