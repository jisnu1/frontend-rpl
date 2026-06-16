import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AlertTriangle,
  Download,
  FolderPlus,
  Filter,
  List,
  Grid,
  Files,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Table as TableIcon
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
  FolderResponse,
  FolderContentResponse
} from '../../api/folders';
import { fetchExternalAccounts, getGoogleAuthUrl, ExternalAccountDto } from '../../api/externalAccounts';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ShareModal from '../../components/ShareModal';
import FolderShareModal from '../../components/FolderShareModal';
import { useToast } from '../../context/ToastContext';
import { useActivity } from '../../context/ActivityContext';
import FilePreviewModal from '../../components/FilePreviewModal';
import { fetchUserStorage, UserStorageResponse } from '../../api/storage';
import { useAuth } from '../../context/AuthContext';
import UpgradeModal from '../../components/ui/UpgradeModal';

// Sub-components
import QuotaBanner from './components/QuotaBanner';
import DashboardTabs from './components/DashboardTabs';
import Breadcrumbs from './components/Breadcrumbs';
import FolderCreationModal from './components/FolderCreationModal';
import FileBrowser from './components/FileBrowser';

import { formatSize, getFileExtension } from '../../utils/fileHelpers';

export interface DashboardFolder extends FolderResponse {
  provider?: 'STORAGE_NODE' | 'GOOGLE_DRIVE';
  externalAccountId?: number | null;
  providerLabel?: string;
}

