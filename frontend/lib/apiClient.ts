// frontend/lib/apiClient.ts
import Swal from 'sweetalert2';
import { getAuthToken } from './auth';

/**
 * Helper fetch yang secara otomatis menyertakan token autentikasi
 * dan menangani error 401 (Unauthorized) secara global.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    // Ambil token dari cookie melalui helper di auth.ts
    const token = getAuthToken();

    const res = await fetch(url, {
      ...options,
      cache: 'no-store',
      // 'include' memastikan cookie (jika ada) terkirim ke backend
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
        // Sertakan Bearer Token jika user sudah login
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    // --- GLOBAL ERROR HANDLER ---
    // Jika backend menolak karena token tidak valid, expired, atau tidak ada
    if (res.status === 401) {
      // Pastikan kode berjalan di sisi client (browser)
      if (typeof window !== 'undefined') {
        // Hindari looping redirect jika user memang sudah berada di halaman login
        if (!window.location.pathname.includes('/login')) {
          
          await Swal.fire({
            icon: 'warning',
            title: 'Sesi Berakhir',
            text: 'Mohon login kembali untuk melanjutkan.',
            timer: 2000,
            showConfirmButton: false,
            allowOutsideClick: false
          });

          // Hapus sisa-sisa auth jika ada (opsional, bisa panggil clearAuth())
          // document.cookie = "auth=; path=/; max-age=0";

          // Redirect paksa ke halaman login
          window.location.href = '/login';
          
          // Lempar error khusus untuk menghentikan eksekusi kode setelah pemanggilan fetch ini
          throw new Error('SESSION_EXPIRED');
        }
      }
    }

    return res;

  } catch (error: any) {
    // Jika error disebabkan oleh sesi habis, jangan tampilkan console error tambahan
    if (error.message === 'SESSION_EXPIRED') {
      throw error; 
    }
    
    // Tangani error jaringan (misal: internet mati, backend mati/CORS error)
    console.error("API Call Error:", error);
    
    // Opsional: Tampilkan toast jika server tidak bisa dijangkau sama sekali
    /*
    if (typeof window !== 'undefined' && error.message === 'Failed to fetch') {
      console.warn("Server backend tidak dapat dijangkau. Periksa koneksi atau URL API.");
    }
    */

    throw error;
  }
}