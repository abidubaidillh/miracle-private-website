// frontend/app/paket-kelas/page.tsx
"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Search, Plus, Pencil, Trash2, Loader2, Package as PackageIcon, BookOpen } from 'lucide-react'
import PaketFormModal from '@/components/PaketFormModal'
import { getPackagesData, deletePackage, Package } from '@/lib/packageActions'

// --- Helper Functions ---

// 1. Format Rupiah (Rp 500.000)
const formatRupiah = (number: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);
}

// 2. Format Ribuan jadi 'k' (Contoh: 70000 jadi 70k)
const formatK = (num: number) => {
    if (num >= 1000) {
       // Membagi 1000 dan membulatkan
       return (num / 1000).toFixed(0) + "k";
    }
    return num.toString();
};

// 3. Mencoba menghitung harga per sesi dari string durasi
const getPricePerSession = (totalPrice: number, durationStr: string) => {
    // Mencari angka pertama di dalam string durasi (misal: "1 Bulan (8 Sesi)" -> nemu angka 1 lalu 8)
    // Kita coba cari angka yang diikuti kata "Sesi" dulu agar lebih akurat
    let match = durationStr.match(/(\d+)\s*(Sesi|sesi)/);
    
    // Jika tidak ada kata "Sesi", ambil angka pertama saja yang ditemukan
    if (!match) {
         match = durationStr.match(/(\d+)/);
    }

    if (match && match[1]) {
        const sessions = parseInt(match[1]);
        if (sessions > 0) {
            const perSession = totalPrice / sessions;
            return `${formatK(perSession)} / sesi`;
        }
    }
    // Jika gagal mendeteksi sesi, kembalikan null agar tidak ditampilkan
    return null;
};


export default function PaketKelasPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [paketData, setPaketData] = useState<Package[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);

    const fetchPackages = async () => {
        setLoading(true)
        try {
            const result = await getPackagesData(searchQuery)
            setPaketData(result.packages)
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchPackages() }, [searchQuery])

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Hapus paket "${name}"? Data yang dihapus tidak bisa dikembalikan.`)) {
            try {
                await deletePackage(id);
                fetchPackages();
            } catch (error) {
                alert("Gagal menghapus paket.");
            }
        }
    }

    // TODO: Ganti dengan session role yang asli nanti
    const userRole = "OWNER"; 
    const canEdit = ["OWNER", "ADMIN"].includes(userRole);

    return (
        <DashboardLayout title="Paket Kelas">
            
            {/* Top Bar: Search & Add Button */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                {/* Search Bar */}
                <div className="w-full max-w-md relative group">
                    <input
                        type="text"
                        placeholder="Cari nama paket..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077AF] transition-colors shadow-sm"
                    />
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                </div>

                {/* Tombol Tambah (Hanya untuk Owner/Admin) */}
                {canEdit && (
                    <button
                        onClick={() => { setEditingPackage(null); setIsModalOpen(true); }}
                        className="flex items-center px-6 py-3 bg-[#00558F] text-white rounded-lg font-bold text-sm hover:bg-[#004475] transition shadow-sm whitespace-nowrap"
                    >
                        <Plus size={18} className="mr-2" /> Tambah Paket Kelas
                    </button>
                )}
            </div>

            {/* --- Content Area (Cards) --- */}
            
            {loading ? (
                // Loading State
                <div className="flex justify-center items-center h-64 text-gray-500">
                    <Loader2 className="animate-spin inline mr-2" size={32}/>Memuat data paket...
                </div>
            ) : paketData.length === 0 ? (
                // Empty State
                <div className="bg-white p-12 text-center text-gray-400 rounded-xl border border-gray-200 shadow-sm">
                    <PackageIcon size={48} className="mx-auto mb-4 opacity-50"/>
                    <p className="text-lg font-semibold">Belum ada paket kelas</p>
                    <p className="text-sm">Silakan tambahkan paket baru.</p>
                </div>
            ) : (
                // GRID CARD LAYOUT
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 justify-items-center md:justify-items-stretch">
                    {paketData.map((p) => {
                        // Hitung harga per sesi untuk tampilan
                        const pricePerSessionStr = getPricePerSession(p.price, p.duration);

                        return (
                        <div 
                            key={p.id} 
                            // Ukuran card dibuat fix sesuai request (w-[346px] h-[222px])
                            // Namun diberi max-w-full agar responsif di layar kecil
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between w-full max-w-[346px] h-[222px] hover:shadow-md transition-shadow relative overflow-hidden"
                        >
                             {/* Hiasan background tipis (opsional, agar mirip desain) */}
                             <div className="absolute top-0 right-0 -mt-4 -mr-4 text-gray-50 opacity-[0.03]">
                                <PackageIcon size={120} />
                             </div>

                            {/* --- Bagian Atas Card --- */}
                            <div>
                                {/* Header: Icon, Nama, Badge Sesi */}
                                <div className="flex justify-between items-start mb-3 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-gray-100 p-2 rounded-lg text-gray-700">
                                            <BookOpen size={20} />
                                        </div>
                                        <h3 className="font-bold text-gray-800 text-lg line-clamp-1" title={p.name}>
                                            {p.name}
                                        </h3>
                                    </div>
                                    {/* Badge Durasi/Sesi */}
                                    <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                                        {p.duration}
                                    </span>
                                </div>

                                {/* Deskripsi Singkat */}
                                <p className="text-gray-500 text-sm line-clamp-2 mb-4 relative z-10">
                                    {p.description || "Tidak ada deskripsi tambahan."}
                                </p>
                            </div>

                            {/* --- Bagian Bawah Card (Harga & Aksi) --- */}
                            <div>
                                {/* Harga */}
                                <div className="mb-5">
                                    <div className="text-2xl font-bold text-[#00558F]">
                                        {formatRupiah(p.price)}
                                    </div>
                                    {/* Menampilkan hint harga per sesi jika berhasil dihitung */}
                                    {pricePerSessionStr && (
                                        <div className="text-xs text-gray-400 font-medium mt-1">
                                            {pricePerSessionStr}
                                        </div>
                                    )}
                                </div>

                                {/* Tombol Aksi (Hanya jika punya akses) */}
                                {canEdit && (
                                    <div className="flex gap-3 relative z-10">
                                        <button 
                                            onClick={() => { setEditingPackage(p); setIsModalOpen(true); }} 
                                            className="flex-1 bg-[#00558F] hover:bg-[#004475] text-white text-sm font-bold py-2 rounded-lg flex items-center justify-center transition-colors"
                                        >
                                            <Pencil size={14} className="mr-2" /> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(p.id, p.name)} 
                                            className="flex-1 bg-white border border-red-500 text-red-500 hover:bg-red-50 text-sm font-bold py-2 rounded-lg flex items-center justify-center transition-colors"
                                        >
                                            <Trash2 size={14} className="mr-2" /> Hapus
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )})}
                </div>
            )}

            {/* Modal Form (Tidak berubah) */}
            <PaketFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchPackages}
                editingPackage={editingPackage}
            />
        </DashboardLayout>
    )
}