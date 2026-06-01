import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ isMobileOpen, onCloseMobile, onUploadClick }) {
  const location = useLocation();

  const navLinks = [
    { name: 'My Drive', path: '/', icon: 'folder_open' },
    { name: 'Shared', path: '/shared', icon: 'group' },
    { name: 'Recent', path: '/recent', icon: 'schedule' },
    { name: 'Trash', path: '/trash', icon: 'delete' },
  ];

  const sidebarContent = (isMobile = false) => (
    <>
      {/* Brand */}
      <div className="px-8 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined icon-fill text-on-primary text-3xl">cloud_done</span>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-on-primary dark:text-on-primary-container">Horizon Drive</span>
            <span className="text-xs text-on-primary/70">Cloud Storage</span>
          </div>
        </div>
        {isMobile && (
          <button onClick={onCloseMobile} className="text-white hover:opacity-80 md:hidden">
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* CTA */}
      <div className="px-6 mb-8">
        <button
          onClick={() => {
            onUploadClick();
            if (isMobile) onCloseMobile();
          }}
          className="w-full bg-white text-primary text-sm font-semibold py-3 px-4 rounded-full flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined">add</span>
          Upload New File
        </button>
      </div>

      {/* Main Nav */}
      <div className="flex-1 px-4 flex flex-col gap-2">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={isMobile ? onCloseMobile : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'text-white bg-white/10'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Nav */}
      <div className="px-4 mt-auto border-t border-white/10 pt-6 flex flex-col gap-2">
        <div className="px-4 mb-2">
          <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Storage Details</p>
          
          <div className="flex items-center justify-between mb-2 text-white/90 text-sm">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-white/70 text-[18px]">cloud_queue</span>
              <span>Storage</span>
            </div>
            <span className="font-bold">60.8 GB / 1 TB</span>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full mb-4">
            <div className="bg-white h-1.5 rounded-full w-[6%]"></div>
          </div>

          <div className="flex items-center justify-between mb-2 text-white/90 text-sm">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-white/70 text-[18px]">photo_library</span>
              <span>Photos</span>
            </div>
            <span className="font-bold">10.3 GB / 1 TB</span>
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full mb-1">
            <div className="bg-white h-1.5 rounded-full w-[1%]"></div>
          </div>
        </div>
        
        <a
          href="#"
          className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all mt-2 text-center text-sm shadow-sm hover:scale-[1.01]"
        >
          <span className="material-symbols-outlined">trending_up</span>
          <span>Upgrade Storage</span>
        </a>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Drawer Navigation */}
      <nav className="hidden md:flex bg-primary dark:bg-primary-container h-screen w-[280px] rounded-r-3xl flex-col shadow-md fixed left-0 top-0 bottom-0 py-8 z-20 transition-all">
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
