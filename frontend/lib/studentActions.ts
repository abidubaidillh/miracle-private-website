// lib/studentActions.ts

// Hapus import getSupabaseClient karena semua operasi CRUD dialihkan ke Express.js
// import { getSupabaseClient } from './supabaseClient'; 

// URL Backend Anda
const API_BASE_URL = 'http://localhost:4000/api/students'; 

// Definisikan tipe data Student
export interface Student {
    id: string; 
    name: string;
    age: number;
    phone_number: string; 
    address: string;
    
    // --- TAMBAHAN BARU (Sesuai Modal & Database) ---
    parent_name: string; 
    parent_phone: string;
    // -----------------------------------------------

    status: 'AKTIF' | 'NON-AKTIF';
    package_id: string | null;
}

// Interface untuk data yang dikembalikan oleh API
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
export async function getStudentsData(search: string = ""): Promise<{ students: Student[], totalCount: number, activeCount: number, inactiveCount: number }> {
    let url = API_BASE_URL;
    
    const params = new URLSearchParams();
    if (search) {
        params.append('search', search);
    }
    
    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    try {
        console.log(`[ACTION] Fetching students from: ${url}`);
        
        const response = await fetch(url, {
            method: 'GET',
            cache: 'no-store', 
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Gagal fetch data murid: Status ${response.status}`);
        }

        const data: StudentDataResponse = await response.json();
        
        const students = data.students || [];
        const activeCount = data.stats?.active || 0;
        const inactiveCount = data.stats?.inactive || 0;
        
        return { 
            students: students, 
            totalCount: students.length,
            activeCount: activeCount, 
            inactiveCount: inactiveCount
        };
        
    } catch (e: any) {
        console.error("Error fetching students data from backend:", e);
        throw new Error(`Operasi READ Gagal: ${e.message}`);
    }
}


// =============================================================================
// 2. POST (CREATE)
// =============================================================================
// Interface Omit akan otomatis mengecualikan ID, tapi MEWAJIBKAN parent_name & parent_phone
export async function createStudent(newStudentData: Omit<Student, 'id' | 'package_id'>): Promise<Student> {
    
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}` 
        },
        // Body akan otomatis menyertakan parent_name & parent_phone dari Form
        body: JSON.stringify(newStudentData),
    });

    const result = await response.json();

    if (!response.ok) {
        console.error('Error creating student:', result); 
        const errorMessage = result.message || 'Gagal menambahkan murid baru.';
        throw new Error(errorMessage);
    }
    
    return result.student as Student;
}

// =============================================================================
// 3. PUT (UPDATE)
// =============================================================================
export async function updateStudent(studentId: string, updateData: Partial<Omit<Student, 'id'>>): Promise<Student> {
    
    const response = await fetch(`${API_BASE_URL}/${studentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (!response.ok) {
        console.error('Error updating student:', result); 
        const errorMessage = result.message || 'Gagal memperbarui data murid.';
        throw new Error(errorMessage);
    }
    
    return result.student as Student;
}

// =============================================================================
// 4. DELETE
// =============================================================================
export async function deleteStudent(studentId: string): Promise<void> {
    
    const response = await fetch(`${API_BASE_URL}/${studentId}`, {
        method: 'DELETE',
        // headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        const result = await response.json();
        const errorMessage = result.message || 'Gagal menghapus data murid.';
        console.error("DELETE API Error:", result);
        throw new Error(errorMessage);
    }
    
    return;
}