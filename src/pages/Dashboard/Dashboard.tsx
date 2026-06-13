import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderOpen, 
  Download, 
  Trash2, 
  Sparkles, 
  List, 
  Grid, 
  SearchX, 
  AlertTriangle,
  ChevronRight,
  Share2,
  Filter,
  Files,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Table as TableIcon
} from 'lucide-react';
import { fetchMyFiles, deleteFile, getDownloadUrl, FileResponse } from '../../api/files';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ShareModal from '../../components/ShareModal';
import FileIcon from '../../components/ui/FileIcon';
import Card from '../../components/ui/Card';
import { useToast } from '../../context/ToastContext';
import { useActivity } from '../../context/ActivityContext';
import FilePreviewModal from '../../components/FilePreviewModal';

interface DashboardProps {
  uploadTrigger?: number;
  searchQuery?: string;
}

export default function Dashboard({ uploadTrigger = 0, searchQuery = '' }: DashboardProps) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDeleteFile, setConfirmDeleteFile] = useState<FileResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeShareFile, setActiveShareFile] = useState<FileResponse | null>(null);
  const [activePreviewFile, setActivePreviewFile] = useState<FileResponse | null>(null);
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

  const getCategoryCount = (category: typeof filterCategories[0]) => {
    if (category.id === 'all') return files.length;
    return files.filter(f => {
      const ext = getFileExtension(f.originalFileName).toLowerCase();
      return category.extensions.includes(ext);
    }).length;
  };

  const { error: toastError, success: toastSuccess } = useToast();
  const { downloadFile } = useActivity();

  const loadFiles = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMyFiles();
      setFiles(data || []);
    } catch (err) {
      console.error('Failed to load files', err);
      toastError('Gagal memuat daftar berkas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [uploadTrigger]);

  const handleDelete = async () => {
    if (!confirmDeleteFile) return;
    setIsDeleting(true);
    try {
      await deleteFile(confirmDeleteFile.id, confirmDeleteFile.provider);
      setFiles((prev) => prev.filter((f) => f.id !== confirmDeleteFile.id));
      toastSuccess(`Berkas "${confirmDeleteFile.originalFileName}" berhasil dihapus.`);
    } catch (err) {
      console.error('Failed to delete file', err);
      toastError('Gagal menghapus berkas. Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteFile(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.originalFileName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    
    if (activeFilter === 'all') return true;
    const ext = getFileExtension(f.originalFileName).toLowerCase();
    const category = filterCategories.find(c => c.id === activeFilter);
    return category ? category.extensions.includes(ext) : true;
  });

  const isEmpty = !isLoading && filteredFiles.length === 0;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex-1 space-y-8 flex flex-col relative">
      
      {/* Modal Konfirmasi Hapus Berkas */}
      <Modal
        isOpen={confirmDeleteFile !== null}
        onClose={() => setConfirmDeleteFile(null)}
        title="Hapus Berkas Permanen?"
        icon={AlertTriangle}
      >
        <p className="text-sm text-slate-550 leading-relaxed">
          Apakah Anda yakin ingin menghapus berkas <strong className="text-slate-800 font-semibold">"{confirmDeleteFile?.originalFileName}"</strong> secara permanen? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="flex gap-3 justify-end mt-6">
          <Button
            variant="secondary"
            disabled={isDeleting}
            onClick={() => setConfirmDeleteFile(null)}
          >
            Batal
          </Button>
          <Button
            variant="danger"
            isLoading={isDeleting}
            onClick={handleDelete}
          >
            Hapus Permanen
          </Button>
        </div>
      </Modal>

      {/* Header Halaman & Kontrol Tampilan */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-450 mb-1">
            <span>Horizon Drive</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-350" />
            <span className="text-slate-500 font-medium">My Drive</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            My Drive
            <FolderOpen className="w-8 h-8 text-primary" />
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola seluruh berkas penyimpanan pribadi Anda di server Horizon Cloud.
          </p>
        </div>

        {/* Controls Container */}
        <div className="flex items-center gap-3 relative">
          {/* Tombol Filter dengan Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-sm cursor-pointer select-none ${
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

          {/* Kontrol Tampilan Grid / List */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/50">
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

      {/* Konten Utama: Daftar Berkas */}
      <div className="flex-1 animate-fadeIn">
        <div className="bg-white rounded-[2rem] shadow-[0px_4px_20px_rgba(15,23,42,0.03)] border border-slate-150/80 overflow-hidden">
          
          {/* ── LIST VIEW ─────────────────────────────── */}
          {viewMode === 'list' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs text-slate-400 font-bold uppercase tracking-wider">Nama Berkas</th>
                    <th className="px-6 py-5 text-xs text-slate-400 font-bold uppercase tracking-wider">Penyedia</th>
                    <th className="px-6 py-5 text-xs text-slate-400 font-bold uppercase tracking-wider">Tanggal Ditambahkan</th>
                    <th className="px-6 py-5 text-xs text-slate-400 font-bold uppercase tracking-wider">Ukuran</th>
                    <th className="px-8 py-5 text-xs text-slate-400 font-bold uppercase tracking-wider text-right min-w-[280px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    // Skeleton loader
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
                            <div className="space-y-2">
                              <div className="h-3.5 w-40 bg-slate-100 rounded animate-pulse" />
                              <div className="h-2.5 w-16 bg-slate-100 rounded animate-pulse" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5"><div className="h-5 w-24 bg-slate-100 rounded-full animate-pulse" /></td>
                        <td className="px-6 py-5"><div className="h-3.5 w-24 bg-slate-100 rounded animate-pulse" /></td>
                        <td className="px-6 py-5"><div className="h-3.5 w-12 bg-slate-100 rounded animate-pulse" /></td>
                        <td className="px-8 py-5" />
                      </tr>
                    ))
                  ) : isEmpty ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-slate-400 font-bold">
                        <SearchX className="w-12 h-12 block mx-auto mb-4 text-slate-300" />
                        <h3 className="text-lg font-bold text-slate-700">Tidak ada berkas</h3>
                        <p className="text-sm text-slate-450 mt-1 font-semibold">
                          {searchQuery ? `Tidak ada berkas yang cocok dengan "${searchQuery}"` : 'Unggah berkas baru untuk memulai.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredFiles.map((file) => {
                      const ext = getFileExtension(file.originalFileName);
                      const isPdf = ext.toLowerCase() === 'pdf';
                      const downloadUrl = getDownloadUrl(file.id, file.provider);

                      return (
                        <tr 
                          key={file.id} 
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest('button') || target.closest('a')) {
                              return;
                            }
                            setActivePreviewFile(file);
                          }}
                          className="group hover:bg-slate-50/40 transition-colors cursor-pointer"
                        >
                          {/* Nama */}
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <FileIcon type={ext} className="w-5 h-5 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate max-w-[280px]" title={file.originalFileName}>
                                  {file.originalFileName}
                                </p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Penyedia */}
                          <td className="px-6 py-5">
                            <span className={`inline-flex px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                              file.provider?.toUpperCase() === 'GOOGLE_DRIVE' 
                                ? 'bg-amber-50 border-amber-100 text-amber-600' 
                                : 'bg-blue-50 border-blue-100 text-blue-600'
                            }`}>
                              {file.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'Google Drive' : 'Local Node'}
                            </span>
                          </td>

                          {/* Tanggal */}
                          <td className="px-6 py-5 text-xs font-semibold text-slate-450">
                            {file.createdAt ? new Date(file.createdAt).toLocaleString() : '-'}
                          </td>

                          {/* Ukuran */}
                          <td className="px-6 py-5 text-xs font-bold text-slate-500">
                            {formatSize(file.size)}
                          </td>

                          {/* Aksi */}
                          <td className="px-8 py-5 min-w-[280px]" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-2 shrink-0">
                              {isPdf && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={Sparkles}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/recap?fileId=${file.id}`);
                                  }}
                                  className="text-primary hover:text-indigo-700 hover:bg-indigo-50/50 cursor-pointer"
                                  title="Analisis AI Recap"
                                >
                                  AI Recap
                                </Button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadFile(file.id, file.originalFileName, file.provider, file.size);
                                }}
                                className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 transition-all border border-transparent hover:border-slate-100 cursor-pointer"
                                title="Unduh Berkas"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveShareFile(file);
                                }}
                                className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 transition-all border border-transparent hover:border-slate-100 cursor-pointer"
                                title="Bagikan Akses Berkas"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteFile(file);
                                }}
                                className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-55 transition-all cursor-pointer"
                                title="Hapus Berkas"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── GRID VIEW ─────────────────────────────── */}
          {viewMode === 'grid' && (
            <div className="p-6">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100 animate-pulse">
                      <div className="w-12 h-12 rounded-xl bg-slate-200" />
                      <div className="space-y-2">
                        <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                        <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isEmpty ? (
                <div className="py-20 text-center text-slate-400 font-bold">
                  <SearchX className="w-12 h-12 block mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-bold text-slate-700">Tidak ada berkas</h3>
                  <p className="text-sm text-slate-450 mt-1 font-semibold">
                    {searchQuery ? `Tidak ada berkas yang cocok dengan "${searchQuery}"` : 'Unggah berkas baru untuk memulai.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
                  {filteredFiles.map((file) => {
                    const ext = getFileExtension(file.originalFileName);
                    const isPdf = ext.toLowerCase() === 'pdf';

                    return (
                      <Card 
                        key={file.id} 
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest('button') || target.closest('a')) {
                            return;
                          }
                          setActivePreviewFile(file);
                        }}
                        className="p-5 flex flex-col gap-4 group cursor-pointer hover:shadow-md hover:border-slate-350 transition-all active:scale-[0.98]"
                      >
                        
                        {/* Header Kartu */}
                        <div className="flex items-start justify-between">
                          <FileIcon type={ext} className="w-6 h-6 shrink-0" />
                          <span className={`text-[9px] font-bold uppercase tracking-wider rounded-full border px-2 py-0.5 ${
                            file.provider?.toUpperCase() === 'GOOGLE_DRIVE' 
                              ? 'bg-amber-50 border-amber-100 text-amber-600' 
                              : 'bg-blue-50 border-blue-100 text-blue-600'
                          }`}>
                            {file.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'GDrive' : 'Local'}
                          </span>
                        </div>

                        {/* Info Berkas */}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate" title={file.originalFileName}>
                            {file.originalFileName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : '-'}
                          </p>
                        </div>

                        {/* Footer & Aksi */}
                        <div 
                          className="border-t border-slate-100 pt-3 flex justify-between items-center mt-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-xs font-bold text-slate-500">{formatSize(file.size)}</span>
                          <div className="flex gap-1">
                            {isPdf && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/recap?fileId=${file.id}`);
                                }}
                                className="p-1.5 rounded-lg text-primary hover:bg-indigo-50/50 transition-colors cursor-pointer"
                                title="AI Recap"
                              >
                                <Sparkles className="w-4 h-4" />
                              </button>
                            )}
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 downloadFile(file.id, file.originalFileName, file.provider, file.size);
                               }}
                               className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100/70 transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
                               title="Download"
                             >
                               <Download className="w-4 h-4" />
                             </button>
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setActiveShareFile(file);
                               }}
                               className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100/70 transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
                               title="Bagikan"
                             >
                               <Share2 className="w-4 h-4" />
                             </button>
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setConfirmDeleteFile(file);
                               }}
                               className="p-1.5 rounded-lg text-red-500 hover:bg-red-55 transition-colors cursor-pointer"
                               title="Hapus"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                        </div>

                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={activeShareFile !== null}
        onClose={() => setActiveShareFile(null)}
        fileId={activeShareFile?.id}
        fileName={activeShareFile?.originalFileName}
        provider={activeShareFile?.provider}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={activePreviewFile !== null}
        onClose={() => setActivePreviewFile(null)}
        fileId={activePreviewFile?.id}
        fileName={activePreviewFile?.originalFileName}
        provider={activePreviewFile?.provider}
        fileSize={activePreviewFile?.size}
        createdAt={activePreviewFile?.createdAt}
      />
    </div>
  );
}
