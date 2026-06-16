import React, { useState } from 'react';
import { 
  MoreVertical, ExternalLink, Copy, Check,
  Trash2, ArrowLeft, ArrowRight, SearchX, Globe, Mail, Clock, Calendar
} from 'lucide-react';
import { SharedByMeDto, unshareFileById, shareFile } from '../../../api/shared';
import FileIcon from '../../../components/ui/FileIcon';
import Card from '../../../components/ui/Card';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import FilePreviewModal from '../../../components/FilePreviewModal';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

interface SharedByMeTableProps {
  files: SharedByMeDto[];
  isLoading: boolean;
  viewMode: 'list' | 'grid';
  searchQuery: string;
  onRemoveSuccess?: (shareId: number) => void;
}

// ─── Row (List View) ─────────────────────────────────────────────────────────
interface FileRowProps {
  file: SharedByMeDto;
  onPreviewClick: () => void;
  onRemoveAccess: () => void;
  onManageClick: () => void;
}

function FileRow({ file, onPreviewClick, onRemoveAccess, onManageClick }: FileRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { success: toastSuccess } = useToast();
  const ext = file.originalFileName.split('.').pop() || 'file';

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.shareLink) {
      navigator.clipboard.writeText(file.shareLink);
      setCopied(true);
      toastSuccess('Tautan berhasil disalin.');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <tr 
      onClick={onPreviewClick}
      className={`group hover:bg-slate-50/50 transition-colors cursor-pointer relative animate-fadeIn ${menuOpen ? 'z-30' : ''}`}
    >
      {/* File Name */}
      <td className="px-4 sm:px-8 py-3.5 sm:py-5">
        <div className="flex items-center gap-4">
          <FileIcon type={ext} className="w-5 h-5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate max-w-[160px] sm:max-w-[240px]">{file.originalFileName}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider hidden sm:block">
              {file.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'Google Drive' : 'Local Storage'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 sm:hidden font-medium flex flex-wrap gap-x-1 items-center">
              <span>{formatSize(file.size)}</span>
              <span>•</span>
              <span>{file.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'Google Drive' : 'Local Storage'}</span>
              <span>•</span>
              {file.isPublic ? (
                <span className="text-emerald-600 font-bold">Publik</span>
              ) : (
                <span className="text-blue-600 font-bold truncate max-w-[120px]">{file.sharedWithEmail}</span>
              )}
              {file.expiresAt && (
                <>
                  <span>•</span>
                  <span className={new Date(file.expiresAt) < new Date() ? "text-red-500 font-semibold" : "text-amber-600 font-semibold"}>
                    {new Date(file.expiresAt) < new Date() ? 'Kadaluarsa' : new Date(file.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </td>

      {/* Shared To */}
      <td className="px-6 py-5 hidden sm:table-cell">
        {file.isPublic ? (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 w-max">
            <Globe className="w-3.5 h-3.5" />
            <span>Tautan Publik</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 w-max max-w-[200px] truncate" title={file.sharedWithEmail || ''}>
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            <span className="truncate">{file.sharedWithEmail}</span>
          </div>
        )}
      </td>

      {/* Expiration */}
      <td className="px-6 py-5 text-xs font-bold hidden sm:table-cell">
        {file.expiresAt ? (
          new Date(file.expiresAt) < new Date() ? (
            <span className="text-red-500 inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Kadaluarsa
            </span>
          ) : (
            <span className="text-amber-600 inline-flex items-center gap-1" title={new Date(file.expiresAt).toLocaleString('id-ID')}>
              <Clock className="w-3.5 h-3.5" />
              {new Date(file.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </span>
          )
        ) : (
          <span className="text-slate-400">Selamanya</span>
        )}
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
      <td className="px-4 sm:px-8 py-3.5 sm:py-5 text-right relative">
        <div className="flex items-center justify-end gap-2">
          {file.isPublic && file.shareLink && (
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-slate-100 transition-all text-slate-500 hover:text-slate-800"
              title="Salin Tautan"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition-all text-slate-500 hover:text-slate-800"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {menuOpen && (
          <div className="absolute right-8 top-12 z-20 bg-white rounded-xl shadow-[0px_10px_30px_rgba(15,23,42,0.1)] border border-slate-100 py-1 w-44 text-left">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onPreviewClick();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-slate-400" />
              Buka Pratinjau
            </button>
            
            {file.isPublic && file.shareLink && (
              <button
                onClick={(e) => {
                  handleCopy(e);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Copy className="w-4 h-4 text-slate-400" />
                Salin Tautan
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                onManageClick();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              Kelola Tautan
            </button>

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
              Batalkan Share
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

// ─── Card (Grid View) ─────────────────────────────────────────────────────────
interface FileCardProps {
  file: SharedByMeDto;
  onPreviewClick: () => void;
  onRemoveAccess: () => void;
  onManageClick: () => void;
}

function FileCard({ file, onPreviewClick, onRemoveAccess, onManageClick }: FileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { success: toastSuccess } = useToast();
  const ext = file.originalFileName.split('.').pop() || 'file';

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (file.shareLink) {
      navigator.clipboard.writeText(file.shareLink);
      setCopied(true);
      toastSuccess('Tautan berhasil disalin.');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card 
      onClick={onPreviewClick}
      className={`p-5 flex flex-col gap-4 group cursor-pointer hover:shadow-md hover:border-slate-300 transition-all active:scale-[0.98] relative !overflow-visible ${menuOpen ? 'z-30' : ''}`}
    >
      <div className="flex items-start justify-between">
        <FileIcon type={ext} className="w-6 h-6 shrink-0" />
        <div className="relative flex items-center gap-1">
          {file.isPublic && file.shareLink && (
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-600"
              title="Salin Tautan"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onPreviewClick();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
                Buka Pratinjau
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onManageClick();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Clock className="w-4 h-4 text-slate-400" />
                Kelola Tautan
              </button>
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
                Batalkan Share
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-800 truncate" title={file.originalFileName}>{file.originalFileName}</p>
        <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
          {file.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'Google Drive' : 'Local Storage'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
        <div>
          {file.isPublic ? (
            <span className="inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600">
              Publik
            </span>
          ) : (
            <span className="inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-blue-50 border border-blue-100 text-blue-600 max-w-[80px] truncate" title={file.sharedWithEmail || ''}>
              {file.sharedWithEmail}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400">{formatSize(file.size)}</span>
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
                <div className="h-2.5 w-24 bg-slate-55 rounded animate-pulse sm:hidden" />
              </div>
            </div>
          </td>
          <td className="px-6 py-5 hidden sm:table-cell">
            <div className="h-5 w-24 bg-slate-100 rounded-full animate-pulse" />
          </td>
          <td className="px-6 py-5 hidden sm:table-cell"><div className="h-3 w-20 bg-slate-100 rounded animate-pulse" /></td>
          <td className="px-6 py-5 hidden md:table-cell"><div className="h-3 w-20 bg-slate-100 rounded animate-pulse" /></td>
          <td className="px-6 py-5 hidden sm:table-cell"><div className="h-3 w-12 bg-slate-100 rounded animate-pulse" /></td>
          <td className="px-8 py-5" />
        </tr>
      ))}
    </>
  );
}

const ITEMS_PER_PAGE = 5;

export default function SharedByMeTable({ 
  files, 
  isLoading, 
  viewMode, 
  searchQuery,
  onRemoveSuccess 
}: SharedByMeTableProps) {
  const [page, setPage] = useState(1);
  const [activePreviewFile, setActivePreviewFile] = useState<SharedByMeDto | null>(null);
  const [confirmCancelShare, setConfirmCancelShare] = useState<SharedByMeDto | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  // Expiry states
  const [editingFile, setEditingFile] = useState<SharedByMeDto | null>(null);
  const [expiresOption, setExpiresOption] = useState<string>('never'); // 'never', '1h', '1d', '7d', 'custom'
  const [customExpiry, setCustomExpiry] = useState<string>('');
  const [isSavingExpiry, setIsSavingExpiry] = useState<boolean>(false);

  const handleOpenManageFile = (file: SharedByMeDto) => {
    setEditingFile(file);
    if (file.expiresAt) {
      setExpiresOption('custom');
      const date = new Date(file.expiresAt);
      const tzOffset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
      setCustomExpiry(localISOTime);
    } else {
      setExpiresOption('never');
      setCustomExpiry('');
    }
  };

  const handleSaveFileSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFile) return;

    setIsSavingExpiry(true);
    try {
      let hours: number | undefined = undefined;
      let days: number | undefined = undefined;

      if (expiresOption === '1h') {
        hours = 1;
      } else if (expiresOption === '1d') {
        days = 1;
      } else if (expiresOption === '7d') {
        days = 7;
      } else if (expiresOption === 'custom' && customExpiry) {
        const diffMs = new Date(customExpiry).getTime() - Date.now();
        if (diffMs > 0) {
          hours = Math.ceil(diffMs / (1000 * 60 * 60));
        }
      }

      await shareFile(
        editingFile.fileId,
        {
          isPublic: editingFile.isPublic,
          email: editingFile.sharedWithEmail || undefined,
          expiresInDays: days,
          expiresInHours: hours
        },
        editingFile.provider
      );

      toastSuccess('Masa aktif berkas bersama berhasil diperbarui.');
      setEditingFile(null);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Gagal memperbarui masa aktif berkas.');
    } finally {
      setIsSavingExpiry(false);
    }
  };

  const totalPages = Math.ceil(files.length / ITEMS_PER_PAGE);
  const paginatedFiles = files.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const isEmpty = !isLoading && files.length === 0;

  const handleCancelShare = async () => {
    if (!user || !confirmCancelShare) return;

    try {
      setIsCancelling(true);
      await unshareFileById(confirmCancelShare.id, confirmCancelShare.provider);
      toastSuccess(`Berhasil membatalkan pembagian berkas "${confirmCancelShare.originalFileName}".`);
      setConfirmCancelShare(null);
      if (onRemoveSuccess) {
        onRemoveSuccess(confirmCancelShare.id);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Gagal membatalkan pembagian berkas.';
      toastError(msg);
    } finally {
      setIsCancelling(false);
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
                <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">File Name</th>
                <th className="px-6 py-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:table-cell">Bagikan Ke</th>
                <th className="px-6 py-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:table-cell">Kadaluarsa</th>
                <th className="px-6 py-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden md:table-cell">Tanggal Share</th>
                <th className="px-6 py-5 text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden sm:table-cell">File Size</th>
                <th className="px-4 sm:px-8 py-4 sm:py-5 text-right text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <TableSkeleton />
              ) : isEmpty ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-bold text-xs">
                    <SearchX className="w-10 h-10 block mx-auto mb-2 text-slate-300" />
                    {searchQuery ? `Tidak ada berkas yang cocok dengan "${searchQuery}"` : 'Anda belum membagikan berkas apa pun kepada pengguna lain.'}
                  </td>
                </tr>
              ) : (
                paginatedFiles.map((file) => (
                  <FileRow 
                    key={file.id} 
                    file={file} 
                    onPreviewClick={() => setActivePreviewFile(file)}
                    onRemoveAccess={() => setConfirmCancelShare(file)}
                    onManageClick={() => handleOpenManageFile(file)}
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
              {searchQuery ? `Tidak ada berkas yang cocok dengan "${searchQuery}"` : 'Anda belum membagikan berkas apa pun kepada pengguna lain.'}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedFiles.map((file) => (
                <FileCard 
                  key={file.id} 
                  file={file} 
                  onPreviewClick={() => setActivePreviewFile(file)}
                  onRemoveAccess={() => setConfirmCancelShare(file)}
                  onManageClick={() => handleOpenManageFile(file)}
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
        fileId={activePreviewFile?.fileId}
        fileName={activePreviewFile?.originalFileName}
        provider={activePreviewFile?.provider}
        fileSize={activePreviewFile?.size}
        createdAt={activePreviewFile?.createdAt}
      />

      {/* ── Confirm Cancel Share Modal ────────────────── */}
      <ConfirmModal
        isOpen={confirmCancelShare !== null}
        onClose={() => setConfirmCancelShare(null)}
        onConfirm={handleCancelShare}
        title="Batalkan Pembagian Berkas"
        message={
          <>
            Apakah Anda yakin ingin membatalkan pembagian berkas <span className="font-bold text-slate-800">"{confirmCancelShare?.originalFileName}"</span> {confirmCancelShare?.isPublic ? 'secara publik' : `dengan ${confirmCancelShare?.sharedWithEmail}`}?
            Pengguna lain tidak akan memiliki akses ke berkas ini lagi.
          </>
        }
        confirmText="Batalkan Share"
        cancelText="Batal"
        confirmVariant="danger"
        isLoading={isCancelling}
      />

      {editingFile && (
        <Modal
          isOpen={editingFile !== null}
          onClose={() => setEditingFile(null)}
          title={`Kelola Masa Aktif Berkas`}
          icon={Clock}
        >
          <form onSubmit={handleSaveFileSettings} className="space-y-4">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Berkas</p>
              <h4 className="text-sm font-bold text-slate-700 truncate mt-0.5">{editingFile.originalFileName}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3">Metode Berbagi</p>
              <p className="text-xs font-bold text-slate-650 mt-0.5">
                {editingFile.isPublic ? 'Tautan Publik' : `Dibagikan ke ${editingFile.sharedWithEmail}`}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pilihan Masa Aktif
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'never', label: 'Selamanya' },
                  { value: '1h', label: '1 Jam' },
                  { value: '1d', label: '1 Hari' },
                  { value: '7d', label: '7 Hari' },
                  { value: 'custom', label: 'Kustom' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setExpiresOption(opt.value)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border-2 transition-all cursor-pointer ${
                      expiresOption === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 bg-white text-slate-650'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {expiresOption === 'custom' && (
              <div className="space-y-1.5 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Masa Kadaluarsa Kustom
                  </label>
                  {customExpiry && (
                    <button
                      type="button"
                      onClick={() => {
                        setExpiresOption('never');
                        setCustomExpiry('');
                      }}
                      className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-all cursor-pointer"
                    >
                      Hapus Batas Waktu
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    type="datetime-local"
                    value={customExpiry}
                    onChange={(e) => setCustomExpiry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t border-slate-150">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingFile(null)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSavingExpiry}>
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
