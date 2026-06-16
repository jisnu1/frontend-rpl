import React from 'react';
import { 
  Folder, 
  Share2, 
  Trash2, 
  SearchX, 
  Sparkles, 
  Download 
} from 'lucide-react';
import { formatSize, getFileExtension } from '../../../utils/fileHelpers';
import FileIcon from '../../../components/ui/FileIcon';
import Card from '../../../components/ui/Card';

import { DashboardFolder, DashboardFile } from '../Dashboard';

interface FileBrowserProps {
  isLoading: boolean;
  activeTab: 'all' | 'local' | number;
  filteredFolders: DashboardFolder[];
  filteredFiles: DashboardFile[];
  draggedOverFolderId: string | null;
  viewMode: 'list' | 'grid';
  searchQuery: string;
  activeFilter: string;
  onFolderDoubleClick: (folder: DashboardFolder) => void;
  onDragStart: (e: React.DragEvent, id: string, type: 'FILE' | 'FOLDER', provider: string) => void;
  onDragOver: (e: React.DragEvent, targetFolderId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, targetFolderId: string, targetProvider: 'LOCAL' | 'GOOGLE_DRIVE') => void;
  onShareFolder: (folder: DashboardFolder) => void;
  onDeleteFolder: (folder: DashboardFolder) => void;
  onDownloadFile: (file: DashboardFile) => void;
  onShareFile: (file: DashboardFile) => void;
  onDeleteFile: (file: DashboardFile) => void;
  onPreviewFile: (file: DashboardFile) => void;
  onRecapClick: (fileId: string) => void;
}

