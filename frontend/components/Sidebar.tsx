// components/Sidebar.tsx
"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { 
    LayoutDashboard, 
    Users, 
    UserCog, 
    Calendar, 
    CheckSquare, 
    Package, 
    CreditCard, 
    Wallet, 
    ClipboardList, 
    TrendingUp, 
    FileText, 
    LogOut 
} from 'lucide-react'

// SESUAIKAN HREF DENGAN HASIL TREE FOLDER ANDA
const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Murid', href: '/murid', icon: Users },
    { label: 'Mentor', href: '/mentor', icon: UserCog },
    { label: 'Jadwal Kelas', href: '/jadwal', icon: Calendar }, // Sesuai folder "jadwal"
    { label: 'Absensi', href: '/absensi', icon: CheckSquare },
    { label: 'Paket Kelas', href: '/paket-kelas', icon: Package },
    { label: 'Pembayaran', href: '/pembayaran', icon: CreditCard },
    { label: 'Keuangan', href: '/keuangan', icon: Wallet },
    { label: 'Gaji Mentor', href: '/gaji-mentor', icon: ClipboardList },
    { label: 'Biaya Operasional', href: '/biaya-operasional', icon: TrendingUp },
    { label: 'Laporan', href: '/laporan', icon: FileText },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-20 bg-[#0077AF] text-white">
            {/* Header Sidebar: LOGO */}
            <div className="flex flex-col items-center justify-center py-8">
                <div className="relative w-40 h-16"> 
                    <Image
                        src="/logo-lembaga.png" 
                        alt="Miracle Private Class"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: 'contain' }} 
                        priority
                    />
                </div>
            </div>

            {/* Menu Navigasi */}
            <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                        const IconComponent = item.icon
                        
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-white/20 shadow-sm font-semibold' 
                                            : 'hover:bg-white/10'
                                    }`}
                                >
                                    <IconComponent size={18} className="mr-3" />
                                    {item.label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-4 mt-auto mb-4">
                <button
                    className="w-full flex items-center justify-center px-4 py-3 bg-transparent border border-white/40 hover:bg-white/10 text-white rounded-lg transition-all text-sm font-medium"
                >
                    <LogOut size={18} className="mr-2" /> Logout
                </button>
            </div>
        </aside>
    )
}