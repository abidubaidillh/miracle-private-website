// frontend/lib/mentorActions.ts

const API_BASE_URL = "http://localhost:4000/api/mentors"

// ===============================
// TYPE
// ===============================
export interface Mentor {
  id: string
  name: string
  phone_number: string
  address?: string | null
  expertise?: string | null
  salary_per_session: number
  status: "AKTIF" | "NON-AKTIF"
  created_at?: string
  updated_at?: string
}

interface MentorResponse {
  mentors: Mentor[]
  stats: {
    active: number
    inactive: number
  }
}

// ===============================
// AUTH FETCH (WAJIB)
// ===============================
async function authFetch(
  url: string,
  options: RequestInit = {}
) {
  return fetch(url, {
    ...options,
    credentials: "include", // 🔐 WAJIB
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  })
}

// ===============================
// GET (READ ALL / SELF)
// ===============================
export async function getMentors(): Promise<{
  mentors: Mentor[]
  activeCount: number
  inactiveCount: number
}> {
  const response = await authFetch(API_BASE_URL)

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data mentor")
  }

  return {
    mentors: result.mentors || [],
    activeCount: result.stats?.active || 0,
    inactiveCount: result.stats?.inactive || 0,
  }
}

// ===============================
// POST (CREATE)
// ===============================
export async function createMentor(
  payload: Omit<Mentor, "id">
): Promise<Mentor> {
  const response = await authFetch(API_BASE_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || "Gagal menambahkan mentor")
  }

  return result.mentor as Mentor
}

// ===============================
// PUT (UPDATE)
// ===============================
export async function updateMentor(
  mentorId: string,
  payload: Partial<Omit<Mentor, "id">>
): Promise<Mentor> {
  const response = await authFetch(`${API_BASE_URL}/${mentorId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui mentor")
  }

  return result.mentor as Mentor
}

// ===============================
// DELETE
// ===============================
export async function deleteMentor(
  mentorId: string
): Promise<void> {
  const response = await authFetch(`${API_BASE_URL}/${mentorId}`, {
    method: "DELETE",
  })

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.message || "Gagal menghapus mentor")
  }
}