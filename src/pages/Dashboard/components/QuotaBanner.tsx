import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatSize } from '../../../utils/fileHelpers';

interface QuotaBannerProps {
  storageInfo: {
    usedBytes: number;
    quotaBytes: number;
  } | null;
  onUpgradeClick: () => void;
}

export default function QuotaBanner({ storageInfo, onUpgradeClick }: QuotaBannerProps) {
  if (!storageInfo || storageInfo.usedBytes <= storageInfo.quotaBytes) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_10px_30px_rgba(244,63,94,0.25)] border border-red-500/10 transition-all">
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-2.5 rounded-2xl shrink-0">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div className="text-left">
          <h4 className="text-sm md:text-base font-extrabold tracking-wide">Penyimpanan Anda Telah Melebihi Kuota!</h4>
          <p className="text-xs text-white/90 mt-1 font-semibold leading-relaxed">
            Penggunaan ({formatSize(storageInfo.usedBytes)}) telah melewati kuota aktif ({formatSize(storageInfo.quotaBytes)}). Fitur Upload, Berbagi berkas, AI, dan Migrasi dinonaktifkan sementara. Silakan hapus berkas atau upgrade paket Anda.
          </p>
        </div>
      </div>
      <button
        onClick={onUpgradeClick}
        className="w-full md:w-auto px-5 py-2.5 bg-white text-rose-600 hover:bg-slate-50 font-black rounded-xl text-xs transition-all shadow-md shrink-0 active:scale-95 cursor-pointer"
      >
        Upgrade Sekarang
      </button>
    </div>
  );
}
