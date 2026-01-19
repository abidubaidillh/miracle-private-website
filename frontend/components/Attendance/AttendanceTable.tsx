"use client"

import React, { useState } from 'react'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Plus,
  User,
  BookOpen,
  Target
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
  mentor_name: string  // Changed from mentors relation
  student_name: string // Changed from students relation
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

  // Get status badge dengan desain profesional
  const getStatusBadge = (status: string | null) => {
    if (!status) return null
    
    const statusConfig = {
      'HADIR': { 
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
        text: 'text-green-700',
        border: 'border border-green-200',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      },
      'IZIN': { 
        bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
        text: 'text-amber-700',
        border: 'border border-amber-200',
        icon: AlertCircle,
        iconColor: 'text-amber-600'
      },
      'ALPA': { 
        bg: 'bg-gradient-to-r from-red-50 to-rose-50',
        text: 'text-red-700',
        border: 'border border-red-200',
        icon: XCircle,
        iconColor: 'text-red-600'
      }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null

    const IconComponent = config.icon

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${config.bg} ${config.text} ${config.border}`}>
        <IconComponent size={14} className={config.iconColor} />
        <span className="text-xs font-semibold tracking-wide">{status}</span>
      </div>
    )
  }

  // Handle image preview
  const handleImagePreview = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    setShowImageModal(true)
  }

  // Loading state yang lebih profesional
  if (isLoading) {
    return (
      <div className="bg-miracle-surface rounded-2xl shadow-medium border border-gray-100 p-10">
        <div className="animate-pulse space-y-6">
          <div className="h-5 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Empty state yang lebih elegan
  if (schedules.length === 0) {
    return (
      <div className="bg-miracle-surface rounded-2xl shadow-medium border border-gray-100 p-16 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-miracle-background mb-6">
          <Calendar size={32} className="text-miracle-blue/60" />
        </div>
        <h3 className="text-lg font-semibold text-miracle-text mb-2">Tidak ada jadwal kelas</h3>
        <p className="text-miracle-text-secondary max-w-md mx-auto text-sm">
          Jadwal akan muncul setelah ditambahkan oleh admin. 
          Silakan hubungi administrator untuk menambahkan jadwal kelas baru.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {schedules.map((schedule, index) => (
          <div 
            key={schedule.id} 
            className="bg-miracle-surface rounded-2xl shadow-hard border border-gray-100 overflow-hidden animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Header Jadwal yang lebih profesional */}
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-8 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white shadow-soft border border-gray-100">
                      <BookOpen size={22} className="text-miracle-blue" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-miracle-text tracking-tight">{schedule.subject}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-miracle-text-secondary">
                        <span className="flex items-center gap-2 bg-miracle-background px-3 py-1.5 rounded-lg">
                          <Clock size={15} />
                          <span className="font-medium">{schedule.day_of_week} • {schedule.start_time}</span>
                        </span>
                        <span className="flex items-center gap-2 bg-miracle-background px-3 py-1.5 rounded-lg">
                          <User size={15} />
                          <span className="font-medium">Mentor: {schedule.mentor_name || '-'}</span>
                        </span>
                        <span className="flex items-center gap-2 bg-miracle-background px-3 py-1.5 rounded-lg">
                          <User size={15} className="rotate-90" />
                          <span className="font-medium">Murid: {schedule.student_name || '-'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Card */}
                <div className="bg-white rounded-xl shadow-medium border border-gray-100 p-5 min-w-[200px]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-miracle-blue" />
                      <span className="text-xs font-semibold text-miracle-text-secondary uppercase tracking-wide">Progress</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-miracle-text">
                        {schedule.total_done}<span className="text-miracle-text-secondary">/{schedule.planned_sessions}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-miracle-background rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-miracle-blue to-miracle-light h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{ 
                        width: `${Math.min(100, (schedule.total_done / schedule.planned_sessions) * 100)}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-miracle-text-secondary">
                      {schedule.total_done} sesi selesai
                    </span>
                    <span className="text-xs font-semibold text-miracle-blue">
                      {Math.round((schedule.total_done / schedule.planned_sessions) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabel Sesi yang lebih clean */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-miracle-text-secondary uppercase tracking-wider">
                      Sesi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-miracle-text-secondary uppercase tracking-wider">
                      Waktu/Tanggal
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-miracle-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-miracle-text-secondary uppercase tracking-wider">
                      Bukti
                    </th>
                    {userRole === 'MENTOR' && (
                      <th className="px-6 py-4 text-center text-xs font-semibold text-miracle-text-secondary uppercase tracking-wider">
                        Aksi
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {schedule.sessions_status.map((session) => (
                    <tr key={session.number} className="hover:bg-miracle-background/50 transition-all duration-200 group">
                      {/* Sesi Ke- */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 ${
                            session.is_done 
                              ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-800 ring-2 ring-green-200/50' 
                              : 'bg-gray-100 text-miracle-text-secondary'
                          }`}>
                            {session.number}
                            {session.is_done && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                <CheckCircle size={8} className="text-white" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-miracle-text">Sesi {session.number}</div>
                            <div className="text-xs text-miracle-text-secondary">Pertemuan</div>
                          </div>
                        </div>
                      </td>

                      {/* Waktu/Tanggal */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-miracle-text">
                            {session.date_recorded ? formatDate(session.date_recorded) : 'Belum dilaksanakan'}
                          </div>
                          {session.date_recorded && (
                            <div className="flex items-center gap-1 text-xs text-miracle-text-secondary">
                              <Calendar size={12} />
                              <span>Dicatat pada {new Date(session.date_recorded).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        {session.status ? (
                          getStatusBadge(session.status)
                        ) : (
                          <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gray-100 text-gray-500 text-xs font-medium">
                            Belum Absen
                          </span>
                        )}
                      </td>

                      {/* Bukti Foto */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        {session.bukti_foto ? (
                          <button
                            onClick={() => handleImagePreview(session.bukti_foto!)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-miracle-blue rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 text-sm font-semibold border border-blue-100 hover:border-blue-200 group"
                          >
                            <Eye size={14} className="group-hover:scale-110 transition-transform" />
                            <span>Lihat Bukti</span>
                          </button>
                        ) : session.is_done ? (
                          <span className="text-xs text-miracle-text-secondary italic">Tidak ada bukti foto</span>
                        ) : (
                          <span className="text-xs text-miracle-text-secondary">-</span>
                        )}
                      </td>

                      {/* Aksi - Only for MENTOR */}
                      {userRole === 'MENTOR' && (
                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          {!session.is_done ? (
                            <button
                              onClick={() => onAttendanceSubmit(schedule, session.number)}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-sm font-semibold shadow-medium hover:shadow-hard transform hover:-translate-y-0.5"
                            >
                              <Plus size={16} />
                              <span>Absen Sekarang</span>
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl text-sm font-semibold border border-gray-200">
                              <CheckCircle size={16} className="text-green-600" />
                              <span>Sudah Absen</span>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer dengan informasi tambahan */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${schedule.total_done === schedule.planned_sessions ? 'bg-green-500' : 'bg-miracle-blue'}`}></div>
                  <span className="text-sm font-medium text-miracle-text">
                    {schedule.total_done === schedule.planned_sessions 
                      ? '🎉 Kelas telah selesai sepenuhnya!' 
                      : `${schedule.planned_sessions - schedule.total_done} sesi tersisa untuk menyelesaikan kelas`
                    }
                  </span>
                </div>
                <div className="text-sm text-miracle-text-secondary">
                  Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
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
