// src/config/supabase.js

// Pastikan Anda telah menginstal: npm install @supabase/supabase-js
const { createClient } = require('@supabase/supabase-js');

// --- Ambil Kunci Akses dari process.env ---
const SUPABASE_URL = process.env.SUPABASE_URL;
// Pastikan nama variabel lingkungan di .env Anda adalah SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; 

// 1. PRODUCTION SECURITY: Remove sensitive logging
if (process.env.NODE_ENV !== 'production') {
    console.log('--- SUPABASE BACKEND CONFIG DEBUG ---');
    console.log('1. URL Loaded:', !!SUPABASE_URL); 
    console.log('2. KEY Loaded:', !!SUPABASE_KEY); 
    console.log('-----------------------------------');
}


// 2. Validasi Kritis
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('🔥 KRITIS: Supabase URL atau SERVICE_ROLE_KEY tidak ditemukan.');
    // Anda bisa memilih untuk menghentikan proses di sini jika konfigurasi hilang
    // process.exit(1); 
}


// 3. Inisialisasi Client Supabase
// KRITIS: Menambahkan opsi db: { schema: 'public' } untuk mengatasi error public.public.students
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        autoRefreshToken: false, 
        persistSession: false,  
        detectSessionInUrl: false
    },
    db: {
        schema: 'public', // <--- PERBAIKAN UNTUK MENGHINDARI 'public.public.students'
    }
});

// 4. Ekspor Client
module.exports = supabase;