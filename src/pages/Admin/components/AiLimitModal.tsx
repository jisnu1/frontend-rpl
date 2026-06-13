import React from 'react';

interface AiLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  limit: number;
  onLimitChange: (val: number) => void;
  onSave: () => void;
}

export default function AiLimitModal({
  isOpen,
  onClose,
  username,
  limit,
  onLimitChange,
  onSave
}: AiLimitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-6">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800">Ubah Batas Request AI</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-1">Tentukan batas maksimal pemanggilan AI per hari untuk user {username}.</p>
        </div>
        
        <div className="space-y-1">
          <label className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Request Per Hari</label>
          <input
            type="number"
            value={limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary"
          />
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
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
