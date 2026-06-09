import React, { useState, useEffect } from 'react';
import { fetchTrashFiles, restoreFile, deleteFilePermanently, emptyTrash } from '../../api/trash';

const FILE_TYPE_CONFIG = {
  pdf: { icon: 'picture_as_pdf', bg: 'bg-error-container/30', color: 'text-error' },
  docx: { icon: 'description', bg: 'bg-surface-container', color: 'text-tertiary' },
  doc: { icon: 'description', bg: 'bg-surface-container', color: 'text-tertiary' },
  jpg: { icon: 'image', bg: 'bg-surface-container', color: 'text-primary' },
  jpeg: { icon: 'image', bg: 'bg-surface-container', color: 'text-primary' },
  png: { icon: 'image', bg: 'bg-surface-container', color: 'text-primary' },
  xlsx: { icon: 'table_chart', bg: 'bg-surface-container', color: 'text-on-surface-variant' },
  xls: { icon: 'table_chart', bg: 'bg-surface-container', color: 'text-on-surface-variant' },
  mp4: { icon: 'video_library', bg: 'bg-surface-container', color: 'text-primary' },
  mov: { icon: 'video_library', bg: 'bg-surface-container', color: 'text-primary' },
  zip: { icon: 'image', bg: 'bg-surface-container', color: 'text-primary' },
};

function getFileTypeConfig(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  return FILE_TYPE_CONFIG[ext] || { icon: 'insert_drive_file', bg: 'bg-slate-50', color: 'text-slate-500' };
}

const ITEMS_PER_PAGE = 5;

