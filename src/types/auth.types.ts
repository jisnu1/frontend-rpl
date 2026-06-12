export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  roles?: string[];
  fullName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  storageQuota?: number;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
}

export interface RefreshResponse {
  message: string;
  accessToken: string;
}
