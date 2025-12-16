// frontend/lib/auth.ts

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

// --- HELPER COOKIE ---

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

  if (authObj.user && !authObj.user.name) {
    authObj.user.name = authObj.user.email.split('@')[0];
  }

  const val = encodeURIComponent(JSON.stringify(authObj));
  document.cookie = `auth=${val}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearAuth() {
  if (typeof document === 'undefined') return;
  document.cookie = `auth=; path=/; max-age=0; SameSite=Lax`;
}

// --- HELPER USER DATA ---

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

// --- ✅ FUNGSI LOGOUT YANG HILANG ---
const API_BASE_URL = 'http://localhost:4000/api/auth';

export async function logoutUser() {
  try {
    // Panggil logout server (opsional)
    await fetch(`${API_BASE_URL}/logout`, { method: 'POST' }).catch(() => {});
    
    // Hapus cookie
    clearAuth();
    return true;
  } catch (error) {
    clearAuth();
    return false;
  }
}