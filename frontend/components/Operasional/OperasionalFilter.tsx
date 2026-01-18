import React from 'react'
import { Search, Plus } from 'lucide-react'

interface FilterProps {
    searchTerm: string; setSearchTerm: (v: string) => void
    filterKategori: string; setFilterKategori: (v: string) => void
    filterTipePeriode: string; setFilterTipePeriode: (v: string) => void
    filterBulan: string; setFilterBulan: (v: string) => void
    filterTahun: string; setFilterTahun: (v: string) => void
    kategoriList: any[]
    canEdit: boolean
    onAddClick: () => void
}

export const OperasionalFilter = ({ 
    searchTerm, setSearchTerm, filterKategori, setFilterKategori, 
    filterTipePeriode, setFilterTipePeriode, filterBulan, setFilterBulan, 
    filterTahun, setFilterTahun, kategoriList, canEdit, onAddClick 
}: FilterProps) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex-1 min-w-[280px]">
                <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text" placeholder="Cari biaya atau kategori..."
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0077AF] outline-none transition-all"
                    />
                </div>
            </div>
            {canEdit && (
                <button onClick={onAddClick} className="bg-[#0077AF] text-white px-5 py-2.5 rounded-lg hover:bg-[#005a8a] transition-all flex items-center gap-2 font-bold shadow-md shadow-blue-100">
                    <Plus size={20} /> Tambah Biaya
                </button>
            )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
            <select value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
                <option value="">Semua Kategori</option>
                {kategoriList.map(k => <option key={k.id} value={k.id}>{k.nama_kategori}</option>)}
            </select>

            <select value={filterTipePeriode} onChange={(e) => setFilterTipePeriode(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
                <option value="">Semua Periode</option>
                <option value="HARIAN">Harian</option>
                <option value="MINGGUAN">Mingguan</option>
                <option value="BULANAN">Bulanan</option>
            </select>

            <select value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
                <option value="">Semua Bulan</option>
                {Array.from({length: 12}, (_, i) => (
                    <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('id-ID', {month: 'long'})}</option>
                ))}
            </select>

            <select value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none">
                {Array.from({length: 5}, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i
                    return <option key={year} value={year}>{year}</option>
                })}
            </select>
        </div>
    </div>
)