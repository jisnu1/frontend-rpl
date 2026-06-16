import React from 'react';
import { Sliders, Loader2, Clock, ShieldAlert, AlertTriangle } from 'lucide-react';

interface AdminConfigFormProps {
  isAdmin: boolean;
  isDailyLimitReached: boolean;
  adminMaxMb: string;
  setAdminMaxMb: (val: string) => void;
  adminDailyLimit: string;
  setAdminDailyLimit: (val: string) => void;
  isUpdatingConfig: boolean;
  handleUpdateConfig: (e: React.FormEvent) => void;
  isLargeScreen: boolean;
}

export default function AdminConfigForm({
  isAdmin,
  isDailyLimitReached,
  adminMaxMb,
  setAdminMaxMb,
  adminDailyLimit,
  setAdminDailyLimit,
  isUpdatingConfig,
  handleUpdateConfig,
  isLargeScreen
}: AdminConfigFormProps) {
  if (isLargeScreen) {
    return (
      <div className="grid grid-cols-2 gap-6 animate-fadeIn">
        {/* Catatan & Ketentuan */}
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catatan & Ketentuan Premium</span>
            <div className="space-y-2 text-xs font-semibold text-on-surface-variant leading-relaxed">
              <div className="flex gap-2.5 items-start">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Reset kuota harian dilakukan secara otomatis saat hari berganti (pukul 00.00 waktu sistem).</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Batas harian migrasi adalah total berkas yang dimigrasikan dalam satu hari, bukan total inisiasi migrasi.</span>
              </div>
            </div>
          </div>
          {isDailyLimitReached && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-[11px] font-bold flex items-start gap-2 animate-pulse mt-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Batas harian migrasi Anda hari ini telah terlampaui. Silakan coba kembali besok!</span>
            </div>
          )}
        </div>

        {/* Admin Config Panel */}
        {isAdmin ? (
          <div className="bg-surface-container-low text-on-surface p-5 rounded-3xl border border-surface-variant space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              <h4 className="text-xs font-black uppercase tracking-wider text-on-surface">Admin Migration Config</h4>
            </div>
            <form onSubmit={handleUpdateConfig} className="space-y-3.5" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant/80 uppercase">Max Size (MB)</label>
                  <input 
                    type="number" 
                    value={adminMaxMb} 
                    onChange={(e) => setAdminMaxMb(e.target.value)} 
                    className="w-full bg-white border border-outline-variant rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary" 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant/80 uppercase">Daily Limit (Files)</label>
                  <input 
                    type="number" 
                    value={adminDailyLimit} 
                    onChange={(e) => setAdminDailyLimit(e.target.value)} 
                    className="w-full bg-white border border-outline-variant rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary" 
                    required 
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={isUpdatingConfig} 
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isUpdatingConfig ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memperbarui...</span>
                  </>
                ) : (
                  <span>Terapkan Konfigurasi</span>
                )}
              </button>
            </form>
          </div>
        ) : <div />}
      </div>
    );
  }

  // Mobile layout
  return (
    <div className="px-4 pb-4 space-y-3 animate-fadeIn">
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1 h-3 bg-primary rounded-full inline-block" />
          Catatan &amp; Ketentuan
        </p>
        <div className="flex gap-2.5 items-start">
          <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
            <Clock className="w-3 h-3 text-primary" />
          </div>
          <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Reset kuota harian dilakukan otomatis saat hari berganti (pukul 00.00).</p>
        </div>
        <div className="flex gap-2.5 items-start">
          <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
            <ShieldAlert className="w-3 h-3 text-primary" />
          </div>
          <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Batas harian dihitung dari total berkas yang dimigrasikan, bukan jumlah inisiasi.</p>
        </div>
      </div>

      {/* Admin config (mobile) */}
      {isAdmin && (
        <div className="bg-surface-container-low border border-surface-variant rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Sliders className="w-3.5 h-3.5 text-primary" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-wider text-on-surface">Admin Config</h4>
          </div>
          <form onSubmit={handleUpdateConfig} className="space-y-3" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant/80 uppercase">Max Size (MB)</label>
                <input 
                  type="number" 
                  value={adminMaxMb} 
                  onChange={(e) => setAdminMaxMb(e.target.value)} 
                  className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary" 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-on-surface-variant/80 uppercase">Daily Limit</label>
                <input 
                  type="number" 
                  value={adminDailyLimit} 
                  onChange={(e) => setAdminDailyLimit(e.target.value)} 
                  className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary" 
                  required 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isUpdatingConfig} 
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-primary/20 cursor-pointer"
            >
              {isUpdatingConfig ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memperbarui...</span>
                </>
              ) : (
                <span>Terapkan Konfigurasi</span>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
