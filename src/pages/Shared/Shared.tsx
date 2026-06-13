import React, { useState, useEffect } from 'react';
import SharedFileTable from './components/SharedFileTable';
import SharedByMeTable from './components/SharedByMeTable';
import { fetchSharedWithMe, fetchSharedByMe, SharedFileDto, SharedByMeDto } from '../../api/shared';
import { 
  Filter, 
  List, 
  Grid, 
  ChevronRight,
  Files,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Table as TableIcon
} from 'lucide-react';
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
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const getFileExtension = (filename: string) => {
    return filename.split('.').pop() || '';
  };

  const filterCategories = [
    { id: 'all', label: 'Semua', icon: Files, extensions: [] as string[] },
    { id: 'document', label: 'Dokumen (PDF/Word)', icon: FileText, extensions: ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'ppt', 'pptx'] },
    { id: 'image', label: 'Gambar', icon: ImageIcon, extensions: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'] },
    { id: 'video', label: 'Video', icon: VideoIcon, extensions: ['mp4', 'mkv', 'avi', 'mov', 'flv', 'wmv', 'webm'] },
    { id: 'spreadsheet', label: 'Spreadsheet', icon: TableIcon, extensions: ['xls', 'xlsx', 'csv', 'ods'] },
  ];

  const currentFilesList = activeTab === 'with-me' ? withMeFiles : byMeFiles;

  const getCategoryCount = (category: typeof filterCategories[0]) => {
    if (category.id === 'all') return currentFilesList.length;
    return currentFilesList.filter(f => {
      const ext = getFileExtension(f.originalFileName).toLowerCase();
      return category.extensions.includes(ext);
    }).length;
  };
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

  // Filter lists based on search query and category
  const filteredWithMe = withMeFiles.filter((f) => {
    const matchesSearch = f.originalFileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.ownerEmail || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    const ext = getFileExtension(f.originalFileName).toLowerCase();
    const category = filterCategories.find(c => c.id === activeFilter);
    return category ? category.extensions.includes(ext) : true;
  });

  const filteredByMe = byMeFiles.filter((f) => {
    const matchesSearch = f.originalFileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.sharedWithEmail || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    const ext = getFileExtension(f.originalFileName).toLowerCase();
    const category = filterCategories.find(c => c.id === activeFilter);
    return category ? category.extensions.includes(ext) : true;
  });

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
        <div className="flex gap-3 relative">
          {/* Tombol Filter dengan Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all shadow-sm cursor-pointer select-none ${
                activeFilter !== 'all'
                  ? 'bg-[#0052cc]/5 border-[#0052cc]/20 text-[#0052cc]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className={`w-4 h-4 ${activeFilter !== 'all' ? 'text-[#0052cc]' : 'text-slate-500'}`} />
              <span>
                {activeFilter === 'all'
                  ? 'Filter'
                  : `Filter: ${filterCategories.find((c) => c.id === activeFilter)?.label.replace(' (PDF/Word)', '')}`}
              </span>
              <svg
                className={`w-4 h-4 text-slate-400 mt-0.5 transition-transform duration-300 ${
                  isFilterDropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isFilterDropdownOpen && (
              <>
                {/* Backdrop to handle clicks outside the dropdown */}
                <div className="fixed inset-0 z-20" onClick={() => setIsFilterDropdownOpen(false)} />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-100 shadow-[0px_10px_30px_rgba(15,23,42,0.1)] py-2 z-30 animate-fadeIn">
                  <div className="px-4 py-2 border-b border-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Pilih Jenis Berkas
                  </div>
                  {filterCategories.map((category) => {
                    const IconComponent = category.icon;
                    const isActive = activeFilter === category.id;
                    const count = getCategoryCount(category);

                    return (
                      <button
                        key={category.id}
                        onClick={() => {
                          setActiveFilter(category.id);
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center justify-between transition-all duration-200 cursor-pointer select-none ${
                          isActive
                            ? 'text-[#0052cc] bg-[#0052cc]/5'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg transition-colors ${
                            isActive ? 'bg-[#0052cc]/10 text-[#0052cc]' : 'bg-slate-50 text-slate-400'
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className={isActive ? 'text-[#0052cc]' : 'text-slate-700'}>{category.label}</span>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full transition-colors ${
                          isActive ? 'bg-[#0052cc]/20 text-[#0052cc]' : 'bg-slate-100 text-slate-550'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          
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
