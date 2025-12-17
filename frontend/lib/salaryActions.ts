import { getAuthToken } from "./auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

// Ambil list gaji berdasarkan bulan/tahun
export const getSalaries = async (month: number, year: number) => {
    const token = getAuthToken()
    const res = await fetch(`${API_URL}/salaries?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error("Gagal mengambil data gaji")
    return res.json()
}

// Simpan Draft (Hitung Ulang)
export const saveSalaryDraft = async (data: any) => {
    const token = getAuthToken()
    const res = await fetch(`${API_URL}/salaries/save`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data)
    })
    if (!res.ok) throw new Error("Gagal menyimpan draft gaji")
    return res.json()
}

// Bayar (Finalize)
export const paySalary = async (id: string) => {
    const token = getAuthToken()
    const res = await fetch(`${API_URL}/salaries/${id}/pay`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error("Gagal memproses pembayaran gaji")
    return res.json()
}