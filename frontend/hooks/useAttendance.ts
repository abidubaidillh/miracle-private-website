import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/context/UserContext'
import { useLoading } from '@/context/LoadingContext'
import { AttendanceService } from '@/lib/attendanceService' // Sesuaikan path-nya

export function useAttendance() {
  const { user } = useUser()
  const { withLoading } = useLoading()
  
  const month = new Date().getMonth() + 1
  const year = new Date().getFullYear()
  
  const [filterProgress, setFilterProgress] = useState<string>('all')
  const [schedules, setSchedules] = useState<any[]>([])
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null)
  const [selectedSession, setSelectedSession] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)

  const fetchData = async () => {
    if (!user) return

    await withLoading(async () => {
      try {
        // Admin/Owner melihat semua, Mentor hanya miliknya
        const mentorId = user.role === 'MENTOR' ? user.id : undefined
        const data = await AttendanceService.fetchAttendance(month, year, mentorId)
        setSchedules(data)
      } catch (error) {
        console.error("Failed to fetch attendance:", error)
        setSchedules([])
      }
    })
  }

  useEffect(() => {
    if (user) fetchData()
  }, [user])

  const filteredSchedules = useMemo(() => {
    if (!schedules || !Array.isArray(schedules)) return []
    
    if (filterProgress === 'in-progress') {
      return schedules.filter(s => (s.sessions_done || 0) < (s.planned_sessions || 8))
    }
    if (filterProgress === 'completed') {
      return schedules.filter(s => (s.sessions_done || 0) >= (s.planned_sessions || 8))
    }
    return schedules
  }, [schedules, filterProgress])

  const handleAttendanceSubmit = async (schedule: any, sessionNumber: number) => {
    if (user?.role === 'MENTOR') {
      setSelectedSchedule(schedule)
      setSelectedSession(sessionNumber)
      setShowPhotoModal(true)
    } else {
      // Logic for Admin/Owner
      try {
        await withLoading(async () => {
          await AttendanceService.submitAttendanceWithoutPhoto(schedule, sessionNumber, month, year)
          await fetchData()
        })
      } catch (error: any) {
        alert(error.message)
      }
    }
  }

  const handlePhotoSubmit = async (file: File) => {
    if (!selectedSchedule || !user) return
    setIsUploading(true)
    try {
      await AttendanceService.submitAttendanceWithPhoto(
        selectedSchedule,
        selectedSession,
        month,
        year,
        file,
        user.id
      )
      setShowPhotoModal(false)
      await fetchData()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const closePhotoModal = () => {
    setShowPhotoModal(false)
    setSelectedSchedule(null)
  }

  return {
    schedules,
    filteredSchedules,
    month,
    year,
    filterProgress,
    isUploading,
    showPhotoModal,
    selectedSchedule,
    selectedSession,
    setFilterProgress,
    handleAttendanceSubmit,
    handlePhotoSubmit,
    closePhotoModal,
    refreshData: fetchData
  }
}