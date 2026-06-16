import React from 'react';
import { HardDrive, Database, ChevronRight } from 'lucide-react';

interface TabConfig {
  id: string;
  name: string;
  provider: 'STORAGE_NODE' | 'GOOGLE_DRIVE';
  accountId: number | null;
  email?: string;
}

interface MigrationTabsProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isLargeScreen: boolean;
}

export default function MigrationTabs({
  tabs,
  activeTab,
  onTabChange,
  isLargeScreen
}: MigrationTabsProps) {
  const currentTabConfig = tabs.find(t => t.id === activeTab) || tabs[0];

  if (isLargeScreen) {
    // We map drive tab display names, keeping them short as "Drive 1", "Drive 2", etc.
    let gDriveCount = 0;
    return (
      <div className="w-full" style={{ minWidth: 0 }}>
        <div className="border-b border-slate-100 flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isGDrive = tab.provider === 'GOOGLE_DRIVE';
            if (isGDrive) gDriveCount++;
            
            const TabIcon = isGDrive ? HardDrive : Database;
            const displayName = isGDrive ? `Drive ${gDriveCount}` : 'Storage Node';

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 border-b-2 font-bold text-xs transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? isGDrive
                      ? 'border-sky-500 text-sky-600 bg-sky-50/60'
                      : 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                }`}
              >
                <TabIcon className={`w-4 h-4 shrink-0 ${isActive && isGDrive ? 'text-sky-500' : ''}`} />
                <span>{displayName}</span>
                {tab.email && (
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${isActive && isGDrive ? 'bg-sky-100 text-sky-500' : 'text-slate-400 bg-slate-100'}`}>
                    {tab.email}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Mobile layout dropdown
  let mobileGDriveCount = 0;
  return (
    <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10 w-full px-4 py-3">
      <div className="relative">
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value)}
          className="w-full bg-slate-100 border border-transparent rounded-2xl py-3 pl-11 pr-10 text-xs font-bold text-slate-700 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer transition-all"
        >
          {tabs.map((tab) => {
            const isGDrive = tab.provider === 'GOOGLE_DRIVE';
            if (isGDrive) mobileGDriveCount++;
            const emailStr = tab.email ? ` (${tab.email.split('@')[0]})` : '';
            const displayName = isGDrive ? `Drive ${mobileGDriveCount}${emailStr}` : 'Storage Node';
            return (
              <option key={tab.id} value={tab.id}>
                {displayName}
              </option>
            );
          })}
        </select>
        {/* Left Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          {currentTabConfig.provider === 'GOOGLE_DRIVE' ? (
            <HardDrive className="w-4 h-4 text-sky-500" />
          ) : (
            <Database className="w-4 h-4 text-primary" />
          )}
        </div>
        {/* Right Arrow/Chevron */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronRight className="w-4 h-4 rotate-90" />
        </div>
      </div>
    </div>
  );
}