export interface DashboardFile extends FileResponse {
  providerLabel?: string;
}

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
  const [folders, setFolders] = useState<DashboardFolder[]>([]);
  const [files, setFiles] = useState<DashboardFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Drag-and-drop target state
  const [draggedOverFolderId, setDraggedOverFolderId] = useState<string | null>(null);

  // Modal control states
  const [confirmDeleteFile, setConfirmDeleteFile] = useState<DashboardFile | null>(null);
  const [confirmDeleteFolder, setConfirmDeleteFolder] = useState<DashboardFolder | null>(null);
  const [confirmDownloadFile, setConfirmDownloadFile] = useState<DashboardFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeShareFile, setActiveShareFile] = useState<DashboardFile | null>(null);
  const [activeShareFolder, setActiveShareFolder] = useState<DashboardFolder | null>(null);
  const [activePreviewFile, setActivePreviewFile] = useState<DashboardFile | null>(null);
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

  const getFolderProvider = (folder: DashboardFolder | null) => {
    if (!folder) return 'STORAGE_NODE';
    return folder.provider || (activeTab === 'local' ? 'STORAGE_NODE' : 'GOOGLE_DRIVE');
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

  const handleConnectGoogleDrive = async () => {
    try {
      const url = await getGoogleAuthUrl();
      window.location.href = url;
    } catch (err) {
      console.error(err);
      toastError('Gagal mendapatkan URL otentikasi Google.');
    }
  };

  const loadContents = async () => {
    setIsLoading(true);
    try {
      const storageData = await fetchUserStorage();
      setStorageInfo(storageData);

      if (activeTab === 'all') {
        const localPromise: Promise<FolderContentResponse> = fetchFolderContents(undefined).catch(err => {
          console.error("Failed to fetch local contents in ALL tab", err);
          return { folders: [], files: [] } as FolderContentResponse;
        });

        const gdrivePromises = externalAccounts.map((acc: ExternalAccountDto) => 
          fetchGoogleDriveFolderContents(acc.id, undefined)
            .then(data => ({ acc, data }))
            .catch(err => {
              console.error(`Failed to fetch GDrive contents for account ${acc.id} in ALL tab`, err);
              return { acc, data: { items: [] } };
            })
        );

        const [localData, ...gdriveResults] = await Promise.all([localPromise, ...gdrivePromises]);

        const combinedFolders: DashboardFolder[] = [];
        const combinedFiles: DashboardFile[] = [];

        if (localData.folders) {
          localData.folders.forEach((f: FolderResponse) => {
            combinedFolders.push({
              ...f,
              provider: 'STORAGE_NODE',
              externalAccountId: null,
              providerLabel: 'Personal-Storage'
            });
          });
        }
        if (localData.files) {
          localData.files.forEach((f: FileResponse) => {
            combinedFiles.push({
              ...f,
              provider: 'STORAGE_NODE',
              externalAccountId: null,
              providerLabel: 'Personal-Storage'
            });
          });
        }

        gdriveResults.forEach((result) => {
          const acc = result.acc;
          const data = result.data;
          data.items?.forEach((item: any) => {
            const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
            if (isFolder) {
              combinedFolders.push({
                id: item.id,
                name: item.name,
                parentId: null,
                userId: user?.id || 0,
                createdAt: item.createdTime,
                provider: 'GOOGLE_DRIVE',
                externalAccountId: acc.id,
                providerLabel: `Google Drive (${acc.email})`
              });
            } else {
              combinedFiles.push({
                id: item.id,
                originalFileName: item.name,
                size: item.size || 0,
                createdAt: item.createdTime,
                provider: 'GOOGLE_DRIVE',
                externalAccountId: acc.id,
                providerLabel: `Google Drive (${acc.email})`
              });
            }
          });
        });

        setFolders(combinedFolders);
        setFiles(combinedFiles);
      } else if (activeTab === 'local') {
        const data = await fetchFolderContents(folderId);
        const mappedFolders: DashboardFolder[] = (data.folders || []).map(f => ({
          ...f,
          provider: 'STORAGE_NODE',
          externalAccountId: null,
          providerLabel: 'Personal-Storage'
        }));
        const mappedFiles: DashboardFile[] = (data.files || []).map(f => ({
          ...f,
          provider: 'STORAGE_NODE',
          externalAccountId: null,
          providerLabel: 'Personal-Storage'
        }));
        setFolders(mappedFolders);
        setFiles(mappedFiles);

        const storedNames = JSON.parse(sessionStorage.getItem('horizon_folder_names') || '{}');
        data.folders?.forEach(f => {
          storedNames[f.id] = f.name;
        });
        sessionStorage.setItem('horizon_folder_names', JSON.stringify(storedNames));

      } else {
        const currentAccount = externalAccounts.find(a => a.id === activeTab) || activeExternalAccount;
        if (currentAccount) {
          const data = await fetchGoogleDriveFolderContents(currentAccount.id, gDriveFolderId);
          
          const mappedFolders: DashboardFolder[] = [];
          const mappedFiles: DashboardFile[] = [];

          data.items?.forEach(item => {
            const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
            if (isFolder) {
              mappedFolders.push({
                id: item.id,
                name: item.name,
                parentId: gDriveFolderId || null,
                userId: user?.id || 0,
                createdAt: item.createdTime,
                provider: 'GOOGLE_DRIVE',
                externalAccountId: currentAccount.id,
                providerLabel: `Google Drive (${currentAccount.email})`
              });
            } else {
              mappedFiles.push({
                id: item.id,
                originalFileName: item.name,
                size: item.size || 0,
                createdAt: item.createdTime,
                provider: 'GOOGLE_DRIVE',
                externalAccountId: currentAccount.id,
                providerLabel: `Google Drive (${currentAccount.email})`
              });
            }
          });

          setFolders(mappedFolders);
          setFiles(mappedFiles);

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

  const handleFolderDoubleClick = (folder: DashboardFolder) => {
    if (folder.id === 'virtual_local') {
      handleTabChange('local');
    } else if (folder.id.startsWith('virtual_gdrive_')) {
      const accId = Number(folder.id.replace('virtual_gdrive_', ''));
      handleTabChange(accId);
    } else {
      const targetProvider = folder.provider || (activeTab === 'local' ? 'STORAGE_NODE' : 'GOOGLE_DRIVE');
      const targetAccountId = folder.externalAccountId || (typeof activeTab === 'number' ? activeTab : activeExternalAccount?.id);

      if (activeTab === 'all') {
        if (targetProvider === 'STORAGE_NODE') {
          setActiveTab('local');
          sessionStorage.setItem('horizon_active_tab', 'local');
          navigate(`/my-drive?folderId=${folder.id}`);
        } else if (targetAccountId) {
          setActiveTab(targetAccountId);
          sessionStorage.setItem('horizon_active_tab', String(targetAccountId));
          const matchingAcc = externalAccounts.find(a => a.id === targetAccountId);
          if (matchingAcc) {
            setActiveExternalAccount(matchingAcc);
          }
          navigate(`/my-drive?gDriveFolderId=${folder.id}&accountId=${targetAccountId}`);
        }
      } else {
        if (activeTab === 'local') {
          navigate(`/my-drive?folderId=${folder.id}`);
        } else {
          navigate(`/my-drive?gDriveFolderId=${folder.id}&accountId=${activeExternalAccount?.id}`);
        }
      }
    }
  };

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

  const handleDeleteFolder = async () => {
    if (!confirmDeleteFolder) return;
    setIsDeleting(true);
    try {
      const provider = confirmDeleteFolder.provider || (activeTab === 'local' ? 'STORAGE_NODE' : 'GOOGLE_DRIVE');
      if (provider === 'STORAGE_NODE') {
        await deleteFolder(confirmDeleteFolder.id);
        toastSuccess(`Folder "${confirmDeleteFolder.name}" berhasil dihapus beserta isinya.`);
      } else {
        const accountId = confirmDeleteFolder.externalAccountId || (typeof activeTab === 'number' ? activeTab : activeExternalAccount?.id);
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1 space-y-5 md:space-y-8 flex flex-col relative">
      
      {/* Sticky Over-quota Alert Banner */}
      <QuotaBanner storageInfo={storageInfo} onUpgradeClick={() => setUpgradeModalOpen(true)} />

      {/* Tabs Selector Local VPS vs Google Drive */}
      <DashboardTabs 
        activeTab={activeTab} 
        externalAccounts={externalAccounts} 
        onTabChange={handleTabChange}
        onConnectGoogleDrive={handleConnectGoogleDrive}
      />

      {/* Main Dashboard interface */}
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
          <FolderCreationModal 
            isOpen={isCreateFolderOpen}
            onClose={() => setIsCreateFolderOpen(false)}
            newFolderName={newFolderName}
            setNewFolderName={setNewFolderName}
            onSubmit={handleCreateFolder}
            isLoading={isCreatingFolder}
          />

          {/* Header Halaman & Kontrol Tampilan */}
          <div className="flex justify-between items-start md:items-end flex-wrap gap-3 md:gap-4">
            <Breadcrumbs 
              activeTab={activeTab}
              activeExternalAccount={activeExternalAccount}
              localPath={localPath}
              gDrivePath={gDrivePath}
              onBreadcrumbClick={handleBreadcrumbClick}
            />

            {/* Controls Container */}
            <div className="flex items-center gap-3 relative flex-wrap w-full md:w-auto justify-end">
              
              {/* Button Create Folder */}
              {activeTab !== 'all' && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => setIsCreateFolderOpen(true)}
                  className="flex items-center gap-2 flex-1 md:flex-initial justify-center"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Folder Baru</span>
                </Button>
              )}

              {/* Tombol Filter dengan Dropdown */}
              <div className="relative flex-1 md:flex-initial">
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className={`flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-sm cursor-pointer select-none ${
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
              <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/50">
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
          </div>

          {/* Konten Utama: Daftar Folder & Berkas */}
          <FileBrowser 
            isLoading={isLoading}
            activeTab={activeTab}
            filteredFolders={filteredFolders}
            filteredFiles={filteredFiles}
            draggedOverFolderId={draggedOverFolderId}
            viewMode={viewMode}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onFolderDoubleClick={handleFolderDoubleClick}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onShareFolder={setActiveShareFolder}
            onDeleteFolder={setConfirmDeleteFolder}
            onDownloadFile={setConfirmDownloadFile}
            onShareFile={setActiveShareFile}
            onDeleteFile={setConfirmDeleteFile}
            onPreviewFile={setActivePreviewFile}
            onRecapClick={(fileId) => navigate(`/recap?fileId=${fileId}`)}
          />
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
          folderType={getFolderProvider(activeShareFolder) === 'STORAGE_NODE' ? 'LOCAL' : 'GOOGLE_DRIVE'}
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
