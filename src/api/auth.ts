import apiClient from './apiClient';
import { RegisterRequest, LoginRequest, LoginResponse, RefreshResponse, UserInfo } from '../types/auth.types';

export interface UpdateProfileRequest {
  fullName: string;
  phoneNumber: string;
  avatarUrl: string;
}

export interface UpdatePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
}

export async function registerUser(data: RegisterRequest): Promise<void> {
  await apiClient.post('/auth/register', data);
}

export async function verifyRegistration(data: { email: string; otp: string }): Promise<void> {
  await apiClient.post('/auth/verify-registration', data);
}

export async function requestForgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password/request', { email });
}

export async function resetPassword(data: { email: string; otp: string; newPassword: string }): Promise<void> {
  await apiClient.post('/auth/forgot-password/reset', data);
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', data);
  return response.data;
}

export async function refreshToken(): Promise<RefreshResponse> {
  const response = await apiClient.post<RefreshResponse>('/auth/refresh');
  return response.data;
}

export async function fetchUserProfile(token?: string): Promise<UserInfo> {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const response = await apiClient.get<UserInfo>('/users/me', { headers });
  return response.data;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserInfo> {
  const response = await apiClient.put<UserInfo>('/users/me', data);
  return response.data;
}

export async function updatePassword(data: UpdatePasswordRequest): Promise<void> {
  await apiClient.put('/users/me/password', data);
}

export async function logoutUser(): Promise<void> {
  await apiClient.post('/auth/logout');
}

