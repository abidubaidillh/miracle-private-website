"use client"

import React from 'react'
import Sidebar from './Sidebar'
import { Bell, Loader2 } from 'lucide-react'
import { useUser } from '@/context/UserContext';

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string; 
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
    const { user, isLoading } = useUser(); 

    const getInitials = (name: string) => {
        if (!name) return 'G';
        const parts = name.split(' ');
        return parts.length > 1 
            ? (parts[0][0] + parts[1][0]).toUpperCase() 
            : parts[0][0].toUpperCase();
    };

    return (
        <div className="flex min-h-screen bg-miracle-background"> 
            <Sidebar />
            
            <main className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* Header dengan konsistensi style baru */}
                <header className="sticky top-0 z-50 bg-miracle-surface/90 backdrop-blur-lg border-b border-gray-100 h-20 flex items-center justify-between px-10 shadow-soft animate-fade-in">
                    
                    {/* Bagian Judul */}
                    <div className="flex flex-col">
                        <h1 className="text-miracle-blue text-3xl font-bold tracking-tight">
                            {title || 'Overview'}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] text-miracle-text-secondary font-bold uppercase tracking-[2px]">
                                Miracle Private Management
                            </p>
                        </div>
                    </div>

                    {/* Bagian Profil & Notifikasi */}
                    <div className="flex items-center gap-6">                        
                        {/* Divider */}
                        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

                        {/* User Profile Card */}
                        <div className="flex items-center gap-3">
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin text-gray-300" />
                            ) : (
                                <>
                                    <div className="flex flex-col text-right">
                                        <span className="text-sm font-semibold text-miracle-text leading-none">
                                            {user?.name || "Guest"}
                                        </span>
                                        <span className="text-xs font-medium text-miracle-blue mt-1">
                                            {user?.role || "Visitor"}
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-miracle-blue to-miracle-light flex items-center justify-center text-white font-bold text-sm shadow-medium">
                                        {getInitials(user?.name || "G")}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>
                
                {/* Area Konten Utama */}
                <div className="p-8">
                    {/* Container agar konten tidak terlalu lebar di layar raksasa */}
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
