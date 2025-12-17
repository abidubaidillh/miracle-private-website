// frontend/lib/apiClient.ts
import Swal from 'sweetalert2';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      cache: 'no-store',
      credentials: 'include', // Penting: Bawa Cookie token
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // --- GLOBAL ERROR HANDLER ---
    // Jika backend menolak karena token tidak valid/habis
    if (res.status === 401) {
      // Cek agar tidak redirect loop jika sudah di halaman login
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        
        await Swal.fire({
          icon: 'warning',
          title: 'Sesi Berakhir',
          text: 'Mohon login kembali untuk melanjutkan.',
          timer: 2000,
          showConfirmButton: false,
          allowOutsideClick: false
        });

        // Redirect paksa ke login
        window.location.href = '/login';
        
        // Throw error khusus untuk menghentikan proses selanjutnya
        throw new Error('SESSION_EXPIRED');
      }
    }

    return res;

  } catch (error: any) {
    // Jika errornya SESSION_EXPIRED, lempar ulang agar pemanggil tahu,
    // tapi tidak perlu alert lagi karena sudah di-handle di atas.
    if (error.message === 'SESSION_EXPIRED') {
      throw error; 
    }
    
    // Error jaringan lain (Internet mati, Server down)
    console.error("API Call Error:", error);
    throw error;
  }
}