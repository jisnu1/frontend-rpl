import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Check, Loader2, RefreshCw } from 'lucide-react';
import { fetchExternalAccounts, ExternalAccountDto } from '../api/externalAccounts';
import { fetchUserStorage, UserStorageResponse } from '../api/storage';
import { useActivity } from '../context/ActivityContext';
import { useToast } from '../context/ToastContext';

interface MigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFiles: Array<{
    id: string;
    name: string;
    size: number;
    provider: string;
    externalAccountId?: number | null;
  }>;
  onSuccess: (batchId: string) => void;
}

export default function MigrationModal({ isOpen, onClose, selectedFiles, onSuccess }: MigrationModalProps) {
  const { migrateFiles } = useActivity();
  const { error: toastError, success: toastSuccess } = useToast();

  const [externalAccounts, setExternalAccounts] = useState<ExternalAccountDto[]>([]);
  const [personalStorage, setPersonalStorage] = useState<UserStorageResponse | null>(null);
  
  const [targetProvider, setTargetProvider] = useState<'STORAGE_NODE' | 'GOOGLE_DRIVE'>('STORAGE_NODE');
  const [targetAccountId, setTargetAccountId] = useState<number | null>(null);
  const [deleteSource, setDeleteSource] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmStep, setShowConfirmStep] = useState(false);

  // Load destinations
  useEffect(() => {
    if (!isOpen) return;
    
    async function loadData() {
      setIsLoading(true);
      try {
        const [accounts, storage] = await Promise.all([
          fetchExternalAccounts(),
          fetchUserStorage()
        ]);
        setExternalAccounts(accounts.filter(a => a.provider.toUpperCase() === 'GOOGLE'));
        setPersonalStorage(storage);
      } catch (err) {
        console.error('Failed to load migration destinations', err);
        toastError('Gagal memuat daftar penyimpanan tujuan.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
    setShowConfirmStep(false);
    setDeleteSource(false);
    setTargetProvider('STORAGE_NODE');
    setTargetAccountId(null);
  }, [isOpen, toastError]);

  // Set default target account when Google Drive provider is selected
  useEffect(() => {
    if (targetProvider === 'GOOGLE_DRIVE' && externalAccounts.length > 0 && targetAccountId === null) {
      setTargetAccountId(externalAccounts[0].id);
    } else if (targetProvider === 'STORAGE_NODE') {
      setTargetAccountId(null);
    }
  }, [targetProvider, externalAccounts, targetAccountId]);

  if (!isOpen) return null;

  const totalBytesToMigrate = selectedFiles.reduce((acc, file) => acc + file.size, 0);

  // Quota calculation for STORAGE_NODE
  const usedBytes = personalStorage?.usedBytes || 0;
  const quotaBytes = personalStorage?.quotaBytes || 1073741824; // default 1GB
  const isQuotaExceeded = targetProvider === 'STORAGE_NODE' && (usedBytes + totalBytesToMigrate > quotaBytes);

  // Check self-migration
  const selfMigrationFiles = selectedFiles.filter(file => {
    if (targetProvider === 'STORAGE_NODE') {
      return file.provider.toUpperCase() === 'STORAGE_NODE';
    } else {
      return file.provider.toUpperCase() === 'GOOGLE_DRIVE' && file.externalAccountId === targetAccountId;
    }
  });

  const hasSelfMigration = selfMigrationFiles.length > 0;

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleStartMigration = async () => {
    setIsSubmitting(true);
    try {
      const fileIds = selectedFiles.map(f => f.id);
      const fileNamesMap: Record<string, string> = {};
      selectedFiles.forEach(f => {
        fileNamesMap[f.id] = f.name;
      });

      const res = await migrateFiles(
        fileIds,
        fileNamesMap,
        targetProvider,
        targetAccountId,
        deleteSource
      );

      if (res.success) {
        toastSuccess('Proses migrasi berhasil dimulai di latar belakang.');
        onSuccess(res.batchId);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Gagal memulai migrasi.';
      toastError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Backdrop click closer */}
      <div className="absolute inset-0" onClick={isSubmitting ? undefined : onClose} />

      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 transition-all duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-surface-container-low text-primary">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {showConfirmStep ? 'Konfirmasi Migrasi Berkas' : 'One-Click Cloud Migration'}
              </h3>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                {selectedFiles.length} berkas terpilih ({formatSize(totalBytesToMigrate)})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-bold text-slate-400">Memuat data penyimpanan...</p>
          </div>
        ) : !showConfirmStep ? (
          /* STEP 1: OPTIONS */
          <div className="p-6 space-y-5">
            
            {/* Target Provider Choice */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Penyimpanan Tujuan</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetProvider('STORAGE_NODE')}
                  className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all duration-200 ${
                    targetProvider === 'STORAGE_NODE'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-xs font-black text-slate-800">Storage Node VPS</span>
                  <span className="text-[10px] font-bold text-slate-400">Penyimpanan internal aman</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTargetProvider('GOOGLE_DRIVE')}
                  className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all duration-200 ${
                    targetProvider === 'GOOGLE_DRIVE'
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/10'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-xs font-black text-slate-800">Google Drive</span>
                  <span className="text-[10px] font-bold text-slate-400">Penyimpanan eksternal</span>
                </button>
              </div>
            </div>

            {/* Account Selector (For Google Drive target) */}
            {targetProvider === 'GOOGLE_DRIVE' && (
              <div className="space-y-2 animate-fadeIn">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pilih Akun Google Drive</label>
                {externalAccounts.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] font-bold flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Belum ada akun Google Drive yang terhubung. Hubungkan akun Google Drive Anda terlebih dahulu di halaman Settings.</span>
                  </div>
                ) : (
                  <select
                    value={targetAccountId || ''}
                    onChange={(e) => setTargetAccountId(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                  >
                    {externalAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.email}</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Quota Progress Visualization (For STORAGE_NODE target) */}
            {targetProvider === 'STORAGE_NODE' && personalStorage && (
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Estimasi Penggunaan Kuota</span>
                  <span>{formatSize(usedBytes + totalBytesToMigrate)} / {formatSize(quotaBytes)}</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                  {/* Current used */}
                  <div 
                    className="bg-secondary h-full"
                    style={{ width: `${(usedBytes / quotaBytes) * 100}%` }}
                  />
                  {/* New files */}
                  <div 
                    className={`${isQuotaExceeded ? 'bg-error' : 'bg-primary/60'} h-full transition-all duration-305`}
                    style={{ width: `${(totalBytesToMigrate / quotaBytes) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    <span>Terpakai ({formatSize(usedBytes)})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isQuotaExceeded ? 'bg-error' : 'bg-primary/60'}`} />
                    <span>Migrasi Baru ({formatSize(totalBytesToMigrate)})</span>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Source Option Toggle */}
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
              <div className="min-w-0 pr-4">
                <span className="text-xs font-black text-slate-800 block">Hapus berkas sumber (Move)</span>
                <span className="text-[10px] font-bold text-slate-400">Menghapus berkas asli dari penyimpanan asal setelah berhasil dimigrasikan</span>
              </div>
              <button
                type="button"
                onClick={() => setDeleteSource(!deleteSource)}
                className={`w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none flex items-center p-0.5 shrink-0 ${
                  deleteSource ? 'bg-red-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`bg-white w-5 h-5 rounded-full shadow transition-transform duration-200 ${
                    deleteSource ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Self-migration Warnings */}
            {hasSelfMigration && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs font-bold flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div className="space-y-1">
                  <span className="block font-black text-amber-900">Peringatan Self-Migration</span>
                  <p className="text-[10px] leading-normal font-semibold">
                    {selfMigrationFiles.length} dari berkas terpilih sudah berada di penyimpanan target yang sama. Harap batal dan hilangkan centang berkas berikut agar migrasi dapat dijalankan:
                  </p>
                  <ul className="list-disc pl-4 text-[10px] leading-normal font-semibold space-y-0.5">
                    {selfMigrationFiles.map((file, i) => (
                      <li key={i}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Quota Exceeded Warnings */}
            {isQuotaExceeded && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-bold flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div>
                  <span className="block font-black text-red-900">Kapasitas Tidak Mencukupi</span>
                  <p className="text-[10px] leading-normal font-semibold mt-0.5">
                    Kapasitas sisa pada Storage Node tujuan Anda ({formatSize(Math.max(0, quotaBytes - usedBytes))}) tidak mencukupi untuk memindahkan berkas terpilih ({formatSize(totalBytesToMigrate)}).
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 px-4 rounded-xl text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isQuotaExceeded || hasSelfMigration || (targetProvider === 'GOOGLE_DRIVE' && externalAccounts.length === 0)}
                onClick={() => setShowConfirmStep(true)}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lanjutkan
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: DOUBLE CONFIRMATION */
          <div className="p-6 space-y-5">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-500 mb-2">Daftar berkas yang akan dimigrasikan:</p>
              <div className="max-h-40 overflow-y-auto custom-scrollbar pr-1 divide-y divide-slate-150/60">
                {selectedFiles.map((file) => (
                  <div key={file.id} className="py-2 flex justify-between gap-4 text-xs">
                    <span className="font-semibold text-slate-700 truncate" title={file.name}>{file.name}</span>
                    <span className="font-black text-slate-400 shrink-0">{formatSize(file.size)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Summary description */}
            <div className="text-xs font-semibold text-slate-600 space-y-1">
              <p>
                Target Penyimpanan: <span className="font-black text-slate-800">
                  {targetProvider === 'STORAGE_NODE' ? 'Storage Node VPS' : `Google Drive (${externalAccounts.find(a => a.id === targetAccountId)?.email})`}
                </span>
              </p>
              <p>
                Mode Migrasi: <span className="font-black text-slate-800">
                  {deleteSource ? 'Pindahkan (Hapus Sumber)' : 'Salin (Keep Source)'}
                </span>
              </p>
            </div>

            {/* Critical Delete Warning */}
            {deleteSource && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-bold flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-error" />
                <div>
                  <span className="font-black text-red-950 block">⚠️ Perhatian Khusus</span>
                  <p className="text-[10px] leading-normal font-semibold mt-0.5">
                    Opsi <strong>"Hapus berkas sumber"</strong> aktif. Berkas asli di penyimpanan asal akan dihapus secara permanen setelah berhasil dipindahkan ke target!
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowConfirmStep(false)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 px-4 rounded-xl text-xs transition-colors disabled:opacity-50"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleStartMigration}
                className="flex-1 bg-error hover:bg-error/90 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Ya, Mulai Migrasi'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
