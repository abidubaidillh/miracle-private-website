// frontend/lib/financeActions.ts
import { fetchWithAuth } from './apiClient';

/**
 * Normalisasi URL Dasar
 * Memastikan tidak ada double slash (//) dan tidak ada double /api
 */
const getApiBase = () => {
    // Mengambil URL dari environment variable
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    
    // 1. .replace(/\/$/, "") -> Menghapus slash di paling akhir jika ada
    // 2. .replace(/\/api$/, "") -> Menghapus /api jika user sudah menulisnya di .env
    // 3. Menambahkan /api secara manual agar konsisten
    return url.replace(/\/$/, "").replace(/\/api$/, "") + "/api";
}

// Export agar bisa digunakan jika ada kebutuhan URL manual di tempat lain
export const API_URL_BASE = getApiBase();

// =============================================================================
// 1. FINANCE SUMMARY
// =============================================================================
export const getFinanceSummary = async () => {
    try {
        const res = await fetchWithAuth(`${API_URL_BASE}/finance/summary`);
        if (!res.ok) throw new Error("Gagal mengambil data keuangan");
        return await res.json();
    } catch (error: any) {
        if (error.message === 'SESSION_EXPIRED') throw error;
        console.error("Error getFinanceSummary:", error);
        throw error;
    }
};

// =============================================================================
// 2. OPERASIONAL DATA
// =============================================================================
export const getOperasionalData = async (queryString: string) => {
    try {
        // Memastikan queryString tidak kosong dan tidak diawali dengan & atau ? ganda
        const cleanQuery = queryString ? (queryString.startsWith('?') ? queryString : `?${queryString}`) : '';
        const res = await fetchWithAuth(`${API_URL_BASE}/operasional${cleanQuery}`);
        
        if (!res.ok) throw new Error("Gagal mengambil data operasional");
        return await res.json();
    } catch (error: any) {
        console.error("Error getOperasionalData:", error);
        throw error;
    }
};

// =============================================================================
// 3. KATEGORI OPERASIONAL
// =============================================================================
export const getKategoriOperasional = async () => {
    try {
        const res = await fetchWithAuth(`${API_URL_BASE}/operasional/kategori`);
        if (!res.ok) throw new Error("Gagal mengambil kategori operasional");
        return await res.json();
    } catch (error: any) {
        console.error("Error getKategoriOperasional:", error);
        throw error;
    }
};

// =============================================================================
// 4. SUMMARY OPERASIONAL
// =============================================================================
export const getOperasionalSummary = async () => {
    try {
        const res = await fetchWithAuth(`${API_URL_BASE}/operasional/summary`);
        if (!res.ok) throw new Error("Gagal mengambil summary operasional");
        return await res.json();
    } catch (error: any) {
        console.error("Error getOperasionalSummary:", error);
        throw error;
    }
};

/**
 * Contoh penambahan fungsi POST untuk operasional jika dibutuhkan nanti
 */
export const createOperasional = async (data: any) => {
    try {
        const res = await fetchWithAuth(`${API_URL_BASE}/operasional`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error("Gagal menambah data operasional");
        return await res.json();
    } catch (error: any) {
        throw error;
    }
};