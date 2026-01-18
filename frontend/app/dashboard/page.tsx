"use client"

import React, { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { useLoading } from '@/context/LoadingContext'
import Swal from 'sweetalert2'
import { StatsGrid } from '@/components/Dashboard/StatsGrid'
import { SummarySection } from '@/components/Dashboard/SummarySection'
import { Calendar } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function DashboardPage() {
  const { withLoading } = useLoading()
  const [stats, setStats] = useState<any>(null)
  const [operasionalSummary, setOperasionalSummary] = useState<any>(null)
  const [recentActivities, setRecentActivities] = useState<any[]>([])

  const getAuthToken = () => {
    if (typeof document === 'undefined') return null;
    const name = "auth=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(name) === 0) {
        try {
          const authData = JSON.parse(c.substring(name.length));
          return authData?.session?.access_token || authData?.token;
        } catch (e) { return null; }
      }
    }
    return null;
  };

  const fetchDashboardData = async () => {
    await withLoading(async () => {
      try {
        const token = getAuthToken();
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };

        const [financeRes, operasionalRes] = await Promise.all([
          fetch(`${API}/api/finance/summary`, { headers, credentials: 'include' }),
          fetch(`${API}/api/operasional/summary`, { headers, credentials: 'include' })
        ]);

        if (financeRes.ok) {
          const data = await financeRes.json();
          setStats(data.stats);
          setRecentActivities(data.history || []);
        }
        
        if (operasionalRes.ok) {
          const dataOp = await operasionalRes.json();
          setOperasionalSummary(dataOp);
        }

      } catch (error) {
        console.error('Fetch error:', error);
        Swal.fire('Error', 'Gagal memuat data dashboard.', 'error');
      }
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR', 
      minimumFractionDigits: 0 
    }).format(amount);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <DashboardLayout title="Dashboard">
      {/* Grid Kartu Statistik Utama */}
      <StatsGrid 
        stats={stats} 
        operasionalSummary={operasionalSummary} 
        formatCurrency={formatCurrency} 
      />
      
      {/* Bagian Perhatian dan Progress Bar Operasional */}
      <SummarySection 
        stats={stats} 
        operasionalSummary={operasionalSummary} 
        formatCurrency={formatCurrency} 
      />

      {/* Tabel Aktivitas Terbaru */}
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