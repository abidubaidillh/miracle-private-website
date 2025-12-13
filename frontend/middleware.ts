import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const pathname = req.nextUrl.pathname

  const publicPaths = ['/login', '/register', '/api', '/_next', '/favicon.ico', '/assets']
  if (publicPaths.some(p => pathname.startsWith(p))) return NextResponse.next()

  const cookie = req.cookies.get('auth')?.value
  if (!cookie) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  let auth = null
  try {
    auth = JSON.parse(decodeURIComponent(cookie))
  } catch (e) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Ensure role is UPPERCASE for consistent comparison
  const role = (auth?.user?.role || '').toUpperCase().trim()
  
  // Role-to-path mapping (single source of truth)
  function getRoleDefaultPath(userRole: string): string {
    if (userRole === 'OWNER' || userRole === 'ADMIN') return '/dashboard'
    if (userRole === 'BENDAHARA') return '/keuangan'
    if (userRole === 'MENTOR') return '/jadwal'
    return '/login'
  }

  // Root path: redirect to role's default page
  if (pathname === '/') {
    url.pathname = getRoleDefaultPath(role)
    return NextResponse.redirect(url)
  }

  // DASHBOARD: Only OWNER and ADMIN
  if (pathname.startsWith('/dashboard')) {
    if (role !== 'OWNER' && role !== 'ADMIN') {
      url.pathname = getRoleDefaultPath(role)
      return NextResponse.redirect(url)
    }
  }

  // KEUANGAN: BENDAHARA, OWNER, and ADMIN
  if (pathname.startsWith('/keuangan')) {
    if (role !== 'BENDAHARA' && role !== 'OWNER' && role !== 'ADMIN') {
      url.pathname = getRoleDefaultPath(role)
      return NextResponse.redirect(url)
    }
  }

  // JADWAL: MENTOR, OWNER, and ADMIN
  if (pathname.startsWith('/jadwal')) {
    if (role !== 'MENTOR' && role !== 'OWNER' && role !== 'ADMIN') {
      url.pathname = getRoleDefaultPath(role)
      return NextResponse.redirect(url)
    }
  }

  // Allow access if no redirect was needed
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/keuangan/:path*', '/jadwal/:path*', '/((?!_next|api|favicon.ico).*)'],
}
