// frontend/lib/jadwalActions.ts

const API_BASE_URL = 'http://localhost:4000/api/schedules';
const API_STUDENTS_URL = 'http://localhost:4000/api/students';
const API_MENTORS_URL = 'http://localhost:4000/api/mentors';

// Tipe Data
export interface Schedule {
    id: string;
    date: string; // ✅ Diganti dari day_of_week menjadi date
    start_time: string;
    end_time: string;
    subject: string;
    students?: { id: string, name: string };
    mentors?: { id: string, name: string, phone_number?: string }; 
}

// 1. Fetch Jadwal
export async function getSchedules(filters: any = {}) {
    const params = new URLSearchParams();
    
    // ✅ Mengirim parameter 'date' ke backend
    if (filters.date) params.append('date', filters.date);
    if (filters.mentor_id) params.append('mentor_id', filters.mentor_id);
    
    const res = await fetch(`${API_BASE_URL}?${params}`, { 
        cache: 'no-store',
        credentials: 'include' 
    });

    if (res.status === 401) {
        throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) throw new Error('Gagal ambil jadwal');
    return res.json();
}

// 2. Helper & CRUD lainnya
export async function getStudentsList() {
    const res = await fetch(API_STUDENTS_URL, { cache: 'no-store', credentials: 'include' });
    const data = await res.json();
    return data.students || [];
}

export async function getMentorsList() {
    const res = await fetch(API_MENTORS_URL, { cache: 'no-store', credentials: 'include' });
    const data = await res.json();
    return data.mentors || [];
}

export async function deleteSchedule(id: string) {
    const res = await fetch(`${API_BASE_URL}/${id}`, { 
        method: 'DELETE',
        credentials: 'include'
    });
    if (!res.ok) throw new Error('Gagal hapus jadwal');
}

// Tambahkan fungsi createSchedule jika belum ada (sesuai backend POST)
export async function createSchedule(data: any) {
    const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Gagal buat jadwal');
    }
    return res.json();
}