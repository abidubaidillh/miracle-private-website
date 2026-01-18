// frontend/lib/auth.ts

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

/**
 * Mengambil data Auth dari Cookie
 * Digunakan baik oleh Client-side maupun logic internal lib ini
 */
export function getAuthCookie(): AuthObject | null {
  if (typeof document === 'undefined') return null;
  
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('auth='));

  if (!cookie) return null;

  try {
    const value = cookie.split('=')[1];
    const decodedValue = decodeURIComponent(value);
    
    // Pastikan string adalah JSON yang valid
    if (decodedValue.startsWith('{')) {
        return JSON.parse(decodedValue) as AuthObject;
    }
    return null;
  } catch (e) {
    console.error("Gagal parse auth cookie:", e);
    return null;
  }
}

/**
 * Menyimpan data Auth ke Cookie
 * Path=/ sangat penting agar cookie bisa dibaca di semua sub-halaman
 */
export function saveAuth(authObj: AuthObject) {
  if (typeof document === 'undefined') return;

  // Fallback nama jika kosong agar UI tidak berlubang
  if (authObj.user && !authObj.user.name) {
    authObj.user.name = authObj.user.email.split('@')[0];
  }

  const val = encodeURIComponent(JSON.stringify(authObj));
  
  // Set Cookie dengan durasi 1 hari (86400 detik)
  // Secure: hanya kirim lewat HTTPS (aktif jika di production)
  // SameSite=Lax: perlindungan CSRF standar
  const isProd = process.env.NODE_ENV === 'production';
  document.cookie = `auth=${val}; path=/; max-age=86400; SameSite=Lax${isProd ? '; Secure' : ''}`;
  
  // Sync ke localStorage sebagai backup (optional, untuk persistensi client-side ekstra)
  localStorage.setItem('user_role', authObj.user.role.toUpperCase());
}

/**
 * Menghapus data Auth dari Cookie
 */
export function clearAuth() {
  if (typeof document === 'undefined') return;
  // Menghapus cookie dengan mengeset max-age ke 0
  document.cookie = `auth=; path=/; max-age=0; SameSite=Lax`;
  localStorage.removeItem('user_role');
}

// ============================================================================
// 2. HELPER DATA USER & TOKEN (High Level)
// ============================================================================

/**
 * Mengambil Access Token untuk Authorization Header (Bearer)
 */
export function getAuthToken(): string | null {
  const auth = getAuthCookie();
  return auth?.session?.access_token || null;
}

/**
 * Mengambil Objek User yang sedang login
 */
export function getCurrentUser() {
  const auth = getAuthCookie();
  return auth?.user || null;
}

/**
 * Mengambil Role User (Dinormalisasi ke Uppercase)
 */
export function getUserRole(): string | null {
  const user = getCurrentUser();
  if (!user || !user.role) return null;
  return user.role.toUpperCase();
}

/**
 * Cek apakah user sedang login berdasarkan keberadaan token
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return !!token;
}

/**
 * Helper Kompatibilitas untuk Login Page
 */
export function setAuthToken(token: string, user: any) {
    const authObj: AuthObject = {
        user: user,
        session: {
            access_token: token,
            refresh_token: '', 
        }
    };
    saveAuth(authObj);
}

// ============================================================================
// 3. LOGOUT SYSTEM
// ============================================================================

/**
 * Fungsi Logout Lengkap (Server Invalidation + Client Cleanup)
 */
export async function logoutUser() {
  try {
    // 1. Invalidate di Backend (Opsional)
    const token = getAuthToken();
    if (token) {
        await fetch(`${API_URL}/api/auth/logout`, { 
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        }).catch((err) => console.warn("Logout server error (ignored):", err));
    }
    
    // 2. Hapus Jejak di Browser
    clearAuth();
    
    // 3. Hapus data sisa di localStorage jika ada
    if (typeof window !== 'undefined') {
        localStorage.clear(); 
    }
    
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    clearAuth(); 
    return false;
  }
}