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
        <div className="flex min-h-screen bg-[#F8FAFC]"> 
            <Sidebar />
            
            <main className="flex-1 ml-64 flex flex-col min-h-screen">
                {/* ✅ TINGGI h-20: Sejajar dengan area logo di sidebar */}
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 h-20 flex items-center justify-between px-10">
                    
                    {/* Bagian Judul */}
                    <div className="flex flex-col">
                        <h1 
                            className="text-[#0077AF] text-3xl font-serif leading-none italic"
                            style={{ fontFamily: '"Times New Roman", Times, serif' }} 
                        >
                            {title || 'Overview'}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[2px]">
                                Miracle Private Management
                            </p>
                        </div>
                    </div>

                    {/* Bagian Profil & Notifikasi (Clean - Tanpa Search) */}
                    <div className="flex items-center gap-6">
                        {/* Notification Bell */}
                        <button className="relative p-2 text-gray-400 hover:text-[#0077AF] hover:bg-gray-50 rounded-full transition-all">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        
                        {/* Divider */}
                        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

                        {/* User Profile Card */}
                        <div className="flex items-center gap-3">
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin text-gray-300" />
                            ) : (
                                <>
                                    <div className="flex flex-col text-right">
                                        <span className="text-xs font-bold text-gray-700 leading-none">
                                            {user?.name || "Guest"}
                                        </span>
                                        <span className="text-[10px] font-medium text-[#0077AF] mt-1">
                                            {user?.role || "Visitor"}
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0077AF] to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
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