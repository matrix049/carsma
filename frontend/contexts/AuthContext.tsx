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
  isInitialized: boolean;
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
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedAdmin = localStorage.getItem(ADMIN_STORAGE_KEY);
        
        // Set state synchronously to avoid race conditions
        if (storedToken && storedAdmin) {
          const adminData = JSON.parse(storedAdmin);
          setToken(storedToken);
          setAdmin(adminData);
        }
      } catch (error) {
        console.error('Failed to load auth data from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(ADMIN_STORAGE_KEY);
      } finally {
        // Delay initialization to ensure state updates are complete
        setTimeout(() => setIsInitialized(true), 0);
      }
    };

    initializeAuth();
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

  // Check if user is authenticated - only after initialization
  const isAuthenticated = isInitialized && token !== null && admin !== null;

  const value: AuthContextType = {
    token,
    admin,
    isAuthenticated: isAuthenticated,
    isInitialized,
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
