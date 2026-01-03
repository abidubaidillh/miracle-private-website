import { useState, useEffect, useMemo } from 'react'
import { useUser } from '@/context/UserContext'
import { useLoading } from '@/context/LoadingContext'
import { AttendanceService } from '@/lib/attendanceService'

export interface UseAttendanceReturn {
  // Data
  schedules: any[]
  filteredSchedules: any[]
  month: number
  year: number
  filterProgress: string
  
  // Loading states
  isUploading: boolean
  
  // Modal states
  showPhotoModal: boolean
  selectedSchedule: any | null
  selectedSession: number
  
  // Actions
  setFilterProgress: (filter: string) => void
  handleAttendanceSubmit: (schedule: any, sessionNumber: number) => void
  handlePhotoSubmit: (file: File) => Promise<void>
  closePhotoModal: () => void
  refreshData: () => Promise<void>
}

export function useAttendance(): UseAttendanceReturn {
  const { user } = useUser()
  const { withLoading } = useLoading()
  
  // Fixed month and year (current month/year)
  const month = new Date().getMonth() + 1
  const year = new Date().getFullYear()
  
  // Progress filter state
  const [filterProgress, setFilterProgress] = useState<string>('all')
  
  // Data state
  const [schedules, setSchedules] = useState<any[]>([])
  
  // Modal states
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null)
  const [selectedSession, setSelectedSession] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch data function
  const fetchData = async () => {
    if (!user) return

    await withLoading(async () => {
      try {
        const mentorId = user.role === 'MENTOR' ? user.id : undefined
        const data = await AttendanceService.fetchAttendance(month, year, mentorId)
        setSchedules(data)
      } catch (error) {
        console.error("Failed to fetch attendance:", error)
        setSchedules([])
      }
    })
  }

  // Load data when user changes
  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  // Filter schedules based on progress
  const filteredSchedules = useMemo(() => {
    if (!schedules || schedules.length === 0) return []
    
    switch (filterProgress) {
      case 'in-progress':
        return schedules.filter(schedule => {
          const totalDone = schedule.sessions_status?.filter((s: any) => s.is_done).length || 0
          const totalSessions = schedule.planned_sessions || schedule.sessions_status?.length || 0
          return totalDone < totalSessions
        })
      case 'completed':
        return schedules.filter(schedule => {
          const totalDone = schedule.sessions_status?.filter((s: any) => s.is_done).length || 0
          const totalSessions = schedule.planned_sessions || schedule.sessions_status?.length || 0
          return totalDone >= totalSessions
        })
      case 'all':
      default:
        return schedules
    }
  }, [schedules, filterProgress])

  // Handle attendance submission
  const handleAttendanceSubmit = async (schedule: any, sessionNumber: number) => {
    if (user?.role === 'MENTOR') {
      // For mentors, show photo upload modal
      setSelectedSchedule(schedule)
      setSelectedSession(sessionNumber)
      setShowPhotoModal(true)
    } else {
      // For admin/owner, direct submit without photo
      try {
        await withLoading(async () => {
          await AttendanceService.submitAttendanceWithoutPhoto(
            schedule, 
            sessionNumber, 
            month, 
            year
          )
          await fetchData() // Refresh data
        })
        alert('Absensi berhasil disimpan!')
      } catch (error) {
        alert('Gagal menyimpan absensi: ' + (error as any).message)
      }
    }
  }

  // Handle photo submission
  const handlePhotoSubmit = async (file: File) => {
    if (!selectedSchedule || !user) return

    try {
      setIsUploading(true)
      
      await AttendanceService.submitAttendanceWithPhoto(
        selectedSchedule,
        selectedSession,
        month,
        year,
        file,
        user.id
      )

      // Reset states and refresh data
      closePhotoModal()
      await fetchData()
      
      alert('Absensi berhasil disimpan!')
    } catch (error) {
      alert('Gagal menyimpan absensi: ' + (error as any).message)
    } finally {
      setIsUploading(false)
    }
  }

  // Close photo modal
  const closePhotoModal = () => {
    setShowPhotoModal(false)
    setSelectedSchedule(null)
    setSelectedSession(0)
  }

  // Refresh data function
  const refreshData = fetchData

  return {
    // Data
    schedules,
    filteredSchedules,
    month,
    year,
    filterProgress,
    
    // Loading states
    isUploading,
    
    // Modal states
    showPhotoModal,
    selectedSchedule,
    selectedSession,
    
    // Actions
    setFilterProgress,
    handleAttendanceSubmit,
    handlePhotoSubmit,
    closePhotoModal,
    refreshData
  }
}
