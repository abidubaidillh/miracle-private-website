export function _getAuthFromCookie() {
  if (typeof document === 'undefined') return null
  const cookie = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith('auth='))
  if (!cookie) return null
  try {
    return JSON.parse(decodeURIComponent(cookie.substring(5)))
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

export function saveAuth(authObj) {
  if (typeof document === 'undefined') return
  document.cookie = `auth=${encodeURIComponent(JSON.stringify(authObj))}; path=/; max-age=86400`
}

export function clearAuth() {
  if (typeof document === 'undefined') return
  document.cookie = `auth=; path=/; max-age=0`
}
