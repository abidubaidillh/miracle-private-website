// components/DashboardLayout.tsx
"use client"

import React, { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { Bell, Loader2 } from 'lucide-react'
// import Image tidak diperlukan di header ini karena logo sudah di sidebar (sesuai request sebelumnya)

// Mock Data User
const useUser = () => {
    const [user, setUser] = useState<{name: string, role: string} | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setUser({ name: "mentor.test", role: "MENTOR" }); 
            setLoading(false);
        }, 500); 
    }, []);

    return { user, loading };
};

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string; 
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const { user, loading } = useUser();

    return (
        // PERBAIKAN DI SINI: Tambahkan 'w-full' dan 'm-0 p-0' untuk memastikan wrapper memenuhi layar
        <div className="flex min-h-screen w-full bg-[#F8F9FA]"> 
            
            <Sidebar />
            
            {/* Main Content Wrapper */}
            <main className="flex-1 ml-64 min-h-screen flex flex-col relative">
                
                {/* HEADER */}
                {/* sticky top-0: Menempel di atas saat scroll
                    z-40: Memastikan header di atas konten tabel/form
                */}
                <header className="bg-white shadow-sm h-[100px] flex justify-between items-center px-8 sticky top-0 z-40">
                    
                    {/* BAGIAN KIRI: JUDUL */}
                    <div className="flex items-center">
                        <h1 
                            className="text-[#0077AF] text-4xl font-normal whitespace-nowrap"
                            style={{ fontFamily: '"Times New Roman", Times, serif' }} 
                        >
                            {title || 'Dashboard'}
                        </h1>
                    </div>

                    {/* BAGIAN KANAN: NOTIFIKASI & PROFIL */}
                    <div className="flex items-center gap-6">
                        <button className="text-gray-500 hover:text-gray-700 relative transition">
                            <Bell size={24} />
                            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                        </button>
                        
                        <div className="flex items-center gap-3 border-l border-gray-200 pl-6 h-10">
                            {loading ? (
                                <Loader2 size={20} className="animate-spin text-gray-400" />
                            ) : (
                                <div className="text-right hidden md:block">
                                    <p className="font-semibold text-gray-800 text-sm">{user?.name}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">{user?.role}</p>
                                </div>
                            )}
                            
                            <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold border border-pink-200 shadow-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </header>
                
                {/* Content Area */}
                <div className="p-8 w-full">
                    {children}
                </div>
            </main>
        </div>
    )
}