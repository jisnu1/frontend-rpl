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
  ChevronRight
} from 'lucide-react';
import { fetchMyFiles, FileResponse } from '../../api/files';
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

export default function Migration() {
  const { user } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [files, setFiles] = useState<FileResponse[]>([]);
  const [externalAccounts, setExternalAccounts] = useState<ExternalAccountDto[]>([]);
  const [config, setConfig] = useState<MigrationConfig>({ maxFileSizeBytes: 268435456, maxDailyLimit: 3, todayTasksCount: 0 });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Record<string, FileResponse>>({});
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

  // Load initial data
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [allFiles, accounts, migrationConf, tasks] = await Promise.all([
        fetchMyFiles(),
        fetchExternalAccounts(),
        fetchMigrationConfig(),
        fetchMigrationTasks()
      ]);

      setFiles(allFiles || []);
      const googleAccs = accounts.filter(a => a.provider.toUpperCase() === 'GOOGLE');
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

  // Filter files based on current tab
  const getTabFiles = (tab: TabConfig) => {
    return files.filter(file => {
      if (tab.provider === 'STORAGE_NODE') {
        return file.provider.toUpperCase() === 'STORAGE_NODE';
      } else {
        return file.provider.toUpperCase() === 'GOOGLE_DRIVE' && file.externalAccountId === tab.accountId;
      }
    });
  };

  const currentTabConfig = tabs.find(t => t.id === activeTab) || tabs[0];
  const tabFiles = currentTabConfig ? getTabFiles(currentTabConfig) : [];

  // Filter tab files by search query
  const filteredTabFiles = tabFiles.filter(file => 
    file.originalFileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSize = (bytes: number) => {
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

  // Select all visible files in active tab
  const handleToggleSelectAll = () => {
    const allSelectedInTab = filteredTabFiles.every(file => selectedFiles[file.id]);
    setSelectedFiles(prev => {
      const updated = { ...prev };
      if (allSelectedInTab) {
        // Unselect all in tab
        filteredTabFiles.forEach(file => {
          delete updated[file.id];
        });
      } else {
        // Select all in tab
        filteredTabFiles.forEach(file => {
          updated[file.id] = file;
        });
      }
      return updated;
    });
  };

  // Clear all selections
  const handleClearSelection = () => {
    setSelectedFiles({});
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
  const selectedCount = selectedFilesList.length;
  const selectedSize = selectedFilesList.reduce((acc, f) => acc + f.size, 0);

  // Check if any selected files exceed config limit
  const hasTooLargeFiles = selectedFilesList.some(f => f.size > config.maxFileSizeBytes);

  const isDailyLimitReached = config.todayTasksCount >= config.maxDailyLimit;

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
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full flex-1 space-y-5 md:space-y-8 flex flex-col relative">
      
      {/* Title & Top Description Banner */}
      <div className="bg-gradient-to-r from-primary to-[#0053db] text-white rounded-3xl p-4 md:p-6 shadow-md border border-primary/10 flex flex-col gap-4 md:flex-row md:justify-between md:items-center relative overflow-hidden">
        <div className="space-y-1 z-10">
          <h2 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2">
            One-Click Multi-Cloud Migration
          </h2>
          <p className="text-xs text-white/80 font-semibold max-w-xl">
            Pindahkan atau salin berkas Anda secara massal antarsumber penyimpanan dengan aman.
          </p>
        </div>
        
        {/* Dynamic statistics block */}
        <div className="flex gap-4 z-10 flex-wrap">
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/20 space-y-0.5">
            <span className="text-[9px] font-black text-white/70 uppercase block tracking-wider">Batas Harian hari ini</span>
            <span className="text-xs font-black">{config.todayTasksCount} / {config.maxDailyLimit} migrated</span>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-2xl border border-white/20 space-y-0.5">
            <span className="text-[9px] font-black text-white/70 uppercase block tracking-wider">Maksimal Ukuran File</span>
            <span className="text-xs font-black">{formatSize(config.maxFileSizeBytes)}</span>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="border-b border-slate-100 pb-px flex gap-2 overflow-x-auto custom-scrollbar">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.provider === 'STORAGE_NODE' ? Database : HardDrive;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs transition-all whitespace-nowrap ${
                isActive
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
              }`}
            >
              <TabIcon className="w-4 h-4 shrink-0" />
              <span>{tab.name}</span>
              {tab.email && <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{tab.email}</span>}
            </button>
          );
        })}
      </div>

      {/* Search Input Container */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full max-w-md group">
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

      {/* Floating Action Bar (selection actions) */}
      {selectedCount > 0 && (
        <div className="sticky top-20 z-20 flex justify-center animate-fadeIn px-2">
          <div className="bg-white/85 backdrop-blur-md border border-surface-container shadow-xl rounded-full py-2.5 md:py-3 px-4 md:px-6 flex items-center justify-between gap-3 md:gap-6 max-w-xl w-full">
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800">{selectedCount} Berkas</span>
              <span className="text-[10px] font-bold text-slate-500">{formatSize(selectedSize)}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClearSelection}
                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all"
                title="Kosongkan Pilihan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <button
                type="button"
                disabled={hasTooLargeFiles || isDailyLimitReached}
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-5 rounded-full text-xs transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Migrasikan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Files Table list */}
      <div className="bg-white border border-slate-150/60 rounded-3xl overflow-hidden shadow-sm flex-1">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-bold text-slate-400">Memuat berkas...</p>
          </div>
        ) : filteredTabFiles.length === 0 ? (
          <div className="py-24 text-center text-slate-400 font-bold text-xs flex flex-col items-center gap-2 select-none">
            <Sliders className="w-12 h-12 text-slate-200" />
            Belum ada berkas di dalam penyimpanan ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-black tracking-wider uppercase">
                  <th className="py-3 px-5 w-10 text-center">
                    <input 
                      type="checkbox"
                      checked={filteredTabFiles.length > 0 && filteredTabFiles.every(file => selectedFiles[file.id])}
                      onChange={handleToggleSelectAll}
                      className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary focus:ring-2 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Nama Berkas</th>
                  <th className="py-3 px-4">Ukuran</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Tanggal Dibuat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredTabFiles.map(file => {
                  const isChecked = !!selectedFiles[file.id];
                  const isTooLarge = file.size > config.maxFileSizeBytes;

                  return (
                    <tr 
                      key={file.id} 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                        isChecked ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => handleToggleFile(file)}
                    >
                      <td className="py-3.5 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleFile(file)}
                          className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary focus:ring-2 cursor-pointer"
                        />
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
                      <td className="py-3.5 px-4 text-slate-400">
                        {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Warnings & Admin Dashboard settings */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* User limits warning info */}
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

        {/* Admin Configuration Board */}
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
                  <input
                    type="number"
                    value={adminMaxMb}
                    onChange={(e) => setAdminMaxMb(e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-on-surface-variant/80 uppercase">Daily Limit (Files)</label>
                  <input
                    type="number"
                    value={adminDailyLimit}
                    onChange={(e) => setAdminDailyLimit(e.target.value)}
                    className="w-full bg-white border border-outline-variant rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingConfig}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isUpdatingConfig ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memperbarui...
                  </>
                ) : (
                  'Terapkan Konfigurasi'
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Migration Target & Configuration Dialog */}
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
        onSuccess={handleMigrationStarted}
      />
    </div>
  );
}
