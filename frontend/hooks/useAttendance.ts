import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useUser } from '@/context/UserContext'
import { useLoading } from '@/context/LoadingContext'
import { AttendanceService } from '@/lib/attendanceService'

export function useAttendance() {
  const { user, isLoading: isAuthLoading } = useUser()
  const { withLoading } = useLoading()
  
  // State Utama
  const [schedules, setSchedules] = useState<any[]>([])
  const [filterProgress, setFilterProgress] = useState<string>('all')
  const [showPhotoModal, setShowPhotoModal] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null)
  const [selectedSession, setSelectedSession] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  // Ref untuk mengontrol siklus fetch
  const lastFetchedKey = useRef<string | null>(null)
  const isFetching = useRef(false)

  // Memoize nilai tanggal agar tidak berubah setiap render
  const dateValues = useMemo(() => {
    const now = new Date()
    return { 
      month: now.getMonth() + 1, 
      year: now.getFullYear() 
    }
  }, [])

  // Fungsi Fetch Utama
  const fetchData = useCallback(async (force = false) => {
    console.log(`[DEBUG HOOK] fetchData called - force: ${force}`)
    console.log(`[DEBUG HOOK] isAuthLoading: ${isAuthLoading}`)
    console.log(`[DEBUG HOOK] user?.id: ${user?.id}`)
    console.log(`[DEBUG HOOK] user?.role: ${user?.role}`)
    
    // Guard: Jangan fetch jika auth belum siap atau user tidak ada
    if (isAuthLoading || !user?.id) {
      console.log(`[DEBUG HOOK] Guard condition met - returning early`)
      return
    }
    
    // Key unik berdasarkan User ID + Bulan + Tahun
    const currentFetchKey = `${user.id}-${dateValues.month}-${dateValues.year}`
    
    // Guard: Jangan fetch jika data sudah ada untuk key yang sama (kecuali force refresh)
    if (!force && lastFetchedKey.current === currentFetchKey) return
    if (isFetching.current) return

    try {
      isFetching.current = true
      
      const execute = async () => {
        // Mentor hanya melihat jadwal miliknya, Admin/Lainnya melihat semua (atau sesuai filter backend)
        const mentorId = user.role === 'MENTOR' ? user.id : undefined
        
        const data = await AttendanceService.fetchAttendance(
          dateValues.month, 
          dateValues.year, 
          mentorId
        )
        
        // Normalisasi data: Pastikan selalu array
        const validatedData = Array.isArray(data) ? data : []
        setSchedules(validatedData)
        
        lastFetchedKey.current = currentFetchKey
        setIsFirstLoad(false)
      }

      // Gunakan global loading spinner hanya pada pemuatan pertama atau saat force refresh
      if (force || isFirstLoad) {
        await withLoading(execute)
      } else {
        await execute()
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error)
      // Jika error, jangan kunci key agar bisa mencoba lagi nanti
      lastFetchedKey.current = null 
    } finally {
      isFetching.current = false
    }
  }, [user?.id, user?.role, dateValues, withLoading, isAuthLoading, isFirstLoad])

  // Effect untuk auto-fetch saat user sudah login
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Logika Filter Data di Client-side
  const filteredSchedules = useMemo(() => {
    if (!schedules || schedules.length === 0) return []
    
    return schedules.filter(s => {
      // Menghitung sesi yang sudah selesai berdasarkan array sessions_status dari backend
      const doneSessions = s.sessions_status?.filter((sess: any) => sess.is_done).length || 0
      const totalPlanned = s.planned_sessions || 8
      
      if (filterProgress === 'in-progress') return doneSessions < totalPlanned
      if (filterProgress === 'completed') return doneSessions >= totalPlanned
      return true
    })
  }, [schedules, filterProgress])

  // Handler untuk Submit Absensi (Buka Modal atau Langsung)
  const handleAttendanceSubmit = async (schedule: any, sessionNumber: number) => {
    if (!user) return
    
    // Mentor diwajibkan upload foto (membuka modal)
    if (user.role === 'MENTOR') {
      setSelectedSchedule(schedule)
      setSelectedSession(sessionNumber)
      setShowPhotoModal(true)
    } else {
      // Admin atau role lain bisa absen tanpa foto
      try {
        await withLoading(async () => {
          await AttendanceService.submitAttendanceWithoutPhoto(
            schedule, 
            sessionNumber, 
            dateValues.month, 
            dateValues.year
          )
          await fetchData(true) // Refresh data setelah sukses
        })
      } catch (error: any) {
        alert(error.message || "Gagal melakukan absensi")
      }
    }
  }

  // Handler untuk Submit dengan Foto (dari Modal)
  const handlePhotoSubmit = async (file: File) => {
    if (!selectedSchedule || !user) return
    
    setIsUploading(true)
    try {
      await AttendanceService.submitAttendanceWithPhoto(
        selectedSchedule, 
        selectedSession, 
        dateValues.month, 
        dateValues.year, 
        file, 
        user.id
      )
      
      setShowPhotoModal(false)
      setSelectedSchedule(null)
      await fetchData(true) // Refresh data setelah sukses
    } catch (error: any) {
      alert(error.message || "Gagal mengunggah absensi")
    } finally {
      setIsUploading(false)
    }
  }

  return {
    schedules,
    filteredSchedules,
    isLoading: isAuthLoading || (isFirstLoad && schedules.length === 0),
    month: dateValues.month,
    year: dateValues.year,
    filterProgress,
    isUploading,
    showPhotoModal,
    selectedSchedule,
    selectedSession,
    setFilterProgress,
    handleAttendanceSubmit,
    handlePhotoSubmit,
    closePhotoModal: () => { 
      setShowPhotoModal(false)
      setSelectedSchedule(null) 
    },
    refreshData: () => fetchData(true)
  }
}