// frontend/context/UserContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
// ✅ Import logoutUser di sini
import { getCurrentUser, saveAuth, logoutUser, AuthObject } from '@/lib/auth'; 

interface User {
  id: string;
  email: string;
  role: string;
  name?: string;
}

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (authObj: AuthObject) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const initializeUser = () => {
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeUser();
  }, []);

  const login = (authObj: AuthObject) => {
    saveAuth(authObj);
    initializeUser();
  };

  const logout = async () => {
    // ✅ Panggil fungsi dari lib/auth
    await logoutUser(); 
    
    // Reset state lokal
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect
    router.push('/login');
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated, login, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}