import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, BookOpen, LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  amount: string
  icon: LucideIcon
  colorClass: string
  subtext?: string
}

const StatsCard = ({ title, amount, icon: Icon, colorClass, subtext }: StatsCardProps) => (
  <div className={`bg-gradient-to-r ${colorClass} p-6 rounded-xl text-white shadow-md`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white/80 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold">{amount}</p>
        {subtext && <p className="text-white/70 text-xs mt-1">{subtext}</p>}
      </div>
      <Icon size={32} className="text-white/40" />
    </div>
  </div>
)

export const StatsGrid = ({ stats, operasionalSummary, formatCurrency }: any) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard 
        title="Pemasukan Bulan Ini" 
        amount={stats ? formatCurrency(stats.totalIncome) : '...'} 
        icon={TrendingUp} 
        colorClass="from-green-500 to-green-600" 
      />
      <StatsCard 
        title="Pengeluaran Bulan Ini" 
        amount={stats ? formatCurrency(stats.totalExpense) : '...'} 
        icon={TrendingDown} 
        colorClass="from-red-500 to-red-600" 
      />
      <StatsCard 
        title="Laba Bersih" 
        amount={stats ? formatCurrency(stats.netBalance) : '...'} 
        icon={DollarSign} 
        colorClass={stats?.netBalance >= 0 ? "from-blue-500 to-blue-600" : "from-orange-500 to-orange-600"} 
      />
      <StatsCard 
        title="Biaya Operasional" 
        amount={operasionalSummary ? formatCurrency(operasionalSummary.totalBulanIni) : '...'} 
        subtext={operasionalSummary?.periode}
        icon={BookOpen} 
        colorClass="from-purple-500 to-purple-600" 
      />
    </div>
  )
}