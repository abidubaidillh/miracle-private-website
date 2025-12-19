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
    Filter,
    AlertCircle
} from 'lucide-react'
import { useUser } from '@/context/UserContext'
import { useLoading } from '@/context/LoadingContext'
import { getAuthToken } from '@/lib/auth'

// Helper Format Rupiah (Ditambah pengaman || 0 agar tidak NaN)
const formatRupiah = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

const getFinanceSummary = async () => {
    const token = getAuthToken()
    const res = await fetch(`${API_BASE_URL}/api/finance/summary`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error("Gagal mengambil data keuangan")
    return res.json()
}

export default function KeuanganPage() {
    const { user } = useUser()
    const { withLoading } = useLoading()
    const router = useRouter()

    // State awal disesuaikan dengan key dari backend
    const [stats, setStats] = useState({ 
        totalIncome: 0, 
        totalExpense: 0, 
        netBalance: 0,
        unpaid_invoices: 0, 
        unpaid_salaries: 0  
    })
    
    const [history, setHistory] = useState<any[]>([]) 

    useEffect(() => {
        if (user) {
            const allowedRoles = ['OWNER', 'BENDAHARA'] 
            if (!allowedRoles.includes(user.role)) {
                router.push('/dashboard')
            }
        }
    }, [user, router])

    useEffect(() => {
        const loadData = async () => {
            if (!user) return
            await withLoading(async () => {
                try {
                    const data = await getFinanceSummary()
                    // Backend mengirim objek { stats: {...}, history: [...] }
                    if (data.stats) {
                        setStats(data.stats)
                    }
                    if (data.history) {
                        setHistory(data.history)
                    }
                } catch (err) {
                    console.error("Gagal memuat data keuangan:", err)
                }
            })
        }
        loadData()
    }, [user]) 

    if (!user) return null

    return (
        <DashboardLayout title="Dashboard Keuangan">
            
            {/* 1. SECTION CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                
                {/* Income Card - PAKAI totalIncome */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-green-600 group-hover:scale-110 transition-transform">
                        <TrendingUp size={80} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pemasukan (Bulan Ini)</p>
                        <h3 className="text-2xl font-black text-gray-800 mt-1">{formatRupiah(stats.totalIncome)}</h3>
                    </div>
                    <div className="flex items-center text-xs font-bold text-green-600 bg-green-50 w-fit px-2 py-1 rounded">
                        <ArrowUpRight size={14} className="mr-1"/> Sumber: Pembayaran SPP
                    </div>
                </div>

                {/* Expense Card - PAKAI totalExpense */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between h-32 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-red-600 group-hover:scale-110 transition-transform">
                        <TrendingDown size={80} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pengeluaran (Bulan Ini)</p>
                        <h3 className="text-2xl font-black text-gray-800 mt-1">{formatRupiah(stats.totalExpense)}</h3>
                    </div>
                    <div className="flex items-center text-xs font-bold text-red-600 bg-red-50 w-fit px-2 py-1 rounded">
                        <ArrowDownLeft size={14} className="mr-1"/> Operasional + Gaji
                    </div>
                </div>

                {/* Unpaid Invoices Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-200 flex flex-col justify-between h-32 relative overflow-hidden group bg-gradient-to-br from-white to-orange-50">
                    <div className="absolute top-0 right-0 p-4 opacity-20 text-orange-500">
                        <AlertCircle size={80} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tagihan Belum Lunas</p>
                        <h3 className="text-2xl font-black text-orange-600 mt-1">{stats.unpaid_invoices} Siswa</h3>
                    </div>
                    <button onClick={() => router.push('/pembayaran')} className="text-xs font-bold text-orange-700 hover:underline text-left z-10 relative">
                        Lihat & Tagih &rarr;
                    </button>
                </div>

                {/* Unpaid Salaries Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200 flex flex-col justify-between h-32 relative overflow-hidden group bg-gradient-to-br from-white to-blue-50">
                    <div className="absolute top-0 right-0 p-4 opacity-20 text-blue-500">
                        <Wallet size={80} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gaji Belum Dibayar</p>
                        <h3 className="text-2xl font-black text-blue-600 mt-1">{stats.unpaid_salaries} Mentor</h3>
                    </div>
                    <button onClick={() => router.push('/gaji-mentor')} className="text-xs font-bold text-blue-700 hover:underline text-left z-10 relative">
                        Proses Gaji &rarr;
                    </button>
                </div>
            </div>

            {/* 2. HISTORY TABLE */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Riwayat Transaksi Terakhir</h2>
                        <p className="text-sm text-gray-500">Gabungan dari semua jenis transaksi.</p>
                    </div>
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
                                        Data transaksi belum tersedia.
                                    </td>
                                </tr>
                            ) : (
                                history.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
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
                                                {item.category || 'Umum'}
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