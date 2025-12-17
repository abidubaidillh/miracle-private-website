// backend/src/controllers/auth.controller.js

const supabase = require('../config/supabase')
const userStore = require('../data/userStore')

// --- REGISTER PUBLIC (Default) ---
async function register(req, res) {
    try {
        const { username, email, phone_number, birthday, password } = req.body || {}
        if (!username || !email || !phone_number || !birthday || !password) {
            return res.status(400).json({ error: 'Data tidak lengkap.' })
        }

        const normalizedRole = 'MENTOR' 

        // 1. Buat User Auth
        let user = null
        if (supabase.auth && supabase.auth.admin && typeof supabase.auth.admin.createUser === 'function') {
            const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true })
            if (error) return res.status(400).json({ error: error.message })
            user = data?.user || data
        } else {
            const { data, error } = await supabase.auth.signUp({ email, password })
            if (error) return res.status(400).json({ error: error.message })
            user = data?.user || data
        }

        if (!user || !user.id) return res.status(500).json({ error: 'Gagal membuat user auth' })

        // 2. Simpan ke Users & Mentors
        try {
            await supabase.from('users').upsert({
                id: user.id,
                email: user.email || email,
                username,
                phone_number,
                birthday,
                role: normalizedRole,
            })
            
            // Sync Public Register ke Mentors
            // Default: subject 'Umum', Gaji 0
            await supabase.from('mentors').insert([{
                id: user.id,
                name: username,
                email: email,
                phone_number: phone_number,
                subject: 'Umum', 
                salary_per_session: 0, 
                status: 'AKTIF'
            }])

            userStore.saveRole(user.id, user.email || email, normalizedRole)
        } catch (e) {
            console.error("Error saving user profile:", e)
        }

        return res.status(201).json({ user: { id: user.id, email: user.email, role: normalizedRole } })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// --- LOGIN ---
async function login(req, res) {
    try {
        const { email, password } = req.body || {}
        if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi' })

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) return res.status(401).json({ error: error.message })

        const user = data?.user
        const session = data?.session
        
        let role = null
        try {
            const { data: roleRow } = await supabase.from('users').select('role').eq('id', user.id).single()
            role = roleRow?.role
        } catch (e) {}
        
        if (!role) role = userStore.getRole(user.id)
        role = (role || '').toUpperCase()

        return res.json({ user: { id: user.id, email: user.email, role }, session })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// --- ME ---
async function me(req, res) {
    try {
        const token = req.access_token
        if (!token) return res.status(401).json({ error: 'No token' })

        const { data, error } = await supabase.auth.getUser(token)
        if (error || !data.user) return res.status(401).json({ error: 'Invalid token' })

        const user = data.user
        let role = null
        try {
            const { data: roleRow } = await supabase.from('users').select('role').eq('id', user.id).single()
            role = roleRow?.role
        } catch (e) {}
        
        if (!role) role = userStore.getRole(user.id)
        role = (role || '').toUpperCase()

        return res.json({ user: { id: user.id, email: user.email, role } })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// --- REGISTER INTERNAL (Admin/Owner Dashboard) ---
async function registerInternal(req, res) {
    try {
        // ✅ TANGKAP INPUT LENGKAP
        // Frontend kirim: subjects -> Backend terima subjects
        const { username, email, phone_number, birthday, password, role, subjects, expertise, salary_per_session } = req.body || {}
        
        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: 'Data wajib belum lengkap.' })
        }
        
        const validRoles = ['OWNER', 'ADMIN', 'BENDAHARA', 'MENTOR'];
        const normalizedRole = role.toUpperCase();
        
        if (!validRoles.includes(normalizedRole)) {
            return res.status(400).json({ error: 'Role tidak valid.' })
        }

        // 1. Buat User Auth (Supabase Auth)
        let user = null
        if (supabase.auth && supabase.auth.admin && typeof supabase.auth.admin.createUser === 'function') {
             const { data, error } = await supabase.auth.admin.createUser({ 
                 email, 
                 password, 
                 email_confirm: true,
                 user_metadata: { full_name: username }
             })
             if (error) return res.status(400).json({ error: error.message })
             user = data?.user || data
        } else {
             const { data, error } = await supabase.auth.signUp({ email, password })
             if (error) return res.status(400).json({ error: error.message })
             user = data?.user || data
        }
        
        if (!user || !user.id) return res.status(500).json({ error: 'Gagal membuat user auth' })

        // 2. Simpan ke Tabel 'users' (Profile Login)
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
             // Jangan return error, lanjut coba simpan mentor
        }

        // 3. ✅ [FIX] Simpan ke Tabel Mentors
        if (normalizedRole === 'MENTOR') {
            try {
                // Validasi & Standarisasi Data
                const salary = salary_per_session ? parseInt(salary_per_session) : 0;
                
                // Prioritaskan input 'subjects', fallback ke 'expertise' atau 'Umum'
                const finalSubject = subjects || expertise || 'Umum';

                const { error: mentorError } = await supabase
                    .from('mentors')
                    .upsert([{
                        id: user.id, // ID Mentor = ID User Auth
                        name: username,
                        email: email,
                        phone_number: phone_number,
                        
                        // Pastikan nama kolom di DB Anda 'subject'. 
                        // Jika DB Anda pakai 'expertise', ganti jadi: expertise: finalSubject
                        subject: finalSubject, 
                        
                        salary_per_session: isNaN(salary) ? 0 : salary,
                        status: 'AKTIF'
                    }]);
                
                if (mentorError) {
                    console.error("❌ Gagal sync ke tabel mentors:", mentorError);
                    // Opsional: Rollback (hapus user auth) jika gagal buat mentor
                } else {
                    console.log(`✅ Sukses buat mentor: ${username}, Mapel: ${finalSubject}`);
                }
            } catch (err) {
                console.error("Crash sync mentors:", err);
            }
        }

        return res.status(201).json({ 
            message: "User berhasil dibuat",
            user: { id: user.id, email: user.email, role: normalizedRole } 
        })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// --- LOGOUT ---
async function logout(req, res) {
    try {
        res.clearCookie('token'); 
        return res.status(200).json({ message: 'Logout berhasil' });
    } catch (err) {
        return res.status(500).json({ message: 'Gagal logout' });
    }
}

module.exports = { register, login, me, registerInternal, logout }