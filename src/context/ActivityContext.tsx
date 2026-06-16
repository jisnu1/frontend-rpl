import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import axios from 'axios';
import apiClient from '../api/apiClient';
import { getDownloadUrl } from '../api/files';
import { useToast } from './ToastContext';
import { startMigration, fetchMigrationTasks } from '../api/migrations';
import { useAuth } from './AuthContext';

export interface BackgroundActivity {
  id: string;
  type: 'upload' | 'download' | 'migration';
  name: string;
  progress: number;
  status: 'running' | 'success' | 'error';
  errorMessage?: string;
}

export interface ActivityNotification {
  id: string;
  type: 'upload' | 'download' | 'migration';
  name: string;
  status: 'success' | 'error';
  timestamp: string;
  isRead: boolean;
  errorMessage?: string;
}

interface ActivityContextType {
  activities: BackgroundActivity[];
  notifications: ActivityNotification[];
  unreadCount: number;
  uploadFile: (file: File, provider: any, onUploadSuccess?: () => void, folderId?: string) => Promise<void>;
  downloadFile: (fileId: string, fileName: string, provider: string, fileSize: number, externalAccountId?: number | null) => Promise<void>;
  cancelActivity: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  migrateFiles: (
    fileIds: string[],
    fileNamesMap: Record<string, string>,
    targetProvider: string,
    targetExternalAccountId: number | null,
    deleteSource: boolean,
    folderIds?: string[]
  ) => Promise<{ success: boolean; batchId: string }>;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB

export function ActivityProvider({ children }: { children: ReactNode }) {
  const { accessToken } = useAuth();
  const [activities, setActivities] = useState<BackgroundActivity[]>([]);
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const { success: toastSuccess, error: toastError } = useToast();

  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const activeTasksRef = useRef<Map<string, { type: 'upload' | 'download'; fileId: string; provider?: any; fileName: string }>>(new Map());
  const activePollsRef = useRef<Set<string>>(new Set());

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('horizon_notifications');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved notifications', e);
      }
    }
  }, []);

  // Save notifications to localStorage when changed
  const saveNotifications = (updated: ActivityNotification[]) => {
    setNotifications(updated);
    localStorage.setItem('horizon_notifications', JSON.stringify(updated));
  };

  const addNotification = useCallback((type: 'upload' | 'download' | 'migration', name: string, status: 'success' | 'error', errorMessage?: string) => {
    const newNotif: ActivityNotification = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      name,
      status,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      errorMessage
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev].slice(0, 50); // limit to 50 items
      localStorage.setItem('horizon_notifications', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllNotificationsAsRead = useCallback(() => {
    const updated = notifications.map(n => ({ ...n, isRead: true }));
    saveNotifications(updated);
  }, [notifications]);

  const clearNotifications = useCallback(() => {
    saveNotifications([]);
  }, []);

  const updateActivityProgress = useCallback((id: string, progress: number) => {
    setActivities(prev =>
      prev.map(act => (act.id === id ? { ...act, progress } : act))
    );
  }, []);

  const updateActivityStatus = useCallback((id: string, status: 'success' | 'error', errorMessage?: string) => {
    setActivities(prev =>
      prev.map(act => (act.id === id ? { ...act, status, errorMessage, progress: status === 'success' ? 100 : act.progress } : act))
    );
  }, []);

  // Asynchronous Upload File Implementation
  const uploadFile = useCallback(async (file: File, provider: any, onUploadSuccess?: () => void, folderId?: string) => {
    const actId = 'upload_' + Math.random().toString(36).substring(2, 9);
    const newActivity: BackgroundActivity = {
      id: actId,
      type: 'upload',
      name: file.name,
      progress: 0,
      status: 'running',
    };

    setActivities(prev => [...prev, newActivity]);

    const controller = new AbortController();
    abortControllersRef.current.set(actId, controller);

    try {
      const isGDrive = provider.type === 'GOOGLE_DRIVE';
      const initUrl = isGDrive ? '/google-drive/upload/init' : '/files/init';

      const bodyObj: any = {
        fileName: file.name,
        totalSize: file.size,
        provider: provider.type,
      };

      if (folderId) {
        bodyObj.folderId = folderId;
      }

      if (isGDrive) {
        if (!provider.externalAccountId) {
          throw new Error('Akun Google Drive tidak valid.');
        }
        bodyObj.externalAccountId = provider.externalAccountId;
      }

      // 1. Init Upload Session
      const initRes = await apiClient.post<{ id: string }>(initUrl, bodyObj, { signal: controller.signal });
      const fileId = initRes.data.id;
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

      activeTasksRef.current.set(actId, { type: 'upload', fileId, provider, fileName: file.name });

      // 2. Upload chunks sequentially
      for (let i = 0; i < totalChunks; i++) {
        if (controller.signal.aborted) {
          break;
        }

        const start = i * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append('file', chunk, `chunk-${i}`);

        const chunkUrl = isGDrive
          ? `/google-drive/upload/${fileId}/chunks/${i}`
          : `/files/${fileId}/chunks/${i}`;

        await apiClient.post(chunkUrl, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          signal: controller.signal
        });

        const percent = Math.round(((i + 1) / totalChunks) * 100);
        updateActivityProgress(actId, percent);
      }

      if (controller.signal.aborted) {
        throw new DOMException('Upload canceled by user', 'AbortError');
      }

      updateActivityStatus(actId, 'success');
      addNotification('upload', file.name, 'success');
      toastSuccess(`Berkas "${file.name}" berhasil diunggah.`);
      onUploadSuccess?.();
      
      // Auto-remove active task from panel list after 4 seconds
      setTimeout(() => {
        setActivities(prev => prev.filter(act => act.id !== actId));
      }, 4000);

    } catch (err: any) {
      console.error(err);
      const isCanceled = axios.isCancel(err) || err.name === 'AbortError' || err.message === 'canceled';
      
      if (isCanceled) {
        updateActivityStatus(actId, 'error', 'Unggah dibatalkan.');
      } else {
        const msg = err.response?.data?.message || err.message || 'Gagal mengunggah berkas.';
        updateActivityStatus(actId, 'error', msg);
        addNotification('upload', file.name, 'error');
        toastError(`Gagal mengunggah "${file.name}": ${msg}`);
      }
      
      // Auto-remove active task from panel list after 6 seconds
      setTimeout(() => {
        setActivities(prev => prev.filter(act => act.id !== actId));
      }, 6000);
    } finally {
      abortControllersRef.current.delete(actId);
      activeTasksRef.current.delete(actId);
    }
  }, [addNotification, toastSuccess, toastError, updateActivityProgress, updateActivityStatus]);

  // Asynchronous Download File Implementation
  const downloadFile = useCallback(async (fileId: string, fileName: string, provider: string, fileSize: number, externalAccountId?: number | null) => {
    const actId = 'download_' + Math.random().toString(36).substring(2, 9);
    const newActivity: BackgroundActivity = {
      id: actId,
      type: 'download',
      name: fileName,
      progress: 0,
      status: 'running',
    };

    setActivities(prev => [...prev, newActivity]);

    const controller = new AbortController();
    abortControllersRef.current.set(actId, controller);
    activeTasksRef.current.set(actId, { type: 'download', fileId, provider, fileName });

    try {
      const url = getDownloadUrl(fileId, provider, externalAccountId);
      
      const response = await apiClient.get(url, {
        responseType: 'blob',
        signal: controller.signal,
        onDownloadProgress: (progressEvent) => {
          const loaded = progressEvent.loaded;
          const total = fileSize || progressEvent.total || 0;
          if (total > 0) {
            const percent = Math.round((loaded / total) * 100);
            updateActivityProgress(actId, Math.min(percent, 99)); // Keep at 99% until fully resolved as blob
          } else {
            updateActivityProgress(actId, 50);
          }
        }
      });

      // Save blob to user local file system
      const contentType = (response.headers['content-type'] as string) || 'application/octet-stream';
      const blob = new Blob([response.data], { type: contentType });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);

      updateActivityProgress(actId, 100);
      updateActivityStatus(actId, 'success');
      addNotification('download', fileName, 'success');
      toastSuccess(`Berkas "${fileName}" berhasil diunduh.`);

      // Auto-remove from list after 4 seconds
      setTimeout(() => {
        setActivities(prev => prev.filter(act => act.id !== actId));
      }, 4000);

    } catch (err: any) {
      console.error(err);
      const isCanceled = axios.isCancel(err) || err.name === 'AbortError' || err.message === 'canceled';

      if (isCanceled) {
        updateActivityStatus(actId, 'error', 'Unduhan dibatalkan.');
      } else {
        const msg = err.response?.data?.message || err.message || 'Gagal mengunduh berkas.';
        updateActivityStatus(actId, 'error', msg);
        addNotification('download', fileName, 'error');
        toastError(`Gagal mengunduh "${fileName}": ${msg}`);
      }

      // Auto-remove from list after 6 seconds
      setTimeout(() => {
        setActivities(prev => prev.filter(act => act.id !== actId));
      }, 6000);
    } finally {
      abortControllersRef.current.delete(actId);
      activeTasksRef.current.delete(actId);
    }
  }, [addNotification, toastSuccess, toastError, updateActivityProgress, updateActivityStatus]);

  // Cancel Activity Implementation
  const cancelActivity = useCallback(async (actId: string) => {
    if (actId.startsWith('migration_')) {
      const parts = actId.split('_');
      if (parts.length === 3) {
        const fileId = parts[1];
        const batchId = parts[2];
        try {
          await apiClient.post(`/migrations/tasks/cancel`, null, {
            params: { batchId, fileId }
          });
          toastSuccess('Migrasi berhasil dibatalkan.');
        } catch (e: any) {
          console.error('Failed to notify backend of migration cancellation', e);
          toastError(e.response?.data?.message || 'Gagal membatalkan migrasi.');
        }
      }
      updateActivityStatus(actId, 'error', 'Dibatalkan oleh pengguna.');
      return;
    }

    const task = activeTasksRef.current.get(actId);
    if (!task) return;

    // 1. Abort the HTTP request
    const controller = abortControllersRef.current.get(actId);
    if (controller) {
      controller.abort();
    }

    // 2. Call backend cancel endpoint
    try {
      if (task.type === 'download') {
        const isGDrive = task.provider === 'GOOGLE_DRIVE';
        const cancelUrl = isGDrive 
          ? `/google-drive/download/${task.fileId}/cancel` 
          : `/files/download/${task.fileId}/cancel`;
        await apiClient.post(cancelUrl);
      } else {
        const isGDrive = task.provider === 'GOOGLE_DRIVE' || task.provider?.type === 'GOOGLE_DRIVE';
        const cancelUrl = isGDrive 
          ? `/google-drive/upload/${task.fileId}/cancel` 
          : `/files/${task.fileId}/cancel`;
        await apiClient.post(cancelUrl);
      }
    } catch (e) {
      console.error('Failed to notify backend of cancellation', e);
    }

    // 3. Update status to error/canceled
    updateActivityStatus(actId, 'error', 'Dibatalkan oleh pengguna.');
    addNotification(task.type, task.fileName, 'error');

    // Clean up refs
    abortControllersRef.current.delete(actId);
    activeTasksRef.current.delete(actId);
  }, [updateActivityStatus, addNotification, toastSuccess, toastError]);

  const startPollingForBatch = useCallback((batchId: string, fileNamesMap?: Record<string, string>) => {
    if (activePollsRef.current.has(batchId)) return;
    activePollsRef.current.add(batchId);

    const pollInterval = setInterval(async () => {
      try {
        const tasks = await fetchMigrationTasks(batchId);
        let allFinished = true;

        tasks.forEach(task => {
          const actId = `migration_${task.fileId}_${batchId}`;
          const percentage = Math.round(task.progress || 0);
          const fileName = task.fileName || (fileNamesMap && fileNamesMap[task.fileId]) || 'File';

          if (task.status === 'SUCCESS') {
            setActivities(prev => {
              const act = prev.find(a => a.id === actId);
              if (act && act.status === 'running') {
                addNotification('migration', fileName, 'success');
                setTimeout(() => {
                  setActivities(p => p.filter(a => a.id !== actId));
                }, 4000);
                return prev.map(a => a.id === actId ? { ...a, status: 'success' as const, progress: 100 } : a);
              }
              return prev;
            });
          } else if (task.status === 'FAILED') {
            const errorMsg = task.errorMessage || 'Migrasi gagal.';
            setActivities(prev => {
              const act = prev.find(a => a.id === actId);
              if (act && act.status === 'running') {
                addNotification('migration', fileName, 'error', errorMsg);
                setTimeout(() => {
                  setActivities(p => p.filter(a => a.id !== actId));
                }, 6050);
                return prev.map(a => a.id === actId ? { ...a, status: 'error' as const, errorMessage: errorMsg } : a);
              }
              return prev;
            });
          } else {
            setActivities(prev =>
              prev.map(a => a.id === actId ? { ...a, progress: percentage } : a)
            );
            allFinished = false;
          }
        });

        if (allFinished) {
          clearInterval(pollInterval);
          activePollsRef.current.delete(batchId);
        }
      } catch (err) {
        console.error('Failed to poll migration tasks', err);
      }
    }, 2000);
  }, [addNotification]);

  // Restore running migrations on mount/login
  useEffect(() => {
    if (!accessToken) return;

    async function restoreActiveMigrations() {
      try {
        const tasks = await fetchMigrationTasks();
        const activeTasks = tasks.filter(t => t.status === 'PENDING' || t.status === 'RUNNING');
        if (activeTasks.length > 0) {
          // Group by batchId
          const batchIds = Array.from(new Set(activeTasks.map(t => t.batchId)));
          
          batchIds.forEach(batchId => {
            const batchTasks = activeTasks.filter(t => t.batchId === batchId);
            
            const newActivities = batchTasks.map(task => ({
              id: `migration_${task.fileId}_${batchId}`,
              type: 'migration' as const,
              name: task.fileName || 'File',
              progress: Math.round(task.progress || 0),
              status: 'running' as const,
            }));
            
            setActivities(prev => {
              const filtered = prev.filter(act => !act.id.endsWith(batchId));
              return [...filtered, ...newActivities];
            });

            startPollingForBatch(batchId);
          });
        }
      } catch (err) {
        console.error('Failed to restore active migrations', err);
      }
    }

    const timeout = setTimeout(restoreActiveMigrations, 1500);
    return () => clearTimeout(timeout);
  }, [accessToken, startPollingForBatch]);

  const migrateFiles = useCallback(async (
    fileIds: string[],
    fileNamesMap: Record<string, string>,
    targetProvider: string,
    targetExternalAccountId: number | null,
    deleteSource: boolean,
    folderIds?: string[]
  ) => {
    const res = await startMigration({
      fileIds,
      folderIds,
      targetProvider,
      targetExternalAccountId,
      deleteSource
    });

    if (res.success && res.batchId) {
      const batchId = res.batchId;
      
      const newActivities = [
        ...fileIds.map(fileId => {
          const name = fileNamesMap[fileId] || 'File';
          return {
            id: `migration_${fileId}_${batchId}`,
            type: 'migration' as const,
            name,
            progress: 0,
            status: 'running' as const,
          };
        }),
        ...(folderIds || []).map(folderId => {
          const name = fileNamesMap[folderId] || 'Folder';
          return {
            id: `migration_${folderId}_${batchId}`,
            type: 'migration' as const,
            name: `[Folder] ${name}`,
            progress: 0,
            status: 'running' as const,
          };
        })
      ];

      setActivities(prev => [...prev, ...newActivities]);
      startPollingForBatch(batchId, fileNamesMap);
    }

    return res;
  }, [startPollingForBatch]);

  return (
    <ActivityContext.Provider
      value={{
        activities,
        notifications,
        unreadCount,
        uploadFile,
        downloadFile,
        cancelActivity,
        markAllNotificationsAsRead,
        clearNotifications,
        migrateFiles,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
}
