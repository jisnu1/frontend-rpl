import apiClient from './apiClient';
import { FileResponse } from './files';

export interface FolderResponse {
  id: string;
  name: string;
  parentId: string | null;
  userId: number;
  createdAt: string;
}

export interface FolderContentResponse {
  folders: FolderResponse[];
  files: FileResponse[];
  permission?: 'VIEW' | 'EDIT';
  allowAnonymous?: boolean;
}

export interface GoogleDriveItemResponse {
  id: string;
  name: string;
  size: number | null;
  mimeType: string;
  createdTime: string;
}

export interface GoogleDriveFolderContentResponse {
  items: GoogleDriveItemResponse[];
}

/**
 * Mengambil isi folder lokal (berkas & sub-folder)
 */
export async function fetchFolderContents(parentId?: string): Promise<FolderContentResponse> {
  const response = await apiClient.get<FolderContentResponse>('/folders/contents', {
    params: parentId ? { parentId } : {},
  });
  return response.data;
}

/**
 * Membuat folder lokal baru
 */
export async function createFolder(name: string, parentId?: string): Promise<FolderResponse> {
  const response = await apiClient.post<FolderResponse>('/folders', {
    name,
    parentId: parentId || null,
  });
  return response.data;
}

/**
 * Memindahkan folder atau berkas lokal ke folder lain
 */
export async function moveFolderItem(
  sourceId: string,
  targetFolderId: string | null,
  type: 'FILE' | 'FOLDER'
): Promise<void> {
  await apiClient.post('/folders/move', {
    sourceId,
    targetFolderId,
    type,
  });
}

/**
 * Menghapus folder lokal beserta isinya secara permanen dan rekursif
 */
export async function deleteFolder(id: string): Promise<void> {
  await apiClient.delete(`/folders/${id}`);
}

/**
 * Mengambil isi folder Google Drive secara real-time
 */
export async function fetchGoogleDriveFolderContents(
  externalAccountId: number,
  parentId?: string
): Promise<GoogleDriveFolderContentResponse> {
  const response = await apiClient.get<GoogleDriveFolderContentResponse>('/google-drive/folders/contents', {
    params: {
      externalAccountId,
      parentId: parentId || null,
    },
  });
  return response.data;
}

/**
 * Membuat folder baru di Google Drive
 */
export async function createGoogleDriveFolder(
  externalAccountId: number,
  name: string,
  parentId?: string
): Promise<{ id: string }> {
  const response = await apiClient.post<{ id: string }>('/google-drive/folders', {
    externalAccountId,
    name,
    parentId: parentId || null,
  });
  return response.data;
}

/**
 * Memindahkan file atau folder di Google Drive
 */
export async function moveGoogleDriveItem(
  externalAccountId: number,
  fileId: string,
  targetFolderId: string
): Promise<void> {
  await apiClient.post('/google-drive/folders/move', {
    externalAccountId,
    fileId,
    targetFolderId,
  });
}
