// backend/src/middlewares/auth.middleware.js
const supabase = require('../config/supabase')

// Helper: Parsing raw cookie string manual
function parseAuthCookie(cookieHeader) {
  if (!cookieHeader) return null
  const parts = cookieHeader.split(';').map(s => s.trim())
  for (const p of parts) {
    if (p.startsWith('auth=')) {
      try {
        return JSON.parse(decodeURIComponent(p.substring(5)))
      } catch (e) {
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
            console.warn(`[Auth] User ${userAuth.email} tidak ditemukan di tabel public.users`)
        }
    } catch (err) {
        console.error("Gagal fetch role user:", err)
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