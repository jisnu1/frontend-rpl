import React from 'react';
import { Link } from 'react-router-dom';

export default function Header({ onMenuClick, searchPlaceholder = "Search Drive...", searchValue = "", onSearchChange }) {
  return (
    <header className="bg-white flex justify-between items-center h-16 px-6 w-full sticky top-0 border-b border-slate-100 z-30">
      {/* Mobile Menu Trigger & Logo */}
      <div className="md:hidden flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-primary p-2 -ml-2 rounded-full hover:bg-slate-50 transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <Link to="/" className="text-xl font-extrabold text-primary flex items-center gap-1.5">
          <span className="material-symbols-outlined icon-fill">cloud_done</span>
          <span>Horizon Drive</span>
        </Link>
      </div>

      {/* Search Bar - Desktop Only */}
      <div className="hidden md:flex flex-1 max-w-2xl">
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            className="w-full bg-[#F1F5F9] border-none rounded-full py-2 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
            placeholder={searchPlaceholder}
            type="text"
            value={searchValue}
            onChange={onSearchChange}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <button className="p-2 rounded-full text-slate-600 hover:bg-slate-50 transition-colors relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
        </button>
        <button className="hidden sm:block p-2 rounded-full text-slate-600 hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined">help</span>
        </button>
        <button className="hidden sm:block p-2 rounded-full text-slate-600 hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined">settings</span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
        
        <div className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors border border-transparent cursor-pointer">
          <span className="text-sm font-semibold text-slate-700 hidden md:block">Jessica</span>
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold uppercase shadow-sm">
            J
          </div>
        </div>
      </div>
    </header>
  );
}
