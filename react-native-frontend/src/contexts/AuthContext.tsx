import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/apiService';

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  total_points: number;
  available_points: number;
}

interface AuthContextType {
  user: User | null;
  // MODIFIED: 'isLoading' is now 'isInitializing' to be more specific
  isInitializing: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // MODIFIED: Renamed state to be clearer about its purpose (initial app load)
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        apiService.setAuthToken(token);
        await refreshUser();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      // This is now only set to false after the very first check
      setIsInitializing(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // MODIFIED: Removed the global setIsLoading calls from here
    try {
      const response = await apiService.login(email, password);
      
      if (response.success && response.data) {
        await AsyncStorage.setItem('authToken', response.data.token);
        apiService.setAuthToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; error?: string }> => {
    // MODIFIED: Removed the global setIsLoading calls from here
    try {
      const response = await apiService.register(userData);
      
      if (response.success && response.data) {
        await AsyncStorage.setItem('authToken', response.data.token);
        apiService.setAuthToken(response.data.token);
        setUser(response.data.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      apiService.clearAuthToken();
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.getUserProfile();
      if (response.success && response.data) {
        setUser(response.data.user);
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    isInitializing, // MODIFIED: Exporting the renamed state
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};