export default function FileBrowser({
  isLoading,
  activeTab,
  filteredFolders,
  filteredFiles,
  draggedOverFolderId,
  viewMode,
  searchQuery,
  activeFilter,
  onFolderDoubleClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onShareFolder,
  onDeleteFolder,
  onDownloadFile,
  onShareFile,
  onDeleteFile,
  onPreviewFile,
  onRecapClick
}: FileBrowserProps) {
  const isEmpty = !isLoading && filteredFiles.length === 0 && filteredFolders.length === 0;

  return (
    <div className="flex-1 animate-fadeIn space-y-6">
      
      {/* ───── SECTION 1: FOLDERS ───── */}
      {filteredFolders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Folder</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFolders.map((folder) => {
              const isDraggedOver = draggedOverFolderId === folder.id;
              const providerStr = folder.provider === 'STORAGE_NODE' ? 'LOCAL' : 'GOOGLE_DRIVE';
              
              return (
                <div
                  key={folder.id}
                  draggable={activeTab !== 'all'}
                  onDragStart={activeTab !== 'all' ? (e) => onDragStart(e, folder.id, 'FOLDER', providerStr) : undefined}
                  onDragOver={activeTab !== 'all' ? (e) => onDragOver(e, folder.id) : undefined}
                  onDragLeave={activeTab !== 'all' ? onDragLeave : undefined}
                  onDrop={activeTab !== 'all' ? (e) => onDrop(e, folder.id, providerStr) : undefined}
                  onDoubleClick={() => onFolderDoubleClick(folder)}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      onFolderDoubleClick(folder);
                    }
                  }}
                  className={`flex items-center justify-between p-4 rounded-2xl bg-white border shadow-[0px_2px_8px_rgba(15,23,42,0.01)] transition-all duration-200 select-none group cursor-pointer hover:shadow-md hover:border-primary/50 active:scale-98 ${
                    isDraggedOver ? 'border-primary bg-indigo-50/30 ring-2 ring-primary/20 scale-[1.02]' : 'border-slate-150'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl ${isDraggedOver ? 'bg-primary text-white animate-pulse' : 'bg-primary/5 text-primary'}`}>
                      <Folder className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex flex-col">
                      <span className="text-sm font-bold text-slate-800 truncate pr-2" title={folder.name}>
                        {folder.name}
                      </span>
                      {folder.providerLabel && (
                        <span className="text-[10px] text-slate-400 font-medium truncate">
                          {folder.providerLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Folder Action buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareFolder(folder);
                      }}
                      className="p-1.5 rounded-lg text-slate-450 hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer"
                      title="Bagikan Folder"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteFolder(folder);
                      }}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-55 hover:text-red-700 transition-all cursor-pointer"
                      title="Hapus Folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ───── SECTION 2: FILES ───── */}
      <div className="space-y-3">
        {filteredFolders.length > 0 && <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Berkas</h3>}
        
        <div className="bg-white rounded-[2rem] shadow-[0px_4px_20px_rgba(15,23,42,0.03)] border border-slate-150/80 overflow-hidden">
          {/* ── LIST VIEW ─────────────────────────────── */}
          {viewMode === 'list' && (
            <div className="overflow-x-auto -webkit-overflow-scrolling-touch">
              <table className="w-full text-left border-collapse" style={{ minWidth: '600px' }}>
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100">
                    <th className="px-4 md:px-8 py-4 md:py-5 text-xs text-slate-400 font-bold uppercase tracking-wider">Nama Berkas</th>
                    <th className="px-3 md:px-6 py-4 md:py-5 text-xs text-slate-400 font-bold uppercase tracking-wider w-[110px] min-w-[110px]">Penyedia</th>
                    <th className="px-3 md:px-6 py-4 md:py-5 text-xs text-slate-400 font-bold uppercase tracking-wider w-[160px] min-w-[160px] hidden md:table-cell">Tanggal</th>
                    <th className="px-3 md:px-6 py-4 md:py-5 text-xs text-slate-400 font-bold uppercase tracking-wider w-[80px] min-w-[80px]">Ukuran</th>
                    <th className="px-2 md:px-8 py-4 md:py-5 text-xs text-slate-400 font-bold uppercase tracking-wider text-right w-[130px] min-w-[130px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
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
                        <h3 className="text-lg font-bold text-slate-700">Tidak ada berkas atau folder</h3>
                        <p className="text-sm text-slate-450 mt-1 font-semibold">
                          {searchQuery ? `Tidak ada konten yang cocok dengan "${searchQuery}"` : 'Unggah berkas atau buat folder baru untuk memulai.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredFiles.map((file) => {
                      const ext = getFileExtension(file.originalFileName);
                      const isPdf = ext.toLowerCase() === 'pdf';
                      const providerStr = file.provider === 'STORAGE_NODE' ? 'LOCAL' : 'GOOGLE_DRIVE';

                      return (
                        <tr 
                          key={file.id} 
                          draggable={activeTab !== 'all'}
                          onDragStart={activeTab !== 'all' ? (e) => onDragStart(e, file.id, 'FILE', providerStr) : undefined}
                          onClick={(e) => {
                            const target = e.target as HTMLElement;
                            if (target.closest('button') || target.closest('a')) {
                              return;
                            }
                            onPreviewFile(file);
                          }}
                          className="group hover:bg-slate-50/40 transition-colors cursor-pointer select-none"
                        >
                          {/* Nama */}
                          <td className="px-4 md:px-8 py-4 md:py-5">
                            <div className="flex items-center gap-2 md:gap-4">
                              <FileIcon type={ext} className="w-5 h-5 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate max-w-[140px] md:max-w-[280px]" title={file.originalFileName}>
                                  {file.originalFileName}
                                </p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Penyedia */}
                          <td className="px-3 md:px-6 py-4 md:py-5">
                            <span className={`inline-flex px-2 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                              file.provider?.toUpperCase() === 'GOOGLE_DRIVE' 
                                ? 'bg-amber-50 border-amber-100 text-amber-600' 
                                : 'bg-blue-50 border-blue-100 text-blue-600'
                            }`}>
                              {file.providerLabel || (file.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'GDrive' : 'Local')}
                            </span>
                          </td>

                          {/* Tanggal - hide on mobile */}
                          <td className="px-3 md:px-6 py-4 md:py-5 text-xs font-semibold text-slate-450 hidden md:table-cell">
                            {file.createdAt ? new Date(file.createdAt).toLocaleString() : '-'}
                          </td>

                          {/* Ukuran */}
                          <td className="px-3 md:px-6 py-4 md:py-5 text-xs font-bold text-slate-500">
                            {formatSize(file.size)}
                          </td>

                          <td className="pl-1 pr-3 md:pl-2 md:pr-6 py-4 md:py-5" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end gap-1 md:gap-2 shrink-0 relative z-10">
                              {isPdf && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRecapClick(file.id);
                                  }}
                                  className="hidden md:flex items-center justify-center p-1.5 rounded-lg text-primary hover:text-indigo-700 hover:bg-indigo-50/50 cursor-pointer"
                                  title="Analisis AI Recap"
                                >
                                  <Sparkles className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDownloadFile(file);
                                }}
                                className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 transition-all cursor-pointer"
                                title="Unduh Berkas"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onShareFile(file);
                                }}
                                className="hidden sm:flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 transition-all cursor-pointer"
                                title="Bagikan Akses Berkas"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteFile(file);
                                }}
                                className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer"
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
                    const providerStr = file.provider === 'STORAGE_NODE' ? 'LOCAL' : 'GOOGLE_DRIVE';

                    return (
                      <Card 
                        key={file.id} 
                        draggable={activeTab !== 'all'}
                        onDragStart={activeTab !== 'all' ? (e) => onDragStart(e, file.id, 'FILE', providerStr) : undefined}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (target.closest('button') || target.closest('a')) {
                            return;
                          }
                          onPreviewFile(file);
                        }}
                        className="p-5 flex flex-col gap-4 group cursor-pointer hover:shadow-md hover:border-slate-350 transition-all active:scale-[0.98] select-none"
                      >
                        
                        {/* Header Kartu */}
                        <div className="flex items-start justify-between">
                          <FileIcon type={ext} className="w-6 h-6 shrink-0" />
                          <span className={`text-[9px] font-bold uppercase tracking-wider rounded-full border px-2 py-0.5 ${
                            file.provider?.toUpperCase() === 'GOOGLE_DRIVE' 
                              ? 'bg-amber-50 border-amber-100 text-amber-600' 
                              : 'bg-blue-50 border-blue-100 text-blue-600'
                            }`}>
                            {file.providerLabel || (file.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'GDrive' : 'Local')}
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
                                  onRecapClick(file.id);
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
                                onDownloadFile(file);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100/70 transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onShareFile(file);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100/70 transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
                              title="Bagikan"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteFile(file);
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

    </div>
  );
}
