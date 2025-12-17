"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { Plus, Trash2, TrendingDown, Wallet } from 'lucide-react'
import { getTransactions, createTransaction, deleteTransaction } from '@/lib/transactionActions'
import TransactionFormModal from '@/components/TransactionFormModal'
import { useLoading } from '@/context/LoadingContext'
import { useUser } from '@/context/UserContext'
import { useRouter } from 'next/navigation'

const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

export default function OperasionalPage() {
    const { withLoading } = useLoading()
    const { user } = useUser()
    const router = useRouter()

    const [transactions, setTransactions] = useState<any[]>([])
    const [stats, setStats] = useState({ total: 0, count: 0 })
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Cek Role (Hanya Owner & Bendahara)
    useEffect(() => {
        if (user && user.role !== 'OWNER' && user.role !== 'BENDAHARA') {
            router.push('/dashboard')
        }
    }, [user, router])

    const fetchData = async () => {
        await withLoading(async () => {
            try {
                const res = await getTransactions('EXPENSE')
                setTransactions(res.transactions)
                setStats(res.stats)
            } catch (err) {
                console.error(err)
            }
        })
    }

    useEffect(() => { fetchData() }, [])

    const handleCreate = async (data: any) => {
        await withLoading(async () => {
            try {
                await createTransaction(data)
                setIsModalOpen(false)
                fetchData()
            } catch (err) {
                alert("Gagal menyimpan")
            }
        })
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus transaksi ini?")) return
        await withLoading(async () => {
            try {
                await deleteTransaction(id)
                fetchData()
            } catch (err) {
                alert("Gagal menghapus")
            }
        })
    }

    if (!user || (user.role !== 'OWNER' && user.role !== 'BENDAHARA')) return null

    return (
        <DashboardLayout title="Biaya Operasional">
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-red-100 p-3 rounded-full text-red-600"><TrendingDown size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-500">Total Pengeluaran (Bulan Ini)</p>
                        <h3 className="text-2xl font-bold text-gray-800">{formatRupiah(stats.total)}</h3>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Wallet size={24}/></div>
                    <div>
                        <p className="text-sm text-gray-500">Jumlah Transaksi</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stats.count} Transaksi</h3>
                    </div>
                </div>
            </div>

            {/* Action */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-700 text-lg">Riwayat Pengeluaran</h3>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                    <Plus size={18} /> Catat Pengeluaran
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-bold text-sm">Tanggal</th>
                            <th className="px-6 py-4 font-bold text-sm">Kategori</th>
                            <th className="px-6 py-4 font-bold text-sm">Keterangan</th>
                            <th className="px-6 py-4 font-bold text-sm">Nominal</th>
                            <th className="px-6 py-4 font-bold text-sm text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transactions.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Belum ada data pengeluaran.</td></tr>
                        ) : transactions.map((t) => (
                            <tr key={t.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-600">
                                    {new Date(t.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold border">
                                        {t.categories?.name}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{t.description || '-'}</td>
                                <td className="px-6 py-4 font-mono font-bold text-red-600">
                                    {formatRupiah(t.amount)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => handleDelete(t.id)}
                                        className="text-gray-400 hover:text-red-600 p-2 transition"
                                        title="Hapus"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <TransactionFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreate}
                type="EXPENSE"
            />

        </DashboardLayout>
    )
}