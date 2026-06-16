import React from 'react';
import { Files, Cloud, HardDrive, Plus } from 'lucide-react';

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
    <div className="flex border-b border-slate-200 gap-6 text-sm font-extrabold overflow-x-auto pb-1">
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
  );
}
