import React, { useState, useEffect, useRef } from 'react';
import RecentFileList from './components/RecentFileList';
import RecentFileGrid from './components/RecentFileGrid';
import { fetchRecentFiles } from '../../api/recent';

export default function Recent({ searchQuery = '' }) {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all' | 'pdf' | 'document' | 'spreadsheet' | 'presentation' | 'image' | 'video' | 'zip'
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const filterMenuRef = useRef(null);

  useEffect(() => {
    async function loadFiles() {
      setIsLoading(true);
      // Artificial delay for premium loading experience
      const data = await fetchRecentFiles();
      if (data) {
        setFiles(data);
      }
      setIsLoading(false);
    }
    loadFiles();
  }, []);

  // Close filter menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setFilterMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter category map
  const categoryFilters = {
    all: () => true,
    pdf: (file) => file.type === 'pdf',
    document: (file) => ['docx', 'doc'].includes(file.type),
    spreadsheet: (file) => ['xlsx', 'xls'].includes(file.type),
    presentation: (file) => ['pptx', 'ppt'].includes(file.type),
    image: (file) => ['jpg', 'jpeg', 'png'].includes(file.type),
    video: (file) => ['mp4', 'mov'].includes(file.type),
    zip: (file) => ['zip', 'folder'].includes(file.type) || file.name.endsWith('.zip'),
  };

  // Filter files based on search query and category
  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.folder && file.folder.toLowerCase().includes(searchQuery.toLowerCase())) ||
      file.owner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilters[selectedCategory](file);

    return matchesSearch && matchesCategory;
  });

  // Group files by timelineGroup (Today, Yesterday, Last Week)
  const groupFiles = (fileList) => {
    return fileList.reduce(
      (groups, file) => {
        const group = file.timelineGroup || 'Last Week';
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(file);
        return groups;
      },
      { Today: [], Yesterday: [], 'Last Week': [] }
    );
  };

  const groupedFiles = groupFiles(filteredFiles);
  const hasFiles = filteredFiles.length > 0;

  // Category labels helper
  const getCategoryLabel = () => {
    const labels = {
      all: 'All Files',
      pdf: 'PDF Documents',
      document: 'Word Documents',
      spreadsheet: 'Spreadsheets',
      presentation: 'Presentations',
      image: 'Images',
      video: 'Videos',
      zip: 'Archives & Folders',
    };
    return labels[selectedCategory] || 'Filter';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex-1 space-y-8 flex flex-col">
      {/* Page Header & Filters */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-outline mb-1">
            <span>Horizon Drive</span>
            <span className="material-symbols-outlined text-xs" style={{ fontSize: '14px' }}>chevron_right</span>
            <span className="text-on-surface-variant font-medium">Recent</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
            Recent Files
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Files you've worked on recently across all folders.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex gap-3 items-center">
          {/* Category Filter Dropdown */}
          <div className="relative" ref={filterMenuRef}>
            <button
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-outline-variant/30 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              {getCategoryLabel()}
              <span className="material-symbols-outlined text-[16px] text-outline">keyboard_arrow_down</span>
            </button>
            {filterMenuOpen && (
              <div className="absolute right-0 mt-2 z-30 bg-white rounded-2xl shadow-level-2 border border-outline-variant/10 p-2 w-56 space-y-1">
                {[
                  { id: 'all', label: 'All Files', icon: 'folder_open' },
                  { id: 'pdf', label: 'PDF Documents', icon: 'picture_as_pdf' },
                  { id: 'document', label: 'Word Documents', icon: 'description' },
                  { id: 'spreadsheet', label: 'Spreadsheets', icon: 'table_chart' },
                  { id: 'presentation', label: 'Presentations', icon: 'slideshow' },
                  { id: 'image', label: 'Images', icon: 'image' },
                  { id: 'video', label: 'Videos', icon: 'video_library' },
                  { id: 'zip', label: 'Archives & Folders', icon: 'folder_zip' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setFilterMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all text-left ${
                      selectedCategory === cat.id
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-on-surface hover:bg-surface-container-low/70'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${
                      selectedCategory === cat.id ? 'text-primary' : 'text-outline'
                    }`}>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

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

      {/* Main content list/grid */}
      <div className="flex-1">
        {isLoading ? (
          // Loading skeletons
          <div className="space-y-8 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 w-32 bg-slate-200 rounded-lg"></div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 w-full bg-slate-100 rounded-xl"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-6 w-32 bg-slate-200 rounded-lg"></div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 w-full bg-slate-100 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        ) : !hasFiles ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-white rounded-3xl border border-outline-variant/10 shadow-level-1">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-3xl">search_off</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-on-surface">No matching files</h3>
              <p className="text-sm text-on-surface-variant max-w-xs">
                We couldn't find any recent files that match your search or filter criteria.
              </p>
            </div>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  // Let the search query clear be handled or not (it's in the parent)
                }}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-opacity-95 active:scale-[0.98] transition-all"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <RecentFileList groupedFiles={groupedFiles} />
        ) : (
          <RecentFileGrid groupedFiles={groupedFiles} />
        )}
      </div>
    </div>
  );
}
