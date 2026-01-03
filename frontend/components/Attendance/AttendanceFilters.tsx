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
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700 font-bold bg-gray-50 px-3 py-1.5 rounded-lg border">
          <Calendar size={18} className="text-[#0077AF]" />
          <span>{monthNames[month - 1]} {year}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <select 
            value={filterProgress} 
            onChange={(e) => onFilterProgressChange(e.target.value)} 
            className="bg-white border rounded p-2 outline-none focus:ring-2 focus:ring-[#0077AF] transition-all duration-200"
          >
            <option value="all">Semua Progress</option>
            <option value="in-progress">In-Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
      {/* Badge Info Role */}
      {userRole === 'MENTOR' && userName && (
        <div className="bg-blue-50 text-[#0077AF] px-3 py-1 rounded text-xs font-bold border border-blue-100 flex items-center gap-2">
          <User size={14}/> Mode Mentor: {userName}
        </div>
      )}
    </div>
  )
}
