// frontend/lib/auth.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface AuthObject {
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
    phone_number?: string;
    [key: string]: any;
  };
  session: {
    access_token: string;
    refresh_token?: string;
    [key: string]: any;
  } | null;
}

// ============================================================================
// 1. HELPER COOKIE (Low Level)
// ============================================================================

export function getAuthCookie(): AuthObject | null {
  if (typeof document === 'undefined') return null;
  
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('auth='));

  if (!cookie) return null;

  try {
    const value = cookie.split('=')[1];
    return JSON.parse(decodeURIComponent(value)) as AuthObject;
  } catch (e) {
    console.error("Gagal parse auth cookie", e);
    return null;
  }
}

export function saveAuth(authObj: AuthObject) {
  if (typeof document === 'undefined') return;

  // Fallback nama jika kosong
  if (authObj.user && !authObj.user.name) {
    authObj.user.name = authObj.user.email.split('@')[0];
  }

  const val = encodeURIComponent(JSON.stringify(authObj));
  // Simpan cookie selama 1 hari (86400 detik)
  document.cookie = `auth=${val}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearAuth() {
  if (typeof document === 'undefined') return;
  document.cookie = `auth=; path=/; max-age=0; SameSite=Lax`;
}

// ============================================================================
// 2. HELPER DATA USER & TOKEN (High Level)
// ============================================================================

/**
 * ✅ Mengambil Access Token untuk Authorization Header (Bearer)
 */
export function getAuthToken(): string | null {
  const auth = getAuthCookie();
  // Cek struktur session supabase atau struktur custom
  return auth?.session?.access_token || null;
}

/**
 * ✅ Mengambil Objek User yang sedang login
 */
export function getCurrentUser() {
  const auth = getAuthCookie();
  return auth?.user || null;
}

/**
 * ✅ Mengambil Role User (Dinormalisasi ke Uppercase)
 * Penting untuk Sidebar agar konsisten (MENTOR vs mentor)
 */
export function getUserRole(): string | null {
  const user = getCurrentUser();
  if (!user || !user.role) return null;
  return user.role.toUpperCase();
}

/**
 * ✅ Cek apakah user sedang login
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return !!token;
}

/**
 * ✅ Helper Kompatibilitas untuk Login Page
 * Digunakan untuk menyimpan token & user sekaligus dengan format standar
 */
export function setAuthToken(token: string, user: any) {
    const authObj: AuthObject = {
        user: user,
        session: {
            access_token: token,
            refresh_token: '', // Opsional jika backend tidak kirim refresh token
        }
    };
    saveAuth(authObj);
}

// ============================================================================
// 3. LOGOUT SYSTEM
// ============================================================================

export async function logoutUser() {
  try {
    // Panggil endpoint logout di server (opsional, best practice untuk invalidate token)
    await fetch(`${API_URL}/api/auth/logout`, { 
        method: 'POST' 
    }).catch((err) => console.warn("Logout server error (ignored):", err));
    
    // Hapus cookie di browser (Wajib)
    clearAuth();
    
    // Hapus local storage lain jika ada (misal data user_data lama)
    if (typeof window !== 'undefined') {
        localStorage.removeItem('user_data'); 
    }
    
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    clearAuth(); 
    return false;
  }
}