const supabase = require('../config/supabase')

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

    const authHeader = req.headers && req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }

    if (!token) {
      const cookies = req.cookies || {}
      if (cookies.auth) {
        try {
          const parsed = typeof cookies.auth === 'string' ? JSON.parse(decodeURIComponent(cookies.auth)) : cookies.auth
          token = parsed?.session?.access_token
        } catch (e) {
          // ignore
        }
      }
    }

    if (!token && req.headers && req.headers.cookie) {
      const parsed = parseAuthCookie(req.headers.cookie)
      token = parsed?.session?.access_token || token
    }

    if (!token) return res.status(401).json({ error: 'missing token' })

    const { data, error } = await supabase.auth.getUser(token)
    if (error) return res.status(401).json({ error: error.message || error })
    req.user = data?.user || null
    req.access_token = token
    return next()
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}
