"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Search, PlusCircle, Printer, Trash2, CreditCard } from 'lucide-react'
import { getPayments, createPayment, deletePayment } from '@/lib/paymentActions'
import { useUser } from '@/context/UserContext'
import { useLoading } from '@/context/LoadingContext'
import PaymentFormModal from '@/components/PaymentFormModal'

// Format Rupiah
const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

// Helper Cetak Struk
const printReceipt = (payment: any) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (printWindow) {
        printWindow.document.write(`
            <html>
                <head>
                    <title>Struk Pembayaran - Miracle Private</title>
                    <style>
                        body { font-family: 'Courier New', monospace; padding: 20px; text-align: center; }
                        .header { border-bottom: 2px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                        .content { text-align: left; margin-bottom: 20px; }
                        .total { border-top: 2px dashed #000; padding-top: 10px; font-weight: bold; font-size: 1.2em; }
                        .footer { font-size: 0.8em; color: #555; margin-top: 30px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>MIRACLE PRIVATE</h2>
                        <p>Bukti Pembayaran Les</p>
                        <p>${new Date(payment.payment_date).toLocaleDateString('id-ID')}</p>
                    </div>
                    <div class="content">
                        <p><strong>Siswa:</strong> ${payment.students?.name}</p>
                        <p><strong>Ket:</strong> ${payment.title}</p>
                        <p><strong>Metode:</strong> ${payment.method}</p>
                        <p><strong>Status:</strong> ${payment.status}</p>
                    </div>
                    <div class="total">
                        Total: ${formatRupiah(payment.amount)}
                    </div>
                    <div class="footer">
                        Terima Kasih.<br/>Simpan struk ini sebagai bukti sah.
                    </div>
                    <script>window.print();</script>
                </body>
            </html>
        `)
        printWindow.document.close()
    }
}

export default function PembayaranPage() {
    const { user } = useUser()
    const { withLoading } = useLoading()
    
    // State
    const [payments, setPayments] = useState<any[]>([])
    const [stats, setStats] = useState({ total_lunas: 0, total_pending: 0, total_uang: 0 })
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Role Check
    const role = user?.role || ''
    const canCreate = ['OWNER', 'ADMIN', 'BENDAHARA'].includes(role)
    const canDelete = ['OWNER', 'BENDAHARA'].includes(role) // Admin tidak bisa hapus

    const fetchData = async () => {
        await withLoading(async () => {
            try {
                const res = await getPayments(search)
                setPayments(res.payments)
                setStats(res.stats)
            } catch (err) {
                console.error(err)
            }
        })
    }

    // Fetch saat search berubah (Debounce simpel)
    useEffect(() => {
        const timer = setTimeout(() => fetchData(), 500)
        return () => clearTimeout(timer)
    }, [search])

    const handleCreate = async (formData: any) => {
        await withLoading(async () => {
            try {
                await createPayment(formData)
                setIsModalOpen(false)
                fetchData() // Refresh data
            } catch (err) {
                alert("Gagal menyimpan data")
            }
        })
    }

    const handleDelete = async (id: string) => {
        if(!confirm("Yakin hapus data pembayaran ini?")) return
        await withLoading(async () => {
            try {
                await deletePayment(id)
                fetchData()
            } catch (err) {
                alert("Gagal menghapus data")
            }
        })
    }

    return (
        <DashboardLayout title="Pembayaran Les">
            
            {/* --- STATS CARD --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full text-green-600"><CreditCard size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Pemasukan</p>
                        <h3 className="text-xl font-bold text-gray-800">{formatRupiah(stats.total_uang)}</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600"><CreditCard size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-500">Transaksi Lunas</p>
                        <h3 className="text-xl font-bold text-gray-800">{stats.total_lunas} Transaksi</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-red-100 p-3 rounded-full text-red-600"><CreditCard size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-500">Belum Lunas</p>
                        <h3 className="text-xl font-bold text-gray-800">{stats.total_pending} Murid</h3>
                    </div>
                </div>
            </div>

            {/* --- ACTION BAR --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative w-full md:w-96">
                    <input 
                        type="text" 
                        placeholder="Cari murid atau keterangan..." 
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077AF]"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>

                {canCreate && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center bg-[#0077AF] hover:bg-[#006699] text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all"
                    >
                        <PlusCircle size={20} className="mr-2" /> Input Pembayaran
                    </button>
                )}
            </div>

            {/* --- TABEL --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-bold text-sm">Tanggal</th>
                            <th className="px-6 py-4 font-bold text-sm">Nama Murid</th>
                            <th className="px-6 py-4 font-bold text-sm">Keterangan</th>
                            <th className="px-6 py-4 font-bold text-sm">Nominal</th>
                            <th className="px-6 py-4 font-bold text-sm">Metode</th>
                            <th className="px-6 py-4 font-bold text-sm">Status</th>
                            <th className="px-6 py-4 font-bold text-sm text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payments.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-8 text-gray-400">Belum ada data pembayaran</td></tr>
                        ) : payments.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(p.payment_date).toLocaleDateString('id-ID')}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-800">{p.students?.name}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{p.title}</td>
                                <td className="px-6 py-4 font-mono font-bold text-[#0077AF]">
                                    {formatRupiah(p.amount)}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${p.method === 'TRANSFER' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                        {p.method}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                                        p.status === 'LUNAS' ? 'bg-[#5AB267]' : 
                                        p.status === 'JATUH_TEMPO' ? 'bg-red-500' : 'bg-yellow-500'
                                    }`}>
                                        {p.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 flex justify-center gap-2">
                                    <button 
                                        onClick={() => printReceipt(p)}
                                        className="p-2 text-gray-500 hover:text-[#0077AF] hover:bg-blue-50 rounded-lg transition"
                                        title="Cetak Struk"
                                    >
                                        <Printer size={18} />
                                    </button>
                                    {canDelete && (
                                        <button 
                                            onClick={() => handleDelete(p.id)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Hapus"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <PaymentFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleCreate} 
            />

        </DashboardLayout>
    )
}