import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MoreVertical, ExternalLink, Download, Share2, Copy, 
  Trash2, ArrowLeft, ArrowRight, SearchX, Sparkles 
} from 'lucide-react';
import { SharedFileDto, unshareFile } from '../../../api/shared';
import FileIcon from '../../../components/ui/FileIcon';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { useActivity } from '../../../context/ActivityContext';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import FilePreviewModal from '../../../components/FilePreviewModal';

interface SharedFileTableProps {
  files: SharedFileDto[];
  isLoading: boolean;
  viewMode: 'list' | 'grid';
  searchQuery: string;
  onRemoveSuccess?: (fileId: string) => void;
}

// ─── Row (List View) ─────────────────────────────────────────────────────────
interface FileRowProps {
  file: SharedFileDto;
  onPreviewClick: () => void;
  onRemoveAccess: () => void;
}

function FileRow({ file, onPreviewClick, onRemoveAccess }: FileRowProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { downloadFile } = useActivity();
  const ext = file.originalFileName.split('.').pop() || 'file';
  const isPdf = ext.toLowerCase() === 'pdf';

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleRowClick = () => {
    onPreviewClick();
  };

  return (
    <tr 
      onClick={handleRowClick}
      className={`group hover:bg-slate-50/50 transition-colors cursor-pointer relative animate-fadeIn ${menuOpen ? 'z-30' : ''}`}
    >
      {/* File Name */}
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <FileIcon type={ext} className="w-5 h-5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate max-w-[160px] sm:max-w-[240px]">{file.originalFileName}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider hidden sm:block">
              {file.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'Google Drive' : 'Local Storage'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 sm:hidden font-medium">
              {formatSize(file.size)} • {file.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'Google Drive' : 'Local Storage'} • Oleh {file.ownerEmail || 'Shared Owner'}
            </p>
          </div>
        </div>
      </td>

      {/* Owner */}
      <td className="px-6 py-5 hidden sm:table-cell">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase">
            {file.ownerEmail ? file.ownerEmail.charAt(0) : 'S'}
          </div>
          <span className="text-sm font-bold text-slate-650 truncate max-w-[180px]">{file.ownerEmail || 'Shared Owner'}</span>
        </div>
      </td>

      {/* Shared Date */}
      <td className="px-6 py-5 text-xs font-bold text-slate-450 hidden md:table-cell">
        {file.createdAt ? new Date(file.createdAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }) : '-'}
      </td>

      {/* File Size */}
      <td className="px-6 py-5 text-xs font-bold text-slate-450 hidden sm:table-cell">{formatSize(file.size)}</td>

      {/* Actions */}
      <td className="px-8 py-5 text-right relative">
        <div ref={menuRef} className="relative inline-block text-left">
          <div className="flex items-center justify-end gap-2">
            {isPdf && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/recap?fileId=${file.id}`);
                }}
                className="px-3 py-1.5 rounded-lg text-primary hover:text-indigo-700 hover:bg-indigo-50/50 text-[10px] font-bold inline-flex items-center gap-1 transition-all border border-indigo-100"
                title="Analisis AI Recap"
              >
                <Sparkles className="w-3 h-3" />
                AI Recap
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className={`p-2 rounded-lg transition-all text-slate-500 hover:text-slate-800 hover:bg-slate-100 ${
                menuOpen ? 'opacity-100 bg-slate-100' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100'
              }`}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {menuOpen && (
            <div className="absolute right-0 top-10 z-30 bg-white rounded-xl shadow-[0px_10px_30px_rgba(15,23,42,0.1)] border border-slate-100 py-1 w-44 text-left animate-fadeIn">
              {[
                { icon: ExternalLink, label: 'Buka Pratinjau', onClick: onPreviewClick },
                { 
                  icon: Download, 
                  label: 'Unduh Berkas', 
                  onClick: () => downloadFile(file.id, file.originalFileName, file.provider, file.size) 
                },
              ].map((action) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      action.onClick?.();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-55 transition-colors"
                  >
                    <ActionIcon className="w-4 h-4 text-slate-400" />
                    {action.label}
                  </button>
                );
              })}
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onRemoveAccess();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-error hover:bg-red-50/50 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-error" />
                Hapus Akses (Batal Share)
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── Card (Grid View) ─────────────────────────────────────────────────────────
interface FileCardProps {
  file: SharedFileDto;
  onPreviewClick: () => void;
  onRemoveAccess: () => void;
}

function FileCard({ file, onPreviewClick, onRemoveAccess }: FileCardProps) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { downloadFile } = useActivity();
  const ext = file.originalFileName.split('.').pop() || 'file';
  const isPdf = ext.toLowerCase() === 'pdf';

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCardClick = () => {
    onPreviewClick();
  };

  return (
    <Card 
      onClick={handleCardClick}
      className={`p-5 flex flex-col gap-4 group cursor-pointer hover:shadow-md hover:border-slate-350 transition-all active:scale-[0.98] relative !overflow-visible ${menuOpen ? 'z-30' : ''}`}
    >
      {/* File Icon & More Button */}
      <div className="flex items-start justify-between">
        <FileIcon type={ext} className="w-6 h-6 shrink-0" />
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-50 transition-all text-slate-500"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-[0px_10px_30px_rgba(15,23,42,0.1)] border border-slate-100 py-1 w-44 text-left">
              {[
                { icon: ExternalLink, label: 'Buka Pratinjau', onClick: onPreviewClick },
                { 
                  icon: Download, 
                  label: 'Unduh Berkas', 
                  onClick: () => downloadFile(file.id, file.originalFileName, file.provider, file.size) 
                },
              ].map((action) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      action.onClick?.();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <ActionIcon className="w-4 h-4 text-slate-400" />
                    {action.label}
                  </button>
                );
              })}
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onRemoveAccess();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-error hover:bg-red-50/50 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-error" />
                Hapus Akses
              </button>
            </div>
          )}
        </div>
      </div>

      {/* File Info */}
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate" title={file.originalFileName}>{file.originalFileName}</p>
        <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
          {file.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'Google Drive' : 'Local Storage'}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold uppercase">
            {file.ownerEmail ? file.ownerEmail.charAt(0) : 'S'}
          </div>
          <span className="text-[10px] font-bold text-slate-500 truncate max-w-[80px]" title={file.ownerEmail || 'Shared Owner'}>
            {file.ownerEmail || 'Shared Owner'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400">{formatSize(file.size)}</span>
          {isPdf && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/recap?fileId=${file.id}`);
              }}
              className="p-1 rounded bg-indigo-50 border border-indigo-100 text-primary hover:bg-indigo-100 transition-colors"
              title="AI Recap"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          <td className="px-8 py-5">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-40 bg-slate-100 rounded animate-pulse" />
                <div className="h-2.5 w-24 bg-slate-50 rounded animate-pulse sm:hidden" />
              </div>
            </div>
          </td>
          <td className="px-6 py-5 hidden sm:table-cell">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
            </div>
          </td>
          <td className="px-6 py-5 hidden md:table-cell"><div className="h-3 w-20 bg-slate-100 rounded animate-pulse" /></td>
          <td className="px-6 py-5 hidden sm:table-cell"><div className="h-3 w-12 bg-slate-100 rounded animate-pulse" /></td>
          <td className="px-8 py-5" />
        </tr>
      ))}
    </>
  );
}

