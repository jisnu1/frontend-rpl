import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu, 
  Search, 
  Bell, 
  Cloud,
  Trash2,
  FileUp,
  FileDown,
  X,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { useActivity } from '../context/ActivityContext';
import { useToast } from '../context/ToastContext';
import logoUrl from '../assets/horizon.png';

interface HeaderProps {
  onMenuClick: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showSearch?: boolean;
}

export default function Header({ 
  onMenuClick, 
  searchPlaceholder = "Search Drive...", 
  searchValue = "", 
  onSearchChange,
  showSearch = true
}: HeaderProps) {
  const { user } = useAuth();
  const { activities, notifications, unreadCount, cancelActivity, markAllNotificationsAsRead, clearNotifications } = useActivity();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const runningActivities = activities.filter(act => (act.type === 'download' || act.type === 'migration') && act.status === 'running');

  return (
    <header className="relative bg-white flex justify-between items-center h-16 px-6 w-full sticky top-0 border-b border-slate-100 z-30">
      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <div className="absolute inset-0 bg-white px-4 flex items-center gap-2.5 z-50 animate-fadeIn">
          <button
            type="button"
            onClick={() => {
              setIsMobileSearchOpen(false);
              if (onSearchChange) {
                const e = { target: { value: '' } } as React.ChangeEvent<HTMLInputElement>;
                onSearchChange(e);
              }
            }}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              autoFocus
              className="w-full bg-[#F1F5F9] border-none rounded-full py-2.5 pl-11 pr-4 text-xs font-semibold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
              placeholder={searchPlaceholder}
              type="text"
              value={searchValue}
              onChange={onSearchChange}
            />
          </div>
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                if (onSearchChange) {
                  const e = { target: { value: '' } } as React.ChangeEvent<HTMLInputElement>;
                  onSearchChange(e);
                }
              }}
              className="p-2 text-slate-400 hover:text-slate-650 rounded-full hover:bg-slate-50 transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      )}

      {/* Mobile Menu Trigger & Logo */}
      <div className="md:hidden flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-primary p-2 -ml-2 rounded-full hover:bg-slate-50 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/" className="text-lg font-extrabold text-primary flex items-center gap-2">
          <img src={logoUrl} className="w-8 h-8 object-contain" alt="Horizon Cloud Logo" />
          <span>Horizon Cloud</span>
        </Link>
      </div>

      {/* Search Bar - Desktop Only */}
      {showSearch && (
        <div className="hidden md:flex flex-1 max-w-2xl">
          <div className="relative w-full group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <Search className="w-4 h-4" />
            </span>
            <input
              className="w-full bg-[#F1F5F9] border-none rounded-full py-2 pl-12 pr-4 text-xs font-semibold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
              placeholder={searchPlaceholder}
              type="text"
              value={searchValue}
              onChange={onSearchChange}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Mobile Search Toggle Trigger */}
        {showSearch && (
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(true)}
            className="md:hidden p-2 rounded-full text-slate-600 hover:bg-slate-50 transition-colors"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        <div className="relative">
          <button
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              if (!isDropdownOpen) markAllNotificationsAsRead();
            }}
            className="p-2 rounded-full text-slate-600 hover:bg-slate-50 transition-colors relative"
          >
            <Bell className={`w-5 h-5 ${runningActivities.length > 0 ? 'animate-bounce text-indigo-650' : ''}`} />
            {runningActivities.length > 0 ? (
              <span className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full text-[9px] font-black h-4.5 w-4.5 flex items-center justify-center border-2 border-white animate-pulse">
                {runningActivities.length}
              </span>
            ) : unreadCount > 0 ? (
              <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-[9px] font-black h-4.5 w-4.5 flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            ) : null}
          </button>
          {isDropdownOpen && (
            <>
              {/* Click outside backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              {/* Dropdown Card */}
              <div className="absolute right-0 mt-2.5 w-[90vw] max-w-[340px] bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 py-3 flex flex-col gap-2 max-h-[30rem]">
                <div className="px-4 py-1.5 flex items-center justify-between border-b border-slate-50 pb-2">
                  <span className="text-xs font-bold text-slate-800">Aktivitas & Riwayat</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] font-bold text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1"
                      title="Hapus Semua"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  )}
                </div>
                
                <div className="overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-3 max-h-80">
                  {/* Aktivitas Berjalan */}
                  {runningActivities.length > 0 && (
                    <div className="px-4 py-2 flex flex-col gap-2 bg-indigo-50/40 border-b border-slate-100">
                      <span className="text-[10px] font-black text-primary uppercase tracking-wider block">Aktivitas Berjalan ({runningActivities.length})</span>
                      <div className="flex flex-col gap-2">
                        {runningActivities.map((act) => (
                          <div key={act.id} className="flex flex-col gap-1.5 p-2 bg-white rounded-xl border border-indigo-100/50 shadow-sm">
                            <div className="flex justify-between items-center gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {act.type === 'migration' ? (
                                  <RefreshCw className="w-3.5 h-3.5 text-primary shrink-0 animate-spin" style={{ animationDuration: '3s' }} />
                                ) : (
                                  <FileDown className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                )}
                                <span className="text-xs font-bold text-slate-700 truncate" title={act.name}>
                                  {act.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] font-black text-primary">{act.progress}%</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    cancelActivity(act.id);
                                  }}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-slate-100"
                                  title={act.type === 'migration' ? 'Batalkan Migrasi' : 'Batalkan Unduhan'}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-600 transition-all duration-100 ease-out" 
                                style={{ width: `${act.progress}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
 
                  {/* Riwayat Notifikasi */}
                  <div className="flex-1">
                    {notifications.length === 0 && runningActivities.length === 0 ? (
                      <div className="px-4 py-8 text-center text-slate-400 font-semibold text-xs flex flex-col items-center gap-2 select-none">
                        <Bell className="w-8 h-8 text-slate-200" />
                        Belum ada aktivitas terpantau.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {notifications.map((notif) => {
                          const isSuccess = notif.status === 'success';
                          const isError = notif.status === 'error';
                          const isUpload = notif.type === 'upload';
                          const isMigration = notif.type === 'migration';
                          
                          let typeLabel = 'Unduh';
                          if (isUpload) typeLabel = 'Unggah';
                          else if (isMigration) typeLabel = 'Migrasi';
 
                          return (
                            <div key={notif.id} className={`px-4 py-3 hover:bg-slate-50/50 flex gap-3 items-start transition-colors ${
                              isError && isMigration ? 'bg-red-50/30' : ''
                            }`}>
                              <div className={`p-1.5 rounded-lg shrink-0 ${
                                isSuccess ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-650'
                              }`}>
                                {isMigration ? (
                                  <RefreshCw className="w-3.5 h-3.5" />
                                ) : isUpload ? (
                                  <FileUp className="w-3.5 h-3.5" />
                                ) : (
                                  <FileDown className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={`text-xs font-bold truncate ${isError && isMigration ? 'text-red-750 font-black' : 'text-slate-700'}`} title={notif.name}>
                                  {notif.name}
                                </p>
                                <p className="text-[9px] font-semibold text-slate-450 mt-0.5">
                                  {typeLabel} • {isSuccess ? 'Berhasil' : 'Gagal'} • {notif.timestamp}
                                </p>
                                {isError && notif.errorMessage && (
                                  <p className="text-[10px] font-bold text-red-600 mt-1 leading-normal">
                                    Alasan: {notif.errorMessage}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <Link
          to="/settings"
          className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors border border-transparent"
          title="Pengaturan"
        >
          <span className="text-xs font-bold text-slate-700 hidden md:block">
            {user?.fullName || user?.username || 'Jessica'}
          </span>
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user?.username} 
              className="w-8 h-8 rounded-full object-cover shadow-sm border border-slate-100" 
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold uppercase shadow-sm">
              {user?.username?.[0] || 'J'}
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
