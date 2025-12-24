"use client"

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface SalaryStatCardProps {
  title: string
  value: string
  subtext: string
  colorClass: string
  icon: LucideIcon
}

export default function SalaryStatCard({ 
  title, 
  value, 
  subtext, 
  colorClass, 
  icon: Icon 
}: SalaryStatCardProps) {
  return (
    <div className={`p-5 rounded-xl border shadow-sm flex items-center justify-between transition-all duration-200 hover:shadow-md ${colorClass}`}>
      <div>
        <p className="text-xs font-bold opacity-70 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black mt-1">{value}</h3>
        <p className="text-[10px] font-medium opacity-80 mt-1">{subtext}</p>
      </div>
      <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
        <Icon size={28} />
      </div>
    </div>
  )
}