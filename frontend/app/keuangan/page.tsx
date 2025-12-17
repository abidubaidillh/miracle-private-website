"use client"

import React, { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useRouter } from 'next/navigation'
import { 
    TrendingUp, 
    TrendingDown, 
    Wallet, 
    ArrowUpRight, 
    ArrowDownLeft,
    Filter
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useLoading } from '@/context/LoadingContext'
import { getFinanceSummary } from '@/lib/financeActions'

// Format Rupiah Helper
const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)

export default function KeuanganPage() {
    const { user } = useUser()
    const { withLoading } = useLoading()
    const router = useRouter()

    const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 })
    const [history, setHistory] = useState<any[]>([])

    // 1. Cek Role (UPDATE: Menambahkan ADMIN agar tidak ditendang ke dashboard)
    useEffect(() => {
        if (user) {
            const allowedRoles = ['OWNER', 'BENDAHARA', 'ADMIN'] // ✅ Admin ditambahkan
            if (!allowedRoles.includes(user.role)) {
                router.push('/dashboard')
            }
        }
    }, [user, router])

    // 2. Load Data
    useEffect(() => {
        const loadData = async () => {
            if (!user) return

            await withLoading(async () => {
                try {
                    const data = await getFinanceSummary()
                    setStats(data.stats)
                    setHistory(data.history)
                } catch (err) {
                    console.error("Gagal memuat data keuangan:", err)
                }
            })
        }
        
        loadData()
    }, [user]) 

    if (!user) return null

    return (
        <DashboardLayout title="Rekapitulasi Keuangan">
            
            {/* 1. SECTION CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* Card Pemasukan */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-green-600 group-hover:scale-110 transition-transform">
                        <TrendingUp size={80} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Pemasukan</p>
                        <h3 className="text-2xl font-black text-gray-800 mt-1">{formatRupiah(stats.totalIncome)}</h3>
                    </div>
                    <div className="flex items-center text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded">
                        <ArrowUpRight size={14} className="mr-1"/> Sumber: Pembayaran Murid
                    </div>
                </div>

                {/* Card Pengeluaran */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-red-600 group-hover:scale-110 transition-transform">
                        <TrendingDown size={80} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Pengeluaran</p>
                        <h3 className="text-2xl font-black text-gray-800 mt-1">{formatRupiah(stats.totalExpense)}</h3>
                    </div>
                    <div className="flex items-center text-xs font-bold text-red-600 bg-red-50 w-fit px-2 py-1 rounded">
                        <ArrowDownLeft size={14} className="mr-1"/> Operasional + Gaji
                    </div>
                </div>

                {/* Card Saldo Bersih */}
                <div className={`p-6 rounded-xl shadow-sm border flex flex-col justify-between h-32 relative overflow-hidden text-white
                    ${stats.netBalance >= 0 ? 'bg-[#0077AF] border-blue-600' : 'bg-orange-500 border-orange-600'}
                `}>
                    <div className="absolute top-0 right-0 p-4 opacity-20 text-white">
                        <Wallet size={80} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold opacity-90 uppercase tracking-wider">Saldo Bersih</p>
                        <h3 className="text-3xl font-black mt-1">{formatRupiah(stats.netBalance)}</h3>
                    </div>
                    <div className="text-xs font-medium opacity-80">
                        {stats.netBalance >= 0 ? 'Kondisi Keuangan Sehat' : 'Pengeluaran melebihi Pemasukan'}
                    </div>
                </div>
            </div>

            {/* 2. SECTION TABLE RIWAYAT */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Riwayat Transaksi Gabungan</h2>
                        <p className="text-sm text-gray-500">Rekap otomatis dari Pembayaran Murid, Operasional, dan Gaji.</p>
                    </div>
                    {/* Placeholder Filter Button */}
                    <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#0077AF] border px-3 py-2 rounded-lg hover:bg-gray-50 transition">
                        <Filter size={16} /> Filter
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-6 py-4 font-bold text-sm">Tanggal</th>
                                <th className="px-6 py-4 font-bold text-sm">Keterangan</th>
                                <th className="px-6 py-4 font-bold text-sm">Kategori</th>
                                <th className="px-6 py-4 font-bold text-sm text-center">Arus Kas</th>
                                <th className="px-6 py-4 font-bold text-sm text-right">Nominal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-400">
                                        Belum ada transaksi tercatat.
                                    </td>
                                </tr>
                            ) : (
                                history.map((item, idx) => (
                                    <tr key={`${item.type}-${item.id}-${idx}`} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                                            {new Date(item.date).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'long', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {item.description}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-semibold border">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.type === 'INCOME' ? (
                                                <span className="flex items-center justify-center gap-1 text-green-600 text-xs font-bold bg-green-50 py-1 px-2 rounded-full w-fit mx-auto">
                                                    <ArrowUpRight size={14} /> Masuk
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-1 text-red-600 text-xs font-bold bg-red-50 py-1 px-2 rounded-full w-fit mx-auto">
                                                    <ArrowDownLeft size={14} /> Keluar
                                                </span>
                                            )}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-mono font-bold ${
                                            item.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {item.type === 'INCOME' ? '+' : '-'} {formatRupiah(item.amount)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    )
}