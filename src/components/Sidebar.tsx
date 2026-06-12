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
  HardDrive
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
}

interface GoogleDriveStorageInfo {
  email: string;
  storage: GoogleDriveStorageDto;
}

export default function Sidebar({ isMobileOpen, onCloseMobile, onUploadClick, uploadTrigger }: SidebarProps) {
  const location = useLocation();
  const { logout, accessToken } = useAuth();
  const [storage, setStorage] = useState<UserStorageResponse | null>(null);
  const [gdriveStorages, setGdriveStorages] = useState<GoogleDriveStorageInfo[]>([]);

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

  const navLinks = [
    { name: 'My Drive', path: '/', icon: FolderOpen },
    { name: 'Shared', path: '/shared', icon: Users },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarContent = (isMobile = false) => (
    <>
      {/* Brand */}
      <div className="px-8 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoUrl} className="w-10 h-10 object-contain" alt="Horizon Drive Logo" />
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white">Horizon Drive</span>
            <span className="text-[10px] text-white/60 font-semibold uppercase tracking-wider">Cloud Storage</span>
          </div>
        </div>
        {isMobile && (
          <button onClick={onCloseMobile} className="text-white hover:opacity-80 md:hidden p-1 rounded-full hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* CTA */}
      <div className="px-6 mb-8">
        <Button
          variant="secondary"
          className="w-full bg-white text-primary hover:shadow-lg font-bold hover:scale-[1.02] transition-all"
          icon={Plus}
          onClick={() => {
            onUploadClick();
            if (isMobile) onCloseMobile();
          }}
        >
          Upload New File
        </Button>
      </div>

      {/* Main Nav */}
      <div className="flex-1 px-4 flex flex-col gap-1.5">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          const LinkIcon = link.icon;
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={isMobile ? onCloseMobile : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                isActive
                  ? 'text-white bg-white/10 shadow-sm'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <LinkIcon className="w-4 h-4 shrink-0" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Nav */}
      <div className="px-4 mt-auto border-t border-white/10 pt-6 flex flex-col gap-2">
        <div className="px-4 mb-2">
          <p className="text-[10px] font-bold text-white/55 uppercase tracking-wider mb-3">Storage Details</p>
          
          {/* Personal Storage */}
          <div className="flex items-center justify-between mb-2 text-white/95 text-xs">
            <div className="flex items-center gap-2.5">
              <Cloud className="text-white/60 w-4 h-4" />
              <span>Personal Storage</span>
            </div>
            <span className="font-bold">{formatSize(usedBytes)} / {formatSize(quotaBytes)}</span>
          </div>
          <div className="w-full bg-white/20 h-1 rounded-full mb-4">
            <div 
              className="bg-white h-1 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>

          {/* Google Drive Storage — per akun terhubung */}
          {gdriveStorages.map((gd, idx) => {
            const gPercent = gd.storage.totalBytes > 0
              ? (gd.storage.usedBytes / gd.storage.totalBytes) * 100
              : 0;
            return (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1 text-white/95 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <HardDrive className="text-emerald-400 w-4 h-4 shrink-0" />
                    <span className="truncate" title={gd.email}>Google Drive</span>
                  </div>
                  <span className="font-bold shrink-0 ml-2">{formatSize(gd.storage.usedBytes)} / {formatSize(gd.storage.totalBytes)}</span>
                </div>
                <p className="text-[9px] text-white/40 font-semibold mb-1.5 pl-[26px] truncate">{gd.email}</p>
                <div className="w-full bg-white/20 h-1 rounded-full mb-4">
                  <div 
                    className="bg-emerald-400 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(gPercent, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        
        <a
          href="#"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all text-xs shadow-sm hover:scale-[1.01]"
        >
          <TrendingUp className="w-4 h-4" />
          <span>Upgrade Storage</span>
        </a>

        {/* Log Out Button */}
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-bold transition-all text-xs mt-1 border border-white/5"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Drawer Navigation */}
      <nav className="hidden md:flex bg-primary h-screen w-[280px] rounded-r-3xl flex-col shadow-md fixed left-0 top-0 bottom-0 py-8 z-40 transition-all">
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
