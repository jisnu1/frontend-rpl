import apiClient from './apiClient';

/**
 * Mengirimkan laporan kendala/bug ke developer
 */
export async function submitBugReport(description: string): Promise<void> {
  await apiClient.post('/reports', { description });
}
