import apiClient from './apiClient';
import { FileResponse } from './files';
import { FolderResponse, FolderContentResponse } from './folders';

export interface SharedFolderResponse {
  id: number;
  folderId: string;
  folderType: 'LOCAL' | 'GOOGLE_DRIVE';
  shareToken: string;
  permission: 'VIEW' | 'EDIT';
  allowAnonymous: boolean;
  expiresAt: string | null;
  createdAt: string;
  folderName: string;
}

export interface ShareFolderRequest {
  folderId: string;
  folderType: 'LOCAL' | 'GOOGLE_DRIVE';
  permission: 'VIEW' | 'EDIT';
  allowAnonymous: boolean;
  expiresAt: string | null;
}

export interface UpdateShareExpiryRequest {
  expiresAt: string | null;
}

export interface UpdateShareAccessRequest {
  permission: 'VIEW' | 'EDIT';
  allowAnonymous: boolean;
}

/**
 * Membagikan folder lokal atau Google Drive
 */
export async function shareFolder(request: ShareFolderRequest): Promise<SharedFolderResponse> {
  const response = await apiClient.post<SharedFolderResponse>('/shared-folders', request);
  return response.data;
}

/**
 * Memperbarui kedaluwarsa tautan berbagi folder
 */
export async function updateShareFolderExpiry(
  shareToken: string,
  request: UpdateShareExpiryRequest
): Promise<SharedFolderResponse> {
  const response = await apiClient.put<SharedFolderResponse>(`/shared-folders/${shareToken}/expiry`, request);
  return response.data;
}

/**
 * Memperbarui izin dan akses tautan berbagi folder
 */
export async function updateShareFolderAccess(
  shareToken: string,
  request: UpdateShareAccessRequest
): Promise<SharedFolderResponse> {
  const response = await apiClient.put<SharedFolderResponse>(`/shared-folders/${shareToken}/access`, request);
  return response.data;
}

/**
 * Membatalkan tautan berbagi folder (revoke)
 */
export async function revokeSharedFolder(shareToken: string): Promise<void> {
  await apiClient.delete(`/shared-folders/${shareToken}`);
}

/**
 * Mendapatkan daftar folder yang dibagikan oleh saya
 */
export async function fetchSharedFoldersByMe(): Promise<SharedFolderResponse[]> {
  const response = await apiClient.get<SharedFolderResponse[]>('/shared-folders');
  return response.data;
}

/**
 * Mengakses isi folder yang dibagikan secara publik menggunakan share token
 */
export async function fetchSharedFolderContentsPublic(shareToken: string, folderId?: string): Promise<FolderContentResponse> {
  const url = folderId 
    ? `/shared-folders/public/${shareToken}/contents?folderId=${encodeURIComponent(folderId)}`
    : `/shared-folders/public/${shareToken}/contents`;
  const response = await apiClient.get<FolderContentResponse>(url);
  return response.data;
}

/**
 * Mengunggah file ke folder bersama secara publik (anonim / login)
 */
export async function uploadToSharedFolderPublic(
  shareToken: string,
  file: File,
  folderId?: string,
  onProgress?: (percent: number) => void
): Promise<FileResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('size', file.size.toString());

  const url = folderId 
    ? `/shared-folders/public/${shareToken}/upload?folderId=${encodeURIComponent(folderId)}`
    : `/shared-folders/public/${shareToken}/upload`;

  const response = await apiClient.post<FileResponse>(
    url,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }
  );
  return response.data;
}

/**
 * Menghapus file dari folder bersama secara publik (hanya untuk tipe LOCAL dan permission EDIT)
 */
export async function deleteFromSharedFolderPublic(shareToken: string, fileId: string): Promise<void> {
  await apiClient.delete(`/shared-folders/public/${shareToken}/files/${fileId}`);
}
