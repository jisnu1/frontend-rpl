import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/apiClient';
import { loginUser, registerUser, refreshToken, fetchUserProfile } from '../api/auth';
import { RegisterRequest, LoginRequest, UserInfo } from '../types/auth.types';

interface AuthContextType {
  user: UserInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUserProfileState: (updated: UserInfo) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configure Axios Interceptor for injecting JWT
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
    };
  }, [accessToken]);

  // Configure Axios Interceptor for handling 401 Unauthorized (Auto-refresh)
  useEffect(() => {
    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const isAuthRequest = originalRequest?.url?.includes('/auth/');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
          originalRequest._retry = true;
          try {
            const data = await refreshToken();
            if (data && data.accessToken) {
              setAccessToken(data.accessToken);
              const profile = await fetchUserProfile(data.accessToken);
              setUser(profile);
              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
              return apiClient(originalRequest);
            } else {
              logout();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            // Refresh token failed -> clear session and logout
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Try checking session on initial load
  useEffect(() => {
    async function checkSession() {
      try {
        const data = await refreshToken();
        if (data && data.accessToken) {
          setAccessToken(data.accessToken);
          const profile = await fetchUserProfile(data.accessToken);
          setUser(profile);
        } else {
          logout();
        }
      } catch (err) {
        logout();
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (data: LoginRequest) => {
    const res = await loginUser(data);
    setAccessToken(res.accessToken);
    const profile = await fetchUserProfile(res.accessToken);
    setUser(profile);
    localStorage.setItem('hasSession', 'true');
  };

  const register = async (data: RegisterRequest) => {
    await registerUser(data);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('hasSession');
    // Call backend logout or clear cookie if any
  };

  const updateUserProfileState = (updated: UserInfo) => {
    setUser(prev => prev ? { ...prev, ...updated } : updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        isLoading,
        login,
        register,
        logout,
        updateUserProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
