// frontend/src/lib/salaryActions.ts
import { getAuthToken } from "./auth";
import { supabase } from "./supabaseClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const getHeaders = () => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const getSalaries = async (month: number, year: number) => {
    const res = await fetch(`${API_URL}/salaries?month=${month}&year=${year}`, {
        headers: getHeaders()
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorData.error || "Gagal mengambil data gaji");
    }
    return res.json();
};

export const getMySalaries = async () => {
    const res = await fetch(`${API_URL}/salaries/my-salary`, {
        headers: getHeaders()
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorData.error || "Gagal mengambil data gaji pribadi");
    }
    return res.json();
};

export const saveSalaryDraft = async (data: {
    mentor_id: string;
    month: number;
    year: number;
    total_sessions: number;
    salary_per_session: number;
    bonus: number;
    deduction: number;
}) => {
    const res = await fetch(`${API_URL}/salaries/save`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorData.error || "Gagal menyimpan draft gaji");
    }
    return res.json();
};

export const paySalary = async (id: string, proof_image: string) => {
    const res = await fetch(`${API_URL}/salaries/${id}/pay`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ proof_image })
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorData.error || "Gagal memproses pembayaran gaji");
    }
    return res.json();
};

// ✅ AUDIT FIX: Fungsi recalculate salary
export const recalculateSalary = async (id: string) => {
    const res = await fetch(`${API_URL}/salaries/${id}/recalculate`, {
        method: 'POST',
        headers: getHeaders()
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || errorData.error || "Gagal recalculate gaji");
    }
    return res.json();
};

// --- FUNGSI UPLOAD STORAGE ---
export const uploadSalaryProof = async (file: File): Promise<string> => {
    // Validasi keamanan objek supabase
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