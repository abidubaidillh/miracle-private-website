// frontend/lib/jadwalActions.ts

const API_BASE_URL = 'http://localhost:4000/api/schedules';
const API_STUDENTS_URL = 'http://localhost:4000/api/students';
const API_MENTORS_URL = 'http://localhost:4000/api/mentors';

// Tipe Data
export interface Schedule {
    id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    subject: string;
    status: string;
    
    // Data Relasi (Join)
    students?: { id: string, name: string };
    
    // ✅ PERBAIKAN TIPE DATA: Sesuaikan dengan kolom tabel 'mentors'
    // Sebelumnya username, sekarang kita pakai name karena tabel mentors pakai name
    mentors?: { id: string, name: string, phone_number?: string, email?: string }; 
}

// 1. Fetch Jadwal
export async function getSchedules(filters: any = {}) {
    const params = new URLSearchParams();
    if (filters.day) params.append('day', filters.day);
    if (filters.mentor_id) params.append('mentor_id', filters.mentor_id);
    
    const res = await fetch(`${API_BASE_URL}?${params}`, { 
        cache: 'no-store',
        credentials: 'include' 
    });
    if (!res.ok) throw new Error('Gagal ambil jadwal');
    return res.json();
}

// 2. Fetch Dropdown Murid (Helper)
export async function getStudentsList() {
    const res = await fetch(API_STUDENTS_URL, { cache: 'no-store', credentials: 'include' });
    const data = await res.json();
    return data.students || [];
}

// 3. Fetch Dropdown Mentor (Helper)
export async function getMentorsList() {
    const res = await fetch(API_MENTORS_URL, { cache: 'no-store', credentials: 'include' });
    const data = await res.json();
    return data.mentors || [];
}

// 4. CRUD
export async function createSchedule(data: any) {
    const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
    });
    
    // ✅ ERROR HANDLING: Baca pesan spesifik dari backend
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal buat jadwal');
    }
    return res.json();
}

export async function deleteSchedule(id: string) {
    const res = await fetch(`${API_BASE_URL}/${id}`, { 
        method: 'DELETE',
        credentials: 'include'
    });
    
    // ✅ ERROR HANDLING
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Gagal hapus jadwal');
    }
}