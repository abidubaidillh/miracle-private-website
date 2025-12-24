const supabase = require('../config/supabase')
const userStore = require('../data/userStore')

module.exports = function allowedRoles(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles]

  return async function (req, res, next) {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'unauthenticated' })
      }

      let role = null

      // 1️⃣ Ambil role dari database
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', req.user.id)
        .single()

      if (!error && data?.role) {
        role = data.role
      }

      // ✅ SECURITY FIX: Hapus fallback ke userStore (rentan tampering)
      if (!role) {
        return res.status(403).json({ error: 'User role tidak ditemukan di database.' })
      }

      // ✅ SIMPAN ROLE KE req.user
      req.user.role = role

      if (!allowed.includes(role)) {
        return res.status(403).json({ error: 'forbidden' })
      }

      next()
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }
}
