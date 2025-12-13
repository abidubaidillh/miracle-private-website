const supabase = require('../config/supabase')
const userStore = require('../data/userStore')

module.exports = function allowedRoles(roles) {
  // ensure roles is an array
  const allowed = Array.isArray(roles) ? roles : [roles]
  return async function (req, res, next) {
    try {
      if (!req.user || !req.user.id) return res.status(401).json({ error: 'unauthenticated' })
      let role = null
      try {
        const { data, error } = await supabase.from('users').select('role').eq('id', req.user.id).single()
        if (!error && data) role = data.role
      } catch (e) {
        // ignore supabase error
      }
      if (!role) role = userStore.getRole(req.user.id) || null

      if (!allowed.includes(role)) return res.status(403).json({ error: 'forbidden' })
      return next()
    } catch (err) {
      return res.status(500).json({ error: err.message || String(err) })
    }
  }
}
