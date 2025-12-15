// frontend/lib/auth.ts

// Perbaiki tipe data untuk authObj
interface AuthObject {
  user: {
    email: string;
    role: string;
    name?: string; // name bisa optional dari API
    [key: string]: any; // Memungkinkan properti lain
  };
  session: any; // Atau sesuaikan dengan interface session Anda
}

export function _getAuthFromCookie() {
  if (typeof document === 'undefined') return null
  const cookie = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith('auth='))
  if (!cookie) return null
  try {
    // Pastikan return value sesuai dengan AuthObject
    return JSON.parse(decodeURIComponent(cookie.substring(5))) as AuthObject
  } catch (e) {
    return null
  }
}

export function getCurrentUser() {
  const auth = _getAuthFromCookie()
  return auth?.user || null
}

export function getUserRole() {
  return getCurrentUser()?.role || null
}

export function isAuthenticated() {
  const auth = _getAuthFromCookie()
  return !!(auth?.session?.access_token)
}

// KRITIS: saveAuth
export function saveAuth(authObj: AuthObject) {
  if (typeof document === 'undefined') return
  
  // Pastikan properti 'name' ada sebelum disimpan ke cookie agar Context dapat membacanya
  if (!authObj.user.name) {
      authObj.user.name = authObj.user.email.split('@')[0];
  }

  // Tambahkan opsi secure dan sameSite (hanya berlaku jika situs berjalan di HTTPS di production)
  document.cookie = `auth=${encodeURIComponent(JSON.stringify(authObj))}; path=/; max-age=86400; SameSite=Lax` 
}

export function clearAuth() {
  if (typeof document === 'undefined') return
  // Atur max-age ke 0 untuk menghapus cookie
  document.cookie = `auth=; path=/; max-age=0; SameSite=Lax`
}