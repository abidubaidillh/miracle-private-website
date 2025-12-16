import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const pathname = req.nextUrl.pathname

  // 1. Dapatkan Cookie Auth
  const authCookie = req.cookies.get('auth')?.value

  // 2. Tentukan apakah ini halaman publik (Login/Register)
  const isPublicPage = pathname === '/login' || pathname === '/register'

  // --- LOGIKA REDIRECT ---

  // KASUS A: User mengakses Root ('/')
  // Middleware akan menentukan dia harus ke mana
  if (pathname === '/') {
    if (authCookie) {
      try {
        const auth = JSON.parse(decodeURIComponent(authCookie))
        const role = (auth?.user?.role || '').toUpperCase()
        url.pathname = getRoleDefaultPath(role)
        return NextResponse.redirect(url)
      } catch (e) {
        // Cookie rusak, hapus dan ke login
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

  // KASUS B: User SUDAH Login, tapi mencoba buka halaman Login/Register
  // Lempar balik ke Dashboard/Halaman Default mereka
  if (authCookie && isPublicPage) {
    try {
      const auth = JSON.parse(decodeURIComponent(authCookie))
      const role = (auth?.user?.role || '').toUpperCase()
      url.pathname = getRoleDefaultPath(role)
      return NextResponse.redirect(url)
    } catch (e) {
      // Ignore error, let them go to login if cookie is bad
    }
  }

  // KASUS C: User BELUM Login, tapi mencoba buka halaman yang dilindungi
  if (!authCookie && !isPublicPage) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // KASUS D: Validasi Hak Akses Role (RBAC)
  // Hanya dijalankan jika user sudah login dan berada di halaman private
  if (authCookie && !isPublicPage) {
    try {
      const auth = JSON.parse(decodeURIComponent(authCookie))
      const role = (auth?.user?.role || '').toUpperCase()

      // --- ATURAN HAK AKSES SESUAI REQUIREMENT ---

      // 1. Keuangan, Gaji, Biaya Ops (Hanya Owner & Bendahara, Admin view only/partial)
      // MENTOR DILARANG MASUK SINI
      if (
        pathname.startsWith('/keuangan') || 
        pathname.startsWith('/gaji-mentor') || 
        pathname.startsWith('/biaya-operasional') ||
        pathname.startsWith('/pembayaran')
      ) {
        if (role === 'MENTOR') {
          return NextResponse.redirect(new URL('/jadwal', req.url)) // Mentor dilempar ke Jadwal
        }
      }

      // 2. Jadwal (Owner, Admin, Mentor)
      // BENDAHARA DILARANG MASUK SINI (Sesuai tabel: Jadwal -> Bendahara ❌)
      if (pathname.startsWith('/jadwal')) {
        if (role === 'BENDAHARA') {
          return NextResponse.redirect(new URL('/keuangan', req.url)) // Bendahara dilempar ke Keuangan
        }
      }

      // 3. Paket Kelas & Murid (Owner, Admin, Bendahara view only)
      // MENTOR DILARANG MASUK SINI
      if (pathname.startsWith('/paket-kelas') || pathname.startsWith('/murid')) {
        if (role === 'MENTOR') {
          return NextResponse.redirect(new URL('/jadwal', req.url))
        }
      }

    } catch (e) {
      // Jika parsing gagal, anggap sesi tidak valid
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
      return '/keuangan' // Fokus utama bendahara
    case 'MENTOR':
      return '/jadwal'   // Fokus utama mentor
    default:
      return '/login'
  }
}

// Konfigurasi Matcher:
// Middleware TIDAK akan berjalan pada path yang cocok dengan regex ini.
// Kita mengecualikan: api, _next/static, _next/image, favicon.ico, dan logo-lembaga.png
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|logo-lembaga.png|aset).*)',
  ],
}