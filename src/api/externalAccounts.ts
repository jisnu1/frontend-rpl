import apiClient from './apiClient';

export interface ExternalAccountDto {
  id: number;
  provider: string;
  email: string;
}

export interface GoogleDriveStorageDto {
  googleDriveConnected: boolean;
  usedBytes: number;
  totalBytes: number;
}

/** Tipe respons asli dari backend (field berbeda dari DTO frontend) */
interface GoogleDriveStorageBackendResponse {
  usedBytes: number;
  quotaBytes: number;
  googleDriveConnected: boolean;
  googleUsedBytes: number | null;
  googleQuotaBytes: number | null;
}

export async function fetchExternalAccounts(): Promise<ExternalAccountDto[]> {
  const response = await apiClient.get<ExternalAccountDto[]>('/external-accounts/me');
  return response.data;
}

export async function getGoogleAuthUrl(): Promise<string> {
  const response = await apiClient.get<string>('/external-accounts/auth-url', {
    params: { provider: 'GOOGLE' }
  });
  return response.data;
}

export async function connectExternalAccount(code: string): Promise<void> {
  await apiClient.post('/external-accounts/init', { token: code }, {
    params: { provider: 'GOOGLE' }
  });
}

export async function disconnectExternalAccount(id: number): Promise<void> {
  await apiClient.delete(`/external-accounts/${id}`);
}

export async function syncGoogleDriveFiles(externalAccountId: number): Promise<void> {
  await apiClient.post('/google-drive/sync', null, {
    params: { externalAccountId }
  });
}

export async function fetchGoogleDriveStorage(externalAccountId: number): Promise<GoogleDriveStorageDto> {
  const response = await apiClient.get<GoogleDriveStorageBackendResponse>('/google-drive/storage', {
    params: { externalAccountId }
  });
  const data = response.data;
  // Memetakan field backend (googleUsedBytes, googleQuotaBytes) ke DTO frontend (usedBytes, totalBytes)
  return {
    googleDriveConnected: data.googleDriveConnected,
    usedBytes: data.googleUsedBytes ?? 0,
    totalBytes: data.googleQuotaBytes ?? 0,
  };
}
