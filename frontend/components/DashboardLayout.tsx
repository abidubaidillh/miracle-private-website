// components/DashboardLayout.tsx
"use client"

import React from 'react'
import Sidebar from './Sidebar'
import { Bell, Loader2 } from 'lucide-react'
import { useUser } from '@/context/UserContext'; // Gunakan Context

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string; 
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
    // Ambil data langsung dari Context yang sudah sinkron
    const { user, isLoading, logout } = useUser(); 

    // Helper untuk inisial (fallback jika user null)
    const getInitials = (name: string) => {
        return name ? name.charAt(0).toUpperCase() : '?';
    };

    return (
        <div className="flex min-h-screen w-full bg-[#F8F9FA]"> 
            {/* Sidebar Logout Function */}
            <Sidebar logout={logout} />
            
            <main className="flex-1 ml-64 min-h-screen flex flex-col relative">
                
                {/* HEADER */}
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
                            <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                        </button>
                        
                        <div className="flex items-center gap-4 border-l border-gray-200 pl-6 h-10">
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin text-gray-400" />
                            ) : (
                                <>
                                    {/* Data User dari Context */}
                                    <div className="text-right hidden md:block">
                                        <p className="font-semibold text-gray-800 text-sm leading-tight">
                                            {user?.name || "Guest"}
                                        </p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mt-0.5">
                                            {user?.role || "VISITOR"}
                                        </p>
                                    </div>
                                    
                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 font-bold border border-pink-200 shadow-sm text-lg">
                                        {getInitials(user?.name || "")}
                                    </div>
                                </>
                            )}
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