const ITEMS_PER_PAGE = 5;

export default function SharedFileTable({ 
  files, 
  isLoading, 
  viewMode, 
  searchQuery,
  onRemoveSuccess 
}: SharedFileTableProps) {
  const [page, setPage] = useState(1);
  const [activePreviewFile, setActivePreviewFile] = useState<SharedFileDto | null>(null);
  const [confirmRemoveFile, setConfirmRemoveFile] = useState<SharedFileDto | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const totalPages = Math.ceil(files.length / ITEMS_PER_PAGE);
  const paginatedFiles = files.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const isEmpty = !isLoading && files.length === 0;

  const handleRemoveAccess = async () => {
    if (!user || !confirmRemoveFile) return;

    try {
      setIsRemoving(true);
      await unshareFile(confirmRemoveFile.id, Number(user.id), confirmRemoveFile.provider);
      toastSuccess(`Akses Anda ke berkas "${confirmRemoveFile.originalFileName}" berhasil dihapus.`);
      setConfirmRemoveFile(null);
      if (onRemoveSuccess) {
        onRemoveSuccess(confirmRemoveFile.id);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Gagal menghapus akses berkas.';
      toastError(msg);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-slate-100 overflow-hidden">
      
      {/* ── LIST VIEW ─────────────────────────────── */}
      {viewMode === 'list' && (
        <div className="overflow-x-auto min-h-[280px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">File Name</th>
                <th className="px-6 py-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:table-cell">Owner</th>
                <th className="px-6 py-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden md:table-cell">Shared Date</th>
                <th className="px-6 py-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:table-cell">File Size</th>
                <th className="px-8 py-5 text-right text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableSkeleton />
              ) : isEmpty ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 font-bold text-xs">
                    <SearchX className="w-10 h-10 block mx-auto mb-2 text-slate-300" />
                    {searchQuery ? `Tidak ada berkas yang cocok dengan "${searchQuery}"` : 'Belum ada berkas yang dibagikan kepada Anda.'}
                  </td>
                </tr>
              ) : (
                paginatedFiles.map((file) => (
                  <FileRow 
                    key={file.id} 
                    file={file} 
                    onPreviewClick={() => setActivePreviewFile(file)}
                    onRemoveAccess={() => setConfirmRemoveFile(file)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── GRID VIEW ─────────────────────────────── */}
      {viewMode === 'grid' && (
        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-slate-100" />
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                    <div className="h-2.5 bg-slate-50 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <div className="py-16 text-center text-slate-400 font-bold text-xs">
              <SearchX className="w-10 h-10 block mx-auto mb-2 text-slate-300" />
              {searchQuery ? `Tidak ada berkas yang cocok dengan "${searchQuery}"` : 'Belum ada berkas yang dibagikan kepada Anda.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedFiles.map((file) => (
                <FileCard 
                  key={file.id} 
                  file={file} 
                  onPreviewClick={() => setActivePreviewFile(file)}
                  onRemoveAccess={() => setConfirmRemoveFile(file)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Pagination Footer ─────────────────────── */}
      {!isLoading && files.length > 0 && (
        <div className="px-8 py-4 flex items-center justify-between bg-slate-50/20 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500">
            Showing {Math.min((page - 1) * ITEMS_PER_PAGE + 1, files.length)}–
            {Math.min(page * ITEMS_PER_PAGE, files.length)} of {files.length} items
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── File Preview Modal ────────────────────── */}
      <FilePreviewModal
        isOpen={activePreviewFile !== null}
        onClose={() => setActivePreviewFile(null)}
        fileId={activePreviewFile?.id}
        fileName={activePreviewFile?.originalFileName}
        provider={activePreviewFile?.provider}
        fileSize={activePreviewFile?.size}
        ownerEmail={activePreviewFile?.ownerEmail}
        createdAt={activePreviewFile?.createdAt}
      />

      {/* ── Confirm Remove Access Modal ────────────────── */}
      <ConfirmModal
        isOpen={confirmRemoveFile !== null}
        onClose={() => setConfirmRemoveFile(null)}
        onConfirm={handleRemoveAccess}
        title="Hapus Akses Berkas"
        message={
          <>
            Apakah Anda yakin ingin menghapus akses Anda ke berkas <span className="font-bold text-slate-800">"{confirmRemoveFile?.originalFileName}"</span>? 
            Anda tidak akan dapat mengakses berkas ini lagi kecuali pemiliknya membagikannya kembali kepada Anda.
          </>
        }
        confirmText="Hapus Akses"
        cancelText="Batal"
        confirmVariant="danger"
        isLoading={isRemoving}
      />
    </div>
  );
}
