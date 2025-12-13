const supabase = require('../config/supabase')
const userStore = require('../data/userStore')

async function register(req, res) {
  try {
    const { email, password, role } = req.body || {}
    if (!email || !password || !role) return res.status(400).json({ error: 'email, password, role required' })

    // NORMALIZE role to UPPERCASE (single source of truth)
    const normalizedRole = (role || '').toUpperCase()
    const validRoles = ['OWNER', 'ADMIN', 'BENDAHARA', 'MENTOR']
    if (!validRoles.includes(normalizedRole)) {
      return res.status(400).json({ error: `invalid role. must be one of: ${validRoles.join(', ')}` })
    }

    // create user via Supabase Admin if available
    let user = null
    if (supabase.auth && supabase.auth.admin && typeof supabase.auth.admin.createUser === 'function') {
      const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
      if (error) return res.status(400).json({ error: error.message || error })
      user = data?.user || data
    } else {
      // fallback to signUp
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return res.status(400).json({ error: error.message || error })
      user = data?.user || data
    }

    if (!user || !user.id) return res.status(500).json({ error: 'failed to create user' })

    // store role in users table, fallback to local store if Supabase table missing
    try {
      const { data: upsertData, error: upsertError } = await supabase.from('users').upsert({ id: user.id, email: user.email || email, role: normalizedRole })
      // verify persisted
      let persistedRole = null
      try {
        const { data: sel, error: selErr } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (!selErr && sel) persistedRole = sel.role || null
      } catch (e) {
        // ignore
      }
      if (!persistedRole) {
        userStore.saveRole(user.id, user.email || email, normalizedRole)
      }
    } catch (e) {
      userStore.saveRole(user.id, user.email || email, normalizedRole)
    }

    // Always mirror role in in-memory store so backend can read it even if Supabase table isn't writable
    try {
      userStore.saveRole(user.id, user.email || email, normalizedRole)
      console.log('[auth.controller] saved role to userStore', user.id, normalizedRole)
    } catch (e) {
      console.log('[auth.controller] failed to save role to userStore', e && e.message)
    }

    return res.status(201).json({ user: { id: user.id, email: user.email, role: normalizedRole } })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return res.status(401).json({ error: error.message || error })

    const user = data?.user
    const session = data?.session
    if (!user) return res.status(401).json({ error: 'invalid credentials' })

    let role = null
    try {
      const { data: roleRow, error } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (!error && roleRow) role = roleRow.role || null
    } catch (e) {
      // ignore
    }
    if (!role) {
      role = userStore.getRole(user.id) || null
    }
    // NORMALIZE to UPPERCASE
    role = (role || '').toUpperCase() || null
    console.log('[auth.controller] login resolved role', user.id, role, 'store=', userStore.getUser(user.id))

    return res.json({ user: { id: user.id, email: user.email, role }, session })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}

async function me(req, res) {
  try {
    const token = req.access_token
    if (!token) return res.status(401).json({ error: 'no token' })

    const { data, error } = await supabase.auth.getUser(token)
    if (error) return res.status(401).json({ error: error.message || error })

    const user = data?.user
    if (!user) return res.status(401).json({ error: 'invalid token' })

    let role = null
    try {
      const { data: roleRow, error } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (!error && roleRow) role = roleRow.role || null
    } catch (e) {
      // ignore
    }
    if (!role) role = userStore.getRole(user.id) || null
    // NORMALIZE to UPPERCASE
    role = (role || '').toUpperCase() || null
    console.log('[auth.controller] me resolved role', user.id, role, 'store=', userStore.getUser(user.id))

    return res.json({ user: { id: user.id, email: user.email, role } })
  } catch (err) {
    return res.status(500).json({ error: err.message || String(err) })
  }
}

module.exports = { register, login, me }
