import { getAuthToken } from './auth'
import { createClient } from '@supabase/supabase-js'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface AttendanceData {
  schedules: any[]
}

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
   */
  static async fetchAttendance(
    month: number, 
    year: number, 
    mentorId?: string
  ): Promise<any[]> {
    try {
      const token = getAuthToken()
      
      // Build query parameters
      let queryParams = `month=${month}&year=${year}`
      if (mentorId) {
        queryParams += `&mentor_id=${mentorId}`
      }

      const response = await fetch(`${API_URL}/attendance?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const data = await response.json()

      // Validate response format
      if (Array.isArray(data)) {
        return data
      } else {
        console.error("Invalid data format from backend:", data)
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
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}_${Date.now()}.${fileExt}`
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('absensi_mentors')
        .upload(fileName, file)

      if (error) {
        console.error('Supabase upload error:', error)
        throw error
      }

      // Get public URL
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
   */
  static async submitAttendance(submission: AttendanceSubmission): Promise<void> {
    try {
      const token = getAuthToken()
      
      const response = await fetch(`${API_URL}/attendance/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(submission)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan absensi')
      }
    } catch (error) {
      console.error('Attendance submission failed:', error)
      throw error
    }
  }

  /**
   * Submit attendance with photo upload
   */
  static async submitAttendanceWithPhoto(
    schedule: any,
    sessionNumber: number,
    month: number,
    year: number,
    file: File,
    userId: string
  ): Promise<void> {
    // Upload photo first
    const photoUrl = await this.uploadPhoto(file, userId)
    
    // Then submit attendance
    await this.submitAttendance({
      schedule_id: schedule.id,
      mentor_id: schedule.mentors.id,
      session_number: sessionNumber,
      month,
      year,
      status: 'HADIR',
      bukti_foto: photoUrl
    })
  }

  /**
   * Submit attendance without photo (for admin/owner)
   */
  static async submitAttendanceWithoutPhoto(
    schedule: any,
    sessionNumber: number,
    month: number,
    year: number
  ): Promise<void> {
    await this.submitAttendance({
      schedule_id: schedule.id,
      mentor_id: schedule.mentors.id,
      session_number: sessionNumber,
      month,
      year,
      status: 'HADIR',
      bukti_foto: null
    })
  }
}