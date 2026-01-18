// components/Dashboard/StatCard.tsx
import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    icon: LucideIcon
    count: number
    label: string
    colorClass: string
    iconColor: string
}

export const StatCard = ({ icon: Icon, count, label, colorClass, iconColor }: StatCardProps) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 transition-transform hover:scale-[1.02]">
        <div className={`p-3 rounded-full ${colorClass} ${iconColor}`}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</p>
            <h3 className="text-xl font-black text-gray-800">{count}</h3>
        </div>
    </div>
)