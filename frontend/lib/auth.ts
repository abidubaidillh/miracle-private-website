// frontend/lib/auth.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface AuthObject {
  user: {
    id: string;
    email: string;
    role: string;
    name?: string;
    [key: string]: any;
  };
  session: any;
}

// ============================================================================
// HELPER COOKIE (Low Level)
// ============================================================================

export function getAuthCookie(): AuthObject | null {
  if (typeof document === 'undefined') return null;
  
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('auth='));

  if (!cookie) return null;

  try {
    const value = cookie.split('=')[1];
    // Decode URI Component penting karena cookie disimpan dalam format ter-encode
    return JSON.parse(decodeURIComponent(value)) as AuthObject;
  } catch (e) {
    console.error("Gagal parse auth cookie", e);
    return null;
  }
}

export function saveAuth(authObj: AuthObject) {
  if (typeof document === 'undefined') return;

  // Pastikan ada fallback name jika kosong
  if (authObj.user && !authObj.user.name) {
    authObj.user.name = authObj.user.email.split('@')[0];
  }

  const val = encodeURIComponent(JSON.stringify(authObj));
  // Max-age 1 hari (86400 detik)
  document.cookie = `auth=${val}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearAuth() {
  if (typeof document === 'undefined') return;
  document.cookie = `auth=; path=/; max-age=0; SameSite=Lax`;
}

// ============================================================================
// HELPER DATA USER & TOKEN (High Level)
// ============================================================================

/**
 * ✅ Mengambil Access Token untuk Authorization Header
 * Fungsi ini yang sebelumnya hilang dan menyebabkan error.
 */
export function getAuthToken(): string | null {
  const auth = getAuthCookie();
  return auth?.session?.access_token || null;
}

export function getCurrentUser() {
  const auth = getAuthCookie();
  return auth?.user || null;
}

export function getUserRole() {
  return getCurrentUser()?.role || null;
}

export function isAuthenticated() {
  const auth = getAuthCookie();
  return !!auth?.session?.access_token;
}

// ============================================================================
// LOGOUT SYSTEM
// ============================================================================

export async function logoutUser() {
  try {
    // Panggil endpoint logout di server (opsional, untuk clear cookie server-side jika ada)
    await fetch(`${API_URL}/auth/logout`, { 
        method: 'POST' 
    }).catch((err) => console.warn("Logout server error (ignored):", err));
    
    // Hapus cookie di browser (Wajib)
    clearAuth();
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    clearAuth(); // Tetap hapus cookie meski server error
    return false;
  }
}