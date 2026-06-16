import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Search, 
  Database, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Loader2, 
  Sliders, 
  File,
  ChevronRight
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

// Sub-components
import MigrationBanner from './components/MigrationBanner';
import MigrationTabs from './components/MigrationTabs';
import MigrationFileList from './components/MigrationFileList';
import AdminConfigForm from './components/AdminConfigForm';
import MigrationFloatingActionBar from './components/MigrationFloatingActionBar';

import { formatSize } from '../../utils/fileHelpers';

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
    
    // 1. Load External Accounts
    try {
      const accounts = await fetchExternalAccounts();
      const googleAccs = accounts.filter(a => a.provider.toUpperCase().startsWith('GOOGLE'));
      setExternalAccounts(googleAccs);
    } catch (err) {
      console.error('Failed to load external accounts', err);
      toastError('Gagal memuat akun Google Drive.');
    }

    // 2. Load Migration Config
    try {
      const migrationConf = await fetchMigrationConfig();
      setConfig(migrationConf);
      setAdminMaxMb((migrationConf.maxFileSizeBytes / 1024 / 1024).toString());
      setAdminDailyLimit(migrationConf.maxDailyLimit.toString());
    } catch (err) {
      console.error('Failed to load migration config', err);
      toastError('Gagal memuat konfigurasi migrasi.');
    }

    // 3. Load Migration Tasks
    try {
      const tasks = await fetchMigrationTasks();
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
      console.error('Failed to load migration tasks', err);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

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

  const handleToggleSelectAll = () => {
    const allFilesSelected = files.every(file => selectedFiles[file.id]);
    const allFoldersSelected = folders.every(folder => selectedFolders[folder.id]);
    const allSelected = allFilesSelected && allFoldersSelected;

    setSelectedFiles(prev => {
      const updated = { ...prev };
      if (allSelected) {
        files.forEach(file => {
          delete updated[file.id];
        });
      } else {
        files.forEach(file => {
          updated[file.id] = file;
        });
      }
      return updated;
    });

    setSelectedFolders(prev => {
      const updated = { ...prev };
      if (allSelected) {
        folders.forEach(folder => {
          delete updated[folder.id];
        });
      } else {
        folders.forEach(folder => {
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

  const handleClearSelection = () => {
    setSelectedFiles({});
    setSelectedFolders({});
  };

  const handleMigrationStarted = (batchId: string) => {
    setSelectedFiles({});
    setSelectedFolders({});
    setActiveBatchId(batchId);
    localStorage.setItem('activeMigrationBatchId', batchId);
  };

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
          loadInitialData();
        }

      } catch (err) {
        console.error('Failed to poll active migration', err);
      }
    };

    poll();
    const interval = setInterval(poll, 2000);

    return () => clearInterval(interval);
  }, [activeBatchId]);

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

  const hasTooLargeFiles = config.maxFileSizeBytes !== -1 && selectedFilesList.some(f => f.size > config.maxFileSizeBytes);
  const isDailyLimitReached = config.maxDailyLimit !== -1 && config.todayTasksCount >= config.maxDailyLimit;

  // Filter tab folders and files by search query
  const filteredTabFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTabFiles = files.filter(file => 
    file.originalFileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && folders.length === 0 && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-full gap-3 bg-background animate-fadeIn">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-slate-500 font-sans">Memuat data migrasi...</p>
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
      return <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
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
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-md cursor-pointer"
              >
                Kembali ke Daftar Berkas
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-start gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-primary animate-pulse">
              <RefreshCw className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Dashboard Progress Migrasi</h2>
              <p className="text-xs font-semibold text-slate-400">Batch ID: {activeBatchId}</p>
            </div>
          </div>
        </div>

        {/* Global Progress Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between animate-fadeIn">
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
            <div className="flex gap-4 text-[10px] font-bold text-slate-450 pt-1">
              <span>Berhasil: {completedCount}/{totalCount}</span>
              {runningCount > 0 && <span className="animate-pulse text-primary">Berjalan: {runningCount}</span>}
              {failedCount > 0 && <span className="text-red-500">Gagal: {failedCount}</span>}
            </div>
          </div>
        </div>

        {/* List of files in progress */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daftar Berkas Migrasi</h3>
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
                  
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <File className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-xs font-black text-slate-800 truncate" title={task.fileName || task.fileId}>
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
                          className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg border border-red-200 transition-colors cursor-pointer"
                        >
                          Batal
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Provider Direction Visual flow */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-550 w-fit">
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
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>{statusText}</span>
                      <span className="font-black text-slate-700">{Math.round(task.progress || 0)}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${isSuccess ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-primary'}`}
                          style={{ width: `${task.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Error Message if Failed */}
                  {isFailed && task.errorMessage && (
                    <div className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 p-3 rounded-2xl leading-relaxed">
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
            DESKTOP LAYOUT
            ============================================================ */
        <div className="hidden lg:flex p-8 max-w-7xl mx-auto w-full flex-1 space-y-8 flex-col relative animate-fadeIn">

          <MigrationBanner 
            config={config} 
            formatSize={formatSize} 
            isDailyLimitReached={isDailyLimitReached} 
            isLargeScreen={isLargeScreen} 
          />

          <MigrationTabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            isLargeScreen={isLargeScreen} 
          />

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

          {folderPath.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold bg-slate-50 p-3 rounded-2xl border border-slate-100/80 w-fit">
              <button 
                type="button" 
                onClick={() => {
                  setCurrentFolderId(undefined);
                  setFolderPath([]);
                }}
                className="hover:text-primary transition-colors cursor-pointer"
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
                    className={`hover:text-primary transition-colors max-w-[200px] truncate cursor-pointer ${idx === folderPath.length - 1 ? 'text-slate-700 font-extrabold cursor-default' : ''}`}
                  >
                    {p.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}

          <div className="bg-white border border-slate-150/60 rounded-3xl overflow-hidden shadow-sm flex-1">
            <MigrationFileList 
              isLoading={isLoading}
              isLargeScreen={isLargeScreen}
              filteredTabFolders={filteredTabFolders}
              filteredTabFiles={filteredTabFiles}
              selectedFolders={selectedFolders}
              selectedFiles={selectedFiles}
              config={config}
              currentTabConfig={currentTabConfig}
              handleToggleSelectAll={handleToggleSelectAll}
              handleToggleFolder={handleToggleFolder}
              handleToggleFile={handleToggleFile}
              handleFolderDoubleClick={handleFolderDoubleClick}
              formatSize={formatSize}
            />
          </div>

          <AdminConfigForm 
            isAdmin={isAdmin}
            isDailyLimitReached={isDailyLimitReached}
            adminMaxMb={adminMaxMb}
            setAdminMaxMb={setAdminMaxMb}
            adminDailyLimit={adminDailyLimit}
            setAdminDailyLimit={setAdminDailyLimit}
            isUpdatingConfig={isUpdatingConfig}
            handleUpdateConfig={handleUpdateConfig}
            isLargeScreen={isLargeScreen}
          />

        </div>
      ) : (
        /* ============================================================
            MOBILE LAYOUT
            ============================================================ */
        <div className="lg:hidden flex flex-col min-h-screen bg-slate-50 pb-32 w-full overflow-x-hidden animate-fadeIn">

          <MigrationBanner 
            config={config} 
            formatSize={formatSize} 
            isDailyLimitReached={isDailyLimitReached} 
            isLargeScreen={isLargeScreen} 
          />

          <MigrationTabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
            isLargeScreen={isLargeScreen} 
          />

          <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 w-full overflow-x-hidden">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="w-full bg-slate-55 border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary focus:bg-white focus:border-primary transition-all outline-none"
                placeholder="Cari berkas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {(filteredTabFiles.length > 0 || filteredTabFolders.length > 0) && (
              <button
                onClick={handleToggleSelectAll}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-2xl font-bold text-xs transition-all border cursor-pointer ${
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

          <div className="flex-1 px-4 py-3 space-y-3">
            {folderPath.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-slate-50 p-2 rounded-xl border border-slate-100/80 mb-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setCurrentFolderId(undefined);
                    setFolderPath([]);
                  }}
                  className="hover:text-primary transition-colors cursor-pointer"
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
                      className={`hover:text-primary transition-colors max-w-[120px] truncate cursor-pointer ${idx === folderPath.length - 1 ? 'text-slate-600 font-extrabold cursor-default' : ''}`}
                    >
                      {p.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            )}

            <MigrationFileList 
              isLoading={isLoading}
              isLargeScreen={isLargeScreen}
              filteredTabFolders={filteredTabFolders}
              filteredTabFiles={filteredTabFiles}
              selectedFolders={selectedFolders}
              selectedFiles={selectedFiles}
              config={config}
              currentTabConfig={currentTabConfig}
              handleToggleSelectAll={handleToggleSelectAll}
              handleToggleFolder={handleToggleFolder}
              handleToggleFile={handleToggleFile}
              handleFolderDoubleClick={handleFolderDoubleClick}
              formatSize={formatSize}
            />
          </div>

          <AdminConfigForm 
            isAdmin={isAdmin}
            isDailyLimitReached={isDailyLimitReached}
            adminMaxMb={adminMaxMb}
            setAdminMaxMb={setAdminMaxMb}
            adminDailyLimit={adminDailyLimit}
            setAdminDailyLimit={setAdminDailyLimit}
            isUpdatingConfig={isUpdatingConfig}
            handleUpdateConfig={handleUpdateConfig}
            isLargeScreen={isLargeScreen}
          />
        </div>
      )}

      {/* Floating Bottom Action Bar */}
      <MigrationFloatingActionBar 
        selectedCount={selectedCount}
        selectedSize={selectedSize}
        hasTooLargeFiles={hasTooLargeFiles}
        isDailyLimitReached={isDailyLimitReached}
        isSidebarMinimized={isSidebarMinimized}
        isLargeScreen={isLargeScreen}
        onClearSelection={handleClearSelection}
        onMigrateClick={() => setIsModalOpen(true)}
        formatSize={formatSize}
      />

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
