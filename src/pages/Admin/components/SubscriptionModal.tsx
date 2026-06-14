import React, { useState, useEffect } from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  currentTier: string;
  onSave: (newTier: string) => void;
}

export default function SubscriptionModal({
  isOpen,
  onClose,
  username,
  currentTier,
  onSave
}: SubscriptionModalProps) {
  const [selectedTier, setSelectedTier] = useState(currentTier);

  useEffect(() => {
    setSelectedTier(currentTier);
  }, [currentTier, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-6">
        <div>
          <h3 className="text-sm font-extrabold text-slate-800">Ubah Paket Langganan</h3>
          <p className="text-[10px] text-slate-400 font-bold mt-1">
            Ubah tingkat paket untuk user <span className="text-slate-600">{username}</span> secara langsung.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Pilih Paket
          </label>
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="FREEMIUM">Freemium</option>
            <option value="PREMIUM_INDIVIDUAL">Premium Individual</option>
            <option value="PREMIUM_ACADEMIC">Premium Academic</option>
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
            onClick={() => onSave(selectedTier)}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
