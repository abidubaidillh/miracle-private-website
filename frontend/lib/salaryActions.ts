// frontend/src/lib/salaryActions.ts
import { getAuthToken } from "./auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

/**
 * Helper untuk mengambil header standar termasuk Token Auth
 */
const getHeaders = () => {
    const token = getAuthToken()
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
}

/**
 * 1. Ambil list gaji semua mentor (Untuk OWNER / BENDAHARA / ADMIN)
 * Digunakan di tabel utama penggajian dengan filter bulan & tahun
 */
export const getSalaries = async (month: number, year: number) => {
    const res = await fetch(`${API_URL}/salaries?month=${month}&year=${year}`, {
        headers: getHeaders()
    })
    
    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || errorData.error || "Gagal mengambil data gaji")
    }
    
    return res.json()
}

/**
 * 2. Ambil riwayat gaji milik sendiri (Khusus Role MENTOR)
 * Pastikan di Backend routes menggunakan path '/my-salary'
 */
export const getMySalaries = async () => {
    const res = await fetch(`${API_URL}/salaries/my-salary`, {
        headers: getHeaders()
    })

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || errorData.error || "Gagal mengambil data gaji pribadi")
    }

    return res.json()
}

/**
 * 3. Simpan Draft Gaji (Untuk OWNER / BENDAHARA)
 * Digunakan saat admin mengubah bonus/potongan atau mengunci sesi absensi
 */
export const saveSalaryDraft = async (data: {
    mentor_id: string;
    month: number;
    year: number;
    total_sessions: number;
    salary_per_session: number;
    bonus: number;
    deduction: number;
}) => {
    const res = await fetch(`${API_URL}/salaries/save`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    })

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || errorData.error || "Gagal menyimpan draft gaji")
    }

    return res.json()
}

/**
 * 4. Konfirmasi Pembayaran Gaji (Untuk OWNER / BENDAHARA)
 * @param id - ID baris gaji dari tabel salaries
 * @param proof_image - URL bukti transfer (setelah diupload ke storage)
 */
export const paySalary = async (id: string, proof_image: string) => {
    const res = await fetch(`${API_URL}/salaries/${id}/pay`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ proof_image })
    })

    if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || errorData.error || "Gagal memproses pembayaran gaji")
    }

    return res.json()
}