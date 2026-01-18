"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Search, Plus } from 'lucide-react'
import PaketFormModal from '@/components/PaketFormModal'
import { getPackagesData, deletePackage, Package } from '@/lib/packageActions'
import { useLoading } from '@/context/LoadingContext'
import { useUser } from '@/context/UserContext'

// Import Sub-components
import { PaketCard } from '@/components/PaketKelas/PaketCard'
import { PaketEmptyState } from '@/components/PaketKelas/PaketEmptyState'

export default function PaketKelasPage() {
    const { withLoading } = useLoading()
    const { user } = useUser()
    
    const [searchQuery, setSearchQuery] = useState('')
    const [paketData, setPaketData] = useState<Package[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);

    const canEdit = ["OWNER", "ADMIN"].includes(user?.role || '');

    // --- Utils ---
    const formatRupiah = (num: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
    
    const getPricePerSession = (totalPrice: number, durationStr: string) => {
        const match = durationStr.match(/(\d+)/);
        if (match && match[1]) {
            const sessions = parseInt(match[1]);
            if (sessions > 0) {
                const perSession = totalPrice / sessions;
                const formattedK = perSession >= 1000 ? (perSession / 1000).toFixed(0) + "k" : perSession.toString();
                return `${formattedK} / sesi`;
            }
        }
        return null;
    };

    const fetchPackages = async () => {
        await withLoading(async () => {
            try {
                const result = await getPackagesData(searchQuery)
                setPaketData(result.packages || [])
            } catch (err) {
                console.error("Gagal mengambil data:", err);
            }
        })
    }

    useEffect(() => {
        const timer = setTimeout(() => { fetchPackages() }, 500)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Hapus paket "${name}"?`)) return
        await withLoading(async () => {
            try {
                await deletePackage(id);
                fetchPackages();
            } catch (error) { alert("Gagal menghapus paket."); }
        })
    }

    return (
        <DashboardLayout title="Paket Kelas">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div className="w-full max-w-md relative">
                    <input
                        type="text"
                        placeholder="Cari nama paket..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0077AF] outline-none shadow-sm transition-all"
                    />
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                </div>

                {canEdit && (
                    <button
                        onClick={() => { setEditingPackage(null); setIsModalOpen(true); }}
                        className="flex items-center px-6 py-3 bg-[#0077AF] hover:bg-[#006699] text-white rounded-lg font-bold text-sm transition shadow-md"
                    >
                        <Plus size={18} className="mr-2" /> Tambah Paket Kelas
                    </button>
                )}
            </div>

            {/* Content Area */}
            {paketData.length === 0 ? (
                <PaketEmptyState />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paketData.map((p) => (
                        <PaketCard 
                            key={p.id}
                            paket={p}
                            canEdit={canEdit}
                            onEdit={(item) => { setEditingPackage(item); setIsModalOpen(true); }}
                            onDelete={handleDelete}
                            formatRupiah={formatRupiah}
                            getPricePerSession={getPricePerSession}
                        />
                    ))}
                </div>
            )}

            <PaketFormModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingPackage(null); }}
                onSuccess={fetchPackages}
                editingPackage={editingPackage}
            />
        </DashboardLayout>
    )
}