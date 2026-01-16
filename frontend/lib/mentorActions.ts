import { getAuthToken } from "./auth"

/**
 * Logika API_BASE_URL:
 * Kita memastikan URL dasar selalu berakhir dengan /api tanpa double slash.
 */
const getBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
  // Hapus slash di akhir jika ada, lalu tambahkan /api secara konsisten
  return url.replace(/\/$/, "") + "/api"
}

const API_BASE_URL = getBaseUrl()

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface Mentor {
  id: string
  name: string
  email?: string
  phone_number: string
  address?: string | null
  subject?: string | null
  subjects?: string | null
  expertise?: string | null
  salary_per_session: number
  status: "AKTIF" | "NON-AKTIF"
}

export interface ScheduleSummary {
  id: string
  date: string
  time: string
  subject: string
  students?: {
    name: string
  }
}

export interface MentorProfile {
  mentor: Mentor
  upcoming_schedules: ScheduleSummary[]
  stats: {
    sessions_this_month: number
    estimated_income: number
  }
}

// ==========================================
// HELPER FETCH
// ==========================================

/**
 * authFetch: Helper untuk melakukan request ke backend dengan 
 * menyertakan token Bearer secara otomatis.
 */
async function authFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken()
  
  // Pastikan endpoint diawali dengan satu slash saja
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...options.headers,
  }

  // Final URL Construction: base + /api + /mentors
  const finalUrl = `${API_BASE_URL}${cleanEndpoint}`

  try {
    const res = await fetch(finalUrl, {
      ...options,
      headers,
      // Penting jika backend menggunakan session/cookie-parser
      credentials: 'include' 
    })

    // Handle 401: Unauthorized (Sesi habis/Token salah)
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        // Bersihkan data jika perlu lalu lempar ke login
        window.location.href = '/login'
      }
      throw new Error("Sesi habis. Silakan login kembali.")
    }

    // Jika 404, berikan pesan yang lebih informatif untuk debugging
    if (res.status === 404) {
      throw new Error(`Endpoint tidak ditemukan (404): ${finalUrl}`)
    }

    const result = await res.json()

    if (!res.ok) {
      throw new Error(result.message || result.error || "Terjadi kesalahan pada server")
    }

    return result
  } catch (error: any) {
    console.error(`Fetch Error [${finalUrl}]:`, error.message)
    throw error
  }
}

// ==========================================
// ACTIONS
// ==========================================

/**
 * 1. Get All Mentors (Admin/Owner)
 * Backend Route: GET /api/mentors
 */
export async function getMentors() {
  return await authFetch("/mentors")
}

/**
 * 2. Get My Profile (Mentor)
 * Backend Route: GET /api/mentors/me
 */
export async function getMentorProfile(): Promise<MentorProfile> {
  return await authFetch("/mentors/me")
}

/**
 * 3. Create Mentor
 * Backend Route: POST /api/mentors
 */
export async function createMentor(data: Partial<Mentor>) {
  return await authFetch("/mentors", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * 4. Update Mentor
 * Backend Route: PUT /api/mentors/:id
 */
export async function updateMentor(id: string, data: Partial<Mentor>) {
  return await authFetch(`/mentors/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

/**
 * 5. Delete Mentor
 * Backend Route: DELETE /api/mentors/:id
 */
export async function deleteMentor(id: string) {
  return await authFetch(`/mentors/${id}`, {
    method: "DELETE",
  })
}