export default function Trash({ searchQuery = '' }) {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  
  // Modals / Actions states
  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);
  const [confirmDeleteFile, setConfirmDeleteFile] = useState(null); // file object or null
  const [toast, setToast] = useState(null); // { message, type }

  useEffect(() => {
    async function loadFiles() {
      setIsLoading(true);
      // Premium feel delay
      const data = await fetchTrashFiles();
      if (data) {
        setFiles(data);
      }
      setIsLoading(false);
    }
    loadFiles();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Filter based on search query
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.originalLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE);
  const paginatedFiles = filteredFiles.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Handle Page Reset on Search change
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  // Handlers
  const handleRestore = async (file) => {
    const success = await restoreFile(file.id);
    if (success) {
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      showToast(`Successfully restored "${file.name}"`, 'success');
    }
  };

  const handleDeletePermanently = async () => {
    if (!confirmDeleteFile) return;
    const file = confirmDeleteFile;
    const success = await deleteFilePermanently(file.id);
    if (success) {
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      showToast(`Permanently deleted "${file.name}"`, 'error');
    }
    setConfirmDeleteFile(null);
  };

  const handleEmptyTrash = async () => {
    const success = await emptyTrash();
    if (success) {
      setFiles([]);
      showToast('All files permanently deleted from trash', 'error');
    }
    setConfirmEmptyOpen(false);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const isEmpty = !isLoading && filteredFiles.length === 0;

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex-1 space-y-8 flex flex-col relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-level-2 border animate-bounce transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
            : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          <span className="material-symbols-outlined text-[20px]">
            {toast.type === 'success' ? 'check_circle' : 'delete_forever'}
          </span>
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Confirmation Modal: Delete Permanently */}
      {confirmDeleteFile && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-level-2 border border-outline-variant/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Delete permanently?</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-on-surface font-semibold">"{confirmDeleteFile.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteFile(null)}
                className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePermanently}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md transition-all active:scale-[0.98]"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Empty Trash */}
      {confirmEmptyOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-level-2 border border-outline-variant/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 mb-4">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2">Empty Trash?</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              All items in the trash will be permanently deleted. This action is absolute and cannot be recovered.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmEmptyOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-outline-variant/30 text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleEmptyTrash}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md transition-all active:scale-[0.98]"
              >
                Empty Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header & Filters */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-outline mb-1">
            <span>Horizon Drive</span>
            <span className="material-symbols-outlined text-xs" style={{ fontSize: '14px' }}>chevron_right</span>
            <span className="text-on-surface-variant font-medium">Trash</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
            Trash
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Files in trash will be automatically deleted after 30 days.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex gap-3 items-center">
          {/* Empty Trash Button */}
          {files.length > 0 && (
            <button
              onClick={() => setConfirmEmptyOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-error text-error hover:bg-error-container hover:text-on-error-container font-bold transition-all duration-200"
            >
              <span className="material-symbols-outlined">delete_forever</span>
              Empty Trash
            </button>
          )}

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

      {/* Main Content Area */}
      <div className="flex-1">
        <div className="bg-white rounded-[2rem] shadow-level-1 border border-outline-variant/10 overflow-hidden">
          
          {/* ── LIST VIEW ─────────────────────────────── */}
          {viewMode === 'list' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50 border-b border-outline-variant/10">
                    <th className="px-8 py-5 text-xs text-outline font-bold uppercase tracking-wider">File Name</th>
                    <th className="px-6 py-5 text-xs text-outline font-bold uppercase tracking-wider">Original Location</th>
                    <th className="px-6 py-5 text-xs text-outline font-bold uppercase tracking-wider">Date Deleted</th>
                    <th className="px-8 py-5 text-xs text-outline font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {isLoading ? (
                    // Skeleton
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 animate-pulse" />
                            <div className="space-y-2">
                              <div className="h-3 w-40 bg-slate-100 rounded animate-pulse" />
                              <div className="h-2.5 w-16 bg-slate-100 rounded animate-pulse" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-5 w-32 bg-slate-100 rounded-full animate-pulse" />
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                        </td>
                        <td className="px-8 py-5" />
                      </tr>
                    ))
                  ) : isEmpty ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-on-surface-variant">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
                          <span className="material-symbols-outlined text-3xl">search_off</span>
                        </div>
                        <h3 className="text-lg font-bold text-on-surface">No files in Trash</h3>
                        <p className="text-sm text-on-surface-variant max-w-xs mx-auto mt-1">
                          {searchQuery ? `No files matching "${searchQuery}"` : 'Your trash is clean and empty.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedFiles.map((file) => {
                      const fileConfig = getFileTypeConfig(file.name);
                      return (
                        <tr key={file.id} className="ghost-row group hover:bg-surface-container-low/30 transition-colors">
                          {/* Name */}
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg ${fileConfig.bg} flex items-center justify-center shrink-0`}>
                                <span className={`material-symbols-outlined ${fileConfig.color}`}>{fileConfig.icon}</span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-on-surface truncate max-w-[280px]" title={file.name}>
                                  {file.name}
                                </p>
                                <p className="text-xs text-on-surface-variant mt-0.5">{file.size}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Location */}
                          <td className="px-6 py-5">
                            <span className="inline-flex px-3 py-1 bg-secondary-container/60 text-on-secondary-container rounded-full text-xs font-semibold">
                              {file.originalLocation}
                            </span>
                          </td>

                          {/* Date Deleted */}
                          <td className="px-6 py-5 text-sm text-on-surface-variant">
                            {file.dateDeleted}
                          </td>

                          {/* Actions */}
                          <td className="px-8 py-5">
                            <div className="flex justify-end gap-2 shrink-0">
                              <button
                                onClick={() => handleRestore(file)}
                                className="flex items-center gap-1 px-3 py-1.5 text-primary hover:bg-primary/10 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                title="Restore File"
                              >
                                <span className="material-symbols-outlined text-[16px]">restore</span>
                                <span>Restore</span>
                              </button>
                              <button
                                onClick={() => setConfirmDeleteFile(file)}
                                className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold transition-all hover:scale-105 active:scale-95"
                                title="Delete Permanently"
                              >
                                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                                <span>Delete</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="bg-slate-50 rounded-2xl p-5 space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-200" />
                      <div className="space-y-2">
                        <div className="h-3 bg-slate-200 rounded w-3/4" />
                        <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isEmpty ? (
                <div className="py-20 text-center text-on-surface-variant">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
                    <span className="material-symbols-outlined text-3xl">search_off</span>
                  </div>
                  <h3 className="text-lg font-bold text-on-surface">No files in Trash</h3>
                  <p className="text-sm text-on-surface-variant max-w-xs mx-auto mt-1">
                    {searchQuery ? `No files matching "${searchQuery}"` : 'Your trash is clean and empty.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedFiles.map((file) => {
                    const fileConfig = getFileTypeConfig(file.name);
                    return (
                      <div key={file.id} className="bg-white rounded-2xl border border-outline-variant/20 shadow-level-1 p-5 flex flex-col gap-4 hover:shadow-level-2 hover:-translate-y-1 transition-all duration-300 group">
                        
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className={`w-12 h-12 rounded-xl ${fileConfig.bg} flex items-center justify-center`}>
                            <span className={`material-symbols-outlined text-[28px] ${fileConfig.color}`}>{fileConfig.icon}</span>
                          </div>
                          <span className="text-[10px] text-outline bg-slate-100 rounded-full px-2 py-0.5 max-w-[120px] truncate" title={file.originalLocation}>
                            {file.originalLocation.split('/').pop()?.trim()}
                          </span>
                        </div>

                        {/* File Info */}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-on-surface truncate" title={file.name}>{file.name}</p>
                          <p className="text-xs text-on-surface-variant mt-0.5">Deleted on {file.dateDeleted}</p>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-outline-variant/10 pt-3 flex justify-between items-center mt-auto">
                          <span className="text-xs text-outline">{file.size}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleRestore(file)}
                              className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                              title="Restore"
                            >
                              <span className="material-symbols-outlined text-[18px]">restore</span>
                            </button>
                            <button
                              onClick={() => setConfirmDeleteFile(file)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete Permanently"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Pagination Footer ─────────────────────── */}
          {!isLoading && filteredFiles.length > 0 && (
            <div className="px-8 py-4 flex items-center justify-between bg-surface-container-low/20 border-t border-outline-variant/10">
              <p className="text-xs text-on-surface-variant">
                Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filteredFiles.length)}–
                {Math.min(page * ITEMS_PER_PAGE, filteredFiles.length)} of {filteredFiles.length} items
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg border border-outline-variant/30 text-outline hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-outline-variant/30 text-outline hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bento Suggestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Bento Card 1 & 2: Clean Storage Space */}
        <div className="col-span-1 md:col-span-2 bg-primary-container p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between group shadow-level-1 hover:shadow-level-2 transition-all">
          <div className="relative z-10 space-y-2">
            <h3 className="text-headline-md font-headline-md text-white mb-2">Recover Storage Space</h3>
            <p className="text-body-md text-white/80 max-w-md">
              Deleting files permanently from the trash can free up to 2.4GB of your cloud storage immediately. Make sure you don't need them!
            </p>
          </div>
          <div className="mt-8 z-10">
            <button
              onClick={() => {
                if (files.length > 0) setConfirmEmptyOpen(true);
                else showToast('Your trash is already empty!', 'info');
              }}
              className="bg-white text-primary px-6 py-3 rounded-xl font-bold hover:bg-primary-fixed transition-colors"
            >
              Clean Trash Now
            </button>
          </div>
          
          {/* Decorative Background Element */}
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-[160px] text-white/5 group-hover:scale-110 transition-transform duration-700 select-none">
            cleaning_services
          </span>
        </div>

        {/* Bento Card 3: Auto Delete Info */}
        <div className="bg-white p-8 rounded-3xl shadow-level-1 flex flex-col justify-center items-center text-center border border-surface-container hover:shadow-level-2 transition-all">
          <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-3xl">auto_delete</span>
          </div>
          <h4 className="text-headline-md font-headline-md text-on-surface mb-2">Auto-Delete</h4>
          <p className="text-body-md text-on-surface-variant mb-6">
            Files stay here for 30 days before being purged forever.
          </p>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              showToast('Policy details: Deleted items are recoverable for 30 days before permanent automatic purging.', 'info');
            }}
            className="text-label-md font-label-md text-primary hover:underline underline-offset-4"
          >
            Learn more about policy
          </a>
        </div>

      </div>

    </div>
  );
}
