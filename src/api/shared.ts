import apiClient from './apiClient';

export interface SharedFileDto {
  id: string;
  originalFileName: string;
  size: number;
  ownerEmail: string;
  createdAt: string;
  provider: string;
}

export interface ShareFileRequest {
  email?: string;
  isPublic?: boolean;
  expiresInDays?: number;
  expiresInHours?: number;
}

export interface ShareFileResponse {
  id: number;
  email: string | null;
  isPublic: boolean;
  shareToken: string | null;
  shareLink: string | null;
  expiresAt: string | null;
}

export async function fetchSharedWithMe(): Promise<SharedFileDto[]> {
  let localData: SharedFileDto[] = [];
  let gdriveData: SharedFileDto[] = [];
  
  try {
    const res = await apiClient.get<SharedFileDto[]>('/files/share/shared-with-me');
    localData = res.data || [];
  } catch (e) {
    console.error('Gagal mengambil berkas lokal shared-with-me:', e);
  }
  
  try {
    const res = await apiClient.get<SharedFileDto[]>('/google-drive/share/shared-with-me');
    gdriveData = res.data || [];
  } catch (e) {
    console.error('Gagal mengambil berkas Google Drive shared-with-me:', e);
  }
  
  return [...localData, ...gdriveData];
}

export async function shareFile(fileId: string, request: ShareFileRequest, provider?: string): Promise<ShareFileResponse> {
  const isGDrive = provider === 'GOOGLE_DRIVE';
  const path = isGDrive ? `/google-drive/share/${fileId}` : `/files/share/${fileId}`;
  const response = await apiClient.post<ShareFileResponse>(path, request);
  return response.data;
}

export async function unshareFile(fileId: string, userId: number, provider?: string): Promise<void> {
  const isGDrive = provider === 'GOOGLE_DRIVE';
  const path = isGDrive ? `/google-drive/share/${fileId}/${userId}` : `/files/share/${fileId}/${userId}`;
  await apiClient.delete(path);
}

export async function unshareFileById(shareId: number, provider?: string): Promise<void> {
  const isGDrive = provider === 'GOOGLE_DRIVE' || provider === 'google';
  const path = isGDrive ? `/google-drive/share/cancel/${shareId}` : `/files/share/cancel/${shareId}`;
  await apiClient.delete(path);
}

export async function fetchPublicFileInfo(shareToken: string, provider: string): Promise<SharedFileDto> {
  const path = provider === 'google'
    ? `/google-drive/share/public/info/${shareToken}`
    : `/files/share/public/info/${shareToken}`;
  const response = await apiClient.get<SharedFileDto>(path);
  return response.data;
}

export function getPublicDownloadUrl(shareToken: string, provider: string, download = false): string {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090/api';
  const path = provider === 'google'
    ? `/google-drive/share/public/download/${shareToken}`
    : `/files/share/public/download/${shareToken}`;
  return `${baseUrl}${path}${download ? '?download=true' : ''}`;
}

/**
 * URL preview inline untuk file publik via share token (endpoint preview standalone)
 */
export function getPublicPreviewUrl(shareToken: string, provider: string): string {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090/api';
  const prov = provider === 'google' || provider?.toUpperCase() === 'GOOGLE_DRIVE' ? 'google' : 'local';
  return `${baseUrl}/preview/public/${prov}/${shareToken}`;
}


export interface SharedByMeDto {
  id: number;
  fileId: string;
  originalFileName: string;
  size: number;
  createdAt: string;
  provider: string;
  isPublic: boolean;
  shareToken: string | null;
  shareLink: string | null;
  expiresAt: string | null;
  sharedWithEmail: string | null;
}

export async function fetchSharedByMe(): Promise<SharedByMeDto[]> {
  let localData: SharedByMeDto[] = [];
  let gdriveData: SharedByMeDto[] = [];
  
  try {
    const res = await apiClient.get<SharedByMeDto[]>('/files/share/shared-by-me');
    localData = res.data || [];
  } catch (e) {
    console.error('Gagal mengambil berkas lokal shared-by-me:', e);
  }
  
  try {
    const res = await apiClient.get<SharedByMeDto[]>('/google-drive/share/shared-by-me');
    gdriveData = res.data || [];
  } catch (e) {
    console.error('Gagal mengambil berkas Google Drive shared-by-me:', e);
  }
  
  return [...localData, ...gdriveData];
}
