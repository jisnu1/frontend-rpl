import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MoreVertical, ExternalLink, Copy, Check,
  Trash2, SearchX, Globe, Clock, Shield, ToggleLeft, ToggleRight, Calendar
} from 'lucide-react';
import { 
  fetchSharedFoldersByMe, 
  revokeSharedFolder, 
  updateShareFolderAccess, 
  updateShareFolderExpiry, 
  SharedFolderResponse 
} from '../../../api/sharedFolders';
import { useToast } from '../../../context/ToastContext';
import Card from '../../../components/ui/Card';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';


interface SharedFoldersByMeTableProps {
  searchQuery: string;
}

export default function SharedFoldersByMeTable({ searchQuery }: SharedFoldersByMeTableProps) {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<SharedFolderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Expiry / Access Edit State
  const [editingFolder, setEditingFolder] = useState<SharedFolderResponse | null>(null);
  const [newPermission, setNewPermission] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [newAllowAnonymous, setNewAllowAnonymous] = useState<boolean>(true);
  const [newExpiry, setNewExpiry] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Revoke confirm state
  const [confirmRevokeFolder, setConfirmRevokeFolder] = useState<SharedFolderResponse | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Clipboard copy state
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const { success: toastSuccess, error: toastError } = useToast();

  const loadFolders = async () => {
    setIsLoading(true);
    try {
      const data = await fetchSharedFoldersByMe();
      setFolders(data || []);
    } catch (err) {
      console.error('Failed to load shared folders', err);
      toastError('Gagal memuat folder bersama.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const handleCopyLink = (folder: SharedFolderResponse) => {
    const providerPrefix = folder.folderType === 'GOOGLE_DRIVE' ? 'google' : 'local';
    const link = `${window.location.origin}/shared/public/${providerPrefix}/${folder.shareToken}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(folder.shareToken);
    toastSuccess('Tautan folder bersama disalin.');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleRevokeShare = async () => {
    if (!confirmRevokeFolder) return;
    setIsRevoking(true);
    try {
      await revokeSharedFolder(confirmRevokeFolder.shareToken);
      toastSuccess(`Berhasil membatalkan pembagian folder "${confirmRevokeFolder.folderName}".`);
      setFolders(prev => prev.filter(f => f.shareToken !== confirmRevokeFolder.shareToken));
      setConfirmRevokeFolder(null);
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Gagal membatalkan pembagian folder.');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleOpenEdit = (folder: SharedFolderResponse) => {
    setEditingFolder(folder);
    setNewPermission(folder.permission);
    setNewAllowAnonymous(folder.allowAnonymous);
    if (folder.expiresAt) {
      // Format to YYYY-MM-DDTHH:MM
      const date = new Date(folder.expiresAt);
      const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
      const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
      setNewExpiry(localISOTime);
    } else {
      setNewExpiry('');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFolder) return;

    setIsUpdating(true);
    try {
      // 1. Update Access
      await updateShareFolderAccess(editingFolder.shareToken, {
        permission: newPermission,
        allowAnonymous: newPermission === 'EDIT' ? newAllowAnonymous : true
      });

      // 2. Update Expiry
      const expiresAt = newExpiry ? new Date(newExpiry).toISOString() : null;
      await updateShareFolderExpiry(editingFolder.shareToken, { expiresAt });

      toastSuccess('Pengaturan folder bersama berhasil diperbarui.');
      setEditingFolder(null);
      loadFolders();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Gagal memperbarui pengaturan folder bersama.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredFolders = folders.filter(f => 
    (f.folderName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEmpty = !isLoading && filteredFolders.length === 0;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-extrabold text-slate-700">Folder Bersama yang Dibagikan</h3>
      
      <div className="bg-white rounded-[2rem] shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Nama Folder</th>
                <th className="px-6 py-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Provider</th>
                <th className="px-6 py-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Izin Akses</th>
                <th className="px-6 py-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Anonim</th>
                <th className="px-6 py-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Masa Aktif</th>
                <th className="px-8 py-4 text-right text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-8 py-4"><div className="h-4 w-40 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded animate-pulse" /></td>
                    <td className="px-8 py-4" />
                  </tr>
                ))
              ) : isEmpty ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-bold text-xs">
                    <SearchX className="w-10 h-10 block mx-auto mb-2 text-slate-300" />
                    {searchQuery ? `Tidak ada folder bersama yang cocok dengan "${searchQuery}"` : 'Anda belum membagikan folder bersama publik.'}
                  </td>
                </tr>
              ) : (
                filteredFolders.map((folder) => {
                  const isExpired = folder.expiresAt ? new Date(folder.expiresAt) < new Date() : false;
                  return (
                    <tr key={folder.shareToken} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/5 text-primary">
                            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                          </div>
                          <button
                            onClick={() => {
                              const providerPrefix = folder.folderType === 'GOOGLE_DRIVE' ? 'google' : 'local';
                              navigate(`/shared/public/${providerPrefix}/${folder.shareToken}`);
                            }}
                            className="text-sm font-bold text-slate-850 hover:text-primary transition-all text-left cursor-pointer"
                          >
                            {folder.folderName}
                          </button>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">
                        <span className={`inline-flex px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${
                          folder.folderType === 'GOOGLE_DRIVE' 
                            ? 'bg-amber-50 border-amber-100 text-amber-600' 
                            : 'bg-blue-50 border-blue-100 text-blue-600'
                        }`}>
                          {folder.folderType === 'GOOGLE_DRIVE' ? 'GDrive' : 'Local'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs font-bold">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                          folder.permission === 'EDIT' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          <Shield className="w-3.5 h-3.5" />
                          {folder.permission === 'EDIT' ? 'VIEW & EDIT' : 'HANYA VIEW'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs font-bold text-slate-500">
                        {folder.permission === 'EDIT' ? (
                          folder.allowAnonymous ? (
                            <span className="text-emerald-600">Boleh Anonim</span>
                          ) : (
                            <span className="text-amber-600">Wajib Login</span>
                          )
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs font-bold">
                        {folder.expiresAt ? (
                          isExpired ? (
                            <span className="text-red-500 inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              Kedaluwarsa
                            </span>
                          ) : (
                            <span className="text-amber-600 inline-flex items-center gap-1" title={new Date(folder.expiresAt).toLocaleString()}>
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(folder.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400">Selamanya</span>
                        )}
                      </td>

                      <td className="px-8 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopyLink(folder)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 transition-all text-slate-500 hover:text-slate-800 cursor-pointer"
                            title="Salin Tautan"
                          >
                            {copiedToken === folder.shareToken ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleOpenEdit(folder)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all cursor-pointer"
                            title="Pengaturan Tautan"
                          >
                            Kelola
                          </button>

                          <button
                            onClick={() => setConfirmRevokeFolder(folder)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-all cursor-pointer"
                            title="Batalkan Share"
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
      </div>

      {/* Edit Expiry & Settings Modal */}
      {editingFolder && (
        <Modal
          isOpen={editingFolder !== null}
          onClose={() => setEditingFolder(null)}
          title={`Kelola Tautan: ${editingFolder.folderName}`}
          icon={Globe}
        >
          <form onSubmit={handleSaveSettings} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Hak Akses Folder
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewPermission('VIEW')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border-2 transition-all ${
                    newPermission === 'VIEW'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 bg-white text-slate-650'
                  }`}
                >
                  Hanya Lihat (VIEW)
                </button>
                <button
                  type="button"
                  onClick={() => setNewPermission('EDIT')}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border-2 transition-all ${
                    newPermission === 'EDIT'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 bg-white text-slate-650'
                  }`}
                >
                  Lihat & Edit (EDIT)
                </button>
              </div>
            </div>

            {newPermission === 'EDIT' && (
              <div className="flex items-center justify-between bg-slate-50/70 border border-slate-100 rounded-xl p-3 animate-fadeIn">
                <div className="text-left pr-4">
                  <h5 className="text-xs font-bold text-slate-700">Izinkan Kolaborasi Anonim</h5>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                    Membolehkan siapa saja mengunggah/menghapus file tanpa harus masuk akun.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNewAllowAnonymous(!newAllowAnonymous)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    newAllowAnonymous ? 'bg-primary' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      newAllowAnonymous ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Masa Kadaluarsa (Kosongkan jika Selamanya)
                </label>
                {newExpiry && (
                  <button
                    type="button"
                    onClick={() => setNewExpiry('')}
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
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-150">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingFolder(null)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isUpdating}>
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Revoke Share */}
      <ConfirmModal
        isOpen={confirmRevokeFolder !== null}
        onClose={() => setConfirmRevokeFolder(null)}
        onConfirm={handleRevokeShare}
        title="Batalkan Pembagian Folder"
        message={
          <>
            Apakah Anda yakin ingin membatalkan pembagian folder <span className="font-bold text-slate-800">"{confirmRevokeFolder?.folderName}"</span> secara publik?
            Tautan tersebut tidak akan dapat diakses oleh siapa pun lagi.
          </>
        }
        confirmText="Batalkan Share"
        cancelText="Batal"
        confirmVariant="danger"
        isLoading={isRevoking}
      />
    </div>
  );
}
