// frontend/lib/supabaseClient.js

import { createClient } from '@supabase/supabase-js'
// Import helper untuk membaca Auth dari Cookie
// ASUMSI: File './auth' diekspor dengan _getAuthFromCookie
import { _getAuthFromCookie } from './auth'; 

// Next.js client-side variables HARUS memiliki awalan NEXT_PUBLIC_
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Kesalahan Konfigurasi Supabase: Variabel URL atau Key tidak ditemukan.")
    throw new Error("Supabase URL atau Key wajib diatur di .env.local."); 
}

// Fungsi Helper untuk mendapatkan token dari Cookie
function getAuthToken() {
    try {
        const auth = _getAuthFromCookie();
        return auth?.session?.access_token || null; 
    } catch (e) {
        console.warn("Peringatan: Gagal membaca Auth Token dari cookie. Menggunakan Anon Key.");
        return null;
    }
}

/**
 * Fungsi ini membuat dan mengembalikan klien Supabase yang dinamis.
 */
export const getSupabaseClient = () => {
    const token = getAuthToken();

    // KRITIS: Definisikan opsi awal. Kita paksa klien menggunakan skema 'public'.
    const options = {
        schema: 'public', // <--- MEMPERBAIKI MASALAH public.public
    };

    // Jika ada token, tambahkan header otorisasi ke opsi global
    if (token) {
        options.global = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }
    
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, options);
};