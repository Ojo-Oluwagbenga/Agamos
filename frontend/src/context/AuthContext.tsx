import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    const token = localStorage.getItem('agamos_access_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const userData = await api.auth.getProfile();
      setUser(userData);
    } catch {
      localStorage.removeItem('agamos_access_token');
      localStorage.removeItem('agamos_refresh_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const data = await api.auth.login(credentials);
      localStorage.setItem('agamos_access_token', data.access);
      localStorage.setItem('agamos_refresh_token', data.refresh);
      setUser(data.user);
      success('Welcome Back', `Logged in as ${data.user.first_name || data.user.email}`);
    } catch (err: any) {
      error('Authentication Failed', err.message || 'Invalid credentials');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const data = await api.auth.register(userData);
      localStorage.setItem('agamos_access_token', data.tokens.access);
      localStorage.setItem('agamos_refresh_token', data.tokens.refresh);
      setUser(data.user);
      success('Welcome to AGAMOS', 'Your luxury profile has been created.');
    } catch (err: any) {
      error('Registration Failed', err.message || 'Please verify form fields');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (credential: string) => {
    setIsLoading(true);
    try {
      const data = await api.auth.googleLogin(credential);
      localStorage.setItem('agamos_access_token', data.tokens.access);
      localStorage.setItem('agamos_refresh_token', data.tokens.refresh);
      setUser(data.user);
      success('Google Authentication', `Welcome ${data.user.first_name}`);
    } catch (err: any) {
      error('Google Sign-In Failed', err.message || 'Could not verify Google account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('agamos_access_token');
    localStorage.removeItem('agamos_refresh_token');
    setUser(null);
    success('Signed Out', 'You have been safely disconnected.');
  };

  const updateProfile = async (data: any) => {
    try {
      const updated = await api.auth.updateProfile(data);
      setUser(updated);
      success('Profile Updated', 'Your details have been saved.');
    } catch (err: any) {
      error('Update Failed', err.message);
      throw err;
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN' || (user as any)?.is_staff || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        googleLogin,
        logout,
        updateProfile,
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
