import React from 'react';

interface MigrationLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  dailyLimit: number;
  maxFileSizeValue: string;
  maxFileSizeUnit: 'MB' | 'GB' | 'TB';
  onDailyLimitChange: (val: number) => void;
  onMaxFileSizeValueChange: (val: string) => void;
  onMaxFileSizeUnitChange: (unit: 'MB' | 'GB' | 'TB') => void;
  onSave: () => void;
}

export default function MigrationLimitModal({
  isOpen,
  onClose,
  username,
  dailyLimit,
  maxFileSizeValue,
  maxFileSizeUnit,
  onDailyLimitChange,
  onMaxFileSizeValueChange,
  onMaxFileSizeUnitChange,
  onSave
}: MigrationLimitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-5">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800">Ubah Batas Migrasi Pengguna</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-1">
            Konfigurasi batas kuota harian dan batas ukuran file migrasi untuk user {username}.
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Kuota Migrasi Harian (Jumlah Berkas)</label>
            <input
              type="number"
              value={dailyLimit}
              onChange={(e) => onDailyLimitChange(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
              min={0}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Batas Ukuran File Terbesar</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={maxFileSizeValue}
                onChange={(e) => onMaxFileSizeValueChange(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <select
                value={maxFileSizeUnit}
                onChange={(e) => onMaxFileSizeUnitChange(e.target.value as any)}
                className="w-24 px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white"
              >
                <option value="MB">MB</option>
                <option value="GB">GB</option>
                <option value="TB">TB</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
