// frontend/context/UserContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Default true sangat penting untuk mencegah redirect saat refresh
  const router = useRouter();

  /**
   * Mengambil data user terbaru dari storage (Cookie/LocalStorage)
   */
  const initializeUser = useCallback(() => {
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
      console.error("Gagal inisialisasi user context:", e);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      // Pastikan loading dimatikan terakhir setelah state user di-set
      setIsLoading(false);
    }
  }, []);

  // Jalankan inisialisasi saat pertama kali aplikasi dimuat (termasuk saat refresh)
  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  /**
   * Fungsi Login: Dipanggil dari halaman login setelah sukses API
   */
  const login = (authObj: AuthObject) => {
    saveAuth(authObj); // Simpan ke cookie via lib/auth
    setUser(authObj.user);
    setIsAuthenticated(true);
    // Redirect dilakukan di halaman login.tsx agar lebih fleksibel
  };

  /**
   * Fungsi Logout: Membersihkan sesi dan melempar user ke login
   */
  const logout = async () => {
    await logoutUser(); // Hapus cookie & storage via lib/auth
    setUser(null);
    setIsAuthenticated(false);
    
    // Gunakan router.replace dan refresh agar middleware mendeteksi cookie kosong
    router.replace('/login');
    router.refresh();
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      isLoading,
      refreshUser: initializeUser 
    }}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Hook custom untuk menggunakan context user
 */
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}