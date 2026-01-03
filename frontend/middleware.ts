import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const pathname = req.nextUrl.pathname

  // 1. Dapatkan Cookie Auth
  const authCookie = req.cookies.get('auth')?.value || req.cookies.get('token')?.value

  // 2. Tentukan halaman publik
  const isPublicPage = pathname === '/login'

  // --- LOGIKA REDIRECT ---

  if (pathname === '/register') {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // KASUS A: User mengakses Root ('/')
  if (pathname === '/') {
    if (authCookie) {
      try {
        const auth = safeParseAuth(authCookie)
        const role = (auth?.user?.role || auth?.role || '').toUpperCase()
        url.pathname = getRoleDefaultPath(role)
        return NextResponse.redirect(url)
      } catch (e) {
        url.pathname = '/login'
        const response = NextResponse.redirect(url)
        response.cookies.delete('auth')
        return response
      }
    } else {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // KASUS B: User SUDAH Login -> Buka Login
  if (authCookie && isPublicPage) {
    try {
      const auth = safeParseAuth(authCookie)
      const role = (auth?.user?.role || auth?.role || '').toUpperCase()
      url.pathname = getRoleDefaultPath(role)
      return NextResponse.redirect(url)
    } catch (e) { }
  }

  // KASUS C: User BELUM Login -> Buka Halaman Protected
  if (!authCookie && !isPublicPage) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // KASUS D: Validasi Hak Akses Role (RBAC)
  if (authCookie && !isPublicPage) {
    try {
      const auth = safeParseAuth(authCookie)
      const role = (auth?.user?.role || auth?.role || 'GUEST').toUpperCase()

      // --- ATURAN HAK AKSES ---

      // 1. AKSES BENDAHARA (FOKUS KEUANGAN)
      if (role === 'BENDAHARA') {
        // DILARANG: Fitur Operasional & Sistem
        if (
            pathname.startsWith('/jadwal') || 
            pathname.startsWith('/kelola-user') ||
            pathname.startsWith('/mentor') // Tidak boleh akses data mentor (termasuk /mentor, /mentor/me, /mentor/edit)
        ) {
             return NextResponse.redirect(new URL('/keuangan', req.url))
        }
      }

      // 2. AKSES ADMIN (FOKUS OPERASIONAL)
      if (role === 'ADMIN') {
        // DILARANG: Fitur Keuangan Sensitif & Gaji
        // Admin boleh akses /pembayaran (untuk input tagihan murid), tapi tidak boleh lihat Gaji Mentor
        if (
            pathname.startsWith('/keuangan') || 
            pathname.startsWith('/gaji-mentor') || 
            pathname.startsWith('/biaya-operasional')
        ) {
             return NextResponse.redirect(new URL('/dashboard', req.url))
        }
      }

      // 3. AKSES MENTOR (SELF SERVICE)
      if (role === 'MENTOR') {
        // DILARANG: Hampir semua kecuali Profil, Jadwal Saya, Gaji Saya
        if (
            pathname.startsWith('/keuangan') || 
            pathname.startsWith('/biaya-operasional') ||
            pathname.startsWith('/pembayaran') ||
            pathname.startsWith('/murid') ||
            pathname.startsWith('/paket-kelas') ||
            pathname.startsWith('/kelola-user')
        ) {
            return NextResponse.redirect(new URL('/absensi', req.url))
        }
      }

      // 4. AKSES GUEST/UNKNOWN
      if (role === 'GUEST') {
         return NextResponse.redirect(new URL('/login', req.url))
      }

    } catch (e) {
      url.pathname = '/login'
      const response = NextResponse.redirect(url)
      response.cookies.delete('auth')
      return response
    }
  }

  return NextResponse.next()
}

// Helper: Parse Cookie
function safeParseAuth(cookieVal: string) {
    try {
        const decoded = decodeURIComponent(cookieVal)
        return JSON.parse(decoded)
    } catch {
        return { user: { role: 'GUEST' } }
    }
}

// Helper: Default Path per Role
function getRoleDefaultPath(role: string): string {
  switch (role) {
    case 'OWNER':
    case 'ADMIN':
      return '/dashboard'
    case 'BENDAHARA':
      return '/keuangan' // ✅ Bendahara default ke Dashboard Keuangan
    case 'MENTOR':
      return '/absensi'
    default:
      return '/login'
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo-lembaga.png|aset).*)',
  ],
}
