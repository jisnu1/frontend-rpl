import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Table as TableIcon,
  FolderPlus,
  Folder,
  Plus,
  HardDrive,
  Cloud,
  ArrowRight
} from 'lucide-react';
import { fetchMyFiles, deleteFile, getDownloadUrl, FileResponse } from '../../api/files';
import { 
  fetchFolderContents, 
  createFolder, 
  moveFolderItem, 
  deleteFolder, 
  fetchGoogleDriveFolderContents, 
  createGoogleDriveFolder, 
  moveGoogleDriveItem,
  deleteGoogleDriveFolder,
  FolderResponse
} from '../../api/folders';
import { fetchExternalAccounts, getGoogleAuthUrl, ExternalAccountDto } from '../../api/externalAccounts';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ShareModal from '../../components/ShareModal';
import FolderShareModal from '../../components/FolderShareModal';
import FileIcon from '../../components/ui/FileIcon';
import Card from '../../components/ui/Card';
import { useToast } from '../../context/ToastContext';
import { useActivity } from '../../context/ActivityContext';
import FilePreviewModal from '../../components/FilePreviewModal';
import { fetchUserStorage, UserStorageResponse } from '../../api/storage';
import { useAuth } from '../../context/AuthContext';
import UpgradeModal from '../../components/ui/UpgradeModal';

interface DashboardProps {
  uploadTrigger?: number;
  searchQuery?: string;
}

