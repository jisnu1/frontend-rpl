import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface MigrationConfig {
  maxFileSizeBytes: number;
  maxDailyLimit: number;
  todayTasksCount: number;
}

interface MigrationBannerProps {
  config: MigrationConfig;
  formatSize: (bytes: number) => string;
  isDailyLimitReached: boolean;
  isLargeScreen: boolean;
}

export default function MigrationBanner({
  config,
  formatSize,
  isDailyLimitReached,
  isLargeScreen
}: MigrationBannerProps) {
  if (isLargeScreen) {
    return (
      <div className="bg-gradient-to-r from-primary to-[#0053db] text-white rounded-3xl p-6 shadow-md border border-primary/10 flex flex-row justify-between items-center relative overflow-hidden animate-fadeIn">
        <div className="space-y-0.5 z-10">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            One-Click Multi-Cloud Migration
          </h2>
          <p className="text-xs text-white/80 font-semibold max-w-xl">
            Pindahkan atau salin berkas Anda secara massal antarsumber penyimpanan dengan aman.
          </p>
        </div>
        <div className="flex flex-row gap-4 z-10">
          <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/20 space-y-0.5">
            <span className="text-[9px] font-black text-white/70 uppercase block tracking-wider">Batas Harian</span>
            <span className="text-sm font-black">
              {config.maxDailyLimit === -1 ? `${config.todayTasksCount} / ∞` : `${config.todayTasksCount} / ${config.maxDailyLimit}`}
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/20 space-y-0.5">
            <span className="text-[9px] font-black text-white/70 uppercase block tracking-wider">Maks. Ukuran</span>
            <span className="text-sm font-black">{formatSize(config.maxFileSizeBytes)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-primary to-[#0041c4] text-white px-4 pt-4 pb-5 animate-fadeIn">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h1 className="text-base font-black leading-tight tracking-tight">Multi-Cloud Migration</h1>
          <p className="text-[11px] text-white/70 font-medium mt-0.5">Pindahkan berkas antar penyimpanan dengan mudah</p>
        </div>
        <div className="p-2 bg-white/10 rounded-xl border border-white/20 shrink-0">
          <RefreshCw className="w-5 h-5" />
        </div>
      </div>
      {/* Stats pills */}
      <div className="flex gap-2">
        <div className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-3 py-2.5 text-center">
          <p className="text-[9px] font-black text-white/60 uppercase tracking-wider">Batas Harian</p>
          <p className="text-sm font-black mt-0.5">
            {config.maxDailyLimit === -1 ? `${config.todayTasksCount} / ∞` : `${config.todayTasksCount} / ${config.maxDailyLimit}`}
          </p>
        </div>
        <div className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-3 py-2.5 text-center">
          <p className="text-[9px] font-black text-white/60 uppercase tracking-wider">Maks. Ukuran</p>
          <p className="text-sm font-black mt-0.5">{formatSize(config.maxFileSizeBytes)}</p>
        </div>
        {isDailyLimitReached && (
          <div className="flex-1 bg-red-500/80 border border-red-300/30 rounded-2xl px-3 py-2.5 flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <p className="text-[9px] font-black leading-tight">Limit tercapai hari ini!</p>
          </div>
        )}
      </div>
    </div>
  );
}
