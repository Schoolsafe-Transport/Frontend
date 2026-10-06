import axios from 'axios';
import { User, AuthResponse, RegisterPayload, AuthTokens } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer header automatically
apiClient.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('schoolsafe_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatic token refresh interceptor on 401 Unauthorized
apiClient.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh-token')
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('schoolsafe_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post<{ data: AuthTokens }>(
            `${API_BASE_URL}/auth/refresh-token`,
            { refreshToken }
          );
          const newTokens = res.data.data;
          localStorage.setItem('schoolsafe_access_token', newTokens.accessToken);
          localStorage.setItem('schoolsafe_refresh_token', newTokens.refreshToken);

          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return apiClient(originalRequest);
        } catch (_refreshErr) {
          localStorage.removeItem('schoolsafe_access_token');
          localStorage.removeItem('schoolsafe_refresh_token');
          localStorage.removeItem('schoolsafe_user');
          window.location.reload();
        }
      }
    }
    return Promise.reject(error);
  }
);

// System
export const checkServerHealth = async () => {
  const response = await apiClient.get('/health');
  return response.data;
};

// Auth API Calls
export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data.data;
};

export const registerApi = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', payload);
  return response.data.data;
};

export const logoutApi = async (refreshToken?: string): Promise<void> => {
  await apiClient.post('/auth/logout', { refreshToken });
};

export const forgotPasswordApi = async (email: string) => {
  const response = await apiClient.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPasswordApi = async (token: string, newPassword: string) => {
  const response = await apiClient.post('/auth/reset-password', { token, newPassword });
  return response.data;
};

export const getMeApi = async (): Promise<User> => {
  const response = await apiClient.get('/auth/me');
  return response.data.data;
};

// RBAC Demo Endpoints
export const testAdminRoute = async () => {
  const response = await apiClient.get('/auth/admin-only');
  return response.data;
};

export const testSchoolRoute = async () => {
  const response = await apiClient.get('/auth/school-only');
  return response.data;
};

export const testProviderRoute = async () => {
  const response = await apiClient.get('/auth/provider-only');
  return response.data;
};
