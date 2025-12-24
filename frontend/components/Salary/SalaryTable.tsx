"use client"

import React from 'react'
import { 
  CheckCircle, 
  AlertCircle, 
  CreditCard, 
  Lock, 
  Eye, 
  RefreshCw, 
  AlertTriangle 
} from 'lucide-react'

interface SalaryData {
  id: string
  mentor_id: string
  mentor_name: string
  month: number
  year: number
  salary_per_session: number
  total_sessions: number
  bonus: number
  total_amount: number
  status: string
  proof_image?: string
  is_out_of_sync?: boolean
  realtime_sessions?: number
  recorded_sessions?: number
  sync_difference?: number
}

interface SalaryTableProps {
  salaries: SalaryData[]
  isMentor: boolean
  canEdit: boolean
  onUpdateBonus: (item: SalaryData, newBonus: string) => void
  onPaySalary: (salary: SalaryData) => void
  onViewProof: (salary: SalaryData) => void
  onRecalculate: (salaryId: string, mentorName: string) => void
}

// Helper function for formatting currency
const formatRupiah = (num: number) => {
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    minimumFractionDigits: 0 
  }).format(num)
}

export default function SalaryTable({
  salaries,
  isMentor,
  canEdit,
  onUpdateBonus,
  onPaySalary,
  onViewProof,
  onRecalculate
}: SalaryTableProps) {
  if (salaries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center text-gray-400">
          <p className="font-medium text-lg">Tidak ada data gaji.</p>
          <p className="text-sm mt-1">Data akan muncul setelah ada perhitungan gaji</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50 text-gray-700 border-b">
            <tr>
              {!isMentor && (
                <th className="px-6 py-4 font-bold text-sm whitespace-nowrap">
                  Nama Mentor
                </th>
              )}
              <th className="px-6 py-4 font-bold text-sm whitespace-nowrap">
                Rate / Sesi
              </th>
              <th className="px-6 py-4 font-bold text-sm text-center bg-blue-50/30 whitespace-nowrap">
                Total Sesi
              </th>
              <th className="px-6 py-4 font-bold text-sm w-32 whitespace-nowrap">
                Bonus (Rp)
              </th>
              <th className="px-6 py-4 font-bold text-sm text-right whitespace-nowrap">
                Total Terima
              </th>
              <th className="px-6 py-4 font-bold text-sm text-center whitespace-nowrap">
                Status
              </th>
              <th className="px-6 py-4 font-bold text-sm text-center whitespace-nowrap">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {salaries.map((s) => {
              const isPaid = s.status === 'PAID'
              const isOutOfSync = s.is_out_of_sync || false
              const syncDiff = s.sync_difference || 0
              
              return (
                <tr key={s.mentor_id || s.id} className="hover:bg-gray-50 transition-colors">
                  {/* Mentor Name - Only for non-mentors */}
                  {!isMentor && (
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {s.mentor_name}
                    </td>
                  )}
                  
                  {/* Rate per Session */}
                  <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                    {formatRupiah(s.salary_per_session)}
                  </td>
                  
                  {/* Total Sessions with Sync Indicator */}
                  <td className="px-6 py-4 text-center font-bold text-[#0077AF] bg-blue-50/30">
                    <div className="flex items-center justify-center gap-2">
                      <span>{s.total_sessions}</span>
                      {isOutOfSync && (
                        <div className="relative group">
                          <AlertTriangle size={16} className="text-orange-500 cursor-help animate-pulse" />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 shadow-lg">
                            <div className="text-center">
                              <div className="font-semibold text-orange-300">⚠️ Data Tidak Sinkron</div>
                              <div className="mt-1">Real: {s.realtime_sessions} | Recorded: {s.recorded_sessions}</div>
                              <div className="text-orange-200">Selisih: {syncDiff > 0 ? '+' : ''}{syncDiff} sesi</div>
                            </div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      )}
                      <Lock size={12} className="text-gray-400" />
                    </div>
                  </td>
                  
                  {/* Bonus Input */}
                  <td className="px-6 py-4">
                    <input 
                      type="number" 
                      defaultValue={s.bonus} 
                      disabled={isPaid || !canEdit}
                      className={`w-28 border rounded-lg p-1.5 font-mono text-sm outline-none focus:ring-2 focus:ring-[#0077AF] transition-all ${
                        isPaid || !canEdit 
                          ? 'bg-gray-100 text-gray-400 border-transparent' 
                          : 'bg-white border-gray-300'
                      }`}
                      onBlur={(e) => canEdit && !isPaid && onUpdateBonus(s, e.target.value)}
                    />
                  </td>
                  
                  {/* Total Amount */}
                  <td className="px-6 py-4 font-mono font-black text-[#0077AF] text-base text-right">
                    {formatRupiah(s.total_amount)}
                  </td>
                  
                  {/* Status Badge */}
                  <td className="px-6 py-4 text-center">
                    {isPaid ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                        <CheckCircle size={12}/> LUNAS
                      </span>
                    ) : (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 shadow-sm">
                        <AlertCircle size={12}/> PENDING
                      </span>
                    )}
                  </td>
                  
                  {/* Actions */}
                  <td className="px-6 py-4 text-center">
                    {canEdit && !isPaid ? (
                      <button 
                        onClick={() => onPaySalary(s)} 
                        className="bg-[#0077AF] hover:bg-[#006699] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 mx-auto shadow-md hover:shadow-lg transition-all"
                      >
                        <CreditCard size={14}/> Bayar
                      </button>
                    ) : isPaid ? (
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => onViewProof(s)} 
                          className="text-green-600 font-bold text-xs hover:underline flex items-center justify-center gap-1"
                        >
                          <Eye size={14}/> Bukti
                        </button>
                        {canEdit && isOutOfSync && (
                          <button 
                            onClick={() => onRecalculate(s.id, s.mentor_name)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1"
                            title="Recalculate berdasarkan absensi terkini"
                          >
                            <RefreshCw size={12}/> Sync
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}