// frontend/lib/financeActions.ts
import { fetchWithAuth } from './apiClient';
import { API_URL } from './auth';

// Tambahkan kata 'export' di depan variabel ini agar bisa dibaca file lain
export const API_URL_BASE = `${API_URL}/api`;

export const getFinanceSummary = async () => {
    const res = await fetchWithAuth(`${API_URL_BASE}/finance/summary`);
    if (!res.ok) throw new Error("Gagal mengambil data keuangan");
    return res.json();
};

export const getOperasionalData = async (queryString: string) => {
    const res = await fetchWithAuth(`${API_URL_BASE}/operasional?${queryString}`);
    if (!res.ok) throw new Error("Gagal mengambil data operasional");
    return res.json();
};

export const getKategoriOperasional = async () => {
    const res = await fetchWithAuth(`${API_URL_BASE}/operasional/kategori`);
    if (!res.ok) throw new Error("Gagal mengambil kategori operasional");
    return res.json();
};

export const getOperasionalSummary = async () => {
    const res = await fetchWithAuth(`${API_URL_BASE}/operasional/summary`);
    if (!res.ok) throw new Error("Gagal mengambil summary operasional");
    return res.json();
};