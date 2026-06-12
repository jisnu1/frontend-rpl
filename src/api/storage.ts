import apiClient from './apiClient';

export interface UserStorageResponse {
  usedBytes: number;
  quotaBytes: number;
  googleDriveConnected: boolean;
  googleUsedBytes: number | null;
  googleQuotaBytes: number | null;
}

/**
 * Mengambil informasi pemakaian dan batas kuota penyimpanan dari backend VPS
 */
export async function fetchUserStorage(): Promise<UserStorageResponse> {
  const response = await apiClient.get<UserStorageResponse>('/files/me/storage');
  return response.data;
}
