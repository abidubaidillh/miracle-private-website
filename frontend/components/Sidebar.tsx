// components/Sidebar.tsx
"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image' // Import Image dari Next.js
// Import Ikon
import { 
    LayoutDashboard, 
    Users, 
    UserCog, 
    Calendar, 
    ClipboardCheck, // Mengganti CheckSquare agar lebih relevan untuk Absensi (opsional, sesuaikan preferensi)
    Package, 
    CreditCard,     // Mengganti DollarSign agar lebih variatif (Pembayaran)
    Wallet, 
    Banknote,       // Mengganti ClipboardList untuk Gaji Mentor agar lebih relevan
    TrendingUp, 
    FileText,       // Mengganti LogOut (ikon menu Laporan jangan LogOut)
    LogOut 
} from 'lucide-react'

// Mapping Ikon ke Menu
// Pastikan href sesuai dengan routing aplikasi Anda
const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Murid', href: '/murid', icon: Users },
    { label: 'Mentor', href: '/mentor', icon: UserCog },
    { label: 'Jadwal Kelas', href: '/jadwal-kelas', icon: Calendar },
    { label: 'Absensi', href: '/absensi', icon: ClipboardCheck },
    { label: 'Paket Kelas', href: '/paket-kelas', icon: Package },
    { label: 'Pembayaran', href: '/pembayaran', icon: CreditCard },
    { label: 'Keuangan', href: '/keuangan', icon: Wallet },
    { label: 'Gaji Mentor', href: '/gaji-mentor', icon: Banknote },
    { label: 'Biaya Operasional', href: '/biaya-operasional', icon: TrendingUp },
    { label: 'Laporan', href: '/laporan', icon: FileText },
]

export default function Sidebar() {
    const pathname = usePathname()

    const handleLogout = () => {
        // TODO: Implement logout logic (misal: hapus token, redirect ke login)
        console.log('Logout clicked')
    }

    return (
        <aside 
            className="fixed left-0 top-0 h-screen w-64 flex flex-col z-20" 
            style={{ backgroundColor: '#0077AF' }} // Warna Sidebar Biru Tua
        >
            {/* Header Sidebar: Logo Lembaga */}
            <div className="flex flex-col items-center justify-center pt-8 pb-4">
                {/* Container Gambar Logo */}
                <div className="relative w-40 h-16"> 
                    <Image
                        src="/logo-lembaga.png" // Pastikan file ini ada di public/
                        alt="Miracle Private Class Logo"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: 'contain' }} // Logo tidak gepeng
                        priority
                    />
                </div>
                {/* Jika ingin tetap menampilkan teks di bawah logo (opsional, jika logo sudah mengandung teks bisa dihapus) */}
                {/* <div className="text-center mt-2">
                    <div className="text-white text-xs font-light tracking-widest">PRIVATE CLASS</div>
                </div> 
                */}
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 py-4 px-4 overflow-y-auto custom-scrollbar">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        // Logic active state: Cocokkan path persis atau sub-path
                        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                        const IconComponent = item.icon
                        
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center px-4 py-3 rounded-lg text-white font-normal text-base transition-all duration-200 ${
                                        isActive 
                                            ? 'bg-white/10 font-semibold shadow-sm' // Highlight menu aktif
                                            : 'hover:bg-white/5 hover:translate-x-1' // Hover effect halus
                                    }`}
                                    style={{ fontFamily: 'Inter', fontSize: '16px' }}
                                >
                                    <IconComponent size={20} className="mr-3" />
                                    {item.label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Logout Button (Bawah Tengah) */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={handleLogout}
                    // Styling tombol logout sesuai permintaan (Solid border/bg transparan)
                    className="w-full flex items-center justify-center px-4 py-3 bg-transparent hover:bg-white/10 text-white font-normal rounded-lg transition-all border border-white/30 hover:border-white/50" 
                    style={{ fontFamily: 'Inter', fontSize: '16px' }}
                >
                    <LogOut size={18} className="mr-2" /> Logout
                </button>
            </div>
        </aside>
    )
}