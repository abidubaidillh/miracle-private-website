// frontend/context/UserContext.tsx
"use client";

import React, { 
    createContext, 
    useContext, 
    useState, 
    useEffect, 
    ReactNode 
} from 'react';
import { getCurrentUser, saveAuth, clearAuth } from '@/lib/auth'; // Import helper auth

// Interface yang dicocokkan dengan data user dari cookie
interface User {
    id: string;
    email: string;
    role: string;
    // Tambahkan properti nama untuk tampilan, jika tidak ada dari API, ambil dari email
    name: string; 
}

// Interface untuk Context
interface UserContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (authObj: any) => void;
    logout: () => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// =================================================================
// USER CONTEXT PROVIDER
// =================================================================
export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fungsi helper untuk mendapatkan data user dari cookie dan menyiapkannya
    const initializeUser = () => {
        const currentUser = getCurrentUser();
        if (currentUser) {
            const displayName = currentUser.name || currentUser.email.split('@')[0];
            const userWithDisplay: User = { 
                ...currentUser, 
                name: displayName 
            };
            setUser(userWithDisplay);
            setIsAuthenticated(true);
        } else {
            setUser(null);
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        // Panggil saat component mount untuk membaca state dari cookie
        initializeUser();
    }, []);

    // Fungsi Login: Menyimpan data user ke cookie (menggunakan saveAuth dari lib/auth)
    const login = (authObj: any) => {
        saveAuth(authObj); // Simpan ke cookie
        initializeUser(); // Muat ulang state dari cookie
    };

    // Fungsi Logout
    const logout = () => {
        clearAuth(); // Hapus dari cookie
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <UserContext.Provider value={{ user, isAuthenticated, login, logout, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};

// =================================================================
// HOOK PEMAKAIAN CONTEXT
// =================================================================
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        // Ini tidak boleh terjadi jika Provider digunakan dengan benar
        // Tapi penting untuk error handling
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};