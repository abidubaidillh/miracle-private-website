import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const pathname = req.nextUrl.pathname

  // 1. Dapatkan Cookie Auth
  const authCookie = req.cookies.get('auth')?.value

  // 2. Tentukan apakah ini halaman publik
  // 🚨 PENTING: '/register' DIHAPUS dari sini agar tidak bisa diakses publik
  const isPublicPage = pathname === '/login'

  // --- LOGIKA REDIRECT ---

  // BLOKIR AKSES KE /register SECARA EKSPLISIT
  if (pathname === '/register') {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // KASUS A: User mengakses Root ('/')
  if (pathname === '/') {
    if (authCookie) {
      try {
        const auth = JSON.parse(decodeURIComponent(authCookie))
        const role = (auth?.user?.role || '').toUpperCase()
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

  // KASUS B: User SUDAH Login, tapi mencoba buka halaman Login
  if (authCookie && isPublicPage) {
    try {
      const auth = JSON.parse(decodeURIComponent(authCookie))
      const role = (auth?.user?.role || '').toUpperCase()
      url.pathname = getRoleDefaultPath(role)
      return NextResponse.redirect(url)
    } catch (e) {
      // Ignore error
    }
  }

  // KASUS C: User BELUM Login, tapi mencoba buka halaman yang dilindungi
  if (!authCookie && !isPublicPage) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // KASUS D: Validasi Hak Akses Role (RBAC)
  if (authCookie && !isPublicPage) {
    try {
      const auth = JSON.parse(decodeURIComponent(authCookie))
      const role = (auth?.user?.role || '').toUpperCase()

      // --- ATURAN HAK AKSES SESUAI REQUIREMENT ---

      // 1. Keuangan & Gaji (Owner & Bendahara only)
      if (
        pathname.startsWith('/keuangan') || 
        pathname.startsWith('/gaji-mentor') || 
        pathname.startsWith('/biaya-operasional') ||
        pathname.startsWith('/pembayaran')
      ) {
        if (role === 'MENTOR') {
          return NextResponse.redirect(new URL('/jadwal', req.url))
        }
      }

      // 2. Jadwal (Owner, Admin, Mentor) - Bendahara dilarang
      if (pathname.startsWith('/jadwal')) {
        if (role === 'BENDAHARA') {
          return NextResponse.redirect(new URL('/keuangan', req.url))
        }
      }

      // 3. Paket Kelas & Murid (Owner, Admin, Bendahara) - Mentor dilarang
      if (pathname.startsWith('/paket-kelas') || pathname.startsWith('/murid')) {
        if (role === 'MENTOR') {
          return NextResponse.redirect(new URL('/jadwal', req.url))
        }
      }
      
      // 4. Kelola User (Hanya Owner & Admin)
      if (pathname.startsWith('/kelola-user')) {
         if (role !== 'OWNER' && role !== 'ADMIN') {
             return NextResponse.redirect(new URL('/dashboard', req.url))
         }
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

// Helper: Menentukan halaman utama berdasarkan Role
function getRoleDefaultPath(role: string): string {
  switch (role) {
    case 'OWNER':
    case 'ADMIN':
      return '/dashboard'
    case 'BENDAHARA':
      return '/keuangan'
    case 'MENTOR':
      return '/jadwal'
    default:
      return '/login'
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo-lembaga.png|aset).*)',
  ],
}