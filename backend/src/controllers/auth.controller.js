// backend/src/controllers/auth.controller.js

const supabase = require('../config/supabase')
const userStore = require('../data/userStore')

// =================================================================
// 1. REGISTER PUBLIC (Untuk User Daftar Sendiri - Mentor)
// =================================================================
async function register(req, res) {
    try {
        const { username, email, birthday, password } = req.body || {}
        
        // Validasi Dasar (phone_number dihapus dari validasi jika kolom sudah tidak ada)
        if (!username || !email || !birthday || !password) {
            return res.status(400).json({ error: 'Data tidak lengkap. Mohon isi semua field.' })
        }

        const normalizedRole = 'MENTOR' 

        // 1. Buat User di Supabase Auth
        let user = null
        if (supabase.auth.admin && typeof supabase.auth.admin.createUser === 'function') {
            const { data, error } = await supabase.auth.admin.createUser({ 
                email, 
                password, 
                email_confirm: true,
                user_metadata: { full_name: username }
            })
            if (error) return res.status(400).json({ error: error.message })
            user = data?.user || data
        } else {
            const { data, error } = await supabase.auth.signUp({ 
                email, 
                password,
                options: { data: { full_name: username } }
            })
            if (error) return res.status(400).json({ error: error.message })
            user = data?.user || data
        }

        if (!user || !user.id) return res.status(500).json({ error: 'Gagal membuat user auth' })

        // 2. Simpan ke Tabel 'users' (Profile Login)
        // Kolom phone_number DIHAPUS agar tidak terjadi error 500
        const { error: userError } = await supabase.from('users').upsert({
            id: user.id,
            email: user.email || email,
            username,
            birthday,
            role: normalizedRole,
        })
        
        if (userError) throw new Error('Gagal menyimpan profil user: ' + userError.message)
        
        // 3. Simpan ke tabel 'mentors'
        if (normalizedRole === 'MENTOR') {
            console.log("🔄 Menyimpan data mentor ke database...");
            console.log("User ID:", user.id);
            console.log("Username:", username);
            console.log("Email:", email);
            
            const { error: mentorError } = await supabase.from('mentors').insert([{
                user_id: user.id,  // ✅ PERBAIKAN: Gunakan user_id, bukan id
                name: username,
                email: email,
                phone_number: '000000000000', // ✅ PERBAIKAN: Gunakan dummy phone number
                subject: 'Umum', 
                salary_per_session: 0, 
                status: 'AKTIF'
            }])

            if (mentorError) {
                console.error("❌ Gagal menyimpan data mentor:", mentorError);
                throw new Error('Gagal menyimpan data mentor: ' + mentorError.message)
            } else {
                console.log("✅ Data mentor berhasil disimpan ke database");
            }
        }

        if (userStore && userStore.saveRole) {
            userStore.saveRole(user.id, user.email || email, normalizedRole)
        }

        return res.status(201).json({ 
            message: "Registrasi berhasil", 
            user: { id: user.id, email: user.email, role: normalizedRole } 
        })

    } catch (err) {
        console.error("Register Error:", err)
        return res.status(500).json({ error: err.message })
    }
}

// =================================================================
// 2. LOGIN
// =================================================================
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
            const { data: roleRow } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()
            
            role = roleRow?.role
        } catch (e) {
            console.warn("Gagal ambil role dari DB")
        }
        
        if (!role && userStore) role = userStore.getRole(user.id)
        role = (role || 'GUEST').toUpperCase()

        return res.json({ 
            message: 'Login berhasil',
            user: { 
                id: user.id, 
                email: user.email, 
                role,
                name: user.user_metadata?.full_name || email.split('@')[0]
            }, 
            session 
        })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// =================================================================
// 3. GET CURRENT USER (ME)
// =================================================================
async function me(req, res) {
    try {
        const token = req.access_token 
        if (!token && !req.user) return res.status(401).json({ error: 'No token provided' })
        
        if (req.user) return res.json({ user: req.user })

        const { data, error } = await supabase.auth.getUser(token)
        if (error || !data.user) return res.status(401).json({ error: 'Invalid token' })

        const user = data.user
        const { data: roleRow } = await supabase.from('users').select('role').eq('id', user.id).single()

        return res.json({ user: { id: user.id, email: user.email, role: roleRow?.role || 'GUEST' } })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// =================================================================
// 4. REGISTER INTERNAL (Dashboard Admin/Owner)
// =================================================================
async function registerInternal(req, res) {
    try {
        console.log("🔄 [registerInternal] Request body:", req.body);
        const { username, email, birthday, password, role, subjects, expertise, salary_per_session, phone_number } = req.body || {}
        
        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: 'Data wajib (username, email, password, role) belum lengkap.' })
        }
        
        const validRoles = ['OWNER', 'ADMIN', 'BENDAHARA', 'MENTOR'];
        const normalizedRole = role.toUpperCase();
        
        if (!validRoles.includes(normalizedRole)) {
            return res.status(400).json({ error: 'Role tidak valid.' })
        }

        // 1. Buat User Auth (Admin API)
        let user = null
        if (supabase.auth.admin && typeof supabase.auth.admin.createUser === 'function') {
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

        // 2. Simpan ke Tabel 'users' (Tanpa phone_number)
        await supabase.from('users').upsert({
            id: user.id,
            email: user.email || email,
            username,
            birthday: birthday || null,
            role: normalizedRole,
        });
        
        if (userStore && userStore.saveRole) {
            userStore.saveRole(user.id, user.email || email, normalizedRole);
        }

        // 3. Simpan ke Tabel Mentors (Jika role MENTOR)
        if (normalizedRole === 'MENTOR') {
            console.log("🔄 [registerInternal] Menyimpan data mentor...");
            const salary = salary_per_session ? parseInt(salary_per_session) : 0;
            const finalSubject = subjects || expertise || 'Umum';
            const finalPhone = phone_number || '000000000000';

            console.log("📋 [registerInternal] Data mentor:", {
                user_id: user.id,
                name: username,
                email: email,
                phone_number: finalPhone,
                subject: finalSubject,
                salary_per_session: salary
            });

            const { error: mentorError } = await supabase
                .from('mentors')
                .upsert([{
                    user_id: user.id,  // ✅ PERBAIKAN: Gunakan user_id, bukan id
                    name: username,
                    email: email,
                    phone_number: finalPhone, // ✅ PERBAIKAN: Gunakan phone_number dari form atau fallback
                    subject: finalSubject, 
                    salary_per_session: isNaN(salary) ? 0 : salary,
                    status: 'AKTIF'
                }]);
            
            if (mentorError) {
                console.error("❌ [registerInternal] Gagal sync ke tabel mentors:", mentorError);
                throw new Error('Gagal menyimpan data mentor: ' + mentorError.message)
            } else {
                console.log("✅ [registerInternal] Data mentor berhasil disimpan");
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

// =================================================================
// 5. LOGOUT
// =================================================================
async function logout(req, res) {
    try {
        res.clearCookie('token'); 
        res.clearCookie('auth'); 
        return res.status(200).json({ message: 'Logout berhasil' });
    } catch (err) {
        return res.status(500).json({ message: 'Gagal logout' });
    }
}

module.exports = { register, login, me, registerInternal, logout }