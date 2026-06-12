import React, { useState, useEffect } from 'react';
import SharedFileTable from './components/SharedFileTable';
import SharedByMeTable from './components/SharedByMeTable';
import { fetchSharedWithMe, fetchSharedByMe, SharedFileDto, SharedByMeDto } from '../../api/shared';
import { Filter, List, Grid, ChevronRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface SharedProps {
  searchQuery?: string;
}

export default function Shared({ searchQuery = '' }: SharedProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeTab, setActiveTab] = useState<'with-me' | 'by-me'>('with-me');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [withMeFiles, setWithMeFiles] = useState<SharedFileDto[]>([]);
  const [byMeFiles, setByMeFiles] = useState<SharedByMeDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { error: toastError } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'with-me') {
        const data = await fetchSharedWithMe();
        setWithMeFiles(data || []);
      } else {
        const data = await fetchSharedByMe();
        setByMeFiles(data || []);
      }
    } catch (err) {
      console.error('Failed to load shared files', err);
      toastError('Gagal memuat berkas pembagian.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Filter lists based on search query
  const filteredWithMe = withMeFiles.filter((f) =>
    f.originalFileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.ownerEmail || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredByMe = byMeFiles.filter((f) =>
    f.originalFileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.sharedWithEmail || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex-1 space-y-8 animate-fadeIn">
      {/* Page Header & Filters */}
      <div className="flex justify-between items-end">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-1 font-semibold">
            <span>Horizon Drive</span>
            <ChevronRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-500 font-medium">
              {activeTab === 'with-me' ? 'Shared with me' : 'Shared by me'}
            </span>
          </nav>
          
          {/* Dropdown Selector */}
          <div className="relative inline-block text-left">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-3xl font-extrabold text-slate-900 tracking-tight hover:text-primary transition-colors cursor-pointer select-none focus:outline-none"
            >
              <span>{activeTab === 'with-me' ? 'Shared with me' : 'Shared by me'}</span>
              <svg className={`w-5 h-5 text-slate-400 mt-1.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-100 shadow-[0px_10px_30px_rgba(15,23,42,0.1)] py-2 z-30 animate-fadeIn">
                  <button
                    onClick={() => {
                      setActiveTab('with-me');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between transition-colors ${
                      activeTab === 'with-me' ? 'text-primary bg-indigo-50/50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Shared with me</span>
                    {activeTab === 'with-me' && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('by-me');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3 text-sm font-bold flex items-center justify-between transition-colors ${
                      activeTab === 'by-me' ? 'text-primary bg-indigo-50/50' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Shared by me (Shared to)</span>
                    {activeTab === 'by-me' && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Filter className="w-4 h-4 text-slate-500" />
            Filter
          </button>
          
          {/* View Mode Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-slate-400 hover:text-slate-650'
              }`}
              title="List View"
            >
              <List className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-slate-400 hover:text-slate-650'
              }`}
              title="Grid View"
            >
              <Grid className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* File List / Grid Area */}
      {activeTab === 'with-me' ? (
        <SharedFileTable
          files={filteredWithMe}
          isLoading={isLoading}
          viewMode={viewMode}
          searchQuery={searchQuery}
          onRemoveSuccess={(fileId) => {
            setWithMeFiles((prev) => prev.filter((f) => f.id !== fileId));
          }}
        />
      ) : (
        <SharedByMeTable
          files={filteredByMe}
          isLoading={isLoading}
          viewMode={viewMode}
          searchQuery={searchQuery}
          onRemoveSuccess={(shareId) => {
            setByMeFiles((prev) => prev.filter((f) => f.id !== shareId));
          }}
        />
      )}
    </div>
  );
}
