import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import { User, RegisterPayload } from '../types/auth';
import { loginApi, registerApi, logoutApi, getMeApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
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

  const extractErrorMessage = (err: any, fallback: string): string => {
    const errorData = err.response?.data;
    if (!errorData) {
      return err.message || fallback;
    }

    if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      const messages = errorData.errors
        .map((e: any) => e.message || e.msg)
        .filter(Boolean);
      if (messages.length > 0) {
        return messages.join('. ');
      }
    }

    if (errorData.message && errorData.message !== 'Validation failed') {
      return errorData.message;
    }

    return errorData.message || fallback;
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setError(null);
      setLoading(true);
      const res = await loginApi(email, password);
      localStorage.setItem('schoolsafe_access_token', res.tokens.accessToken);
      localStorage.setItem('schoolsafe_refresh_token', res.tokens.refreshToken);
      setUser(res.user);
      return res.user;
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Login failed. Please check your credentials.');
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<User> => {
    try {
      setError(null);
      setLoading(true);
      const res = await registerApi(payload);
      localStorage.setItem('schoolsafe_access_token', res.tokens.accessToken);
      localStorage.setItem('schoolsafe_refresh_token', res.tokens.refreshToken);
      setUser(res.user);
      return res.user;
    } catch (err: any) {
      const msg = extractErrorMessage(err, 'Registration failed. Please check the entered data.');
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<User | null> => {
    const storedToken = localStorage.getItem('schoolsafe_access_token');
    if (storedToken) {
      try {
        const profile = await getMeApi();
        setUser(profile);
        return profile;
      } catch (_err) {
        // Token might be invalid
      }
    }
    return null;
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
        refreshUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext<AuthContextType | undefined>(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
