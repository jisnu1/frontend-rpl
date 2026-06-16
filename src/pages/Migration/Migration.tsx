import React, { useState, useEffect, useRef } from 'react';
import { 
  RefreshCw, 
  Search, 
  Database, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Trash2, 
  Loader2, 
  Sliders, 
  Terminal, 
  Clock, 
  File,
  ShieldAlert,
  ChevronRight,
  Folder
} from 'lucide-react';
import { fetchMyFiles, FileResponse } from '../../api/files';
import { fetchFolderContents, fetchGoogleDriveFolderContents, FolderResponse } from '../../api/folders';
import { fetchExternalAccounts, ExternalAccountDto } from '../../api/externalAccounts';
import { 
  fetchMigrationConfig, 
  updateMigrationConfig, 
  fetchMigrationTasks, 
  cancelMigrationTask,
  MigrationConfig, 
  MigrationTaskDto 
} from '../../api/migrations';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import MigrationModal from '../../components/MigrationModal';

interface TabConfig {
  id: string;
  name: string;
  provider: 'STORAGE_NODE' | 'GOOGLE_DRIVE';
  accountId: number | null;
  email?: string;
}

const getProviderName = (provider: string) => {
  if (provider === 'GOOGLE_DRIVE') return 'Google Drive';
  if (provider === 'STORAGE_NODE') return 'VPS Storage Node';
  return provider;
};

interface MigrationProps {
  isSidebarMinimized?: boolean;
}

