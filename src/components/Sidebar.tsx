import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FolderOpen, 
  Users, 
  Cloud, 
  Plus, 
  X, 
  TrendingUp,
  LogOut,
  Settings,
  HardDrive,
  RefreshCw,
  Shield
} from 'lucide-react';
import Button from './ui/Button';
import { fetchUserStorage, UserStorageResponse } from '../api/storage';
import { fetchExternalAccounts, fetchGoogleDriveStorage, ExternalAccountDto, GoogleDriveStorageDto } from '../api/externalAccounts';
import logoUrl from '../assets/horizon.png';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onUploadClick: () => void;
  uploadTrigger?: number;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

interface GoogleDriveStorageInfo {
  email: string;
  storage: GoogleDriveStorageDto;
}

export default function Sidebar({ 
  isMobileOpen, 
  onCloseMobile, 
  onUploadClick, 
  uploadTrigger,
  isMinimized = false,
  onToggleMinimize
}: SidebarProps) {
  const location = useLocation();
  const { logout, accessToken, user } = useAuth();
  const [storage, setStorage] = useState<UserStorageResponse | null>(null);
  const [gdriveStorages, setGdriveStorages] = useState<GoogleDriveStorageInfo[]>([]);
  const [isStorageCollapsed, setIsStorageCollapsed] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    async function loadStorage() {
      try {
        // Load personal storage
        const data = await fetchUserStorage();
        setStorage(data);

        // Load Google Drive storage per account
        const accounts = await fetchExternalAccounts();
        const googleAccs = accounts.filter(a => a.provider.toUpperCase() === 'GOOGLE');
        
        const gdriveResults: GoogleDriveStorageInfo[] = [];
        for (const acc of googleAccs) {
          try {
            const gStorage = await fetchGoogleDriveStorage(acc.id);
            if (gStorage && gStorage.totalBytes > 0) {
              gdriveResults.push({ email: acc.email, storage: gStorage });
            }
          } catch (err) {
            console.warn(`Failed to load Google Drive storage for ${acc.email}`, err);
          }
        }
        setGdriveStorages(gdriveResults);
      } catch (err) {
        console.error('Failed to load storage details', err);
      }
    }
    loadStorage();
  }, [accessToken, uploadTrigger]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const usedBytes = storage?.usedBytes || 0;
  const quotaBytes = storage?.quotaBytes || 1073741824; // fallback 1 GB
  const percentage = quotaBytes > 0 ? (usedBytes / quotaBytes) * 100 : 0;

  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN') || user?.username === 'admin';

  const navLinks = [
    { name: 'My Drive', path: '/my-drive', icon: FolderOpen },
    { name: 'Shared', path: '/shared', icon: Users },
    { name: 'Migration', path: '/migration', icon: RefreshCw },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin Panel', path: '/admin', icon: Shield });
  }

  const sidebarContent = (isMobile = false) => {
    const isMinimizedState = !isMobile && isMinimized;
    
    return (
      <>
        {/* Brand */}
        <div className={`mb-8 flex items-center justify-between transition-all duration-300 ${
          isMinimizedState ? 'px-4 flex-col gap-4' : 'px-8'
        }`}>
          <div className="flex items-center gap-3">
            <img src={logoUrl} className="w-10 h-10 object-contain shrink-0" alt="Horizon Drive Logo" />
            {!isMinimizedState && (
              <div className="flex flex-col animate-fadeIn">
                <span className="text-lg font-bold tracking-tight text-white">Horizon Cloud</span>
                <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Multi Storage</span>
              </div>
            )}
          </div>

          {/* Toggle Button for desktop minimize/maximize */}
          {!isMobile && onToggleMinimize && (
            <button 
              onClick={onToggleMinimize} 
              className={`hidden md:flex p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer select-none ${
                isMinimizedState ? 'mt-2' : ''
              }`}
              title={isMinimizedState ? "Maximize Sidebar" : "Minimize Sidebar"}
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${isMinimizedState ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {isMobile && (
            <button onClick={onCloseMobile} className="text-white hover:opacity-80 md:hidden p-1 rounded-full hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* CTA */}
        <div className={`mb-8 transition-all duration-300 ${isMinimizedState ? 'px-4' : 'px-6'}`}>
          <Button
            variant="secondary"
            className={`bg-white text-primary hover:shadow-lg font-bold hover:scale-[1.02] transition-all duration-300 flex items-center justify-center ${
              isMinimizedState ? 'w-12 h-12 p-0 rounded-full mx-auto' : 'w-full'
            }`}
            icon={Plus}
            onClick={() => {
              onUploadClick();
              if (isMobile) onCloseMobile();
            }}
          >
            {!isMinimizedState && <span>Upload New File</span>}
          </Button>
        </div>

        {/* Main Nav */}
        <div className={`flex-1 flex flex-col gap-1.5 transition-all duration-300 ${
          isMinimizedState ? 'px-2 items-center' : 'px-4'
        }`}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const LinkIcon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={isMobile ? onCloseMobile : undefined}
                className={`flex items-center rounded-xl font-bold transition-all duration-250 ${
                  isMinimizedState ? 'p-3 justify-center w-12 h-12' : 'gap-3 px-4 py-3 text-xs w-full'
                } ${
                  isActive
                    ? 'text-white bg-white/10 shadow-sm'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
                title={isMinimizedState ? link.name : undefined}
              >
                <LinkIcon className="w-5 h-5 shrink-0" />
                {!isMinimizedState && <span className="text-xs">{link.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Footer Nav */}
        <div className={`mt-auto border-t border-white/10 pt-6 flex flex-col gap-2 transition-all duration-300 ${
          isMinimizedState ? 'px-2 items-center pb-4' : 'px-4 pb-6'
        }`}>
          {!isMinimizedState ? (
            <div className="px-4 mb-2">
              {/* Storage Details Header with collapse toggle */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-white/55 uppercase tracking-wider">Storage Details</p>
                <button 
                  onClick={() => setIsStorageCollapsed(!isStorageCollapsed)}
                  className="text-white/60 hover:text-white p-1 rounded-md hover:bg-white/5 transition-all cursor-pointer select-none"
                  title={isStorageCollapsed ? "Expand Storage Details" : "Collapse Storage Details"}
                >
                  <svg 
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${isStorageCollapsed ? '' : 'rotate-90'}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              {/* Storage Details Content List */}
              <div className={`space-y-3 transition-all duration-300 overflow-hidden ${
                isStorageCollapsed ? 'max-h-0 opacity-0 mb-0' : 'max-h-[300px] opacity-100 mb-4'
              }`}>
                {/* Personal Storage */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-white/95 text-xs">
                    <div className="flex items-center gap-2.5">
                      <Cloud className="text-white/60 w-4 h-4" />
                      <span>Personal Storage</span>
                    </div>
                    <span className="font-bold">{formatSize(usedBytes)} / {formatSize(quotaBytes)}</span>
                  </div>
                  <div className="w-full bg-white/20 h-1 rounded-full">
                    <div 
                      className="bg-white h-1 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Google Drive Storages */}
                {gdriveStorages.map((gd, idx) => {
                  const gPercent = gd.storage.totalBytes > 0
                    ? (gd.storage.usedBytes / gd.storage.totalBytes) * 100
                    : 0;
                  return (
                    <div key={idx} className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-white/95 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <HardDrive className="text-emerald-400 w-4 h-4 shrink-0" />
                          <span className="truncate" title={gd.email}>Google Drive</span>
                        </div>
                        <span className="font-bold shrink-0 ml-2">{formatSize(gd.storage.usedBytes)} / {formatSize(gd.storage.totalBytes)}</span>
                      </div>
                      <p className="text-[9px] text-white/40 font-semibold pl-[26px] truncate">{gd.email}</p>
                      <div className="w-full bg-white/20 h-1 rounded-full">
                        <div 
                          className="bg-emerald-400 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(gPercent, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
          
          {!isMinimizedState ? (
            <a
              href="#"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all text-xs shadow-sm hover:scale-[1.01]"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Upgrade Storage</span>
            </a>
          ) : (
            <a
              href="#"
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all shadow-sm hover:scale-[1.05]"
              title="Upgrade Storage"
            >
              <TrendingUp className="w-5 h-5" />
            </a>
          )}

          {/* Log Out Button */}
          <button
            onClick={logout}
            className={`flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-bold transition-all border border-white/5 ${
              isMinimizedState ? 'w-12 h-12 p-0' : 'px-4 py-2.5 text-xs mt-1'
            }`}
            title={isMinimizedState ? "Log Out" : undefined}
          >
            <LogOut className="w-4 h-4" />
            {!isMinimizedState && <span>Log Out</span>}
          </button>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Desktop Drawer Navigation */}
      <nav className={`hidden md:flex bg-primary h-screen rounded-r-3xl flex-col shadow-md fixed left-0 top-0 bottom-0 py-8 z-40 transition-all duration-300 ${
        isMinimized ? 'w-20' : 'w-[280px]'
      }`}>
        {sidebarContent(false)}
      </nav>

      {/* Mobile Drawer Navigation (Overlay) */}
      <div
        className={`fixed inset-0 bg-slate-900/60 z-40 transition-opacity duration-300 md:hidden ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCloseMobile}
      >
        <nav
          className={`bg-primary h-full w-[280px] flex flex-col py-8 transition-transform duration-300 transform shadow-2xl ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {sidebarContent(true)}
        </nav>
      </div>
    </>
  );
}
