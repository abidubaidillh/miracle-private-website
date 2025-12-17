// lib/studentActions.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/students` 
    : 'http://localhost:4000/api/students';

// =============================================================================
// HELPER: Get Auth Headers (WAJIB untuk menembus Middleware Backend)
// =============================================================================
const getHeaders = () => {
    let token = '';
    if (typeof document !== 'undefined') {
        // Cari cookie bernama 'auth'
        const match = document.cookie.match(new RegExp('(^| )auth=([^;]+)'));
        if (match) {
            try {
                const authData = JSON.parse(decodeURIComponent(match[2]));
                token = authData.session.access_token;
            } catch (e) {
                console.warn("Gagal parse token auth", e);
            }
        }
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    }
}

// =============================================================================
// TIPE DATA
// =============================================================================
export interface Student {
    id: string; 
    name: string;
    age: number;
    phone_number: string; 
    address: string;
    parent_name: string; 
    parent_phone: string;
    status: 'AKTIF' | 'NON-AKTIF';
    package_id: string | null;
}

interface StudentDataResponse {
    students: Student[];
    stats: {
        active: number;
        inactive: number;
    }
}

// =============================================================================
// 1. GET (READ ALL & Search) - Digunakan juga oleh Modal Pembayaran
// =============================================================================
export async function getStudents(search: string = ""): Promise<StudentDataResponse> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const url = `${API_BASE_URL}?${params.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(), // ✅ Pakai Token
            cache: 'no-store', 
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Gagal fetch data murid`);
        }

        const data: StudentDataResponse = await response.json();
        return data; // Mengembalikan { students: [], stats: {} }
        
    } catch (e: any) {
        console.error("Error fetching students:", e);
        // Return fallback kosong agar UI tidak crash
        return { students: [], stats: { active: 0, inactive: 0 } };
    }
}

// =============================================================================
// 2. POST (CREATE)
// =============================================================================
export async function createStudent(newStudentData: any): Promise<Student> {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getHeaders(), // ✅ Pakai Token
        body: JSON.stringify(newStudentData),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Gagal menambahkan murid baru.');
    }
    
    return result.student as Student;
}

// =============================================================================
// 3. PUT (UPDATE)
// =============================================================================
export async function updateStudent(studentId: string, updateData: any): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/${studentId}`, {
        method: 'PUT',
        headers: getHeaders(), // ✅ Pakai Token
        body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || 'Gagal memperbarui data murid.');
    }
    
    return result.student as Student;
}

// =============================================================================
// 4. DELETE
// =============================================================================
export async function deleteStudent(studentId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${studentId}`, {
        method: 'DELETE',
        headers: getHeaders(), // ✅ Pakai Token
    });

    if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Gagal menghapus data murid.');
    }
}