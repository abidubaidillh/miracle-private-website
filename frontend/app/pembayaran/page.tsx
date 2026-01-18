"use client"
import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Search, PlusCircle, Printer, Trash2, Eye } from 'lucide-react'
import { getPayments, createPayment, deletePayment } from '@/lib/paymentActions' 
import { useUser } from '@/context/UserContext'
import { useLoading } from '@/context/LoadingContext'
import PaymentFormModal from '@/components/PaymentFormModal'
import { getAuthToken } from '@/lib/auth'

// Import Sub-Components & Utils
import { formatRupiah, printReceipt, mockUploadService } from '@/components/Pembayaran/PaymentUtils'
import { PaymentStats } from '@/components/Pembayaran/PaymentStats'
import { PayModal, ViewProofModal } from '@/components/Pembayaran/PaymentModals'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function PembayaranPage() {
    const { user } = useUser()
    const { withLoading } = useLoading()
    
    // States
    const [payments, setPayments] = useState<any[]>([])
    const [stats, setStats] = useState({ total_lunas: 0, total_pending: 0, total_uang: 0 })
    const [search, setSearch] = useState('')
    
    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isPayModalOpen, setIsPayModalOpen] = useState(false)
    const [isViewProofOpen, setIsViewProofOpen] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<any>(null)
    const [isUploading, setIsUploading] = useState(false)

    // Permissions
    const canCreate = ['OWNER', 'ADMIN', 'BENDAHARA'].includes(user?.role || '')
    const canDelete = ['OWNER', 'BENDAHARA'].includes(user?.role || '')

    // Fetch Data Logic
    const fetchData = async () => {
        await withLoading(async () => {
            try {
                const res = await getPayments(search)
                setPayments(res.payments || [])
                setStats(res.stats || { total_lunas: 0, total_pending: 0, total_uang: 0 })
            } catch (err) { 
                console.error("Fetch Error:", err)
                setPayments([]) 
            }
        })
    }

    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 500)
        return () => clearTimeout(timer)
    }, [search])

    // Helper Tanggal yang disesuaikan dengan field payment_date dari backend
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Tanggal -'
        const date = new Date(dateString)
        return isNaN(date.getTime()) 
            ? 'Tanggal -' 
            : date.toLocaleDateString('id-ID', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })
    }

    // Action Handlers
    const handleCreate = async (formData: any) => {
        await withLoading(async () => {
            try {
                let proofUrl = null
                if (formData.proof_file) {
                    proofUrl = await mockUploadService(formData.proof_file)
                }
                const payload = { ...formData, proof_image: proofUrl }
                delete payload.proof_file
                
                await createPayment(payload)
                setIsCreateModalOpen(false)
                fetchData()
            } catch (err) {
                alert("Gagal menyimpan data")
            }
        })
    }

    const handleConfirmPay = async (id: string, proofFile: File | null, method: string) => {
        setIsUploading(true)
        try {
            let proofUrl = null
            if (proofFile) proofUrl = await mockUploadService(proofFile)

            const token = getAuthToken()
            const res = await fetch(`${API_URL}/payments/${id}/pay`, {
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status: 'LUNAS', proof_image: proofUrl, method }) 
            })

            if (!res.ok) throw new Error("Gagal update status")
            setIsPayModalOpen(false)
            fetchData()
        } catch (err: any) {
            alert("Gagal: " + err.message)
        } finally {
            setIsUploading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if(!confirm("Yakin hapus data pembayaran ini?")) return
        await withLoading(async () => {
            try {
                await deletePayment(id)
                fetchData()
            } catch (err) { alert("Gagal menghapus data") }
        })
    }

    return (
        <DashboardLayout title="Pembayaran Les">
            {/* 1. Bagian Statistik */}
            <PaymentStats stats={stats} />

            {/* 2. Search & Add Button */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-96">
                    <input 
                        type="text" 
                        placeholder="Cari nama murid..." 
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>
                {canCreate && (
                    <button 
                        onClick={() => setIsCreateModalOpen(true)} 
                        className="bg-[#0077AF] hover:bg-[#005f8d] text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all"
                    >
                        <PlusCircle size={20} /> Input Pembayaran
                    </button>
                )}
            </div>

            {/* 3. Tabel Data */}
            <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 font-semibold text-sm">
                        <tr>
                            <th className="px-6 py-4">Siswa</th>
                            <th className="px-6 py-4">Paket / Judul</th>
                            <th className="px-6 py-4">Total Tagihan</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {payments.length > 0 ? (
                            payments.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{p.students?.name || 'Nama Tidak Ada'}</div>
                                        <div className="text-xs text-gray-500">
                                            {/* Backend menggunakan payment_date */}
                                            {formatDate(p.payment_date || p.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {/* Menampilkan Title jika paket null */}
                                        {p.title || p.pakets?.name || '-'}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-900">
                                        {formatRupiah(p.amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            p.status === 'LUNAS' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            {p.status === 'PENDING' ? (
                                                <button 
                                                    onClick={() => { setSelectedPayment(p); setIsPayModalOpen(true); }}
                                                    className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-xs font-bold"
                                                >
                                                    Bayar
                                                </button>
                                            ) : (
                                                <>
                                                    <button onClick={() => printReceipt(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Cetak Struk">
                                                        <Printer size={18} />
                                                    </button>
                                                    {p.proof_image && (
                                                        <button onClick={() => { setSelectedPayment(p); setIsViewProofOpen(true); }} className="p-2 text-purple-600 hover:bg-purple-50 rounded" title="Lihat Bukti">
                                                            <Eye size={18} />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            {canDelete && (
                                                <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Data pembayaran tidak ditemukan.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 4. Modals */}
            <PaymentFormModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreate} />
            <PayModal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} onConfirm={handleConfirmPay} paymentData={selectedPayment} isUploading={isUploading} />
            <ViewProofModal isOpen={isViewProofOpen} onClose={() => setIsViewProofOpen(false)} imageUrl={selectedPayment?.proof_image} />
        </DashboardLayout>
    )
}