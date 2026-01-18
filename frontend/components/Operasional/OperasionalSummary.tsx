import React from 'react'
import { TrendingUp, Tag, DollarSign } from 'lucide-react'

interface SummaryProps {
    summary: { totalBulanIni: number; perKategori: Record<string, number>; periode: string }
    totalData: number
    formatCurrency: (amount: number) => string
}

export const OperasionalSummary = ({ summary, totalData, formatCurrency }: SummaryProps) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-red-100 text-sm font-medium">Total Bulan Ini</p>
                    <p className="text-2xl font-bold">{formatCurrency(summary.totalBulanIni)}</p>
                    <p className="text-red-100 text-xs mt-1">{summary.periode}</p>
                </div>
                <TrendingUp size={32} className="text-red-200 opacity-50" />
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">Per Kategori</h3>
                <Tag size={20} className="text-gray-400" />
            </div>
            <div className="space-y-2">
                {Object.entries(summary.perKategori).slice(0, 3).map(([kategori, jumlah]) => (
                    <div key={kategori} className="flex justify-between text-sm">
                        <span className="text-gray-600 truncate mr-2">{kategori}</span>
                        <span className="font-medium whitespace-nowrap">{formatCurrency(jumlah)}</span>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm font-medium">Total Data</p>
                    <p className="text-2xl font-bold text-gray-800">{totalData}</p>
                    <p className="text-gray-500 text-xs mt-1">Entri biaya terdaftar</p>
                </div>
                <DollarSign size={32} className="text-gray-400 opacity-50" />
            </div>
        </div>
    </div>
)