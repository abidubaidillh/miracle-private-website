// backend/src/middlewares/auth.middleware.js
const supabase = require('../config/supabase')

// Helper parsing cookie
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

module.exports = async function authMiddleware(req, res, next) {
  try {
    let token = null

    // 1. Cek Header Authorization
    const authHeader = req.headers && req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }

    // 2. Cek Cookie (Fallback)
    if (!token) {
      if (req.headers.cookie) {
          const parsed = parseAuthCookie(req.headers.cookie)
          token = parsed?.session?.access_token
      }
    }

    if (!token) return res.status(401).json({ error: 'missing token' })

    // 3. Validasi Token ke Supabase Auth
    const { data: authData, error } = await supabase.auth.getUser(token)
    if (error || !authData.user) return res.status(401).json({ error: 'Invalid token' })

    const userAuth = authData.user

    // 4. ✅ FETCH ROLE DARI TABEL 'users'
    // Ini wajib agar controller tahu role user ini apa (OWNER/ADMIN/etc)
    let userRole = 'MENTOR' // Default
    try {
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', userAuth.id)
            .single()
        
        if (userData && userData.role) {
            userRole = userData.role.toUpperCase()
        }
    } catch (err) {
        console.error("Gagal fetch role user:", err)
    }

    // 5. Attach ke req.user
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