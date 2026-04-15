// frontend/lib/studentActions.ts
import { fetchWithAuth } from './apiClient';

/**
 * Normalisasi URL API
 */
const getApiBase = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return url.replace(/\/$/, "").replace(/\/api$/, "") + "/api/students";
}

const API_ENDPOINT = getApiBase();

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
    
    const url = `${API_ENDPOINT}?${params.toString()}`;

    try {
        const response = await fetchWithAuth(url, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Gagal mengambil data murid`);
        }

        return await response.json(); 
        
    } catch (e: any) {
        if (e.message === 'SESSION_EXPIRED') throw e;
        console.error("Error fetching students:", e);
        return { students: [], stats: { active: 0, inactive: 0 } };
    }
}

// =============================================================================
// 2. POST (CREATE)
// =============================================================================
export async function createStudent(newStudentData: Omit<Student, 'id'>): Promise<Student> {
    try {
        // Pastikan address tidak undefined sebelum dikirim
        const payload = {
            ...newStudentData,
            address: newStudentData.address || "",
            age: Number(newStudentData.age) // Pastikan age adalah angka
        };

        const response = await fetchWithAuth(API_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
            // Ini akan menangkap pesan "Wajib diisi" dari backend
            throw new Error(result.message || result.error || 'Gagal menambahkan murid baru.');
        }
        
        return result.student || result;
    } catch (error: any) {
        throw error;
    }
}

// =============================================================================
// 3. PUT (UPDATE)
// =============================================================================
export async function updateStudent(studentId: string, updateData: Partial<Student>): Promise<Student> {
    try {
        const response = await fetchWithAuth(`${API_ENDPOINT}/${studentId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || result.error || 'Gagal memperbarui data murid.');
        }
        
        return result.student || result;
    } catch (error: any) {
        throw error;
    }
}

// =============================================================================
// 4. DELETE
// =============================================================================
export async function deleteStudent(studentId: string): Promise<void> {
    try {
        const response = await fetchWithAuth(`${API_ENDPOINT}/${studentId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.message || 'Gagal menghapus data murid.');
        }
    } catch (error: any) {
        throw error;
    }
}