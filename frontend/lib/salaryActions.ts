// frontend/lib/salaryActions.ts
import { fetchWithAuth } from "./apiClient";
import { API_URL } from "./auth";
import { supabase } from "./supabaseClient";

/**
 * URL Base untuk gaji. 
 * Kita memastikan menggunakan API_URL dari auth.ts agar konsisten.
 */
const API_BASE_URL = `${API_URL}/api/salaries`;

// 1. Lihat Daftar Gaji SEMUA (Owner, Bendahara, Admin)
export const getSalaries = async (month: number, year: number) => {
    const res = await fetchWithAuth(`${API_BASE_URL}?month=${month}&year=${year}`);
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Gagal mengambil data gaji");
    }
    return res.json();
};

// 2. Lihat Gaji PRIBADI (Khusus Mentor)
export const getMySalaries = async () => {
    // Sesuai backend: router.get('/my-salary', ...)
    const res = await fetchWithAuth(`${API_BASE_URL}/my-salary`);
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Gagal mengambil data gaji pribadi");
    }
    return res.json();
};

// 3. Simpan Draft (Owner, Bendahara)
export const saveSalaryDraft = async (data: {
    mentor_id: string;
    month: number;
    year: number;
    total_sessions: number;
    salary_per_session: number;
    bonus: number;
    deduction: number;
}) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/save`, {
        method: 'POST',
        body: JSON.stringify(data)
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Gagal menyimpan draft gaji");
    }
    return res.json();
};

// 4. Bayar Gaji (Owner, Bendahara)
export const paySalary = async (id: string, proof_image: string) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/${id}/pay`, {
        method: 'POST',
        body: JSON.stringify({ proof_image })
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Gagal memproses pembayaran gaji");
    }
    return res.json();
};

// 5. Recalculate Gaji (Owner, Bendahara) - AUDIT FIX
export const recalculateSalary = async (id: string) => {
    const res = await fetchWithAuth(`${API_BASE_URL}/${id}/recalculate`, {
        method: 'POST'
    });
    
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Gagal recalculate gaji");
    }
    return res.json();
};

// --- FUNGSI UPLOAD STORAGE (SUPABASE) ---
export const uploadSalaryProof = async (file: File): Promise<string> => {
    if (!supabase || !supabase.storage) {
        throw new Error("Koneksi Supabase Storage tidak tersedia. Periksa konfigurasi client.");
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `bukti_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `transfer/${fileName}`;

    const { data, error } = await supabase.storage
        .from('bukti-transfer')
        .upload(filePath, file);

    if (error) {
        console.error("Storage Upload Error:", error);
        throw new Error(error.message || "Gagal mengunggah file ke storage.");
    }

    const { data: { publicUrl } } = supabase.storage
        .from('bukti-transfer')
        .getPublicUrl(filePath);

    return publicUrl;
};