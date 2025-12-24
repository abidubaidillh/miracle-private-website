"use client"

import React, { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Plus
} from 'lucide-react'
import ImagePreviewModal from './ImagePreviewModal'

interface SessionStatus {
  number: number
  is_done: boolean
  status: string | null
  date_recorded: string | null
  bukti_foto: string | null
}

interface Schedule {
  id: string
  day_of_week: string
  start_time: string
  subject: string
  planned_sessions: number
  mentors: { id: string; name: string }
  students: { name: string }
  sessions_status: SessionStatus[]
  total_done: number
}

interface AttendanceTableProps {
  schedules: Schedule[]
  onAttendanceSubmit: (schedule: Schedule, sessionNumber: number) => void
  userRole: string
  isLoading?: boolean
}

export default function AttendanceTable({ 
  schedules, 
  onAttendanceSubmit, 
  userRole,
  isLoading = false 
}: AttendanceTableProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)

  // Format tanggal
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  // Get status badge
  const getStatusBadge = (status: string | null) => {
    if (!status) return null
    
    const statusConfig = {
      'HADIR': { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle 
      },
      'IZIN': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: AlertCircle 
      },
      'ALPA': { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle 
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null

    const IconComponent = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent size={12} />
        {status}
      </span>
    )
  }

  // Handle image preview
  const handleImagePreview = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setShowImageModal(true)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
        <div className="text-center text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="font-medium">Tidak ada jadwal kelas</p>
          <p className="text-sm mt-1">Jadwal akan muncul setelah ditambahkan oleh admin</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {schedules.map((schedule) => (
          <div key={schedule.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header Jadwal */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar size={20} className="text-blue-600" />
                    {schedule.subject}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {schedule.day_of_week} • {schedule.start_time}
                    </span>
                    <span>Mentor: {schedule.mentors?.name || '-'}</span>
                    <span>Murid: {schedule.students?.name || '-'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Progress</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {schedule.total_done}/{schedule.planned_sessions}
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(schedule.total_done / schedule.planned_sessions) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabel Sesi */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[80px]">
                      Sesi Ke-
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">
                      Mentor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[140px]">
                      Waktu/Tanggal
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[100px]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">
                      Bukti Foto
                    </th>
                    {userRole === 'MENTOR' && (
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">
                        Aksi
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedule.sessions_status.map((session) => (
                    <tr key={session.number} className="hover:bg-gray-50 transition-all duration-200">
                      {/* Sesi Ke- */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                            session.is_done 
                              ? 'bg-green-100 text-green-800 ring-2 ring-green-200' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {session.number}
                          </div>
                        </div>
                      </td>

                      {/* Mentor */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium truncate max-w-[100px]" title={schedule.mentors?.name || '-'}>
                          {schedule.mentors?.name || '-'}
                        </div>
                      </td>

                      {/* Waktu/Tanggal */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {session.date_recorded ? (
                            <span className="flex items-center gap-1">
                              <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                              <span className="truncate">{formatDate(session.date_recorded)}</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">Belum dilaksanakan</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {session.status ? (
                          getStatusBadge(session.status)
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* Bukti Foto */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {session.bukti_foto ? (
                          <button
                            onClick={() => handleImagePreview(session.bukti_foto!)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-200 text-sm font-medium"
                          >
                            <Eye size={14} />
                            <span className="hidden sm:inline">Lihat Foto</span>
                            <span className="sm:hidden">Foto</span>
                          </button>
                        ) : session.is_done ? (
                          <span className="text-gray-400 text-xs">Tidak ada foto</span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>

                      {/* Aksi - Only for MENTOR */}
                      {userRole === 'MENTOR' && (
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          {!session.is_done ? (
                            <button
                              onClick={() => onAttendanceSubmit(schedule, session.number)}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                            >
                              <Plus size={14} />
                              <span className="hidden sm:inline">Klik Absen</span>
                              <span className="sm:hidden">Absen</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                              <CheckCircle size={14} />
                              <span className="hidden sm:inline">Selesai</span>
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Progress */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Sesi selesai: {schedule.total_done} dari {schedule.planned_sessions}
                </span>
                <span className={`font-medium ${
                  schedule.total_done === schedule.planned_sessions 
                    ? 'text-green-600' 
                    : 'text-blue-600'
                }`}>
                  {schedule.total_done === schedule.planned_sessions 
                    ? 'Kelas Selesai' 
                    : `${schedule.planned_sessions - schedule.total_done} sesi tersisa`
                  }
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={showImageModal}
        imageUrl={selectedImage}
        onClose={() => {
          setShowImageModal(false)
          setSelectedImage(null)
        }}
      />
    </>
  )
}