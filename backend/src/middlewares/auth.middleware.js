// backend/src/middlewares/auth.middleware.js
const supabase = require('../config/supabase')

// Helper: Parsing raw cookie string manual - Standardized with frontend
function parseAuthCookie(cookieHeader) {
  if (!cookieHeader) return null
  // Standardize with frontend: split by '; ' (semicolon + space)
  const parts = cookieHeader.split('; ').map(s => s.trim())
  for (const p of parts) {
    if (p.startsWith('auth=')) {
      try {
        const value = p.substring(5) // Remove 'auth='
        return JSON.parse(decodeURIComponent(value))
      } catch (e) {
        console.error("Failed to parse auth cookie:", e)
        return null
      }
    }
  }
  return null
}

const authMiddleware = async (req, res, next) => {
  try {
    let token = null

    // 1. Cek Header Authorization
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }

    // 2. Cek Cookie
    if (!token) {
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token
        } 
        else if (req.headers.cookie) {
            const parsed = parseAuthCookie(req.headers.cookie)
            token = parsed?.session?.access_token || parsed?.token
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Token missing. Please login.' })
    }

    // 3. Validasi Token ke Supabase
    const { data: authData, error } = await supabase.auth.getUser(token)
    
    if (error || !authData.user) {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }

    const userAuth = authData.user

    // 4. Fetch Role dari Tabel Users
    let userRole = 'GUEST' 
    
    try {
        const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', userAuth.id)
            .single()
        
        if (userData && userData.role) {
            userRole = userData.role.toUpperCase()
        } else {
            console.error(`[Auth] User ${userAuth.email} tidak ditemukan atau tidak memiliki role di tabel public.users`)
            return res.status(403).json({ error: 'User role tidak ditemukan. Silakan hubungi administrator.' }) // ✅ SECURITY FIX: Tolak akses jika role tidak ditemukan
        }
    } catch (err) {
        console.error("Gagal fetch role user:", err)
        return res.status(500).json({ error: 'Gagal memverifikasi role user. Silakan coba lagi.' }) // ✅ SECURITY FIX: Generic error message
    }

    // 5. Attach ke request
    req.user = {
        id: userAuth.id,
        email: userAuth.email,
        role: userRole 
    }
    
    req.access_token = token
    return next()

  } catch (err) {
    console.error("Auth Middleware Error:", err)
    return res.status(500).json({ error: "Internal Auth Error" })
  }
}

// 🔥 PERBAIKAN: Export langsung fungsinya (tanpa kurung kurawal)
// Agar paket.routes.js bisa membacanya sebagai function
module.exports = authMiddleware
