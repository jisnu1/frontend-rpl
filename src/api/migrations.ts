import apiClient from './apiClient';

export interface MigrationConfig {
  maxFileSizeBytes: number;
  maxDailyLimit: number;
  todayTasksCount: number;
}

export interface MigrationTaskDto {
  id: string;
  batchId: string;
  userId: number;
  fileId: string;
  fileName?: string;
  sourceProvider: string;
  targetProvider: string;
  targetExternalAccountId: number | null;
  deleteSource: boolean;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  progress: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MigrationRequestDto {
  fileIds: string[];
  folderIds?: string[];
  targetProvider: string;
  targetExternalAccountId: number | null;
  sourceExternalAccountId?: number | null;
  deleteSource: boolean;
}


export async function fetchMigrationConfig(): Promise<MigrationConfig> {
  const response = await apiClient.get<MigrationConfig>('/migrations/config');
  return response.data;
}

export async function updateMigrationConfig(newSettings: Record<string, string>): Promise<MigrationConfig> {
  const response = await apiClient.put<MigrationConfig>('/migrations/config', newSettings);
  return response.data;
}

export async function startMigration(request: MigrationRequestDto): Promise<{ success: boolean; batchId: string }> {
  const path = request.targetProvider.toUpperCase() === 'STORAGE_NODE'
    ? '/migrations/storage-node'
    : '/migrations/drive';
  const response = await apiClient.post<{ success: boolean; batchId: string }>(path, request);
  return response.data;
}

export async function fetchMigrationTasks(batchId?: string): Promise<MigrationTaskDto[]> {
  const response = await apiClient.get<MigrationTaskDto[]>('/migrations/tasks', {
    params: batchId ? { batchId } : undefined,
  });
  return response.data;
}

export async function cancelMigrationTask(taskId: string): Promise<{ success: boolean }> {
  const response = await apiClient.post<{ success: boolean }>(`/migrations/tasks/${taskId}/cancel`);
  return response.data;
}

