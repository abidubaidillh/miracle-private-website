import React from 'react'
import { AlertCircle, Clock, Users, CheckCircle, BookOpen } from 'lucide-react'

export const SummarySection = ({ stats, operasionalSummary, formatCurrency }: any) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Action Items / Attention */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-orange-500" /> Perlu Perhatian
          </h3>
          <div className="space-y-3">
            {stats && stats.unpaid_invoices > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-red-500" />
                  <span className="text-sm font-medium text-red-700">Tagihan Belum Lunas</span>
                </div>
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold">{stats.unpaid_invoices}</span>
              </div>
            )}
            {stats && stats.unpaid_salaries > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">Gaji Belum Dibayar</span>
                </div>
                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">{stats.unpaid_salaries}</span>
              </div>
            )}
            {stats && stats.unpaid_invoices === 0 && stats.unpaid_salaries === 0 && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-sm font-medium text-green-700">Semua pembayaran aman</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Operasional per Kategori */}
      <div className="lg:col-span-2">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen size={20} className="text-purple-500" /> Biaya Operasional per Kategori
          </h3>
          {operasionalSummary && Object.keys(operasionalSummary.perKategori).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(operasionalSummary.perKategori as Record<string, number>)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([kategori, jumlah]) => {
                  const percentage = (jumlah / operasionalSummary.totalBulanIni) * 100
                  return (
                    <div key={kategori} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{kategori}</span>
                        <span className="text-gray-600">{formatCurrency(jumlah)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500 italic">Belum ada data biaya operasional</p>
          )}
        </div>
      </div>
    </div>
  )
}