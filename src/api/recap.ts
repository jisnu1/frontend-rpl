import apiClient from './apiClient';

export interface AiResponseDto {
  response: string;
}

/**
 * Mengirim pesan tanya jawab ke endpoint AI Spring Boot (/api/ai/summary)
 */
export async function fetchAiSummary(question: string): Promise<string> {
  const response = await apiClient.post<AiResponseDto>('/ai/summary', { teks: question });
  return response.data.response;
}

/**
 * Mengambil ringkasan dokumen PDF dari endpoint Spring Boot (/api/ai/summary/pdf/{fileId})
 */
export async function fetchPdfSummary(fileId: string): Promise<string> {
  const response = await apiClient.post<AiResponseDto>(`/ai/summary/pdf/${fileId}`);
  return response.data.response;
}

/**
 * Mengirim pertanyaan berdasarkan konteks dokumen PDF ke endpoint Spring Boot (/api/ai/chat/pdf/{fileId})
 */
export async function fetchPdfChat(fileId: string, question: string): Promise<string> {
  const response = await apiClient.post<AiResponseDto>(`/ai/chat/pdf/${fileId}`, { teks: question });
  return response.data.response;
}
