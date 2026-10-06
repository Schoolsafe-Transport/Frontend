import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, RegisterPayload } from '../types/auth';
import { loginApi, registerApi, logoutApi, getMeApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('schoolsafe_access_token');
      if (storedToken) {
        try {
          const profile = await getMeApi();
          setUser(profile);
        } catch (_err) {
          localStorage.removeItem('schoolsafe_access_token');
          localStorage.removeItem('schoolsafe_refresh_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const res = await loginApi(email, password);
      localStorage.setItem('schoolsafe_access_token', res.tokens.accessToken);
      localStorage.setItem('schoolsafe_refresh_token', res.tokens.refreshToken);
      setUser(res.user);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      setError(null);
      setLoading(true);
      const res = await registerApi(payload);
      localStorage.setItem('schoolsafe_access_token', res.tokens.accessToken);
      localStorage.setItem('schoolsafe_refresh_token', res.tokens.refreshToken);
      setUser(res.user);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Registration failed. Please check the entered data.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('schoolsafe_refresh_token') || undefined;
      await logoutApi(refreshToken);
    } catch (_err) {
      // Proceed with local logout regardless of network response
    } finally {
      localStorage.removeItem('schoolsafe_access_token');
      localStorage.removeItem('schoolsafe_refresh_token');
      setUser(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
