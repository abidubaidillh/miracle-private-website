// backend/src/controllers/auth.controller.js

const supabase = require('../config/supabase')
const userStore = require('../data/userStore') // Opsional: jika Anda masih pakai in-memory store sebagai cache

// =================================================================
// 1. REGISTER PUBLIC (Untuk User Daftar Sendiri)
// =================================================================
async function register(req, res) {
    try {
        const { username, email, phone_number, birthday, password } = req.body || {}
        
        // Validasi Dasar
        if (!username || !email || !phone_number || !birthday || !password) {
            return res.status(400).json({ error: 'Data tidak lengkap. Mohon isi semua field.' })
        }

        const normalizedRole = 'MENTOR' // Default pendaftar umum adalah Mentor (atau bisa diubah logicnya)

        // 1. Buat User di Supabase Auth
        let user = null
        // Coba pakai admin API dulu (bypass email confirm) jika service role key tersedia
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
            // Fallback ke sign up biasa
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
        try {
            const { error: userError } = await supabase.from('users').upsert({
                id: user.id,
                email: user.email || email,
                username,
                phone_number,
                birthday,
                role: normalizedRole,
            })
            
            if (userError) {
                console.error("Error saving user to users table:", userError)
                throw new Error('Gagal menyimpan profil user: ' + userError.message)
            }
            
            // 3. HANYA jika Role MENTOR, simpan juga ke tabel 'mentors'
            // Karena register sendiri, Subject default 'Umum' & Gaji 0 (menunggu di-set Admin)
            if (normalizedRole === 'MENTOR') {
                const { error: mentorError } = await supabase.from('mentors').insert([{
                    id: user.id,
                    name: username,
                    email: email,
                    phone_number: phone_number,
                    subject: 'Umum', 
                    salary_per_session: 0, 
                    status: 'AKTIF'
                }])

                if (mentorError) {
                    console.error("Error saving mentor to mentors table:", mentorError)
                    throw new Error('Gagal menyimpan data mentor: ' + mentorError.message)
                }
            }

            // Cache role (Opsional)
            if (userStore && userStore.saveRole) {
                userStore.saveRole(user.id, user.email || email, normalizedRole)
            }

        } catch (e) {
            console.error("Error saving user profile details:", e)
            // Return error karena profil user tidak lengkap
            return res.status(500).json({ error: e.message })
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

        // Login ke Supabase
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) return res.status(401).json({ error: error.message })

        const user = data?.user
        const session = data?.session
        
        // Ambil Role dari Database
        let role = null
        try {
            const { data: roleRow } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single()
            
            role = roleRow?.role
        } catch (e) {
            console.warn("Gagal ambil role dari DB, mencoba fallback store")
        }
        
        // Fallback jika DB gagal (jarang terjadi)
        if (!role && userStore) role = userStore.getRole(user.id)
        
        // Default GUEST jika tidak ditemukan
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
        // Token didapat dari Middleware (req.access_token)
        const token = req.access_token 
        
        // Jika middleware belum memproses token, kita cek manual (safety net)
        if (!token && !req.user) return res.status(401).json({ error: 'No token provided' })
        
        // Jika req.user sudah di-set oleh Middleware, gunakan itu langsung (LEBIH CEPAT)
        if (req.user) {
            return res.json({ user: req.user })
        }

        // Jika tidak, fetch manual ke Supabase
        const { data, error } = await supabase.auth.getUser(token)
        if (error || !data.user) return res.status(401).json({ error: 'Invalid token' })

        const user = data.user
        let role = null
        
        const { data: roleRow } = await supabase.from('users').select('role').eq('id', user.id).single()
        role = roleRow?.role

        return res.json({ user: { id: user.id, email: user.email, role: role || 'GUEST' } })

    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// =================================================================
// 4. REGISTER INTERNAL (Admin/Owner Dashboard - Kelola User)
// =================================================================
async function registerInternal(req, res) {
    try {
        // ✅ TANGKAP INPUT LENGKAP
        const { username, email, phone_number, birthday, password, role, subjects, expertise, salary_per_session } = req.body || {}
        
        if (!username || !email || !password || !role) {
            return res.status(400).json({ error: 'Data wajib (username, email, password, role) belum lengkap.' })
        }
        
        const validRoles = ['OWNER', 'ADMIN', 'BENDAHARA', 'MENTOR'];
        const normalizedRole = role.toUpperCase();
        
        if (!validRoles.includes(normalizedRole)) {
            return res.status(400).json({ error: 'Role tidak valid.' })
        }

        // 1. Buat User Auth (Supabase Auth)
        let user = null
        // Gunakan Admin API agar email langsung terkonfirmasi (tidak butuh verifikasi email)
        if (supabase.auth.admin && typeof supabase.auth.admin.createUser === 'function') {
             const { data, error } = await supabase.auth.admin.createUser({ 
                 email, 
                 password, 
                 email_confirm: true, // Auto confirm
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
                phone_number: phone_number || '',
                birthday: birthday || null,
                role: normalizedRole,
            });
            
            if (userStore && userStore.saveRole) {
                userStore.saveRole(user.id, user.email || email, normalizedRole);
            }
        } catch (e) {
             console.error("Error upsert users:", e);
        }

        // 3. ✅ [FIX] Simpan ke Tabel Mentors (HANYA JIKA ROLE == MENTOR)
        if (normalizedRole === 'MENTOR') {
            try {
                // Standarisasi Gaji (Pastikan Angka)
                const salary = salary_per_session ? parseInt(salary_per_session) : 0;
                
                // Prioritaskan input 'subjects', fallback ke 'expertise', lalu 'Umum'
                const finalSubject = subjects || expertise || 'Umum';

                const { error: mentorError } = await supabase
                    .from('mentors')
                    .upsert([{
                        id: user.id, // ID Mentor = ID User Auth
                        name: username,
                        email: email,
                        phone_number: phone_number || '',
                        
                        // Kolom di DB Anda kemungkinan bernama 'subject'
                        subject: finalSubject, 
                        
                        salary_per_session: isNaN(salary) ? 0 : salary,
                        status: 'AKTIF'
                    }]);
                
                if (mentorError) {
                    console.error("❌ Gagal sync ke tabel mentors:", mentorError);
                    return res.status(500).json({ error: 'User dibuat, tapi gagal simpan data mentor: ' + mentorError.message })
                } else {
                    // Mentor created successfully
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

// =================================================================
// 5. LOGOUT
// =================================================================
async function logout(req, res) {
    try {
        // Hapus cookie jika ada
        res.clearCookie('token'); 
        res.clearCookie('auth'); 
        
        // Hapus session di Supabase (Opsional, token JWT stateless sebenarnya tetap valid sampai expired)
        // const token = req.headers.authorization?.split(' ')[1];
        // if (token) await supabase.auth.admin.signOut(token);

        return res.status(200).json({ message: 'Logout berhasil' });
    } catch (err) {
        return res.status(500).json({ message: 'Gagal logout' });
    }
}

module.exports = { register, login, me, registerInternal, logout }
