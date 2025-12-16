// components/Sidebar.tsx
"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation' // ✅ Tambah useRouter
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
import { logoutUser } from '@/lib/auth' // ✅ Import fungsi logout

// Hapus interface props karena kita handle logic di sini
// interface SidebarProps { logout?: () => void; }

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

export default function Sidebar() { // Hapus { logout }
    const pathname = usePathname()
    const router = useRouter() // ✅ Hook redirect

    // --- ✅ LOGIC LOGOUT ---
    const handleLogout = async () => {
        await logoutUser(); // Panggil API & Hapus Cookie
        router.push('/login'); // Redirect ke login page (sesuaikan URL login Anda)
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-20 bg-[#0077AF] text-white">
            {/* Header Sidebar: LOGO */}
            <div className="flex flex-col items-center justify-center py-8 border-b border-[#006699]">
                <div className="relative w-40 h-16"> 
                    {/* Pastikan file gambar ada di public/logo-lembaga.png */}
                    <Image
                        src="/logo-lembaga.png" // Sesuaikan path jika berbeda
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
                                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-white text-[#0077AF] font-bold shadow-md' 
                                            : 'text-gray-100 hover:bg-[#006699] hover:text-white'
                                    }`}
                                >
                                    <IconComponent size={20} className={`mr-3 ${isActive ? 'text-[#0077AF]' : 'text-gray-200 group-hover:text-white'}`} />
                                    {item.label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Logout Button */}
            <div className="p-4 mt-auto border-t border-[#006699]">
                <button
                    onClick={handleLogout} // ✅ Panggil handleLogout
                    className="w-full flex items-center justify-center px-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-100 hover:text-white rounded-lg transition-all duration-200 text-sm font-bold"
                >
                    <LogOut size={20} className="mr-2" /> Logout
                </button>
            </div>
        </aside>
    )
}