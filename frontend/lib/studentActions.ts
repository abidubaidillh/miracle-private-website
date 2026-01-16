// lib/studentActions.ts

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/students` 
    : 'http://localhost:4000/api/students';

// =============================================================================
// HELPER: Get Auth Headers
// =============================================================================
const getHeaders = () => {
    let token = '';
    if (typeof document !== 'undefined') {
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
    school_origin: string;
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
// 1. GET (READ ALL & Search)
// =============================================================================
export async function getStudents(search: string = ""): Promise<StudentDataResponse> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    
    const url = `${API_BASE_URL}?${params.toString()}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders(),
            cache: 'no-store', 
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Gagal fetch data murid`);
        }

        const data: StudentDataResponse = await response.json();
        return data; 
        
    } catch (e: any) {
        console.error("Error fetching students:", e);
        return { students: [], stats: { active: 0, inactive: 0 } };
    }
}

// =============================================================================
// 2. POST (CREATE)
// =============================================================================
export async function createStudent(newStudentData: Omit<Student, 'id'>): Promise<Student> {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newStudentData), // Pastikan di Form UI, key-nya sudah 'school_origin'
    });

    const result = await response.json();

    if (!response.ok) {
        // Jika Joi Validation gagal, error akan muncul di sini
        throw new Error(result.message || result.errors?.[0]?.school_origin || 'Gagal menambahkan murid baru.');
    }
    
    return result.student as Student;
}

// =============================================================================
// 3. PUT (UPDATE)
// =============================================================================
export async function updateStudent(studentId: string, updateData: Partial<Student>): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/${studentId}`, {
        method: 'PUT',
        headers: getHeaders(),
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
        headers: getHeaders(),
    });

    if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Gagal menghapus data murid.');
    }
}