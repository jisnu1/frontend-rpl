import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import apiClient from '../api/apiClient';
import { loginUser, registerUser, refreshToken, fetchUserProfile, logoutUser } from '../api/auth';
import { RegisterRequest, LoginRequest, UserInfo } from '../types/auth.types';

interface AuthContextType {
  user: UserInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfileState: (updated: UserInfo) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use ref so the interceptor always reads the LATEST token synchronously
  // (avoids race condition where dashboard API calls fire before useEffect updates the interceptor)
  const accessTokenRef = useRef<string | null>(accessToken);
  accessTokenRef.current = accessToken;

  // Queue parallel API requests while token is refreshing to prevent multiple /refresh calls
  const isRefreshingRef = useRef(false);
  const failedQueueRef = useRef<{ resolve: (token: string | null) => void; reject: (error: any) => void }[]>([]);

  const processQueue = (error: any, token: string | null = null) => {
    failedQueueRef.current.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueueRef.current = [];
  };

  // Configure Axios Interceptor for injecting JWT — register ONCE
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        const token = accessTokenRef.current;
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Configure Axios Interceptor for handling 401 Unauthorized (Auto-refresh)
  useEffect(() => {
    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        const isAuthRequest = originalRequest?.url?.includes('/auth/');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
          originalRequest._retry = true;

          // If already refreshing, queue this request until refresh is done
          if (isRefreshingRef.current) {
            return new Promise((resolve, reject) => {
              failedQueueRef.current.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return apiClient(originalRequest);
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          isRefreshingRef.current = true;

          try {
            const data = await refreshToken();
            if (data && data.accessToken) {
              setAccessToken(data.accessToken);
              localStorage.setItem('accessToken', data.accessToken);
              const profile = await fetchUserProfile(data.accessToken);
              setUser(profile);
              
              processQueue(null, data.accessToken);
              originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
              return apiClient(originalRequest);
            } else {
              logout();
              processQueue(new Error('Refresh failed'));
              return Promise.reject(error);
            }
          } catch (refreshError) {
            // Refresh token failed -> clear session and logout
            logout();
            processQueue(refreshError);
            return Promise.reject(refreshError);
          } finally {
            isRefreshingRef.current = false;
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
      const storedToken = localStorage.getItem('accessToken');
      if (storedToken) {
        try {
          // Attempt to fetch profile using stored access token
          setAccessToken(storedToken);
          const profile = await fetchUserProfile(storedToken);
          setUser(profile);
          setIsLoading(false);
          return;
        } catch (err) {
          console.warn('Stored access token invalid or expired, trying refresh token...', err);
        }
      }

      // Fallback to refresh token cookie if no access token or it expired
      try {
        const data = await refreshToken();
        if (data && data.accessToken) {
          setAccessToken(data.accessToken);
          localStorage.setItem('accessToken', data.accessToken);
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
    localStorage.setItem('accessToken', res.accessToken);
    const profile = await fetchUserProfile(res.accessToken);
    setUser(profile);
  };

  const register = async (data: RegisterRequest) => {
    await registerUser(data);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Failed to logout from backend:', err);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('accessToken');
    }
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
