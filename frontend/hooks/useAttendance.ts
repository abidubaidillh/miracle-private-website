import { useState, useEffect } from 'react'
import { useUser } from '@/context/UserContext'
import { useLoading } from '@/context/LoadingContext'
import { AttendanceService } from '@/lib/attendanceService'

export interface UseAttendanceReturn {
  // Data
  schedules: any[]
  month: number
  year: number
  
  // Loading states
  isUploading: boolean
  
  // Modal states
  showPhotoModal: boolean
  selectedSchedule: any | null
  selectedSession: number
  
  // Actions
  setMonth: (month: number) => void
  setYear: (year: number) => void
  handleAttendanceSubmit: (schedule: any, sessionNumber: number) => void
  handlePhotoSubmit: (file: File) => Promise<void>
  closePhotoModal: () => void
  refreshData: () => Promise<void>
}

export function useAttendance(): UseAttendanceReturn {
  const { user } = useUser()
  const { withLoading } = useLoading()
  
  // Filter states
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  
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

  // Load data when user or filters change
  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, month, year])

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
    month,
    year,
    
    // Loading states
    isUploading,
    
    // Modal states
    showPhotoModal,
    selectedSchedule,
    selectedSession,
    
    // Actions
    setMonth,
    setYear,
    handleAttendanceSubmit,
    handlePhotoSubmit,
    closePhotoModal,
    refreshData
  }
}