export default function Migration({ isSidebarMinimized = false }: MigrationProps) {
  const { user } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [folders, setFolders] = useState<FolderResponse[]>([]);
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [externalAccounts, setExternalAccounts] = useState<ExternalAccountDto[]>([]);
  const [config, setConfig] = useState<MigrationConfig>({ maxFileSizeBytes: 268435456, maxDailyLimit: 3, todayTasksCount: 0 });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Record<string, FileResponse>>({});
  const [selectedFolders, setSelectedFolders] = useState<Record<string, FolderResponse & { provider: string; externalAccountId?: number | null }>>({});
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [folderPath, setFolderPath] = useState<Array<{ id: string; name: string }>>([]);
  const [activeTab, setActiveTab] = useState<string>('STORAGE_NODE');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Admin settings edit state
  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN') || user?.username === 'admin';
  const [adminMaxMb, setAdminMaxMb] = useState('256');
  const [adminDailyLimit, setAdminDailyLimit] = useState('3');
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false);

  // Migration running states
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [batchTasks, setBatchTasks] = useState<MigrationTaskDto[]>([]);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Screen size detection for responsive conditional rendering
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load initial data
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [accounts, migrationConf, tasks] = await Promise.all([
        fetchExternalAccounts(),
        fetchMigrationConfig(),
        fetchMigrationTasks()
      ]);

      const googleAccs = accounts.filter(a => a.provider.toUpperCase().startsWith('GOOGLE'));
      setExternalAccounts(googleAccs);
      setConfig(migrationConf);

      // Initialize admin settings inputs
      setAdminMaxMb((migrationConf.maxFileSizeBytes / 1024 / 1024).toString());
      setAdminDailyLimit(migrationConf.maxDailyLimit.toString());

      // Restore active migration dashboard using localStorage first, or fall back to any active task in tasks list
      const storedBatchId = localStorage.getItem('activeMigrationBatchId');
      if (storedBatchId) {
        setActiveBatchId(storedBatchId);
        const activeBatchTasks = tasks.filter(t => t.batchId === storedBatchId);
        setBatchTasks(activeBatchTasks);
      } else {
        const activeTask = tasks.find(t => t.status === 'PENDING' || t.status === 'RUNNING');
        if (activeTask) {
          setActiveBatchId(activeTask.batchId);
          localStorage.setItem('activeMigrationBatchId', activeTask.batchId);
          const activeBatchTasks = tasks.filter(t => t.batchId === activeTask.batchId);
          setBatchTasks(activeBatchTasks);
        }
      }

    } catch (err) {
      console.error('Failed to load migration data', err);
      toastError('Gagal memuat informasi migrasi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Set up Tabs
  const tabs: TabConfig[] = [
    { id: 'STORAGE_NODE', name: 'Storage Node VPS', provider: 'STORAGE_NODE', accountId: null },
    ...externalAccounts.map(acc => ({
      id: `GOOGLE_DRIVE_${acc.id}`,
      name: `Google Drive`,
      provider: 'GOOGLE_DRIVE' as const,
      accountId: acc.id,
      email: acc.email
    }))
  ];

  const currentTabConfig = tabs.find(t => t.id === activeTab) || tabs[0];

  useEffect(() => {
    const loadFolderData = async () => {
      setIsLoading(true);
      try {
        if (!currentTabConfig) return;

        if (currentTabConfig.provider === 'STORAGE_NODE') {
          const data = await fetchFolderContents(currentFolderId);
          setFolders(data.folders || []);
          setFiles(data.files || []);
        } else {
          const data = await fetchGoogleDriveFolderContents(currentTabConfig.accountId!, currentFolderId);
          const mappedFolders: FolderResponse[] = [];
          const mappedFiles: FileResponse[] = [];

          data.items?.forEach(item => {
            const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
            if (isFolder) {
              mappedFolders.push({
                id: item.id,
                name: item.name,
                parentId: currentFolderId || null,
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
                externalAccountId: currentTabConfig.accountId,
              });
            }
          });
          setFolders(mappedFolders);
          setFiles(mappedFiles);
        }
      } catch (err) {
        console.error('Failed to load folder contents', err);
        toastError('Gagal memuat isi folder.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFolderData();
  }, [currentFolderId, activeTab, externalAccounts]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentFolderId(undefined);
    setFolderPath([]);
  };

  const handleFolderDoubleClick = (folder: FolderResponse) => {
    setFolderPath(prev => [...prev, { id: folder.id, name: folder.name }]);
    setCurrentFolderId(folder.id);
  };

  const handleToggleFolder = (folder: FolderResponse) => {
    setSelectedFolders(prev => {
      const updated = { ...prev };
      if (updated[folder.id]) {
        delete updated[folder.id];
      } else {
        updated[folder.id] = {
          ...folder,
          provider: currentTabConfig.provider,
          externalAccountId: currentTabConfig.accountId,
        };
      }
      return updated;
    });
  };

  const tabFiles = files;
  const tabFolders = folders;

  // Filter tab folders and files by search query
  const filteredTabFolders = tabFolders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTabFiles = tabFiles.filter(file => 
    file.originalFileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes === -1) return 'Tanpa Batas';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Toggle selection
  const handleToggleFile = (file: FileResponse) => {
    setSelectedFiles(prev => {
      const updated = { ...prev };
      if (updated[file.id]) {
        delete updated[file.id];
      } else {
        updated[file.id] = file;
      }
      return updated;
    });
  };

  // Select all visible files and folders in active tab
  const handleToggleSelectAll = () => {
    const allFilesSelected = filteredTabFiles.every(file => selectedFiles[file.id]);
    const allFoldersSelected = filteredTabFolders.every(folder => selectedFolders[folder.id]);
    const allSelected = allFilesSelected && allFoldersSelected;

    setSelectedFiles(prev => {
      const updated = { ...prev };
      if (allSelected) {
        filteredTabFiles.forEach(file => {
          delete updated[file.id];
        });
      } else {
        filteredTabFiles.forEach(file => {
          updated[file.id] = file;
        });
      }
      return updated;
    });

    setSelectedFolders(prev => {
      const updated = { ...prev };
      if (allSelected) {
        filteredTabFolders.forEach(folder => {
          delete updated[folder.id];
        });
      } else {
        filteredTabFolders.forEach(folder => {
          updated[folder.id] = {
            ...folder,
            provider: currentTabConfig.provider,
            externalAccountId: currentTabConfig.accountId,
          };
        });
      }
      return updated;
    });
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedFiles({});
    setSelectedFolders({});
  };

  // Triggered when modal starts migration successfully
  const handleMigrationStarted = (batchId: string) => {
    setSelectedFiles({});
    setActiveBatchId(batchId);
    localStorage.setItem('activeMigrationBatchId', batchId);
  };

  // Polling migration progress
  useEffect(() => {
    if (!activeBatchId) return;

    const poll = async () => {
      try {
        const tasks = await fetchMigrationTasks(activeBatchId);
        setBatchTasks(tasks);

        let allFinished = true;
        tasks.forEach(task => {
          if (task.status === 'PENDING' || task.status === 'RUNNING') {
            allFinished = false;
          }
        });

        if (allFinished && tasks.length > 0) {
          clearInterval(interval);
          setSuccessModalOpen(true);
          // Reload daily limits and stats
          loadInitialData();
        }

      } catch (err) {
        console.error('Failed to poll active migration', err);
      }
    };

    poll(); // Run immediately first
    const interval = setInterval(poll, 2000);

    return () => clearInterval(interval);
  }, [activeBatchId]);

  // Handle Admin Config Update
  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingConfig(true);
    try {
      const bytes = Number(adminMaxMb) * 1024 * 1024;
      await updateMigrationConfig({
        'migration.max_file_size_bytes': bytes.toString(),
        'migration.max_daily_limit': adminDailyLimit
      });
      toastSuccess('Konfigurasi migrasi berhasil diperbarui!');
      loadInitialData();
    } catch (err) {
      console.error(err);
      toastError('Gagal memperbarui konfigurasi.');
    } finally {
      setIsUpdatingConfig(false);
    }
  };

  const handleCancelMigration = async (taskId: string) => {
    try {
      await cancelMigrationTask(taskId);
      toastSuccess('Migrasi berhasil dibatalkan.');
      if (activeBatchId) {
        const tasks = await fetchMigrationTasks(activeBatchId);
        setBatchTasks(tasks);
      }
    } catch (err: any) {
      console.error('Failed to cancel migration', err);
      toastError(err.response?.data?.message || 'Gagal membatalkan migrasi.');
    }
  };

  const selectedFilesList = Object.values(selectedFiles);
  const selectedFoldersList = Object.values(selectedFolders);
  const selectedCount = selectedFilesList.length + selectedFoldersList.length;
  const selectedSize = selectedFilesList.reduce((acc, f) => acc + f.size, 0);

  // Check if any selected files exceed config limit
  const hasTooLargeFiles = config.maxFileSizeBytes !== -1 && selectedFilesList.some(f => f.size > config.maxFileSizeBytes);

  const isDailyLimitReached = config.maxDailyLimit !== -1 && config.todayTasksCount >= config.maxDailyLimit;

  // Add a full-page loading spinner if isLoading is true
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full gap-3 bg-background animate-fadeIn">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-on-surface-variant">Memuat data migrasi...</p>
      </div>
    );
  }

  // Render Progress Dashboard Screen
  if (activeBatchId) {
    const completedCount = batchTasks.filter(t => t.status === 'SUCCESS').length;
    const failedCount = batchTasks.filter(t => t.status === 'FAILED').length;
    const runningCount = batchTasks.filter(t => t.status === 'RUNNING').length;
    const totalCount = batchTasks.length;
    const overallProgress = totalCount > 0 
      ? Math.round((batchTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / (totalCount * 100)) * 100)
      : 0;

    const getProviderIcon = (provider: string) => {
      if (provider === 'GOOGLE_DRIVE') return <HardDrive className="w-3.5 h-3.5 text-sky-500 shrink-0" />;
      if (provider === 'STORAGE_NODE') return <Database className="w-3.5 h-3.5 text-primary shrink-0" />;
      return <File className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />;
    };

    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full flex flex-col gap-5 md:gap-8 min-h-[calc(100vh-4rem)] animate-fadeIn">
        
        {/* Success Modal Overlay */}
        {successModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-100 shadow-2xl space-y-4">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Migrasi Selesai!</h3>
                <p className="text-xs font-semibold text-slate-500 max-w-sm">
                  Proses migrasi batch Anda telah diselesaikan oleh antrean latar belakang.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-bold text-slate-600 space-y-1.5">
                <div className="flex justify-between">
                  <span>Total Berkas:</span>
                  <span className="text-slate-800">{totalCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Berhasil:</span>
                  <span className="text-emerald-600">{completedCount}</span>
                </div>
                {failedCount > 0 && (
                  <div className="flex justify-between">
                    <span>Gagal:</span>
                    <span className="text-red-500">{failedCount}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setSuccessModalOpen(false);
                  setActiveBatchId(null);
                  setBatchTasks([]);
                  localStorage.removeItem('activeMigrationBatchId');
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-md"
              >
                Kembali ke Daftar Berkas
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-start gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-surface-container-low text-primary animate-pulse">
              <RefreshCw className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Dashboard Progress Migrasi</h2>
              <p className="text-xs font-semibold text-on-surface-variant">Batch ID: {activeBatchId}</p>
            </div>
          </div>
        </div>

        {/* Global Progress Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex-1 space-y-2 w-full">
            <div className="flex justify-between text-sm font-bold text-slate-700">
              <span>Progres Keseluruhan</span>
              <span>{overallProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="flex gap-4 text-[10px] font-bold text-on-surface-variant pt-1">
              <span>Berhasil: {completedCount}/{totalCount}</span>
              {runningCount > 0 && <span className="animate-pulse text-primary">Berjalan: {runningCount}</span>}
              {failedCount > 0 && <span className="text-error">Gagal: {failedCount}</span>}
            </div>
          </div>
        </div>

        {/* List of files in progress */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Daftar Berkas Migrasi</h3>
          <div className="grid gap-4">
            {batchTasks.map(task => {
              const isSuccess = task.status === 'SUCCESS';
              const isFailed = task.status === 'FAILED';
              const isRunning = task.status === 'RUNNING';

              let statusText = 'Menunggu antrean...';
              if (isRunning) {
                statusText = `Memindahkan berkas (${Math.round(task.progress || 0)}%)`;
              } else if (isSuccess) {
                statusText = 'Migrasi Selesai';
              } else if (isFailed) {
                statusText = 'Migrasi Gagal';
              }

              return (
                <div key={task.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3.5 transition-all hover:shadow-md">
                  
                  {/* File Name Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <File className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-xs font-black text-on-surface truncate" title={task.fileName || task.fileId}>
                        {task.fileName || task.fileId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                        isSuccess ? 'bg-emerald-100 text-emerald-700' :
                        isFailed ? 'bg-red-100 text-red-700' :
                        isRunning ? 'bg-primary/10 text-primary animate-pulse' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {task.status}
                      </span>
                      {(task.status === 'PENDING' || task.status === 'RUNNING') && (
                        <button 
                          onClick={() => handleCancelMigration(task.id)} 
                          className="text-[10px] font-bold text-error hover:bg-error-container/20 px-2 py-1 rounded-lg border border-error/20 transition-colors"
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Provider Direction Visual flow */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-semibold text-on-surface-variant w-fit">
                    <div className="flex items-center gap-1.5">
                      {getProviderIcon(task.sourceProvider)}
                      <span>{getProviderName(task.sourceProvider)}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                    <div className="flex items-center gap-1.5">
                      {getProviderIcon(task.targetProvider)}
                      <span>{getProviderName(task.targetProvider)}</span>
                    </div>
                  </div>

                  {/* Progress Info & Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant">
                      <span>{statusText}</span>
                      <span className="font-black text-on-surface">{Math.round(task.progress || 0)}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${isSuccess ? 'bg-emerald-500' : isFailed ? 'bg-error' : 'bg-primary'}`}
                          style={{ width: `${task.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Error Message if Failed */}
                  {isFailed && task.errorMessage && (
                    <div className="text-[10px] font-bold text-error bg-error-container/20 border border-error/10 p-3 rounded-2xl leading-relaxed">
                      Error: {task.errorMessage}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLargeScreen ? (
        /* ============================================================
            DESKTOP LAYOUT — hidden on mobile, unchanged
            ============================================================ */
        <div className="hidden lg:flex p-8 max-w-7xl mx-auto w-full flex-1 space-y-8 flex-col relative">

        {/* Title & Top Description Banner */}
        <div className="bg-gradient-to-r from-primary to-[#0053db] text-white rounded-3xl p-6 shadow-md border border-primary/10 flex flex-row justify-between items-center relative overflow-hidden">
          <div className="space-y-0.5 z-10">
            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
              One-Click Multi-Cloud Migration
            </h2>
            <p className="text-xs text-white/80 font-semibold max-w-xl">
              Pindahkan atau salin berkas Anda secara massal antarsumber penyimpanan dengan aman.
            </p>
          </div>
          <div className="flex flex-row gap-4 z-10">
            <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/20 space-y-0.5">
              <span className="text-[9px] font-black text-white/70 uppercase block tracking-wider">Batas Harian</span>
              <span className="text-sm font-black">{config.maxDailyLimit === -1 ? `${config.todayTasksCount} / ∞` : `${config.todayTasksCount} / ${config.maxDailyLimit}`}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/20 space-y-0.5">
              <span className="text-[9px] font-black text-white/70 uppercase block tracking-wider">Maks. Ukuran</span>
              <span className="text-sm font-black">{formatSize(config.maxFileSizeBytes)}</span>
            </div>
          </div>
        </div>

        {/* Tabs list */}
        <div className="w-full" style={{minWidth: 0}}>
          <div className="border-b border-slate-100 flex gap-1 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const isGDrive = tab.provider === 'GOOGLE_DRIVE';
              const TabIcon = isGDrive ? HardDrive : Database;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 border-b-2 font-bold text-xs transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? isGDrive
                        ? 'border-sky-500 text-sky-600 bg-sky-50/60'
                        : 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                  }`}
                >
                  <TabIcon className={`w-4 h-4 shrink-0 ${isActive && isGDrive ? 'text-sky-500' : ''}`} />
                  <span>{tab.name}</span>
                  {tab.email && <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${isActive && isGDrive ? 'bg-sky-100 text-sky-500' : 'text-slate-400 bg-slate-100'}`}>{tab.email}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-row gap-4 justify-between items-center w-full">
          <div className="relative max-w-md w-full group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
              <Search className="w-4 h-4" />
            </span>
            <input
              className="w-full bg-[#F1F5F9] border-none rounded-full py-2 pl-12 pr-4 text-xs font-semibold focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
              placeholder={`Cari berkas di ${currentTabConfig?.name}...`}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop: Floating Bottom Action Bar */}
        {selectedCount > 0 && (
          <div
            className={`fixed bottom-0 right-0 z-30 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-2xl animate-fadeIn hidden lg:block transition-all duration-300 ${
              isSidebarMinimized ? 'left-20' : 'left-[280px]'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-slate-800">{selectedCount} berkas dipilih</p>
                <p className="text-xs font-semibold text-slate-400">{formatSize(selectedSize)}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="p-2.5 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-all"
                  title="Kosongkan Pilihan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={hasTooLargeFiles || isDailyLimitReached}
                  onClick={() => setIsModalOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-6 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Migrasikan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Breadcrumb Path */}
        {folderPath.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-bold bg-slate-50 p-3 rounded-2xl border border-slate-100/80 w-fit">
            <button 
              type="button" 
              onClick={() => {
                setCurrentFolderId(undefined);
                setFolderPath([]);
              }}
              className="hover:text-primary transition-colors"
            >
              Root
            </button>
            {folderPath.map((p, idx) => (
              <React.Fragment key={p.id}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                <button
                  type="button"
                  disabled={idx === folderPath.length - 1}
                  onClick={() => {
                    const newPath = folderPath.slice(0, idx + 1);
                    setFolderPath(newPath);
                    setCurrentFolderId(p.id);
                  }}
                  className={`hover:text-primary transition-colors max-w-[200px] truncate ${idx === folderPath.length - 1 ? 'text-slate-700 font-extrabold cursor-default' : ''}`}
                >
                  {p.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Main Files Table */}
        <div className="bg-white border border-slate-150/60 rounded-3xl overflow-hidden shadow-sm flex-1">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-bold text-slate-400">Memuat berkas...</p>
            </div>
          ) : (filteredTabFiles.length === 0 && filteredTabFolders.length === 0) ? (
            <div className="py-24 px-6 w-full mx-auto text-center text-slate-400 font-bold text-xs flex flex-col items-center justify-center gap-3 select-none">
              <Sliders className="w-12 h-12 text-slate-200" />
              <span className="max-w-[220px] leading-relaxed">Belum ada berkas atau folder di dalam penyimpanan ini.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-black tracking-wider uppercase">
                    <th className="py-3 px-5 w-10 text-center">
                      <input 
                        type="checkbox" 
                        checked={
                          (filteredTabFiles.length > 0 || filteredTabFolders.length > 0) && 
                          filteredTabFiles.every(file => selectedFiles[file.id]) && 
                          filteredTabFolders.every(folder => selectedFolders[folder.id])
                        } 
                        onChange={handleToggleSelectAll} 
                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary focus:ring-2 cursor-pointer" 
                      />
                    </th>
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4">Ukuran</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4">Tanggal Dibuat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {/* Folders */}
                  {filteredTabFolders.map(folder => {
                    const isChecked = !!selectedFolders[folder.id];
                    return (
                      <tr 
                        key={folder.id} 
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${isChecked ? 'bg-primary/5' : ''}`} 
                        onClick={() => handleToggleFolder(folder)}
                        onDoubleClick={() => handleFolderDoubleClick(folder)}
                      >
                        <td className="py-3.5 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={() => handleToggleFolder(folder)} 
                            className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary focus:ring-2 cursor-pointer" 
                          />
                        </td>
                        <td className="py-3.5 px-4 font-bold max-w-sm">
                          <div className="flex items-center gap-2.5">
                            <Folder className="w-4.5 h-4.5 text-primary shrink-0" />
                            <span className="truncate" title={folder.name}>{folder.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400">-</td>
                        <td className="py-3.5 px-4 text-on-surface-variant uppercase font-black">{currentTabConfig.provider}</td>
                        <td className="py-3.5 px-4 text-slate-400">{folder.createdAt ? new Date(folder.createdAt).toLocaleDateString() : '-'}</td>
                      </tr>
                    );
                  })}
                  {/* Files */}
                  {filteredTabFiles.map(file => {
                    const isChecked = !!selectedFiles[file.id];
                    const isTooLarge = config.maxFileSizeBytes !== -1 && file.size > config.maxFileSizeBytes;
                    return (
                      <tr key={file.id} className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${isChecked ? 'bg-primary/5' : ''}`} onClick={() => handleToggleFile(file)}>
                        <td className="py-3.5 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={isChecked} onChange={() => handleToggleFile(file)} className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary focus:ring-2 cursor-pointer" />
                        </td>
                        <td className="py-3.5 px-4 font-bold max-w-sm">
                          <div className="flex items-center gap-2.5">
                            <File className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                            <span className="truncate" title={file.originalFileName}>{file.originalFileName}</span>
                            {isTooLarge && (
                              <span className="text-[8px] font-black bg-error-container text-error px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                <ShieldAlert className="w-2.5 h-2.5" />
                                Premium limit exceeded ({formatSize(config.maxFileSizeBytes)})
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">{formatSize(file.size)}</td>
                        <td className="py-3.5 px-4 text-on-surface-variant uppercase font-black">{file.provider}</td>
                        <td className="py-3.5 px-4 text-slate-400">{file.createdAt ? new Date(file.createdAt).toLocaleDateString() : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Bottom notes & admin */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Catatan & Ketentuan Premium</span>
              <div className="space-y-2 text-xs font-semibold text-on-surface-variant leading-relaxed">
                <div className="flex gap-2.5 items-start">
                  <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Reset kuota harian dilakukan secara otomatis saat hari berganti (pukul 00.00 waktu sistem).</span>
                </div>
                <div className="flex gap-2.5 items-start">
                  <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Batas harian migrasi adalah total berkas yang dimigrasikan dalam satu hari, bukan total inisiasi migrasi.</span>
                </div>
              </div>
            </div>
            {isDailyLimitReached && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-[11px] font-bold flex items-start gap-2 animate-pulse mt-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Batas harian migrasi Anda hari ini telah terlampaui. Silakan coba kembali besok!</span>
              </div>
            )}
          </div>
          {isAdmin && (
            <div className="bg-surface-container-low text-on-surface p-5 rounded-3xl border border-surface-variant space-y-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-primary" />
                <h4 className="text-xs font-black uppercase tracking-wider text-on-surface">Admin Migration Config</h4>
              </div>
              <form onSubmit={handleUpdateConfig} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant/80 uppercase">Max Size (MB)</label>
                    <input type="number" value={adminMaxMb} onChange={(e) => setAdminMaxMb(e.target.value)} className="w-full bg-white border border-outline-variant rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-on-surface-variant/80 uppercase">Daily Limit (Files)</label>
                    <input type="number" value={adminDailyLimit} onChange={(e) => setAdminDailyLimit(e.target.value)} className="w-full bg-white border border-outline-variant rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary" required />
                  </div>
                </div>
                <button type="submit" disabled={isUpdatingConfig} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
                  {isUpdatingConfig ? (<><Loader2 className="w-4 h-4 animate-spin" />Memperbarui...</>) : ('Terapkan Konfigurasi')}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      ) : (
        /* ============================================================
            MOBILE LAYOUT — shown only on mobile (< md), brand new
            ============================================================ */
        <div className="lg:hidden flex flex-col min-h-screen bg-slate-50 pb-32 w-full overflow-x-hidden">

        {/* ── Banner compact ── */}
        <div className="bg-gradient-to-br from-primary to-[#0041c4] text-white px-4 pt-4 pb-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h1 className="text-base font-black leading-tight tracking-tight">Multi-Cloud Migration</h1>
              <p className="text-[11px] text-white/70 font-medium mt-0.5">Pindahkan berkas antar penyimpanan dengan mudah</p>
            </div>
            <div className="p-2 bg-white/10 rounded-xl border border-white/20 shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
          {/* Stats pills */}
          <div className="flex gap-2">
            <div className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-3 py-2.5 text-center">
              <p className="text-[9px] font-black text-white/60 uppercase tracking-wider">Batas Harian</p>
              <p className="text-sm font-black mt-0.5">{config.maxDailyLimit === -1 ? `${config.todayTasksCount} / ∞` : `${config.todayTasksCount} / ${config.maxDailyLimit}`}</p>
            </div>
            <div className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-3 py-2.5 text-center">
              <p className="text-[9px] font-black text-white/60 uppercase tracking-wider">Maks. Ukuran</p>
              <p className="text-sm font-black mt-0.5">{formatSize(config.maxFileSizeBytes)}</p>
            </div>
            {isDailyLimitReached && (
              <div className="flex-1 bg-red-500/80 border border-red-300/30 rounded-2xl px-3 py-2.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <p className="text-[9px] font-black leading-tight">Limit tercapai hari ini!</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Tab Dropdown Selector ── */}
        <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10 w-full px-4 py-3">
          <div className="relative">
            <select
              value={activeTab}
              onChange={(e) => handleTabChange(e.target.value)}
              className="w-full bg-slate-100 border border-transparent rounded-2xl py-3 pl-11 pr-10 text-xs font-bold text-slate-700 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer transition-all"
            >
              {tabs.map(tab => {
                const emailStr = tab.email ? ` (${tab.email.split('@')[0]})` : '';
                return (
                  <option key={tab.id} value={tab.id}>
                    {tab.name === 'Google Drive' ? `Google Drive${emailStr}` : tab.name}
                  </option>
                );
              })}
            </select>
            {/* Left Icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              {currentTabConfig.provider === 'GOOGLE_DRIVE' ? (
                <HardDrive className="w-4 h-4 text-sky-500" />
              ) : (
                <Database className="w-4 h-4 text-primary" />
              )}
            </div>
            {/* Right Arrow/Chevron */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>

        {/* ── Search + select all bar ── */}
        <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 w-full overflow-x-hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:bg-white focus:border-primary transition-all outline-none"
              placeholder="Cari berkas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {(filteredTabFiles.length > 0 || filteredTabFolders.length > 0) && (
            <button
              onClick={handleToggleSelectAll}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-2xl font-bold text-xs transition-all border ${
                ((filteredTabFiles.length > 0 && filteredTabFiles.every(f => selectedFiles[f.id])) &&
                 (filteredTabFolders.length === 0 || filteredTabFolders.every(folder => selectedFolders[folder.id])))
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="checkbox"
                checked={
                  (filteredTabFiles.length > 0 || filteredTabFolders.length > 0) &&
                  filteredTabFiles.every(f => selectedFiles[f.id]) &&
                  filteredTabFolders.every(folder => selectedFolders[folder.id])
                }
                onChange={handleToggleSelectAll}
                onClick={e => e.stopPropagation()}
                className="w-3.5 h-3.5 accent-white cursor-pointer"
              />
              <span>Semua</span>
            </button>
          )}
        </div>

        {/* ── File & Folder list ── */}
        <div className="flex-1 px-4 py-3 space-y-3">
          {/* Breadcrumb Path */}
          {folderPath.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-slate-50 p-2 rounded-xl border border-slate-100/80 mb-2">
              <button 
                type="button" 
                onClick={() => {
                  setCurrentFolderId(undefined);
                  setFolderPath([]);
                }}
                className="hover:text-primary transition-colors"
              >
                Root
              </button>
              {folderPath.map((p, idx) => (
                <React.Fragment key={p.id}>
                  <ChevronRight className="w-3 h-3 text-slate-300" />
                  <button
                    type="button"
                    disabled={idx === folderPath.length - 1}
                    onClick={() => {
                      const newPath = folderPath.slice(0, idx + 1);
                      setFolderPath(newPath);
                      setCurrentFolderId(p.id);
                    }}
                    className={`hover:text-primary transition-colors max-w-[120px] truncate ${idx === folderPath.length - 1 ? 'text-slate-600 font-extrabold cursor-default' : ''}`}
                  >
                    {p.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-bold text-slate-400">Memuat konten...</p>
            </div>
          ) : filteredTabFiles.length === 0 && filteredTabFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center shadow-inner">
                <Sliders className="w-9 h-9 text-slate-300" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-600">Folder Kosong</p>
                <p className="text-xs font-medium text-slate-400 mt-1 max-w-[200px] leading-relaxed">
                  Tidak ada berkas atau folder di direktori ini.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Folder cards */}
              {filteredTabFolders.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Folder</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredTabFolders.map(folder => {
                      const isChecked = !!selectedFolders[folder.id];
                      return (
                        <div
                          key={folder.id}
                          onDoubleClick={() => handleFolderDoubleClick(folder)}
                          onClick={() => handleToggleFolder(folder)}
                          className={`w-full min-w-0 relative rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden border ${
                            isChecked
                              ? 'bg-primary/5 border-primary shadow-md shadow-primary/10'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between p-3.5">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`p-2.5 rounded-xl ${isChecked ? 'bg-primary text-white' : 'bg-primary/5 text-primary'}`}>
                                <Folder className="w-4.5 h-4.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate" title={folder.name}>
                                  {folder.name}
                                </p>
                                <p className="text-[9px] text-slate-450 font-semibold mt-0.5">
                                  Double click untuk membuka folder
                                </p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              onClick={e => e.stopPropagation()}
                              className="w-4 h-4 accent-primary rounded-lg cursor-pointer shrink-0"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* File cards */}
              {filteredTabFiles.length > 0 && (
                <div className="space-y-2">
                  {filteredTabFolders.length > 0 && <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Berkas</h4>}
                  <div className="space-y-2">
                    {filteredTabFiles.map(file => {
                const isChecked = !!selectedFiles[file.id];
                const isTooLarge = config.maxFileSizeBytes !== -1 && file.size > config.maxFileSizeBytes;
                const isGDriveFile = file.provider === 'GOOGLE_DRIVE';
                return (
                  <div
                    key={file.id}
                    onClick={() => handleToggleFile(file)}
                    className={`w-full min-w-0 relative rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden ${
                      isChecked
                        ? isGDriveFile
                          ? 'bg-sky-50 border-2 border-sky-400 shadow-md shadow-sky-100'
                          : 'bg-primary/5 border-2 border-primary shadow-md shadow-primary/10'
                        : 'bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                    }`}
                  >
                    {/* Selected indicator strip */}
                    {isChecked && (
                      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${isGDriveFile ? 'bg-sky-500' : 'bg-primary'}`} />
                    )}
                    <div className="flex items-center gap-3 p-3.5 pl-4 w-full min-w-0">
                      {/* Custom Checkbox */}
                      <div onClick={e => e.stopPropagation()} className="shrink-0">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${
                            isChecked
                              ? isGDriveFile ? 'bg-sky-500 border-sky-500' : 'bg-primary border-primary'
                              : 'border-slate-300 bg-white'
                          }`}
                          onClick={() => handleToggleFile(file)}
                        >
                          {isChecked && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* File icon */}
                      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                        isGDriveFile ? 'bg-sky-100' : 'bg-blue-50'
                      }`}>
                        {isGDriveFile
                          ? <HardDrive className="w-5 h-5 text-sky-500" />
                          : <Database className="w-5 h-5 text-primary" />
                        }
                      </div>

                      {/* File info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate leading-snug">{file.originalFileName}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isGDriveFile ? 'bg-sky-100 text-sky-600' : 'bg-primary/10 text-primary'
                          }`}>
                            {isGDriveFile ? 'Google Drive' : 'Storage Node'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">{formatSize(file.size)}</span>
                          {file.createdAt && (
                            <span className="text-[10px] text-slate-400">
                              {new Date(file.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                        {isTooLarge && (
                          <div className="mt-1.5 inline-flex items-center gap-1 bg-red-50 border border-red-100 text-red-500 rounded-full px-2 py-0.5">
                            <ShieldAlert className="w-3 h-3" />
                            <span className="text-[9px] font-black">Melebihi batas ({formatSize(config.maxFileSizeBytes)})</span>
                          </div>
                        )}
                      </div>

                      {/* Chevron */}
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-all ${isChecked ? (isGDriveFile ? 'text-sky-400' : 'text-primary') : 'text-slate-300'}`} />
                    </div>
                  </div>
                );
              })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Bottom notes ── */}
        <div className="px-4 pb-4 space-y-3">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-3 bg-primary rounded-full inline-block" />
              Catatan &amp; Ketentuan
            </p>
            <div className="flex gap-2.5 items-start">
              <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                <Clock className="w-3 h-3 text-primary" />
              </div>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Reset kuota harian dilakukan otomatis saat hari berganti (pukul 00.00).</p>
            </div>
            <div className="flex gap-2.5 items-start">
              <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                <ShieldAlert className="w-3 h-3 text-primary" />
              </div>
              <p className="text-[11px] font-medium text-slate-500 leading-relaxed">Batas harian dihitung dari total berkas yang dimigrasikan, bukan jumlah inisiasi.</p>
            </div>
          </div>

          {/* Admin config (mobile) */}
          {isAdmin && (
            <div className="bg-surface-container-low border border-surface-variant rounded-2xl p-4 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <Sliders className="w-3.5 h-3.5 text-primary" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-wider text-on-surface">Admin Config</h4>
              </div>
              <form onSubmit={handleUpdateConfig} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant/80 uppercase">Max Size (MB)</label>
                    <input type="number" value={adminMaxMb} onChange={(e) => setAdminMaxMb(e.target.value)} className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-on-surface-variant/80 uppercase">Daily Limit</label>
                    <input type="number" value={adminDailyLimit} onChange={(e) => setAdminDailyLimit(e.target.value)} className="w-full bg-white border border-outline-variant rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary" required />
                  </div>
                </div>
                <button type="submit" disabled={isUpdatingConfig} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-primary/20">
                  {isUpdatingConfig ? (<><Loader2 className="w-4 h-4 animate-spin" />Memperbarui...</>) : 'Terapkan Konfigurasi'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
      )}

      {/* ── Floating bottom action bar (mobile, appears on file selection) ── */}
      {!isLargeScreen && selectedCount > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl px-4 pt-3 pb-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                  <RefreshCw className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800">{selectedCount} item terpilih</p>
                  <p className="text-xs font-semibold text-slate-400">{formatSize(selectedSize)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={hasTooLargeFiles || isDailyLimitReached}
                  onClick={() => setIsModalOpen(true)}
                  className="bg-primary text-white font-bold py-2.5 px-5 rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Migrasikan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Migration Modal */}
      <MigrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedFiles={selectedFilesList.map(f => ({
          id: f.id,
          name: f.originalFileName,
          size: f.size,
          provider: f.provider,
          externalAccountId: f.externalAccountId
        }))}
        selectedFolders={selectedFoldersList.map(f => ({
          id: f.id,
          name: f.name,
          provider: f.provider,
          externalAccountId: f.externalAccountId
        }))}
        onSuccess={handleMigrationStarted}
      />
    </>
  );
}
