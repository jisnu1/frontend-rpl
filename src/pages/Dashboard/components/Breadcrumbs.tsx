import React from 'react';
import { ChevronRight, FolderOpen } from 'lucide-react';

interface BreadcrumbsProps {
  activeTab: string | number;
  activeExternalAccount: { id: number; email: string } | null;
  localPath: Array<{ id: string; name: string }>;
  gDrivePath: Array<{ id: string; name: string }>;
  onBreadcrumbClick: (id?: string) => void;
}

export default function Breadcrumbs({
  activeTab,
  activeExternalAccount,
  localPath,
  gDrivePath,
  onBreadcrumbClick
}: BreadcrumbsProps) {
  const isLocal = activeTab === 'local';
  const pathStack = isLocal ? localPath : gDrivePath;

  return (
    <div>
      {/* Breadcrumb Navigation */}
      {activeTab !== 'all' && (
        <nav className="flex items-center gap-2 text-xs text-slate-450 mb-1 select-none flex-wrap">
          <span className="hover:text-slate-800 cursor-pointer font-semibold" onClick={() => onBreadcrumbClick()}>
            {isLocal ? 'My Drive' : `Google Drive (${activeExternalAccount?.email || ''})`}
          </span>
          
          {pathStack.map((p, idx) => (
            <React.Fragment key={p.id}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-350 shrink-0" />
              <span 
                className={`hover:text-slate-800 cursor-pointer font-semibold truncate max-w-[120px] ${
                  idx === pathStack.length - 1 
                    ? 'text-slate-500 font-extrabold pointer-events-none' 
                    : ''
                }`}
                onClick={() => onBreadcrumbClick(p.id)}
              >
                {p.name}
              </span>
            </React.Fragment>
          ))}
        </nav>
      )}
      
      <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
        {activeTab === 'all'
          ? 'Semua Penyimpanan'
          : isLocal 
            ? (localPath.length > 0 ? localPath[localPath.length - 1].name : 'My Drive')
            : (gDrivePath.length > 0 ? gDrivePath[gDrivePath.length - 1].name : `Google Drive (${activeExternalAccount?.email || ''})`)
        }
        <FolderOpen className="w-6 h-6 md:w-8 md:h-8 text-primary" />
      </h1>
      <p className="text-sm text-slate-500 mt-1">
        {activeTab === 'all'
          ? 'Akses cepat ke seluruh node penyimpanan lokal dan akun Google Drive yang terhubung.'
          : isLocal 
            ? 'Kelola seluruh berkas dan folder penyimpanan pribadi Anda di server VPS Lokal.' 
            : 'Telusuri, organisasikan, dan bagikan seluruh berkas Anda di Google Drive secara real-time.'}
      </p>
    </div>
  );
}
