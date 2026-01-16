import { getAuthToken } from './auth'
import { createClient } from '@supabase/supabase-js'

// Memastikan URL berakhir dengan /api
const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  return url.replace(/\/$/, "") + "/api"
}

const API_URL = getBaseUrl()

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface AttendanceSubmission {
  schedule_id: string
  mentor_id: string
  session_number: number
  month: number
  year: number
  status: string
  bukti_foto?: string | null
}

export class AttendanceService {
  /**
   * Fetch attendance data for a specific month/year
   * URL Target: GET /api/attendance?...
   */
  static async fetchAttendance(
    month: number, 
    year: number, 
    mentorId?: string
  ): Promise<any[]> {
    try {
      const token = getAuthToken()
      
      let queryParams = `month=${month}&year=${year}`
      if (mentorId) {
        queryParams += `&mentor_id=${mentorId}`
      }

      const response = await fetch(`${API_URL}/attendance?${queryParams}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      const data = await response.json()

      if (response.ok) {
        // Backend kita mengembalikan { schedules: [...] } atau array langsung
        return data.schedules || data || []
      } else {
        console.error("Backend error:", data.error)
        return []
      }
    } catch (error) {
      console.error("Failed to fetch attendance data:", error)
      return []
    }
  }

  /**
   * Upload photo to Supabase Storage
   */
  static async uploadPhoto(file: File, userId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}_${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('absensi_mentors')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('absensi_mentors')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Photo upload failed:', error)
      throw new Error('Gagal mengupload foto: ' + (error as any).message)
    }
  }

  /**
   * Submit attendance record
   * URL Target: POST /api/attendance/submit
   */
  static async submitAttendance(submission: AttendanceSubmission): Promise<void> {
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${API_URL}/attendance/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submission),
        credentials: 'include'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Gagal menyimpan absensi')
      }
    } catch (error) {
      console.error('Attendance submission failed:', error)
      throw error
    }
  }

  static async submitAttendanceWithPhoto(
    schedule: any,
    sessionNumber: number,
    month: number,
    year: number,
    file: File,
    userId: string
  ): Promise<void> {
    const photoUrl = await this.uploadPhoto(file, userId)
    
    await this.submitAttendance({
      schedule_id: schedule.id,
      mentor_id: schedule.mentor_id || (schedule.mentors?.id), // Handle various join structures
      session_number: sessionNumber,
      month,
      year,
      status: 'HADIR',
      bukti_foto: photoUrl
    })
  }

  static async submitAttendanceWithoutPhoto(
    schedule: any,
    sessionNumber: number,
    month: number,
    year: number
  ): Promise<void> {
    await this.submitAttendance({
      schedule_id: schedule.id,
      mentor_id: schedule.mentor_id || (schedule.mentors?.id),
      session_number: sessionNumber,
      month,
      year,
      status: 'HADIR',
      bukti_foto: null
    })
  }
}