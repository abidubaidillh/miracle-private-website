// frontend/src/lib/userActions.ts
import { getAuthToken } from "./auth";

/**
 * Helper untuk memastikan URL dasar selalu berakhir dengan /api 
 */
const getBaseUrl = () => {
    let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return url.replace(/\/$/, "") + "/api";
};

const API_BASE_URL = getBaseUrl();

/**
 * Action untuk mendaftarkan user internal (Mentor/Admin/Bendahara)
 */
export const registerInternalUser = async (formData: any) => {
    const token = getAuthToken();

    if (!token) {
        throw new Error("Token otorisasi tidak ditemukan. Silakan login kembali.");
    }

    // Memanggil ke /api/auth/register-internal
    const res = await fetch(`${API_BASE_URL}/auth/register-internal`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || data.message || 'Gagal mendaftarkan user');
    }

    return data;
};