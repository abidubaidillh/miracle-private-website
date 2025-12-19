// src/lib/userActions.ts
import { getAuthToken } from "./auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

/**
 * Action untuk mendaftarkan user internal (Mentor/Admin/Bendahara)
 * Meniru gaya salaryActions.ts
 */
export const registerInternalUser = async (formData: any) => {
    // Ambil token dari cookie 'auth' lewat helper auth.ts
    const token = getAuthToken()

    if (!token) {
        throw new Error("Token otorisasi tidak ditemukan. Silakan login kembali.")
    }

    const res = await fetch(`${API_URL}/auth/register-internal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
    })

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.error || data.message || 'Gagal mendaftarkan user')
    }

    return data
}