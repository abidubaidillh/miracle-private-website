import { getAuthToken } from "./auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export const getFinanceSummary = async () => {
    const token = getAuthToken()
    const res = await fetch(`${API_URL}/finance/summary`, {
        headers: { Authorization: `Bearer ${token}` },
        // next: { revalidate: 0 } // Gunakan jika perlu disable cache di Next.js
    })
    
    if (!res.ok) throw new Error("Gagal mengambil data keuangan")
    return res.json()
}