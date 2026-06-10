import React, { useState, useEffect } from 'react';
import SharedBento from './components/SharedBento';
import SharedFileTable from './components/SharedFileTable';
import { fetchSharedFiles } from '../../api/shared';

export default function Shared({ searchQuery = '' }) {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      setIsLoading(true);
      const data = await fetchSharedFiles();
      if (data) setFiles(data);
      setIsLoading(false);
    }
    loadFiles();
  }, []);

  // Filter berdasarkan search query dari Header
  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenFile = (fileName) => {
    console.log('Opening file:', fileName);
  };

  const handleViewReport = () => {
    console.log('Viewing report...');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex-1 space-y-8">
      {/* Page Header & Filters */}
      <div className="flex justify-between items-end">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-outline mb-1">
            <span>Horizon Drive</span>
            <span className="material-symbols-outlined text-xs" style={{ fontSize: '14px' }}>chevron_right</span>
            <span className="text-on-surface-variant font-medium">Shared with me</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
            Shared with me
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-outline-variant/30 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter
          </button>
          {/* View Mode Toggle */}
          <div className="bg-surface-container-low p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-outline hover:text-on-surface'
              }`}
              title="List View"
            >
              <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white shadow-sm text-primary'
                  : 'text-outline hover:text-on-surface'
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-[20px]">grid_view</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bento Featured Cards */}
      <SharedBento onOpenFile={handleOpenFile} onViewReport={handleViewReport} />

      {/* File List / Grid Area */}
      <SharedFileTable
        files={filteredFiles}
        isLoading={isLoading}
        viewMode={viewMode}
        searchQuery={searchQuery}
      />
    </div>
  );
}
