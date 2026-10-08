import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import { api, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  quickLoginAs: (role: 'admin' | 'customer') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Rehydrate user and token from storage on boot
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await api.auth.login(credentials);
      setToken(response.token);
      setUser(response.user);
      showToast(`¡Bienvenido de nuevo, ${response.user.name}!`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al iniciar sesión', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await api.auth.register(data);
      setToken(response.token);
      setUser(response.user);
      showToast(`¡Cuenta creada con éxito! Bienvenido, ${response.user.name}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error al registrar usuario', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout();
    setToken(null);
    setUser(null);
    showToast('Has cerrado sesión correctamente.', 'info');
  };

  const quickLoginAs = async (role: 'admin' | 'customer') => {
    const email = role === 'admin' ? 'admin@nexus.com' : 'cliente@nexus.com';
    const password = 'Password123!';
    await login({ email, password });
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
        quickLoginAs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
