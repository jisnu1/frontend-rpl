import apiClient from './apiClient';

export interface FileResponse {
  id: string;
  originalFileName: string;
  size: number;
  createdAt: string;
  provider: string;
  externalAccountId: number | null;
}

/**
 * Mengambil daftar berkas milik pengguna yang aktif
 */
export async function fetchMyFiles(): Promise<FileResponse[]> {
  const response = await apiClient.get<FileResponse[]>('/files');
  return response.data;
}

/**
 * Menghapus berkas permanen berdasarkan ID berkas dan provider
 */
export async function deleteFile(id: string, provider?: string): Promise<void> {
  if (provider?.toUpperCase() === 'GOOGLE_DRIVE') {
    await apiClient.delete(`/google-drive/files/${id}`);
  } else {
    await apiClient.delete(`/files/${id}`);
  }
}

/**
 * Mendapatkan URL streaming unduhan riil
 */
export function getDownloadUrl(fileId: string, provider: string): string {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090/api';
  if (provider?.toUpperCase() === 'GOOGLE_DRIVE') {
    return `${baseUrl}/google-drive/download/${fileId}/stream`;
  }
  return `${baseUrl}/files/download/${fileId}/stream`;
}

/**
 * Mendapatkan URL preview inline untuk file pribadi (browser render langsung)
 */
export function getPreviewUrl(fileId: string): string {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090/api';
  return `${baseUrl}/preview/${fileId}`;
}