export default function Dashboard({ uploadTrigger = 0, searchQuery = '' }: DashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Extract folder query parameters
  const queryParams = new URLSearchParams(location.search);
  const folderId = queryParams.get('folderId') || undefined;
  const gDriveFolderId = queryParams.get('gDriveFolderId') || undefined;

  // Active tab state
  const [activeTab, setActiveTab] = useState<'all' | 'local' | number>(() => {
    const saved = sessionStorage.getItem('horizon_active_tab');
    if (saved === 'local') return 'local';
    if (saved && !isNaN(Number(saved))) return Number(saved);
    return 'all';
  });

  // GDrive accounts state
  const [externalAccounts, setExternalAccounts] = useState<ExternalAccountDto[]>([]);
  const [activeExternalAccount, setActiveExternalAccount] = useState<ExternalAccountDto | null>(null);

  // Storage / quota state
  const [storageInfo, setStorageInfo] = useState<UserStorageResponse | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(window.innerWidth < 768 ? 'grid' : 'list');
  
  // Folder content listings
  const [folders, setFolders] = useState<FolderResponse[]>([]);
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drag-and-drop target state
  const [draggedOverFolderId, setDraggedOverFolderId] = useState<string | null>(null);

  // Modal control states
  const [confirmDeleteFile, setConfirmDeleteFile] = useState<FileResponse | null>(null);
  const [confirmDeleteFolder, setConfirmDeleteFolder] = useState<FolderResponse | null>(null);
  const [confirmDownloadFile, setConfirmDownloadFile] = useState<FileResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeShareFile, setActiveShareFile] = useState<FileResponse | null>(null);
  const [activeShareFolder, setActiveShareFolder] = useState<FolderResponse | null>(null);
  const [activePreviewFile, setActivePreviewFile] = useState<FileResponse | null>(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Create folder modal state
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Breadcrumbs stacks
  const [localPath, setLocalPath] = useState<Array<{ id: string; name: string }>>(() => {
    const saved = sessionStorage.getItem('horizon_local_path');
    return saved ? JSON.parse(saved) : [];
  });
  const [gDrivePath, setGDrivePath] = useState<Array<{ id: string; name: string }>>(() => {
    const saved = sessionStorage.getItem('horizon_gdrive_path');
    return saved ? JSON.parse(saved) : [];
  });

  const { error: toastError, success: toastSuccess } = useToast();
  const { downloadFile } = useActivity();

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

  // Persist active tab selection
  const handleTabChange = (tab: 'all' | 'local' | number) => {
    setActiveTab(tab);
    sessionStorage.setItem('horizon_active_tab', String(tab));
    
    if (tab === 'all') {
      setActiveExternalAccount(null);
      navigate('/my-drive');
    } else if (tab === 'local') {
      setActiveExternalAccount(null);
      navigate('/my-drive');
    } else {
      const matchingAcc = externalAccounts.find(a => a.id === tab);
      if (matchingAcc) {
        setActiveExternalAccount(matchingAcc);
        navigate(`/my-drive?accountId=${tab}`);
      } else {
        setActiveTab('all');
        setActiveExternalAccount(null);
        navigate('/my-drive');
      }
    }
  };

  // Load connected cloud accounts
  const loadAccounts = async () => {
    try {
      const accs = await fetchExternalAccounts();
      setExternalAccounts(accs);
      
      const queryParams = new URLSearchParams(location.search);
      const accountIdParam = queryParams.get('accountId');
      if (accountIdParam) {
        const accId = Number(accountIdParam);
        const matchingAcc = accs.find(a => a.id === accId);
        if (matchingAcc) {
          setActiveExternalAccount(matchingAcc);
          setActiveTab(accId);
          return;
        }
      }
      
      // Fallback: if activeTab is a number, set activeExternalAccount
      if (typeof activeTab === 'number') {
        const matchingAcc = accs.find(a => a.id === activeTab);
        if (matchingAcc) {
          setActiveExternalAccount(matchingAcc);
        } else {
          setActiveTab('all');
          setActiveExternalAccount(null);
        }
      } else {
        setActiveExternalAccount(null);
      }
    } catch (err) {
      console.error('Gagal memuat akun eksternal', err);
    }
  };

  // Connect Google Drive integration
  const handleConnectGoogleDrive = async () => {
    try {
      const url = await getGoogleAuthUrl();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      toastError('Gagal mendapatkan URL otentikasi Google.');
    }
  };

  // Core navigation contents loader
  const loadContents = async () => {
    setIsLoading(true);
    try {
      // Fetch storage quota info
      const storageData = await fetchUserStorage();
      setStorageInfo(storageData);

      if (activeTab === 'all') {
        // Render virtual folders
        const virtualFolders: FolderResponse[] = [
          {
            id: 'virtual_local',
            name: 'Storage Node',
            parentId: null,
            userId: user?.id || 0,
            createdAt: new Date().toISOString(),
          }
        ];
        externalAccounts.forEach((acc, index) => {
          virtualFolders.push({
            id: `virtual_gdrive_${acc.id}`,
            name: `Drive ${index + 1} (${acc.email})`,
            parentId: null,
            userId: user?.id || 0,
            createdAt: new Date().toISOString(),
          });
        });
        setFolders(virtualFolders);
        setFiles([]);
      } else if (activeTab === 'local') {
        const data = await fetchFolderContents(folderId);
        setFolders(data.folders || []);
        setFiles(data.files || []);

        // Store subfolders names locally for breadcrumbs reconstruction
        const storedNames = JSON.parse(sessionStorage.getItem('horizon_folder_names') || '{}');
        data.folders?.forEach(f => {
          storedNames[f.id] = f.name;
        });
        sessionStorage.setItem('horizon_folder_names', JSON.stringify(storedNames));

      } else {
        // activeTab is externalAccountId (number)
        const currentAccount = externalAccounts.find(a => a.id === activeTab) || activeExternalAccount;
        if (currentAccount) {
          const data = await fetchGoogleDriveFolderContents(currentAccount.id, gDriveFolderId);
          
          const mappedFolders: FolderResponse[] = [];
          const mappedFiles: FileResponse[] = [];

          data.items?.forEach(item => {
            const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
            if (isFolder) {
              mappedFolders.push({
                id: item.id,
                name: item.name,
                parentId: gDriveFolderId || null,
                userId: user?.id || 0,
                createdAt: item.createdTime,
              });
            } else {
              mappedFiles.push({
                id: item.id,
                originalFileName: item.name,
                size: item.size || 0,
                createdAt: item.createdTime,
                provider: 'GOOGLE_DRIVE',
                externalAccountId: currentAccount.id,
              });
            }
          });

          setFolders(mappedFolders);
          setFiles(mappedFiles);

          // Store GDrive folder names locally for breadcrumbs reconstruction
          const storedGDriveNames = JSON.parse(sessionStorage.getItem('horizon_gdrive_names') || '{}');
          mappedFolders.forEach(f => {
            storedGDriveNames[f.id] = f.name;
          });
          sessionStorage.setItem('horizon_gdrive_names', JSON.stringify(storedGDriveNames));
        } else {
          setFolders([]);
          setFiles([]);
        }
      }
    } catch (err) {
      console.error('Failed to load contents', err);
      toastError('Gagal memuat isi folder.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sync breadcrumbs with URL params
  useEffect(() => {
    if (activeTab === 'local') {
      if (!folderId) {
        setLocalPath([]);
        sessionStorage.setItem('horizon_local_path', JSON.stringify([]));
      } else {
        const idx = localPath.findIndex(p => p.id === folderId);
        if (idx !== -1) {
          const sliced = localPath.slice(0, idx + 1);
          setLocalPath(sliced);
          sessionStorage.setItem('horizon_local_path', JSON.stringify(sliced));
        } else {
          const storedNames = JSON.parse(sessionStorage.getItem('horizon_folder_names') || '{}');
          const name = storedNames[folderId] || 'Folder';
          const updated = [...localPath, { id: folderId, name }];
          setLocalPath(updated);
          sessionStorage.setItem('horizon_local_path', JSON.stringify(updated));
        }
      }
    } else {
      if (!gDriveFolderId) {
        setGDrivePath([]);
        sessionStorage.setItem('horizon_gdrive_path', JSON.stringify([]));
      } else {
        const idx = gDrivePath.findIndex(p => p.id === gDriveFolderId);
        if (idx !== -1) {
          const sliced = gDrivePath.slice(0, idx + 1);
          setGDrivePath(sliced);
          sessionStorage.setItem('horizon_gdrive_path', JSON.stringify(sliced));
        } else {
          const storedGDriveNames = JSON.parse(sessionStorage.getItem('horizon_gdrive_names') || '{}');
          const name = storedGDriveNames[gDriveFolderId] || 'Folder GDrive';
          const updated = [...gDrivePath, { id: gDriveFolderId, name }];
          setGDrivePath(updated);
          sessionStorage.setItem('horizon_gdrive_path', JSON.stringify(updated));
        }
      }
    }
  }, [folderId, gDriveFolderId, activeTab]);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    loadContents();
  }, [uploadTrigger, folderId, gDriveFolderId, activeTab, activeExternalAccount, externalAccounts]);

  // Folder Navigation Actions
  const handleFolderDoubleClick = (folder: FolderResponse) => {
    if (folder.id === 'virtual_local') {
      handleTabChange('local');
    } else if (folder.id.startsWith('virtual_gdrive_')) {
      const accId = Number(folder.id.replace('virtual_gdrive_', ''));
      handleTabChange(accId);
    } else {
      if (activeTab === 'local') {
        navigate(`/my-drive?folderId=${folder.id}`);
      } else {
        navigate(`/my-drive?gDriveFolderId=${folder.id}&accountId=${activeExternalAccount?.id}`);
      }
    }
  };

  // Breadcrumb click handler
  const handleBreadcrumbClick = (id?: string) => {
    if (activeTab === 'local') {
      if (!id) {
        navigate('/my-drive');
      } else {
        navigate(`/my-drive?folderId=${id}`);
      }
    } else {
      if (!id) {
        navigate(`/my-drive?accountId=${activeExternalAccount?.id}`);
      } else {
        navigate(`/my-drive?gDriveFolderId=${id}&accountId=${activeExternalAccount?.id}`);
      }
    }
  };

  // Create folder action
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      if (activeTab === 'local') {
        await createFolder(newFolderName.trim(), folderId);
        toastSuccess(`Folder "${newFolderName}" berhasil dibuat.`);
      } else {
        const accountId = typeof activeTab === 'number' ? activeTab : activeExternalAccount?.id;
        if (!accountId) return;
        await createGoogleDriveFolder(accountId, newFolderName.trim(), gDriveFolderId);
        toastSuccess(`Folder GDrive "${newFolderName}" berhasil dibuat.`);
      }
      setNewFolderName('');
      setIsCreateFolderOpen(false);
      loadContents();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Gagal membuat folder.');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Delete folder action
  const handleDeleteFolder = async () => {
    if (!confirmDeleteFolder) return;
    setIsDeleting(true);
    try {
      if (activeTab === 'local') {
        await deleteFolder(confirmDeleteFolder.id);
        toastSuccess(`Folder "${confirmDeleteFolder.name}" berhasil dihapus beserta isinya.`);
      } else {
        const accountId = typeof activeTab === 'number' ? activeTab : activeExternalAccount?.id;
        if (accountId) {
          await deleteGoogleDriveFolder(accountId, confirmDeleteFolder.id);
          toastSuccess(`Folder Google Drive "${confirmDeleteFolder.name}" berhasil dihapus beserta isinya.`);
        } else {
          await deleteFile(confirmDeleteFolder.id, 'GOOGLE_DRIVE');
          toastSuccess(`Folder Google Drive "${confirmDeleteFolder.name}" berhasil dihapus.`);
        }
      }
      loadContents();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Gagal menghapus folder.');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteFolder(null);
    }
  };

  // Delete file action
  const handleDeleteFile = async () => {
    if (!confirmDeleteFile) return;
    setIsDeleting(true);
    try {
      await deleteFile(confirmDeleteFile.id, confirmDeleteFile.provider);
      toastSuccess(`Berkas "${confirmDeleteFile.originalFileName}" berhasil dihapus.`);
      loadContents();
    } catch (err) {
      console.error('Failed to delete file', err);
      toastError('Gagal menghapus berkas. Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteFile(null);
    }
  };

  // Drag-and-drop move items implementation
  const handleDragStart = (e: React.DragEvent, id: string, type: 'FILE' | 'FOLDER', provider: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, type, provider }));
  };

  const handleDragOver = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    setDraggedOverFolderId(targetFolderId);
  };

  const handleDragLeave = () => {
    setDraggedOverFolderId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolderId: string, targetProvider: 'LOCAL' | 'GOOGLE_DRIVE') => {
    e.preventDefault();
    setDraggedOverFolderId(null);
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const { id: sourceId, type, provider: sourceProvider } = JSON.parse(dataStr);

      if (sourceId === targetFolderId) return;

      const normSource = sourceProvider.toUpperCase() === 'GOOGLE_DRIVE' ? 'GOOGLE_DRIVE' : 'LOCAL';
      if (normSource !== targetProvider) {
        toastError(
          "Pemindahan berkas secara langsung antar provider berbeda tidak diizinkan. Silakan gunakan fitur Migrasi untuk memindahkan berkas antara Google Drive dan Local VPS Storage."
        );
        return;
      }

      if (targetProvider === 'GOOGLE_DRIVE') {
        const accountId = typeof activeTab === 'number' ? activeTab : activeExternalAccount?.id;
        if (!accountId) return;
        await moveGoogleDriveItem(accountId, sourceId, targetFolderId);
        toastSuccess('Item berhasil dipindahkan di Google Drive.');
      } else {
        await moveFolderItem(sourceId, targetFolderId, type);
        toastSuccess('Item berhasil dipindahkan.');
      }
      loadContents();
    } catch (err: any) {
      console.error(err);
      toastError(err.response?.data?.message || 'Gagal memindahkan item.');
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

  const filteredFolders = folders.filter((f) => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isEmpty = !isLoading && filteredFiles.length === 0 && filteredFolders.length === 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1 space-y-5 md:space-y-8 flex flex-col relative">
      
      {/* Sticky Over-quota Alert Banner */}
      {storageInfo && storageInfo.usedBytes > storageInfo.quotaBytes && (
        <div className="bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_10px_30px_rgba(244,63,94,0.25)] border border-red-500/10 transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2.5 rounded-2xl shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h4 className="text-sm md:text-base font-extrabold tracking-wide">Penyimpanan Anda Telah Melebihi Kuota!</h4>
              <p className="text-xs text-white/90 mt-1 font-semibold leading-relaxed">
                Penggunaan ({formatSize(storageInfo.usedBytes)}) telah melewati kuota aktif ({formatSize(storageInfo.quotaBytes)}). Fitur Upload, Berbagi berkas, AI, dan Migrasi dinonaktifkan sementara. Silakan hapus berkas atau upgrade paket Anda.
              </p>
            </div>
          </div>
          <button
            onClick={() => setUpgradeModalOpen(true)}
            className="w-full md:w-auto px-5 py-2.5 bg-white text-rose-600 hover:bg-slate-50 font-black rounded-xl text-xs transition-all shadow-md shrink-0 active:scale-95 cursor-pointer"
          >
            Upgrade Sekarang
          </button>
        </div>
      )}

      {/* Tabs Selector Local VPS vs Google Drive */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-extrabold overflow-x-auto pb-1">
        <button
          onClick={() => handleTabChange('all')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'all' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          <Files className="w-4 h-4" />
          <span>ALL</span>
        </button>
        <button
          onClick={() => handleTabChange('local')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'local' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-450 hover:text-slate-700'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Storage Node</span>
        </button>
        {externalAccounts.map((acc, index) => (
          <button
            key={acc.id}
            onClick={() => handleTabChange(acc.id)}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === acc.id 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-450 hover:text-slate-700'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Drive {index + 1} ({acc.email})</span>
          </button>
        ))}
        <button
          onClick={handleConnectGoogleDrive}
          className="pb-3 border-b-2 border-transparent text-[#0052cc] hover:text-[#0052cc]/80 flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap ml-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Hubungkan Google Drive</span>
        </button>
      </div>

      {/* Main Dashboard interface (if connected / Local / ALL) */}
      {(activeTab === 'all' || activeTab === 'local' || activeExternalAccount) && (
        <>
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
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end mt-6">
              <Button variant="secondary" disabled={isDeleting} onClick={() => setConfirmDeleteFile(null)}>
                Batal
              </Button>
              <Button variant="danger" isLoading={isDeleting} onClick={handleDeleteFile}>
                Hapus Permanen
              </Button>
            </div>
          </Modal>

          {/* Modal Konfirmasi Hapus Folder */}
          <Modal
            isOpen={confirmDeleteFolder !== null}
            onClose={() => setConfirmDeleteFolder(null)}
            title="Hapus Folder?"
            icon={AlertTriangle}
          >
            <p className="text-sm text-slate-550 leading-relaxed">
              Apakah Anda yakin ingin menghapus folder <strong className="text-slate-800 font-bold">"{confirmDeleteFolder?.name}"</strong> secara permanen beserta seluruh sub-folder dan berkas di dalamnya? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end mt-6">
              <Button variant="secondary" disabled={isDeleting} onClick={() => setConfirmDeleteFolder(null)}>
                Batal
              </Button>
              <Button variant="danger" isLoading={isDeleting} onClick={handleDeleteFolder}>
                Hapus Folder Berserta Isinya
              </Button>
            </div>
          </Modal>

          {/* Modal Konfirmasi Unduh Berkas */}
          <Modal
            isOpen={confirmDownloadFile !== null}
            onClose={() => setConfirmDownloadFile(null)}
            title="Unduh Berkas?"
            icon={Download}
          >
            <p className="text-sm text-slate-550 leading-relaxed font-semibold">
              Apakah Anda yakin ingin mengunduh berkas <strong className="text-slate-800 font-bold">"{confirmDownloadFile?.originalFileName}"</strong> ({confirmDownloadFile ? formatSize(confirmDownloadFile.size) : ''}) ke perangkat Anda?
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end mt-6">
              <Button variant="secondary" onClick={() => setConfirmDownloadFile(null)}>
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (confirmDownloadFile) {
                    downloadFile(
                      confirmDownloadFile.id,
                      confirmDownloadFile.originalFileName,
                      confirmDownloadFile.provider,
                      confirmDownloadFile.size,
                      confirmDownloadFile.externalAccountId
                    );
                    setConfirmDownloadFile(null);
                  }
                }}
              >
                Unduh
              </Button>
            </div>
          </Modal>

          {/* Modal Buat Folder Baru */}
          <Modal
            isOpen={isCreateFolderOpen}
            onClose={() => setIsCreateFolderOpen(false)}
            title="Buat Folder Baru"
            icon={FolderPlus}
          >
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Nama Folder
                </label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Masukkan nama folder..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-full py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setIsCreateFolderOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isCreatingFolder}>
                  Buat Folder
                </Button>
              </div>
            </form>
          </Modal>

          {/* Header Halaman & Kontrol Tampilan */}
          <div className="flex justify-between items-start md:items-end flex-wrap gap-3 md:gap-4">
            <div>
              {/* Breadcrumb Navigation */}
              {activeTab !== 'all' && (
                <nav className="flex items-center gap-2 text-xs text-slate-450 mb-1 select-none flex-wrap">
                  <span className="hover:text-slate-800 cursor-pointer font-semibold" onClick={() => handleBreadcrumbClick()}>
                    {activeTab === 'local' ? 'My Drive' : `Google Drive (${activeExternalAccount?.email || ''})`}
                  </span>
                  
                  {(activeTab === 'local' ? localPath : gDrivePath).map((p, idx) => (
                    <React.Fragment key={p.id}>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                      <span 
                        className={`hover:text-slate-800 cursor-pointer font-semibold truncate max-w-[120px] ${
                          idx === (activeTab === 'local' ? localPath.length - 1 : gDrivePath.length - 1) 
                            ? 'text-slate-500 font-extrabold pointer-events-none' 
                            : ''
                        }`}
                        onClick={() => handleBreadcrumbClick(p.id)}
                      >
                        {p.name}
                      </span>
                    </React.Fragment>
                  ))}
                </nav>
              )}
              
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                {activeTab === 'all'
                  ? 'Semua Penyimpanan'
                  : activeTab === 'local' 
                    ? (localPath.length > 0 ? localPath[localPath.length - 1].name : 'My Drive')
                    : (gDrivePath.length > 0 ? gDrivePath[gDrivePath.length - 1].name : `Google Drive (${activeExternalAccount?.email || ''})`)
                }
                <FolderOpen className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {activeTab === 'all'
                  ? 'Akses cepat ke seluruh node penyimpanan lokal dan akun Google Drive yang terhubung.'
                  : activeTab === 'local' 
                    ? 'Kelola seluruh berkas dan folder penyimpanan pribadi Anda di server VPS Lokal.' 
                    : 'Telusuri, organisasikan, dan bagikan seluruh berkas Anda di Google Drive secara real-time.'}
              </p>
            </div>

            {/* Controls Container */}
            {activeTab !== 'all' && (
              <div className="flex items-center gap-3 relative flex-wrap">
                
                {/* Button Create Folder */}
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => setIsCreateFolderOpen(true)}
                  className="flex items-center gap-2"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Folder Baru</span>
                </Button>

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
                      {/* Overlay background to close dropdown */}
                      <div className="fixed inset-0 z-10" onClick={() => setIsFilterDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-20 animate-fadeIn min-w-[220px]">
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
                <div className="bg-slate-100 p-1 rounded-xl hidden md:flex gap-1 border border-slate-200/50">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-650'
                    }`}
                    title="List View"
                  >
                    <List className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-slate-400 hover:text-slate-650'
                    }`}
                    title="Grid View"
                  >
                    <Grid className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Konten Utama: Daftar Folder & Berkas */}
          <div className="flex-1 animate-fadeIn space-y-6">
            
            {/* ───── SECTION 1: FOLDERS (Grid layout always at top for quick access) ───── */}
            {filteredFolders.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Folder</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredFolders.map((folder) => {
                    const isDraggedOver = draggedOverFolderId === folder.id;
                    const providerStr = activeTab === 'local' ? 'LOCAL' : 'GOOGLE_DRIVE';
                    
                    return (
                      <div
                        key={folder.id}
                        draggable={activeTab !== 'all'}
                        onDragStart={activeTab !== 'all' ? (e) => handleDragStart(e, folder.id, 'FOLDER', providerStr) : undefined}
                        onDragOver={activeTab !== 'all' ? (e) => handleDragOver(e, folder.id) : undefined}
                        onDragLeave={activeTab !== 'all' ? handleDragLeave : undefined}
                        onDrop={activeTab !== 'all' ? (e) => handleDrop(e, folder.id, providerStr) : undefined}
                        onDoubleClick={() => handleFolderDoubleClick(folder)}
                        onClick={() => {
                          if (window.innerWidth < 768) {
                            handleFolderDoubleClick(folder);
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
                          <span className="text-sm font-bold text-slate-800 truncate pr-2" title={folder.name}>
                            {folder.name}
                          </span>
                        </div>

                        {/* Folder Action buttons */}
                        {activeTab !== 'all' && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveShareFolder(folder);
                              }}
                              className="p-1.5 rounded-lg text-slate-450 hover:bg-slate-100 hover:text-slate-800 transition-all cursor-pointer"
                              title="Bagikan Folder"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteFolder(folder);
                              }}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer"
                              title="Hapus Folder"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ───── SECTION 2: FILES ───── */}
            {activeTab !== 'all' && (
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
                            const providerStr = activeTab === 'local' ? 'LOCAL' : 'GOOGLE_DRIVE';

                            return (
                              <tr 
                                key={file.id} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, file.id, 'FILE', providerStr)}
                                onClick={(e) => {
                                  const target = e.target as HTMLElement;
                                  if (target.closest('button') || target.closest('a')) {
                                    return;
                                  }
                                  setActivePreviewFile(file);
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
                                    {file.provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'GDrive' : 'Local'}
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
                                          navigate(`/recap?fileId=${file.id}`);
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
                                        setConfirmDownloadFile(file);
                                      }}
                                      className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 transition-all cursor-pointer"
                                      title="Unduh Berkas"
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveShareFile(file);
                                      }}
                                      className="hidden sm:flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100/70 transition-all cursor-pointer"
                                      title="Bagikan Akses Berkas"
                                    >
                                      <Share2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setConfirmDeleteFile(file);
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
                          const providerStr = activeTab === 'local' ? 'LOCAL' : 'GOOGLE_DRIVE';

                          return (
                            <Card 
                              key={file.id} 
                              draggable
                              onDragStart={(e) => handleDragStart(e, file.id, 'FILE', providerStr)}
                              onClick={(e) => {
                                const target = e.target as HTMLElement;
                                if (target.closest('button') || target.closest('a')) {
                                  return;
                                }
                                setActivePreviewFile(file);
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
                                      setConfirmDownloadFile(file);
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
            )}

          </div>
        </>
      )}

      {/* Share Modal */}
      {activeShareFile && (
        <ShareModal
          isOpen={activeShareFile !== null}
          onClose={() => setActiveShareFile(null)}
          fileId={activeShareFile?.id}
          fileName={activeShareFile?.originalFileName}
          provider={activeShareFile?.provider}
        />
      )}

      {/* Folder Share Modal */}
      {activeShareFolder && (
        <FolderShareModal
          isOpen={activeShareFolder !== null}
          onClose={() => setActiveShareFolder(null)}
          folderId={activeShareFolder.id}
          folderName={activeShareFolder.name}
          folderType={activeTab === 'local' ? 'LOCAL' : 'GOOGLE_DRIVE'}
        />
      )}

      {/* File Preview Modal */}
      {activePreviewFile && (
        <FilePreviewModal
          isOpen={activePreviewFile !== null}
          onClose={() => setActivePreviewFile(null)}
          fileId={activePreviewFile?.id}
          fileName={activePreviewFile?.originalFileName}
          provider={activePreviewFile?.provider}
          fileSize={activePreviewFile?.size}
          createdAt={activePreviewFile?.createdAt}
          externalAccountId={activePreviewFile?.externalAccountId}
        />
      )}

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        currentTier={user?.subscriptionTier || 'FREEMIUM'}
        onSuccess={loadContents}
      />
    </div>
  );
}
