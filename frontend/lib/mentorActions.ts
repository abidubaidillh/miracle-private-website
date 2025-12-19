import { getAuthToken } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

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

// Definisi tipe data Jadwal Ringkas (dari join backend)
export interface ScheduleSummary {
  id: string
  date: string
  time: string
  subject: string
  students?: {
    name: string
  }
}

// Interface khusus untuk Profile Page Response
export interface MentorProfile {
  mentor: Mentor
  upcoming_schedules: ScheduleSummary[] // ✅ WAJIB ADA: Agar list jadwal muncul
  stats: {
    sessions_this_month: number
    estimated_income: number
  }
}

// ==========================================
// HELPER FETCH
// ==========================================
async function authFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken()
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Handle Unauthorized (Token Expired)
  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/login'
    throw new Error("Sesi habis. Silakan login kembali.")
  }

  const result = await res.json()

  if (!res.ok) {
    throw new Error(result.message || result.error || "Terjadi kesalahan pada server")
  }

  return result
}

// ==========================================
// ACTIONS
// ==========================================

// 1. Get All Mentors (Untuk Admin - List View)
export async function getMentors() {
  return await authFetch("/mentors")
}

// 2. Get My Profile (Untuk Mentor Login - Dashboard) 
// Return type disesuaikan dengan interface MentorProfile
export async function getMentorProfile(): Promise<MentorProfile> {
  return await authFetch("/mentors/me")
}

// 3. Create Mentor
export async function createMentor(data: any) {
  return await authFetch("/mentors", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// 4. Update Mentor
export async function updateMentor(id: string, data: any) {
  return await authFetch(`/mentors/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

// 5. Delete Mentor
export async function deleteMentor(id: string) {
  return await authFetch(`/mentors/${id}`, {
    method: "DELETE",
  })
}