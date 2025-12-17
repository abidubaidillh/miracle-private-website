// frontend/lib/jadwalActions.ts
import { fetchWithAuth } from './apiClient';

const API_BASE_URL = 'http://localhost:4000/api/schedules';
const API_STUDENTS_URL = 'http://localhost:4000/api/students';
const API_MENTORS_URL = 'http://localhost:4000/api/mentors';

// Tipe Data
export interface Schedule {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    subject: string;
    students?: { id: string, name: string };
    mentors?: { id: string, name: string, phone_number?: string }; 
}

// 1. Fetch Jadwal
export async function getSchedules(filters: any = {}) {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.mentor_id) params.append('mentor_id', filters.mentor_id);
    
    // ✅ PENGGUNAAN BARU: fetchWithAuth
    const res = await fetchWithAuth(`${API_BASE_URL}?${params}`);

    // Tidak perlu cek res.status === 401 lagi di sini
    if (!res.ok) throw new Error('Gagal ambil jadwal');
    return res.json();
}

// 2. Helper & CRUD lainnya
export async function getStudentsList() {
    const res = await fetchWithAuth(API_STUDENTS_URL);
    const data = await res.json();
    return data.students || [];
}

export async function getMentorsList() {
    const res = await fetchWithAuth(API_MENTORS_URL);
    const data = await res.json();
    return data.mentors || [];
}

export async function deleteSchedule(id: string) {
    const res = await fetchWithAuth(`${API_BASE_URL}/${id}`, { 
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Gagal hapus jadwal');
}

export async function createSchedule(data: any) {
    const res = await fetchWithAuth(API_BASE_URL, {
        method: 'POST',
        body: JSON.stringify(data),
    });
    
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Gagal buat jadwal');
    }
    return res.json();
}