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
  subscriptionTier?: string;
  subscriptionExpiresAt?: string;
  academicEmail?: string;
  studentVerified?: boolean;
}

export interface SubscriptionRequest {
  id: number;
  userId: number;
  requestedTier: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  xenditInvoiceId?: string;
  invoiceUrl?: string;
  externalId?: string;
  amount?: number;
  paymentStatus?: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
}

export interface RefreshResponse {
  message: string;
  accessToken: string;
}
