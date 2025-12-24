"use client"

import React from 'react'
import { Calendar, User } from 'lucide-react'

interface AttendanceFiltersProps {
  month: number
  year: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
  userRole: string
  userName?: string
}

export default function AttendanceFilters({
  month,
  year,
  onMonthChange,
  onYearChange,
  userRole,
  userName
}: AttendanceFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-700 font-bold bg-gray-50 px-3 py-1.5 rounded-lg border">
          <Calendar size={18} className="text-[#0077AF]" />
          <span>Periode:</span>
        </div>
        <select 
          value={month} 
          onChange={(e) => onMonthChange(parseInt(e.target.value))} 
          className="bg-white border rounded p-2 outline-none focus:ring-2 focus:ring-[#0077AF] transition-all duration-200"
        >
          {[...Array(12)].map((_, i) => (
            <option key={i+1} value={i+1}>
              Bulan {i+1}
            </option>
          ))}
        </select>
        <select 
          value={year} 
          onChange={(e) => onYearChange(parseInt(e.target.value))} 
          className="bg-white border rounded p-2 outline-none focus:ring-2 focus:ring-[#0077AF] transition-all duration-200"
        >
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
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