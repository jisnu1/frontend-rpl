import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  username
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden p-6 space-y-6 transform scale-100 transition-transform duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-sm">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-800">Hapus Pengguna {username}?</h3>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
              Tindakan ini bersifat <span className="text-rose-500 font-black">PERMANEN</span>. Seluruh berkas fisik di storage node akan dibersihkan dan koneksi awan (Google Drive) milik user <span className="text-slate-700 font-extrabold">{username}</span> akan diputus secara resmi.
            </p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 transition-colors focus:outline-none"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/10 hover:shadow-lg transition-all focus:outline-none"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
