import apiClient from './apiClient';

export interface AiWorkspace {
  id: string;
  userId: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiWorkspaceFile {
  id: string;
  originalFileName: string;
  size: number;
  createdAt: string;
  provider: string;
  externalAccountId: string | null;
}

export interface AiWorkspaceNote {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiWorkspaceChat {
  id: string;
  workspaceId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiWorkspaceMessage {
  id: string;
  chatId: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  createdAt: string;
}

export interface AiResponseDto {
  response: string;
}

// Workspace CRUD
export async function fetchWorkspaces(): Promise<AiWorkspace[]> {
  const response = await apiClient.get<AiWorkspace[]>('/ai/workspaces');
  return response.data;
}

export async function fetchWorkspace(workspaceId: string): Promise<AiWorkspace> {
  const response = await apiClient.get<AiWorkspace>(`/ai/workspaces/${workspaceId}`);
  return response.data;
}

export async function createWorkspace(name: string, description: string): Promise<AiWorkspace> {
  const response = await apiClient.post<AiWorkspace>('/ai/workspaces', { name, description });
  return response.data;
}

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  await apiClient.delete(`/ai/workspaces/${workspaceId}`);
}

// Workspace Files
export async function fetchWorkspaceFiles(workspaceId: string): Promise<AiWorkspaceFile[]> {
  const response = await apiClient.get<AiWorkspaceFile[]>(`/ai/workspaces/${workspaceId}/files`);
  return response.data;
}

export async function addWorkspaceFile(workspaceId: string, fileId: string): Promise<void> {
  await apiClient.post(`/ai/workspaces/${workspaceId}/files`, { fileId });
}

export async function removeWorkspaceFile(workspaceId: string, fileId: string): Promise<void> {
  await apiClient.delete(`/ai/workspaces/${workspaceId}/files/${fileId}`);
}

// Workspace Notes
export async function fetchWorkspaceNotes(workspaceId: string): Promise<AiWorkspaceNote[]> {
  const response = await apiClient.get<AiWorkspaceNote[]>(`/ai/workspaces/${workspaceId}/notes`);
  return response.data;
}

export async function createWorkspaceNote(workspaceId: string, title: string, content: string): Promise<AiWorkspaceNote> {
  const response = await apiClient.post<AiWorkspaceNote>(`/ai/workspaces/${workspaceId}/notes`, { title, content });
  return response.data;
}

export async function updateWorkspaceNote(noteId: string, title: string, content: string): Promise<AiWorkspaceNote> {
  const response = await apiClient.put<AiWorkspaceNote>(`/ai/workspaces/notes/${noteId}`, { title, content });
  return response.data;
}

export async function deleteWorkspaceNote(noteId: string): Promise<void> {
  await apiClient.delete(`/ai/workspaces/notes/${noteId}`);
}

// Workspace Chat
export async function getOrCreateActiveChat(workspaceId: string): Promise<AiWorkspaceChat> {
  const response = await apiClient.post<AiWorkspaceChat>(`/ai/workspaces/${workspaceId}/chats/active`);
  return response.data;
}

export async function fetchChatMessages(chatId: string): Promise<AiWorkspaceMessage[]> {
  const response = await apiClient.get<AiWorkspaceMessage[]>(`/ai/workspaces/chats/${chatId}/messages`);
  return response.data;
}

export async function chatWorkspace(workspaceId: string, chatId: string, question: string): Promise<string> {
  const response = await apiClient.post<AiResponseDto>(`/ai/workspaces/${workspaceId}/chats/${chatId}`, { teks: question });
  return response.data.response;
}

// Workspace Doc Generation
export async function generateWorkspaceDoc(workspaceId: string, type: 'faq' | 'study-guide' | 'briefing'): Promise<string> {
  const response = await apiClient.post<AiResponseDto>(`/ai/workspaces/${workspaceId}/generate`, null, {
    params: { type }
  });
  return response.data.response;
}
