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
    LogOut,
    UserPlus // Icon Kelola User
} from 'lucide-react'

// ✅ Gunakan Context, bukan helper auth manual
import { useUser } from '@/context/UserContext'

const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Murid', href: '/murid', icon: Users },
    { label: 'Mentor', href: '/mentor', icon: UserCog },
    { label: 'Jadwal Kelas', href: '/jadwal', icon: Calendar },
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
    
    // ✅ Ambil user & logout dari Context agar state sinkron
    const { user, logout } = useUser()
    const role = user?.role || 'GUEST'

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-20 bg-[#0077AF] text-white transition-all duration-300 shadow-xl">
            
            {/* Header Sidebar: LOGO */}
            <div className="flex flex-col items-center justify-center py-8 border-b border-[#006699]">
                <div className="relative w-40 h-16"> 
                    {/* Pastikan file logo ada di public/logo-lembaga.png */}
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
            <nav className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                        const IconComponent = item.icon
                        
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                                        isActive 
                                            ? 'bg-white text-[#0077AF] font-bold shadow-md' 
                                            : 'text-gray-100 hover:bg-[#006699] hover:text-white'
                                    }`}
                                >
                                    <IconComponent 
                                        size={20} 
                                        className={`mr-3 transition-colors ${
                                            isActive ? 'text-[#0077AF]' : 'text-blue-200 group-hover:text-white'
                                        }`} 
                                    />
                                    {item.label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>

                {/* ✅ MENU ADMIN AREA: Hanya untuk Owner & Admin */}
                {(role === 'OWNER' || role === 'ADMIN') && (
                    <div className="mt-6 pt-4 border-t border-[#006699]/50 animate-fade-in">
                        <p className="px-4 text-xs font-bold text-blue-200 uppercase tracking-wider mb-2">
                            Admin Area
                        </p>
                        <Link
                            href="/kelola-user"
                            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                                pathname.startsWith('/kelola-user')
                                    ? 'bg-white text-[#0077AF] font-bold shadow-md'
                                    : 'text-gray-100 hover:bg-[#006699] hover:text-white'
                            }`}
                        >
                            <UserPlus 
                                size={20} 
                                className={`mr-3 transition-colors ${
                                    pathname.startsWith('/kelola-user') ? 'text-[#0077AF]' : 'text-blue-200 group-hover:text-white'
                                }`} 
                            />
                            Kelola User
                        </Link>
                    </div>
                )}
            </nav>

            {/* Logout Button */}
            <div className="p-4 mt-auto border-t border-[#006699] bg-[#00608c]">
                <button
                    onClick={logout} // ✅ Panggil fungsi logout dari context
                    className="w-full flex items-center justify-center px-4 py-3 bg-red-500/10 hover:bg-red-600 text-red-100 hover:text-white rounded-lg transition-all duration-200 text-sm font-bold border border-transparent hover:border-red-400"
                >
                    <LogOut size={20} className="mr-2" /> Logout
                </button>
            </div>
        </aside>
    )
}