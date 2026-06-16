import React from 'react';
import { Trash2, RefreshCw } from 'lucide-react';

interface MigrationFloatingActionBarProps {
  selectedCount: number;
  selectedSize: number;
  hasTooLargeFiles: boolean;
  isDailyLimitReached: boolean;
  isSidebarMinimized: boolean;
  isLargeScreen: boolean;
  onClearSelection: () => void;
  onMigrateClick: () => void;
  formatSize: (bytes: number) => string;
}

export default function MigrationFloatingActionBar({
  selectedCount,
  selectedSize,
  hasTooLargeFiles,
  isDailyLimitReached,
  isSidebarMinimized,
  isLargeScreen,
  onClearSelection,
  onMigrateClick,
  formatSize
}: MigrationFloatingActionBarProps) {
  if (selectedCount === 0) return null;

  if (isLargeScreen) {
    return (
      <div
        className={`fixed bottom-0 right-0 z-30 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-2xl animate-fadeIn hidden lg:block transition-all duration-300 ${
          isSidebarMinimized ? 'left-20' : 'left-[280px]'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-slate-800">{selectedCount} berkas dipilih</p>
            <p className="text-xs font-semibold text-slate-400">{formatSize(selectedSize)}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClearSelection}
              className="p-2.5 bg-slate-100 rounded-xl text-slate-505 hover:bg-slate-200 transition-all cursor-pointer"
              title="Kosongkan Pilihan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={hasTooLargeFiles || isDailyLimitReached}
              onClick={onMigrateClick}
              className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Migrasikan</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout (< lg)
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl px-4 pt-3 pb-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-800 truncate">{selectedCount} item terpilih</p>
              <p className="text-xs font-semibold text-slate-400">{formatSize(selectedSize)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClearSelection}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-550 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={hasTooLargeFiles || isDailyLimitReached}
              onClick={onMigrateClick}
              className="bg-primary text-white font-bold py-2.5 px-5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Migrasikan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
