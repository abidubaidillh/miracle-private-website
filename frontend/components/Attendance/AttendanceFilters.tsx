"use client"

import React from 'react'
import { Calendar, User, Filter } from 'lucide-react'

interface AttendanceFiltersProps {
  filterProgress: string
  onFilterProgressChange: (filter: string) => void
  userRole: string
  userName?: string
  month: number
  year: number
}

export default function AttendanceFilters({
  filterProgress,
  onFilterProgressChange,
  userRole,
  userName,
  month,
  year
}: AttendanceFiltersProps) {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  return (
    <div className="bg-miracle-surface p-6 rounded-2xl shadow-medium border border-gray-100 mb-8 flex flex-wrap items-center justify-between gap-6 animate-fade-in">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 text-miracle-text font-semibold bg-miracle-background px-4 py-2.5 rounded-xl border border-gray-100">
          <Calendar size={20} className="text-miracle-blue" />
          <span className="text-sm tracking-wide">Periode: {monthNames[month - 1]} {year}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-miracle-background px-3 py-2 rounded-xl border border-gray-100">
            <Filter size={18} className="text-miracle-blue" />
            <select 
              value={filterProgress} 
              onChange={(e) => onFilterProgressChange(e.target.value)} 
              className="bg-transparent border-none outline-none text-sm font-medium text-miracle-text focus:ring-0 cursor-pointer"
            >
              <option value="all">Semua Progress</option>
              <option value="in-progress">In-Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Badge Info Role */}
      {userRole === 'MENTOR' && userName && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-miracle-blue px-4 py-2 rounded-xl text-sm font-semibold border border-blue-100 flex items-center gap-2 shadow-soft">
          <User size={16} className="text-miracle-blue"/> 
          <span>Mode Mentor: <span className="font-bold">{userName}</span></span>
        </div>
      )}
    </div>
  )
}
