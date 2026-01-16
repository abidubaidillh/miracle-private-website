import { getAuthToken } from './auth'

/**
 * Pastikan URL dasar selalu berakhir dengan /api 
 * agar tidak terjadi error 404 pada backend yang baru.
 */
const getBaseUrl = () => {
    let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    return url.replace(/\/$/, "") + "/api"
}

const API_BASE_URL = getBaseUrl()

/**
 * Helper untuk menyusun Header secara konsisten.
 * Menggunakan getAuthToken() yang sudah teruji di modul lain.
 */
const getHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    }
}

// ==========================================
// ACTIONS
// ==========================================

/**
 * 1. Ambil List Pembayaran
 * Backend Route: GET /api/payments?...
 */
export const getPayments = async (search = '', status = '') => {
    try {
        const query = new URLSearchParams({ search, status }).toString()
        const res = await fetch(`${API_BASE_URL}/payments?${query}`, { 
            headers: getHeaders(),
            credentials: 'include'
        })
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal mengambil data pembayaran')
        }
        
        return res.json()
    } catch (error: any) {
        console.error("Error getPayments:", error.message)
        throw error
    }
}

/**
 * 2. Simpan Pembayaran Baru
 * Backend Route: POST /api/payments
 */
export const createPayment = async (data: any) => {
    try {
        const res = await fetch(`${API_BASE_URL}/payments`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal menyimpan pembayaran')
        }

        return res.json()
    } catch (error: any) {
        console.error("Error createPayment:", error.message)
        throw error
    }
}

/**
 * 3. Hapus Pembayaran
 * Backend Route: DELETE /api/payments/:id
 */
export const deletePayment = async (id: string) => {
    try {
        const res = await fetch(`${API_BASE_URL}/payments/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include'
        })

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || 'Gagal menghapus pembayaran')
        }

        return res.json()
    } catch (error: any) {
        console.error("Error deletePayment:", error.message)
        throw error
    }
}