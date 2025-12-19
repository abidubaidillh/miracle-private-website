"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
    LayoutDashboard, Users, UserCog, Calendar, CheckSquare, 
    Package, CreditCard, ClipboardList, LogOut, UserPlus, 
    User, PieChart, ShoppingBag, ChevronRight
} from 'lucide-react'
import { logoutUser, getUserRole } from '@/lib/auth'

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [role, setRole] = useState<string | null>(null)

    useEffect(() => {
        setRole(getUserRole())
    }, [])

    const handleLogout = async () => {
        if(confirm("Apakah Anda yakin ingin logout?")) {
            await logoutUser();
            router.push('/login');
        }
    }

    // --- LOGIC MENU GENERATOR ---
    const dashboardMenu = { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }
    const operationalMenus = [
        { label: 'Murid', href: '/murid', icon: Users },
        { label: 'Mentor', href: '/mentor', icon: UserCog },
        { label: 'Jadwal Kelas', href: '/jadwal', icon: Calendar },
        { label: 'Absensi', href: '/absensi', icon: CheckSquare },
        { label: 'Paket Kelas', href: '/paket-kelas', icon: Package },
    ]
    const financeMenus = [
        { label: 'Ringkasan Keuangan', href: '/keuangan', icon: PieChart },
        { label: 'Pembayaran Les', href: '/pembayaran', icon: CreditCard },
        { label: 'Gaji Mentor', href: '/gaji-mentor', icon: ClipboardList },
        { label: 'Biaya Operasional', href: '/biaya-operasional', icon: ShoppingBag },
    ]
    const mentorMenus = [
        { label: 'Profil Saya', href: '/mentor/me', icon: User },
        { label: 'Jadwal Saya', href: '/jadwal', icon: Calendar },
        { label: 'Absensi Siswa', href: '/absensi', icon: CheckSquare },
        { label: 'Riwayat Gaji', href: '/gaji-mentor', icon: ClipboardList },
    ]

    let menuGroups: { title: string, items: any[] }[] = []

    if (role === 'OWNER') {
        menuGroups = [
            { title: 'Utama', items: [dashboardMenu] },
            { title: 'Operasional', items: operationalMenus },
            { title: 'Keuangan', items: financeMenus },
            { title: 'System', items: [{ label: 'Kelola User', href: '/kelola-user', icon: UserPlus }] }
        ]
    } else if (role === 'ADMIN') {
        menuGroups = [
            { title: 'Utama', items: [dashboardMenu] },
            { title: 'Operasional', items: [...operationalMenus, { label: 'Pembayaran', href: '/pembayaran', icon: CreditCard }] },
            { title: 'System', items: [{ label: 'Kelola User', href: '/kelola-user', icon: UserPlus }] }
        ]
    } else if (role === 'BENDAHARA') {
        menuGroups = [
            { title: 'Keuangan', items: financeMenus },
            { title: 'Data Referensi', items: [{ label: 'Data Murid', href: '/murid', icon: Users }, { label: 'Data Paket', href: '/paket-kelas', icon: Package }] }
        ]
    } else if (role === 'MENTOR') {
        menuGroups = [{ title: 'Mentor Area', items: mentorMenus }]
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-50 bg-[#0077AF] text-white shadow-2xl">
            {/* ✅ TINGGI DISAMAKAN: h-20 (80px) agar sejajar dengan Header */}
            <div className="h-20 flex items-center justify-center px-6 bg-[#006da1] border-b border-white/10">
                <div className="relative w-full h-10 transition-transform hover:scale-105 duration-300"> 
                    <Image src="/logo-lembaga.png" alt="Logo" fill style={{ objectFit: 'contain' }} priority />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-7 custom-scrollbar">
                {menuGroups.map((group, gIdx) => (
                    <div key={gIdx}>
                        <p className="px-4 text-[10px] font-black text-blue-200 uppercase tracking-[2px] mb-3 opacity-60">
                            {group.title}
                        </p>
                        <ul className="space-y-1">
                            {group.items.map((item: any, iIdx: number) => {
                                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                                const Icon = item.icon
                                return (
                                    <li key={iIdx}>
                                        <Link href={item.href} className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                                            isActive 
                                            ? 'bg-white text-[#0077AF] font-bold shadow-lg shadow-black/10' 
                                            : 'text-blue-50 hover:bg-white/10'
                                        }`}>
                                            <div className="flex items-center gap-3">
                                                <Icon size={18} className={isActive ? 'text-[#0077AF]' : 'text-blue-300 group-hover:text-white'} />
                                                <span>{item.label}</span>
                                            </div>
                                            {isActive && <ChevronRight size={14} />}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Logout Footer */}
            <div className="p-4 bg-[#006da1] border-t border-white/10">
                <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-100 hover:text-white transition-all duration-300 font-bold text-xs"
                >
                    <LogOut size={16} />
                    <span>Keluar</span>
                </button>
            </div>
        </aside>
    )
}