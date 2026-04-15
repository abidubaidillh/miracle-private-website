// frontend/lib/jadwalActions.ts
import { fetchWithAuth } from './apiClient';

/**
 * Normalisasi URL Dasar
 * Memastikan tidak ada double slash (//) dan tidak ada double /api
 */
const getApiBase = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    // Hapus slash di akhir jika ada, hapus /api jika sudah ada, lalu tambah /api secara bersih
    return url.replace(/\/$/, "").replace(/\/api$/, "") + "/api";
}

const BASE_URL = getApiBase();
const API_SCHEDULES = `${BASE_URL}/schedules`;
const API_STUDENTS = `${BASE_URL}/students`;
const API_MENTORS = `${BASE_URL}/mentors`;

// =============================================================================
// TIPE DATA
// =============================================================================
export interface Schedule {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    subject: string;
    students?: { id: string, name: string };
    mentors?: { id: string, name: string, phone_number?: string }; 
}

// =============================================================================
// 1. GET (READ)
// =============================================================================

/**
 * Mengambil daftar jadwal dengan filter optional
 */
export async function getSchedules(filters: any = {}) {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.mentor_id) params.append('mentor_id', filters.mentor_id);
    
    const url = `${API_SCHEDULES}?${params.toString()}`;

    try {
        const res = await fetchWithAuth(url, { method: 'GET' });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || 'Gagal ambil jadwal');
        }
        
        return await res.json();
    } catch (error: any) {
        if (error.message === 'SESSION_EXPIRED') throw error;
        console.error("Error getSchedules:", error);
        throw error;
    }
}

/**
 * Helper untuk mendapatkan daftar murid (untuk dropdown di UI)
 */
export async function getStudentsList() {
    try {
        const res = await fetchWithAuth(API_STUDENTS);
        if (!res.ok) throw new Error('Gagal ambil daftar murid');
        const data = await res.json();
        return data.students || [];
    } catch (error) {
        console.error("Error getStudentsList:", error);
        return [];
    }
}

/**
 * Helper untuk mendapatkan daftar mentor (untuk dropdown di UI)
 */
export async function getMentorsList() {
    try {
        const res = await fetchWithAuth(API_MENTORS);
        if (!res.ok) throw new Error('Gagal ambil daftar mentor');
        const data = await res.json();
        return data.mentors || [];
    } catch (error) {
        console.error("Error getMentorsList:", error);
        return [];
    }
}

// =============================================================================
// 2. CRUD OPERATIONS
// =============================================================================

/**
 * Membuat jadwal baru
 */
export async function createSchedule(data: any) {
    try {
        const res = await fetchWithAuth(API_SCHEDULES, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        
        if (!res.ok) {
            let errorMessage = 'Gagal buat jadwal';
            const err = await res.json().catch(() => ({}));
            
            if (err.errors && Array.isArray(err.errors)) {
                errorMessage = err.errors.map((e: any) => {
                    const key = Object.keys(e)[0];
                    return `${key}: ${e[key]}`;
                }).join(', ');
            } else if (err.message) {
                errorMessage = err.message;
            }
            throw new Error(errorMessage);
        }
        
        return await res.json();
    } catch (error) {
        throw error;
    }
}

/**
 * Menghapus jadwal berdasarkan ID
 */
export async function deleteSchedule(id: string) {
    try {
        const res = await fetchWithAuth(`${API_SCHEDULES}/${id}`, { 
            method: 'DELETE',
        });
        
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Gagal hapus jadwal');
        }
    } catch (error) {
        throw error;
    }
}

/**
 * Memperbarui jadwal yang sudah ada
 */
export async function updateSchedule(id: string, data: any) {
    try {
        const res = await fetchWithAuth(`${API_SCHEDULES}/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Gagal update jadwal');
        }

        return await res.json();
    } catch (error) {
        throw error;
    }
}