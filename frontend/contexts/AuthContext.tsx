'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Admin type definition
interface Admin {
  id: string;
  email: string;
}

// Auth context type
interface AuthContextType {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
}

// Create context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage key
const TOKEN_STORAGE_KEY = 'wall-decoration-auth-token';
const ADMIN_STORAGE_KEY = 'wall-decoration-admin';

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load token and admin from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
      
      if (storedToken) {
        setToken(storedToken);
      }
      
      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin));
      }
    } catch (error) {
      console.error('Failed to load auth data from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Login function - stores JWT token and admin info
  const login = (newToken: string, adminData: Admin) => {
    setToken(newToken);
    setAdmin(adminData);
    
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(adminData));
    } catch (error) {
      console.error('Failed to save auth data to localStorage:', error);
    }
  };

  // Logout function - clears token and admin info
  const logout = () => {
    setToken(null);
    setAdmin(null);
    
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear auth data from localStorage:', error);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = token !== null && admin !== null;

  const value: AuthContextType = {
    token,
    admin,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
