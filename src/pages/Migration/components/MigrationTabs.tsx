import React, { useState } from 'react';
import { HardDrive, Database, ChevronDown } from 'lucide-react';

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
  isLargeScreen?: boolean;
}

export default function MigrationTabs({
  tabs,
  activeTab,
  onTabChange
}: MigrationTabsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentTabConfig = tabs.find(t => t.id === activeTab) || tabs[0];

  // Helper to get Google Drive index
  const getGDriveIndex = (tabId: string) => {
    let count = 0;
    for (const t of tabs) {
      if (t.provider === 'GOOGLE_DRIVE') {
        count++;
        if (t.id === tabId) return count;
      }
    }
    return 0;
  };

  const getMobileTabLabel = () => {
    if (currentTabConfig.provider !== 'GOOGLE_DRIVE') return 'Storage Node';
    const driveIdx = getGDriveIndex(currentTabConfig.id);
    const emailStr = currentTabConfig.email ? ` (${currentTabConfig.email.split('@')[0]}...)` : '';
    return `Google Drive ${driveIdx}${emailStr}`;
  };

  let desktopGDriveCount = 0;

  return (
    <>
      {/* Desktop Layout (hidden on mobile, flex on desktop) */}
      <div className="hidden lg:flex w-full border-b border-slate-100 gap-1 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isGDrive = tab.provider === 'GOOGLE_DRIVE';
          if (isGDrive) desktopGDriveCount++;
          
          const TabIcon = isGDrive ? HardDrive : Database;
          const displayName = isGDrive ? `Drive ${desktopGDriveCount}` : 'Storage Node';

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

      {/* Mobile Layout (block on mobile, hidden on desktop) */}
      <div className="block lg:hidden bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10 w-full px-4 py-3 relative">
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-slate-100 border border-transparent rounded-2xl py-3 pl-11 pr-10 text-xs font-bold text-slate-700 focus:bg-white focus:border-primary flex items-center justify-between cursor-pointer select-none"
          >
            <span>{getMobileTabLabel()}</span>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Left Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {currentTabConfig.provider === 'GOOGLE_DRIVE' ? (
              <HardDrive className="w-4 h-4 text-sky-500" />
            ) : (
              <Database className="w-4 h-4 text-primary" />
            )}
          </div>

          {isOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
              <div className="absolute left-0 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 z-40 animate-fadeIn">
                {tabs.map((tab) => {
                  const isGDrive = tab.provider === 'GOOGLE_DRIVE';
                  const driveIdx = isGDrive ? getGDriveIndex(tab.id) : 0;
                  const emailStr = tab.email ? ` (${tab.email.split('@')[0]}...)` : '';
                  const displayName = isGDrive ? `Google Drive ${driveIdx}${emailStr}` : 'Storage Node';
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        onTabChange(tab.id);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-5 py-2.5 text-xs font-bold transition-colors ${
                        activeTab === tab.id ? 'text-primary bg-indigo-50/50' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {displayName}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
