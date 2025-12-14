// components/DashboardLayout.tsx
"use client"

import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { Bell, User, Loader2 } from 'lucide-react'
import Image from 'next/image' // Penting: Import Image untuk Logo

// --- PLACEHOLDER HOOK DENGAN LOADING STATE ---
interface UserProfile {
    name: string;
    role: string;
}

interface AuthState {
    user: UserProfile | null;
    loading: boolean;
}

// Fungsi placeholder yang mengembalikan data pengguna
const useUser = (): AuthState => {
    const [state, setState] = useState<AuthState>({ user: null, loading: true });

    useEffect(() => {
        setTimeout(() => {
            setState({
                user: {
                    name: "Abid Ubaidillah", 
                    role: "OWNER"      
                },
                loading: false
            });
        }, 500); 
    }, []);

    return state;
};

// Tambahkan prop 'title' di sini
interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string; // Prop optional untuk judul halaman
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const { user, loading } = useUser();

    const userName = user?.name || "Tamu";
    const userRole = user?.role || "Tamu";
    
    // Helper untuk warna ikon user
    const userIconClass = (role: string) => {
        switch (role.toUpperCase()) {
            case 'OWNER': return 'bg-yellow-100 text-yellow-600';
            case 'ADMIN': return 'bg-blue-100 text-blue-600';
            case 'BENDAHARA': return 'bg-green-100 text-green-600';
            case 'MENTOR': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };
    

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 ml-64 min-h-screen flex flex-col">
                
                {/* === HEADER === */}
                <header 
                    className="bg-white shadow-sm flex justify-between items-center sticky top-0 z-10 border-b"
                    style={{
                        height: '120px',    // H = 120
                        width: '100%',      // W = 100% (agar responsif memenuhi layar sebelah sidebar)
                        paddingLeft: '24px', // px-6
                        paddingRight: '24px' // px-6
                    }}
                >
                    
                    {/* BAGIAN KIRI: LOGO & JUDUL HALAMAN */}
                    <div className="flex items-center gap-5"> {/* Gap diperbesar sedikit agar tidak terlalu rapat */}
                        
                        {/* Container Logo (Ukuran disesuaikan dengan header besar) */}
                        <div className="relative w-16 h-16 flex-shrink-0">
                            {/* Pastikan file 'logo-lembaga.png' ada di folder public/ */}
                            <Image
                                src="/logo-lembaga.png" 
                                alt="Logo Lembaga"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                style={{ objectFit: 'contain' }}
                                priority
                            />
                        </div>

                        {/* JUDUL HALAMAN (Data Murid) */}
                        <h1 
                            style={{ 
                                color: '#0077AF', // Warna Biru
                                fontFamily: 'Inter',
                                fontSize: '50px', // Ukuran 50
                                fontWeight: 500,  // Ketebalan Medium (20 invalid di CSS, diganti 500)
                                lineHeight: '1.1', // Line height rapat
                                letterSpacing: '-0.02em' // Sedikit rapat agar rapi di ukuran besar
                            }}
                        >
                            {title || ''}
                        </h1>
                    </div>

                    {/* BAGIAN KANAN: Notifikasi & Profil */}
                    <div className="flex items-center space-x-6"> {/* Spacing diperbesar */}
                        <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 relative transition">
                            <Bell size={28} /> {/* Icon Bell diperbesar sedikit */}
                            <span className="absolute top-2 right-2 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500"></span>
                        </button>
                        
                        <div className="flex items-center space-x-3 border-l pl-6 h-12">
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <Loader2 size={24} className="animate-spin text-gray-400" />
                                    <div className="text-sm">
                                        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userIconClass(userRole)}`}>
                                        <User size={20} />
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-semibold text-gray-800 text-base">{userName}</p>
                                        <p className="text-xs text-gray-500">{userRole}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>
                
                {/* Content Area */}
                <div className="p-4 md:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}