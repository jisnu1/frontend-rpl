import React from 'react';
import { Files, Cloud, HardDrive, Plus, ChevronDown } from 'lucide-react';

interface DashboardTabsProps {
  activeTab: string | number;
  externalAccounts: Array<{ id: number; email: string; provider: string }>;
  onTabChange: (tab: 'all' | 'local' | number) => void;
  onConnectGoogleDrive: () => void;
}

export default function DashboardTabs({
  activeTab,
  externalAccounts,
  onTabChange,
  onConnectGoogleDrive
}: DashboardTabsProps) {
  return (
    <>
      {/* Desktop Tabs View */}
      <div className="hidden md:flex border-b border-slate-200 gap-6 text-sm font-extrabold pb-1">
        <button
          onClick={() => onTabChange('all')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'all' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          <Files className="w-4 h-4" />
          <span>ALL</span>
        </button>
        <button
          onClick={() => onTabChange('local')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'local' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Storage Node</span>
        </button>
        {externalAccounts.map((acc, index) => (
          <button
            key={acc.id}
            onClick={() => onTabChange(acc.id)}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === acc.id 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-450 hover:text-slate-700'
            }`}
            title={acc.email}
          >
            <HardDrive className="w-4 h-4" />
            <span>Drive {index + 1}</span>
          </button>
        ))}
        <button
          onClick={onConnectGoogleDrive}
          className="pb-3 border-b-2 border-transparent text-[#0052cc] hover:text-[#0052cc]/80 flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ml-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Hubungkan Google Drive</span>
        </button>
      </div>

      {/* Mobile Select Dropdown View */}
      <div className="flex md:hidden items-center gap-2 w-full border-b border-slate-200 pb-3">
        <div className="relative flex-1">
          <select
            value={activeTab}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'all') onTabChange('all');
              else if (val === 'local') onTabChange('local');
              else onTabChange(Number(val));
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-3.5 pr-9 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
          >
            <option value="all">📁 Semua Penyimpanan (All)</option>
            <option value="local">☁️ Storage Node (Local)</option>
            {externalAccounts.map((acc, index) => (
              <option key={acc.id} value={acc.id}>
                💾 Google Drive {index + 1} ({acc.email.split('@')[0]}...)
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        <button
          onClick={onConnectGoogleDrive}
          className="flex items-center justify-center p-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary transition-all cursor-pointer border border-primary/20 shrink-0"
          title="Hubungkan Google Drive"
        >
          <Plus className="w-4.5 h-4.5" />
        </button>
      </div>
    </>
  );
}
