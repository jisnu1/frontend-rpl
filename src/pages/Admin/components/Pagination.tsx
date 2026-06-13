import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  onPrev: () => void;
  onNext: () => void;
  disablePrev: boolean;
  disableNext: boolean;
}

export default function Pagination({
  currentPage,
  onPrev,
  onNext,
  disablePrev,
  disableNext
}: PaginationProps) {
  return (
    <div className="flex justify-between items-center pt-4 border-t border-slate-200/80">
      <button
        disabled={disablePrev}
        onClick={onPrev}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Sebelumnya</span>
      </button>
      <span className="text-xs font-bold text-slate-500">Halaman {currentPage + 1}</span>
      <button
        disabled={disableNext}
        onClick={onNext}
        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
      >
        <span>Selanjutnya</span>
        <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
      </button>
    </div>
  );
}
