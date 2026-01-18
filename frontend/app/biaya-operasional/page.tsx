"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useLoading } from '@/context/LoadingContext'
import { useUser } from '@/context/UserContext'
import Swal from 'sweetalert2'
import { Edit, Trash2, AlertCircle } from 'lucide-react'
import { getOperasionalData, getKategoriOperasional, getOperasionalSummary, API_URL_BASE } from '@/lib/financeActions'
import { fetchWithAuth } from '@/lib/apiClient'

// Import Components
import { OperasionalSummary } from '@/components/Operasional/OperasionalSummary'
import { OperasionalFilter } from '@/components/Operasional/OperasionalFilter'
import { OperasionalFormModal } from '@/components/Operasional/OperasionalFormModal'

export default function BiayaOperasionalPage() {
    const { withLoading } = useLoading()
    const { user } = useUser()
    
    const [operasionalList, setOperasionalList] = useState<any[]>([])
    const [kategoriList, setKategoriList] = useState<any[]>([])
    const [summary, setSummary] = useState<any>(null)
    
    // Filters State
    const [searchTerm, setSearchTerm] = useState('')
    const [filterKategori, setFilterKategori] = useState('')
    const [filterTipePeriode, setFilterTipePeriode] = useState('')
    const [filterBulan, setFilterBulan] = useState('')
    const [filterTahun, setFilterTahun] = useState(new Date().getFullYear().toString())
    
    const [showModal, setShowModal] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)

    const canEdit = user?.role === 'OWNER' || user?.role === 'BENDAHARA'

    const fetchData = async () => {
        await withLoading(async () => {
            try {
                const params = new URLSearchParams()
                if (filterKategori) params.append('kategori', filterKategori)
                if (filterTipePeriode) params.append('tipe_periode', filterTipePeriode)
                if (filterBulan) params.append('bulan', filterBulan)
                if (filterTahun) params.append('tahun', filterTahun)
                
                const [op, kat, sum] = await Promise.all([
                    getOperasionalData(params.toString()),
                    getKategoriOperasional(),
                    getOperasionalSummary()
                ])
                setOperasionalList(op.data || [])
                setKategoriList(kat.data || [])
                setSummary(sum)
            } catch (error) { console.error(error) }
        })
    }

    useEffect(() => { fetchData() }, [filterKategori, filterTipePeriode, filterBulan, filterTahun])

    const handleDelete = async (id: string) => {
        if (!canEdit) return
        const result = await Swal.fire({
            title: 'Hapus data?',
            text: 'Data biaya ini akan dihapus permanen',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33'
        })

        if (result.isConfirmed) {
            await withLoading(async () => {
                try {
                    await fetchWithAuth(`${API_URL_BASE}/operasional/${id}`, { method: 'DELETE' })
                    Swal.fire('Berhasil', 'Data dihapus', 'success')
                    fetchData()
                } catch (e) { Swal.fire('Error', 'Gagal menghapus', 'error') }
            })
        }
    }

    const filteredData = operasionalList.filter(item => {
        const query = searchTerm.toLowerCase()
        return item.nama_pengeluaran.toLowerCase().includes(query) ||
               item.kategori_operasional?.nama_kategori.toLowerCase().includes(query)
    })

    const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)

    return (
        <DashboardLayout title="Biaya Operasional">
            {summary && <OperasionalSummary summary={summary} totalData={operasionalList.length} formatCurrency={formatCurrency} />}

            <OperasionalFilter 
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                filterKategori={filterKategori} setFilterKategori={setFilterKategori}
                filterTipePeriode={filterTipePeriode} setFilterTipePeriode={setFilterTipePeriode}
                filterBulan={filterBulan} setFilterBulan={setFilterBulan}
                filterTahun={filterTahun} setFilterTahun={setFilterTahun}
                kategoriList={kategoriList} canEdit={canEdit}
                onAddClick={() => { setEditingItem(null); setShowModal(true); }}
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#0077AF] text-white">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold">Tanggal</th>
                                <th className="px-6 py-4 text-sm font-semibold">Nama Biaya</th>
                                <th className="px-6 py-4 text-sm font-semibold">Kategori</th>
                                <th className="px-6 py-4 text-sm font-semibold">Periode</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold">Jumlah</th>
                                {canEdit && <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredData.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">Data tidak ditemukan</td></tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono">{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-800">{item.nama_pengeluaran}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{item.kategori_operasional?.nama_kategori || '-'}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black ${item.tipe_periode === 'HARIAN' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                                                {item.tipe_periode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-right text-red-600">{formatCurrency(item.jumlah)}</td>
                                        {canEdit && (
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg"><Edit size={16} /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <OperasionalFormModal 
                    isOpen={showModal} onClose={() => setShowModal(false)}
                    editingItem={editingItem} kategoriList={kategoriList}
                    onSuccess={fetchData}
                />
            )}
        </DashboardLayout>
    )
}