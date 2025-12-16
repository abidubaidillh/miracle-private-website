// frontend/lib/packageActions.ts

// ✅ PASTIKAN URL INI BENAR (Sesuai Postman)
const API_BASE_URL = 'http://localhost:4000/api/packages'; 

export interface Package {
    id: string;
    name: string;
    duration: string;
    price: number;
    description?: string;
}

interface PackageDataResponse {
    packages: Package[];
    stats: {
        total: number;
    }
}

// 1. GET
export async function getPackagesData(search: string = ""): Promise<{ packages: Package[], totalCount: number }> {
    let url = API_BASE_URL;
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (params.toString()) url += `?${params.toString()}`;

    try {
        const response = await fetch(url, { 
            method: 'GET', 
            cache: 'no-store',
            credentials: 'include' // ✅ WAJIB: Agar cookie auth terbawa
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Gagal fetch paket");
        }
        const data: PackageDataResponse = await response.json();
        return { 
            packages: data.packages || [], 
            totalCount: data.stats?.total || 0 
        };
    } catch (e: any) {
        console.error("Error fetching packages:", e);
        throw new Error(e.message);
    }
}

// 2. CREATE
export async function createPackage(newData: Omit<Package, 'id'>): Promise<Package> {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
        credentials: 'include' // ✅ WAJIB: Agar backend tahu siapa yang login
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal tambah paket');
    return result.package;
}

// 3. UPDATE
export async function updatePackage(id: string, updateData: Partial<Omit<Package, 'id'>>): Promise<Package> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
        credentials: 'include' // ✅ WAJIB
    });
    
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal update paket');
    return result.package;
}

// 4. DELETE
export async function deletePackage(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, { 
        method: 'DELETE',
        credentials: 'include' // ✅ WAJIB
    });
    
    if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Gagal hapus paket');
    }
}