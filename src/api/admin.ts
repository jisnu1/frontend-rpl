import apiClient from './apiClient';
import { SubscriptionRequest } from '../types/auth.types';

export interface AppSetting {
  id: number;
  key: string;
  value: string;
  description: string;
}

export interface AdminUserResponse {
  id: number;
  username: string;
  email: string;
  fullName: string;
  storageQuota: number;
  usedStorage: number;
  isActive: boolean;
  aiDailyLimit: number;
  dailyAiRequests: number;
  roles: string[];
  migrationDailyLimit: number;
  migrationMaxFileSize: number;
  subscriptionTier: string;
  subscriptionExpiresAt?: string;
}

export interface UserActivity {
  id: number;
  userId: number;
  username?: string;
  email?: string;
  activityType: string;
  description: string;
  ipAddress: string;
  createdAt: string;
}

export interface TokenHistoryEntry {
  date: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface AiTokenStats {
  todayInputTokens: number;
  todayOutputTokens: number;
  todayTotalTokens: number;
  monthInputTokens: number;
  monthOutputTokens: number;
  monthTotalTokens: number;
  history: TokenHistoryEntry[];
}

export async function fetchAdminSettings(): Promise<AppSetting[]> {
  const response = await apiClient.get<AppSetting[]>('/admin/settings');
  return response.data;
}

export async function updateAdminSettings(settings: Record<string, string>): Promise<void> {
  await apiClient.put('/admin/settings', settings);
}

export async function fetchAdminUsers(): Promise<AdminUserResponse[]> {
  const response = await apiClient.get<AdminUserResponse[]>('/admin/users');
  return response.data;
}

export async function updateUserStatus(userId: number, isActive: boolean): Promise<void> {
  await apiClient.put(`/admin/users/${userId}/status`, { isActive });
}

export async function updateUserAiLimit(userId: number, aiLimit: number): Promise<void> {
  await apiClient.put(`/admin/users/${userId}/ai-limit`, { aiLimit });
}

export async function updateUserStorageQuota(userId: number, quotaBytes: number): Promise<void> {
  await apiClient.put(`/files/users/${userId}/quota`, { quotaBytes });
}

export async function updateUserMigrationLimit(userId: number, migrationLimit: number): Promise<void> {
  await apiClient.put(`/admin/users/${userId}/migration-limit`, { migrationLimit });
}

export async function updateUserMigrationMaxSize(userId: number, maxFileSize: number): Promise<void> {
  await apiClient.put(`/admin/users/${userId}/migration-max-size`, { maxFileSize });
}

export async function fetchUserActivities(page = 0, size = 20): Promise<UserActivity[]> {
  const response = await apiClient.get<UserActivity[]>('/admin/activities', {
    params: { page, size }
  });
  return response.data;
}

export async function fetchAiTokenStats(): Promise<AiTokenStats> {
  const response = await apiClient.get<AiTokenStats>('/admin/ai/token-stats');
  return response.data;
}

export async function fetchSubscriptionRequests(): Promise<SubscriptionRequest[]> {
  const response = await apiClient.get<SubscriptionRequest[]>('/admin/subscription-requests');
  return response.data;
}

export async function approveSubscriptionRequest(requestId: number): Promise<void> {
  await apiClient.post(`/admin/subscription-requests/${requestId}/approve`);
}

export async function rejectSubscriptionRequest(requestId: number): Promise<void> {
  await apiClient.post(`/admin/subscription-requests/${requestId}/reject`);
}

export async function directUpdateUserSubscription(userId: number, tier: string): Promise<void> {
  await apiClient.put(`/admin/users/${userId}/subscription`, null, {
    params: { tier }
  });
}

export async function deleteUser(userId: number): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}
