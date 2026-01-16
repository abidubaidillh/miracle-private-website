"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useLoading } from '@/context/LoadingContext'
import { useUser } from '@/context/UserContext'
import Swal from 'sweetalert2'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  BookOpen
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// --- Interfaces ---
interface DashboardStats {
  totalIncome: number
  totalExpense: number
  netBalance: number
  unpaid_invoices: number
  unpaid_salaries: number
}

interface OperasionalSummary {
  totalBulanIni: number
  perKategori: Record<string, number>
  periode: string
}

interface RecentActivity {
  date: string
  description: string
  category: string
  type: 'INCOME' | 'EXPENSE'
  amount: number
}

export default function DashboardPage() {
  const { withLoading } = useLoading()
  const { user } = useUser()
  
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [operasionalSummary, setOperasionalSummary] = useState<OperasionalSummary | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])

  /**
   * Helper: Mengambil Token dari Cookie 'auth'
   * Karena backend menggunakan cookie-parser dan mengharapkan JSON object
   */
  const getAuthToken = () => {
    if (typeof document === 'undefined') return null;
    const name = "auth=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(name) === 0) {
        try {
          // Cookie 'auth' biasanya berisi JSON stringify dari { user, session, token }
          const authData = JSON.parse(c.substring(name.length));
          return authData?.session?.access_token || authData?.token;
        } catch (e) {
          console.error("Gagal parse cookie auth:", e);
          return null;
        }
      }
    }
    return null;
  };

  // --- Fetch dashboard data ---
  const fetchDashboardData = async () => {
    await withLoading(async () => {
      try {
        const token = getAuthToken();
        
        // Membangun Header dengan Authorization Bearer
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        /**
         * CATATAN PENTING:
         * Pastikan di backend index.js, route finance sudah menggunakan /api/finance
         * Jika belum diubah, hapus '/api' pada url finance di bawah ini.
         */
        const [financeRes, operasionalRes] = await Promise.all([
          fetch(`${API}/api/finance/summary`, { 
            headers,
            credentials: 'include' 
          }),
          fetch(`${API}/api/operasional/summary`, { 
            headers,
            credentials: 'include' 
          })
        ]);

        // Cek jika unauthorized (Token hangus/tidak terbaca)
        if (financeRes.status === 401 || operasionalRes.status === 401) {
          console.error("Unauthorized access - Checking token...");
          // Anda bisa redirect ke login di sini jika perlu
        }

        if (financeRes.ok) {
          const financeData = await financeRes.json()
          setStats(financeData.stats)
          setRecentActivities(financeData.history || [])
        } else {
            throw new Error(`Finance API error: ${financeRes.status}`);
        }

        if (operasionalRes.ok) {
          const operasionalData = await operasionalRes.json()
          setOperasionalSummary(operasionalData)
        } else {
            throw new Error(`Operasional API error: ${operasionalRes.status}`);
        }

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error)
        Swal.fire('Error', 'Gagal memuat data dashboard. Pastikan Anda sudah login.', 'error')
      }
    })
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // --- Helpers ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Pemasukan */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Pemasukan Bulan Ini</p>
              <p className="text-2xl font-bold">
                {stats ? formatCurrency(stats.totalIncome) : '...'}
              </p>
            </div>
            <TrendingUp size={32} className="text-green-200" />
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Pengeluaran Bulan Ini</p>
              <p className="text-2xl font-bold">
                {stats ? formatCurrency(stats.totalExpense) : '...'}
              </p>
            </div>
            <TrendingDown size={32} className="text-red-200" />
          </div>
        </div>

        {/* Laba Bersih */}
        <div className={`bg-gradient-to-r p-6 rounded-xl text-white shadow-md ${
          stats && stats.netBalance >= 0 
            ? 'from-blue-500 to-blue-600' 
            : 'from-orange-500 to-orange-600'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Laba Bersih</p>
              <p className="text-2xl font-bold">
                {stats ? formatCurrency(stats.netBalance) : '...'}
              </p>
            </div>
            <DollarSign size={32} className="text-blue-200" />
          </div>
        </div>

        {/* Biaya Operasional */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Biaya Operasional</p>
              <p className="text-2xl font-bold">
                {operasionalSummary ? formatCurrency(operasionalSummary.totalBulanIni) : '...'}
              </p>
              <p className="text-purple-100 text-xs mt-1">
                {operasionalSummary?.periode || 'Memuat...'}
              </p>
            </div>
            <BookOpen size={32} className="text-purple-200" />
          </div>
        </div>
      </div>

      {/* Action Items & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Action Items */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle size={20} className="text-orange-500" />
              Perlu Perhatian
            </h3>
            
            <div className="space-y-3">
              {stats && stats.unpaid_invoices > 0 && (
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-red-500" />
                    <span className="text-sm font-medium text-red-700">Tagihan Belum Lunas</span>
                  </div>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    {stats.unpaid_invoices}
                  </span>
                </div>
              )}
              
              {stats && stats.unpaid_salaries > 0 && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">Gaji Belum Dibayar</span>
                  </div>
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    {stats.unpaid_salaries}
                  </span>
                </div>
              )}
              
              {stats && stats.unpaid_invoices === 0 && stats.unpaid_salaries === 0 && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm font-medium text-green-700">Semua pembayaran up to date</span>
                </div>
              )}

              {!stats && <p className="text-gray-400 text-sm italic">Memeriksa data...</p>}
            </div>
          </div>
        </div>

        {/* Biaya Operasional per Kategori */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-purple-500" />
              Biaya Operasional per Kategori
            </h3>
            
            {operasionalSummary && Object.keys(operasionalSummary.perKategori).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(operasionalSummary.perKategori)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([kategori, jumlah]) => {
                    const percentage = operasionalSummary.totalBulanIni > 0 
                      ? (jumlah / operasionalSummary.totalBulanIni) * 100 
                      : 0
                    
                    return (
                      <div key={kategori} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-700">{kategori}</span>
                          <span className="text-gray-600">{formatCurrency(jumlah)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="font-medium">Belum ada data biaya operasional</p>
                <p className="text-sm mt-1">Data akan muncul setelah ada input biaya</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            Aktivitas Terbaru
          </h3>
        </div>
        
        <div className="p-6">
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.slice(0, 8).map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.category} • {formatDate(activity.date)}</p>
                    </div>
                  </div>
                  <div className={`font-semibold text-sm ${
                    activity.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activity.type === 'INCOME' ? '+' : '-'}{formatCurrency(activity.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Belum ada aktivitas</p>
              <p className="text-sm mt-1">Aktivitas keuangan akan muncul di sini</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}