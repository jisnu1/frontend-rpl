import React from 'react';

interface QuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  quotaValue: string;
  quotaUnit: 'MB' | 'GB' | 'TB';
  onQuotaValueChange: (val: string) => void;
  onQuotaUnitChange: (unit: 'MB' | 'GB' | 'TB') => void;
  onSave: () => void;
}

export default function QuotaModal({
  isOpen,
  onClose,
  username,
  quotaValue,
  quotaUnit,
  onQuotaValueChange,
  onQuotaUnitChange,
  onSave
}: QuotaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-6">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800">Ubah Kuota Penyimpanan</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Ubah kapasitas total disk space untuk user {username}.</p>
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={quotaValue}
            onChange={(e) => onQuotaValueChange(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <select
            value={quotaUnit}
            onChange={(e) => onQuotaUnitChange(e.target.value as any)}
            className="w-24 px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white"
          >
            <option value="MB">MB</option>
            <option value="GB">GB</option>
            <option value="TB">TB</option>
          </select>
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
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
