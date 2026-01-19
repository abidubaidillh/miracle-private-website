import { getAuthToken } from './auth'
import { createClient } from '@supabase/supabase-js'

/**
 * Konfigurasi URL API
 * Memastikan path selalu bersih dan mengarah ke /api
 */
const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  return url.replace(/\/$/, "") + "/api"
}

const API_URL = getBaseUrl()

/**
 * Inisialisasi Supabase Client untuk akses Storage (Bukti Foto)
 */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Interface untuk pengiriman data absensi
 */
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
   * Mengambil data absensi bulanan dari backend
   * Mendukung filter berdasarkan bulan, tahun, dan mentor_id (optional)
   */
  static async fetchAttendance(
    month: number, 
    year: number, 
    mentorId?: string
  ): Promise<any[]> {
    try {
      const token = getAuthToken()
      
      const params = new URLSearchParams({
        month: month.toString(),
        year: year.toString(),
      })
      
      if (mentorId) {
        params.append('mentor_id', mentorId)
      }

      console.log(`[DEBUG FRONTEND] Fetching attendance with params:`, {
        month,
        year,
        mentorId,
        url: `${API_URL}/attendance?${params.toString()}`
      })

      const response = await fetch(`${API_URL}/attendance?${params.toString()}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
      
      console.log(`[DEBUG FRONTEND] Response status:`, response.status)
      
      const data = await response.json()
      
      console.log(`[DEBUG FRONTEND] Response data:`, data)

      if (response.ok) {
        // Normalisasi: Backend bisa mengirim { schedules: [] } atau [] langsung
        const result = data.schedules || data
        return Array.isArray(result) ? result : []
      } else {
        console.error("Backend error:", data.error || "Unknown Error")
        return []
      }
    } catch (error) {
      console.error("Failed to fetch attendance data:", error)
      return []
    }
  }

  /**
   * Mengunggah foto bukti absensi ke Supabase Storage
   * Menggunakan folder 'absensi_mentors'
   */
  static async uploadPhoto(file: File, userId: string): Promise<string> {
    try {
      // Buat nama file unik: user_id + timestamp
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}_${Date.now()}.${fileExt}`
      const filePath = `bukti-pertemuan/${fileName}`
      
      const { data, error } = await supabase.storage
        .from('absensi_mentors')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Ambil URL publik untuk disimpan di database
      const { data: { publicUrl } } = supabase.storage
        .from('absensi_mentors')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Photo upload failed:', error)
      throw new Error('Gagal mengupload foto: ' + (error as any).message)
    }
  }

  /**
   * Mengirim data record absensi ke Database melalui API Backend
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

  /**
   * Helper: Submit absensi lengkap dengan proses upload foto
   */
  static async submitAttendanceWithPhoto(
    schedule: any,
    sessionNumber: number,
    month: number,
    year: number,
    file: File,
    userId: string
  ): Promise<void> {
    // 1. Upload foto terlebih dahulu
    const photoUrl = await this.uploadPhoto(file, userId)
    
    // 2. Kirim data ke backend dengan URL foto
    await this.submitAttendance({
      schedule_id: schedule.id,
      // Fallback ID Mentor: cek di root object atau di dalam relasi mentors
      mentor_id: schedule.mentor_id || schedule.mentors?.id || userId,
      session_number: sessionNumber,
      month,
      year,
      status: 'HADIR',
      bukti_foto: photoUrl
    })
  }

  /**
   * Helper: Submit absensi tanpa foto (misal: untuk Admin atau perbaikan data)
   */
  static async submitAttendanceWithoutPhoto(
    schedule: any,
    sessionNumber: number,
    month: number,
    year: number
  ): Promise<void> {
    await this.submitAttendance({
      schedule_id: schedule.id,
      mentor_id: schedule.mentor_id || schedule.mentors?.id,
      session_number: sessionNumber,
      month,
      year,
      status: 'HADIR',
      bukti_foto: null
    })
  }
}