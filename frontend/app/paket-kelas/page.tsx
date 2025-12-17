// frontend/app/paket-kelas/page.tsx
"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Search, Plus, Pencil, Trash2, Package as PackageIcon, BookOpen } from 'lucide-react'
import PaketFormModal from '@/components/PaketFormModal'
import { getPackagesData, deletePackage, Package } from '@/lib/packageActions'
import { useLoading } from '@/context/LoadingContext'
import { useUser } from '@/context/UserContext'

// --- Helper Functions ---
const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);
}

const formatK = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(0) + "k";
    return num.toString();
};

const getPricePerSession = (totalPrice: number, durationStr: string) => {
    let match = durationStr.match(/(\d+)\s*(Sesi|sesi)/);
    if (!match) match = durationStr.match(/(\d+)/);

    if (match && match[1]) {
        const sessions = parseInt(match[1]);
        if (sessions > 0) {
            const perSession = totalPrice / sessions;
            return `${formatK(perSession)} / sesi`;
        }
    }
    return null;
};

export default function PaketKelasPage() {
    const { withLoading } = useLoading()
    const { user } = useUser()
    
    // State
    const [searchQuery, setSearchQuery] = useState('')
    const [paketData, setPaketData] = useState<Package[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);

    // Role Check
    const role = user?.role || ''
    const canEdit = ["OWNER", "ADMIN"].includes(role);

    const fetchPackages = async () => {
        // Menggunakan withLoading untuk blocking loading screen
        await withLoading(async () => {
            try {
                const result = await getPackagesData(searchQuery)
                setPaketData(result.packages || [])
            } catch (err) {
                console.error("Gagal mengambil data paket:", err);
            }
        })
    }

    // Effect untuk inisialisasi dan pencarian (Debounce 500ms)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPackages()
        }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Hapus paket "${name}"? Data yang dihapus tidak bisa dikembalikan.`)) return

        await withLoading(async () => {
            try {
                await deletePackage(id);
                fetchPackages();
            } catch (error) {
                alert("Gagal menghapus paket.");
            }
        })
    }

    return (
        <DashboardLayout title="Paket Kelas">
            
            {/* Top Bar: Search & Add Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                {/* Search Bar */}
                <div className="w-full max-w-md relative">
                    <input
                        type="text"
                        placeholder="Cari nama paket..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077AF] transition-all shadow-sm"
                    />
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                </div>

                {/* Tombol Tambah */}
                {canEdit && (
                    <button
                        onClick={() => { setEditingPackage(null); setIsModalOpen(true); }}
                        className="flex items-center px-6 py-3 bg-[#0077AF] hover:bg-[#006699] text-white rounded-lg font-bold text-sm transition shadow-md whitespace-nowrap"
                    >
                        <Plus size={18} className="mr-2" /> Tambah Paket Kelas
                    </button>
                )}
            </div>

            {/* --- Content Area --- */}
            {paketData.length === 0 ? (
                <div className="bg-white p-12 text-center text-gray-400 rounded-xl border border-gray-200 shadow-sm">
                    <PackageIcon size={48} className="mx-auto mb-4 opacity-50 text-[#0077AF]"/>
                    <p className="text-lg font-semibold text-gray-800">Belum ada paket kelas</p>
                    <p className="text-sm">Silakan tambahkan paket baru melalui tombol di atas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paketData.map((p) => {
                        const pricePerSessionStr = getPricePerSession(p.price, p.duration);

                        return (
                            <div 
                                key={p.id} 
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between w-full h-[225px] hover:shadow-md transition-all relative overflow-hidden group"
                            >
                                {/* Hiasan background */}
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 text-[#0077AF] opacity-[0.05] group-hover:opacity-[0.08] transition-opacity">
                                    <PackageIcon size={120} />
                                </div>

                                <div>
                                    <div className="flex justify-between items-start mb-3 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-50 p-2 rounded-lg text-[#0077AF]">
                                                <BookOpen size={20} />
                                            </div>
                                            <h3 className="font-bold text-gray-800 text-lg line-clamp-1" title={p.name}>
                                                {p.name}
                                            </h3>
                                        </div>
                                        <span className="bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-gray-200">
                                            {p.duration}
                                        </span>
                                    </div>

                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 relative z-10 italic">
                                        {p.description || "Tersedia untuk semua jenjang pendidikan."}
                                    </p>
                                </div>

                                <div className="relative z-10">
                                    <div className="mb-4">
                                        <div className="text-2xl font-black text-[#0077AF]">
                                            {formatRupiah(p.price)}
                                        </div>
                                        {pricePerSessionStr && (
                                            <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                                                Estimasi: {pricePerSessionStr}
                                            </div>
                                        )}
                                    </div>

                                    {canEdit && (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => { setEditingPackage(p); setIsModalOpen(true); }} 
                                                className="flex-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold py-2 rounded-lg flex items-center justify-center transition-colors"
                                            >
                                                <Pencil size={14} className="mr-1.5 text-yellow-600" /> Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(p.id, p.name)} 
                                                className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold py-2 rounded-lg flex items-center justify-center transition-colors"
                                            >
                                                <Trash2 size={14} className="mr-1.5" /> Hapus
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <PaketFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingPackage(null);
                }}
                onSuccess={fetchPackages}
                editingPackage={editingPackage}
            />
        </DashboardLayout>
    )
}