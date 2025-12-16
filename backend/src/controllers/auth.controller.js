// backend/src/controllers/auth.controller.js

const supabase = require('../config/supabase')
const userStore = require('../data/userStore')

// --- REGISTER PUBLIC (Default) ---
async function register(req, res) {
    try {
        const { username, email, phone_number, birthday, password } = req.body || {}
        if (!username || !email || !phone_number || !birthday || !password) {
            return res.status(400).json({ error: 'username, email, phone_number, birthday, password required' })
        }

        const normalizedRole = 'MENTOR' // Default public registration is MENTOR

        let user = null
        // Create user in Supabase Auth
        if (supabase.auth && supabase.auth.admin && typeof supabase.auth.admin.createUser === 'function') {
            const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
            if (error) return res.status(400).json({ error: error.message || error })
            user = data?.user || data
        } else {
            const { data, error } = await supabase.auth.signUp({ email, password })
            if (error) return res.status(400).json({ error: error.message || error })
            user = data?.user || data
        }

        if (!user || !user.id) return res.status(500).json({ error: 'failed to create user' })

        // Store in 'users' table
        try {
            await supabase.from('users').upsert({
                id: user.id,
                email: user.email || email,
                username,
                phone_number,
                birthday,
                role: normalizedRole,
            })
            
            // ✅ SINKRONISASI KE TABEL MENTORS (Untuk Register Public)
            try {
                await supabase.from('mentors').insert([{
                    id: user.id,
                    name: username,
                    email: email,
                    phone_number: phone_number,
                    subjects: 'Umum', 
                    status: 'AKTIF'
                }])
            } catch (mentorErr) {
                console.error("Gagal auto-sync public register ke mentors:", mentorErr)
            }

            // Backup ke memory store
            userStore.saveRole(user.id, user.email || email, normalizedRole)
        } catch (e) {
            console.error("Error saving user profile:", e)
            userStore.saveRole(user.id, user.email || email, normalizedRole)
        }

        return res.status(201).json({ user: { id: user.id, email: user.email, role: normalizedRole } })
    } catch (err) {
        return res.status(500).json({ error: err.message || String(err) })
    }
}

// --- LOGIN ---
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
        role = (role || '').toUpperCase() || null
        console.log('[auth.controller] login resolved role', user.id, role)

        return res.json({ user: { id: user.id, email: user.email, role }, session })
    } catch (err) {
        return res.status(500).json({ error: err.message || String(err) })
    }
}

// --- ME (Check Token) ---
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
        role = (role || '').toUpperCase() || null

        return res.json({ user: { id: user.id, email: user.email, role } })
    } catch (err) {
        return res.status(500).json({ error: err.message || String(err) })
    }
}

// --- REGISTER INTERNAL (Admin/Owner Dashboard) ---
// ✅ LOGIKA SINKRONISASI DATA MENTOR DITAMBAHKAN DI SINI
async function registerInternal(req, res) {
    try {
        const { username, email, phone_number, birthday, password, role } = req.body || {}
        
        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: 'Username, email, password, dan role wajib diisi.' })
        }
        
        const validRoles = ['OWNER', 'ADMIN', 'BENDAHARA', 'MENTOR'];
        const normalizedRole = role.toUpperCase();
        
        if (!validRoles.includes(normalizedRole)) {
            return res.status(400).json({ error: 'Role tidak valid.' })
        }

        // 1. Buat User Authentication di Supabase
        let user = null
        if (supabase.auth && supabase.auth.admin && typeof supabase.auth.admin.createUser === 'function') {
             const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
             if (error) return res.status(400).json({ error: error.message || error })
             user = data?.user || data
        } else {
             const { data, error } = await supabase.auth.signUp({ email, password })
             if (error) return res.status(400).json({ error: error.message || error })
             user = data?.user || data
        }
        
        if (!user || !user.id) return res.status(500).json({ error: 'Gagal membuat user auth' })

        // 2. Simpan Profile ke Tabel 'users'
        try {
            await supabase.from('users').upsert({
                id: user.id,
                email: user.email || email,
                username,
                phone_number,
                birthday,
                role: normalizedRole,
            });
            userStore.saveRole(user.id, user.email || email, normalizedRole);
        } catch (e) {
             console.error("Error upsert users:", e);
             return res.status(500).json({ error: "Gagal menyimpan data user." });
        }

        // 3. ✅ [PENTING] Jika Role MENTOR, Duplikasi data ke tabel 'mentors'
        if (normalizedRole === 'MENTOR') {
            try {
                const { error: mentorError } = await supabase
                    .from('mentors')
                    .insert([{
                        id: user.id,          // Foreign Key ke users.id
                        name: username,       // Ambil dari username
                        email: email,
                        phone_number: phone_number,
                        subjects: 'Umum',     // Default value
                        status: 'AKTIF'
                    }]);
                
                if (mentorError) {
                    console.error("❌ Gagal sync ke tabel mentors:", mentorError);
                } else {
                    console.log(`✅ [Auth] Berhasil sync user ${username} ke tabel mentors.`);
                }
            } catch (err) {
                console.error("Crash saat sync mentor:", err);
            }
        }

        return res.status(201).json({ 
            message: "User berhasil dibuat",
            user: { id: user.id, email: user.email, role: normalizedRole } 
        })
    } catch (err) {
        return res.status(500).json({ error: err.message || String(err) })
    }
}

// --- LOGOUT ---
async function logout(req, res) {
    try {
        res.clearCookie('token'); 
        return res.status(200).json({ message: 'Logout berhasil di sisi server' });
    } catch (err) {
        console.error("Logout Error:", err);
        return res.status(500).json({ message: 'Gagal logout' });
    }
}

module.exports = { register, login, me, registerInternal, logout }