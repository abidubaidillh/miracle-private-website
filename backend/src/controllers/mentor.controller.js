// src/controllers/mentor.controller.js
const supabase = require('../config/supabase')

// =================================================================
// A. GET (READ) - Ambil Data Mentor (List)
// =================================================================
const getAllMentor = async (req, res) => {
  const { status, search } = req.query
  
  // Ambil info user dari Middleware Auth
  const userRole = req.user ? req.user.role : null
  const userId = req.user ? req.user.id : null

  try {
    let query = supabase
      .from('mentors')
      .select('*')
      .order('name', { ascending: true })

    // 🔐 FILTER: Jika yang login MENTOR, hanya tampilkan data dirinya sendiri
    // ✅ SECURITY FIX: Gunakan 'user_id' bukan 'id' untuk filter mentor
    if (userRole === 'MENTOR') {
      query = query.eq('user_id', userId) 
    }

    // Filter Status (AKTIF/NON-AKTIF)
    if (status && ['AKTIF', 'NON-AKTIF'].includes(status.toUpperCase())) {
      query = query.eq('status', status.toUpperCase())
    }

    // Filter Pencarian (Nama, Email, HP, Mapel)
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone_number.ilike.%${search}%,subject.ilike.%${search}%`)
    }

    const { data: mentors, error } = await query
    
    if (error) throw error

    return res.status(200).json({ mentors })

  } catch (err) {
    console.error("Get Mentor Error:", err)
    return res.status(500).json({ message: 'Gagal mengambil data mentor', error: err.message })
  }
}

// =================================================================
// B. GET MY PROFILE - Khusus Dashboard Mentor (/me)
// =================================================================
const getMyProfile = async (req, res) => {
    try {
        const userId = req.user.id 

        // 1. Ambil Data Mentor
        const { data: mentor, error } = await supabase
            .from('mentors')
            .select('*')
            .eq('user_id', userId)  // ✅ PERBAIKAN: Gunakan user_id, bukan id
            .single()

        if (error || !mentor) {
            console.error("❌ [DEBUG] Data Mentor tidak ditemukan di tabel public.mentors untuk ID:", userId)
            return res.status(404).json({ error: 'Profil mentor tidak ditemukan. ID Login tidak cocok dengan data Mentor.' })
        }

        // 2. 🔥 AMBIL SEMUA JADWAL (MENGGUNAKAN start_time & end_time) 🔥
        const { data: schedules, error: schedError } = await supabase
            .from('schedules')
            .select(`
                id, 
                date, 
                start_time, 
                end_time,
                subject, 
                students (name)
            `)
            .eq('mentor_id', userId)
            .order('date', { ascending: false })     // Urutkan dari tanggal terbaru
            .order('start_time', { ascending: true }) // Urutkan jam mulai

        if (schedError) {
            console.error("❌ [DEBUG] Error ambil jadwal:", schedError.message)
            // Tidak throw error agar profil tetap terload meski jadwal gagal
        } else {
        }

        // 3. Ambil Statistik (Sesi Bulan Ini)
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
        
        let sessionCount = 0;
        try {
            const { count } = await supabase
                .from('schedules')
                .select('*', { count: 'exact', head: true })
                .eq('mentor_id', userId)
                .gte('date', firstDay)
            
            sessionCount = count || 0;
        } catch (e) {
            console.warn("Gagal hitung statistik jadwal:", e.message)
        }

        return res.status(200).json({ 
            mentor, 
            upcoming_schedules: schedules || [], 
            stats: { 
                sessions_this_month: sessionCount,
                estimated_income: sessionCount * (mentor.salary_per_session || 0)
            } 
        })

    } catch (err) {
        console.error("SERVER ERROR:", err)
        return res.status(500).json({ error: err.message })
    }
}

// =================================================================
// C. POST (CREATE) - Tambah Mentor Baru
// =================================================================
const createMentor = async (req, res) => {
  const { name, email, phone, phone_number, address, subject, expertise, salary_per_session, status } = req.body

  // Standarisasi Input
  const finalPhone = phone_number || phone || ''
  const finalSubject = subject || expertise || 'UMUM' 
  const finalSalary = salary_per_session ? parseInt(salary_per_session) : 0

  if (!name || !email) {
    return res.status(400).json({ message: "Nama dan Email wajib diisi." })
  }

  try {
    const { data, error } = await supabase
      .from('mentors')
      .insert([{
        name,
        email,
        phone_number: finalPhone, 
        address,
        subject: finalSubject, 
        salary_per_session: finalSalary,
        status: status?.toUpperCase() || 'AKTIF',
      }])
      .select()
      .single()

    if (error) throw error

    return res.status(201).json({ message: 'Mentor berhasil ditambahkan', mentor: data })

  } catch (err) {
    // Error Code 23505 = Unique Violation (Email Kembar)
    if (err.code === '23505') { 
        return res.status(400).json({ message: 'Email mentor sudah terdaftar.' })
    }
    console.error("Create Mentor Error:", err)
    return res.status(500).json({ message: 'Gagal menambahkan mentor', error: err.message })
  }
}

// =================================================================
// D. PUT (UPDATE) - Edit Data Mentor
// =================================================================
// ✅ Update fungsi updateMentor di src/controllers/mentor.controller.js
const updateMentor = async (req, res) => {
  const { id } = req.params
  const userRole = req.user ? req.user.role : null
  const userId = req.user ? req.user.id : null
  
  // Clone body agar tidak merusak req.body asli
  let updateData = { ...req.body }

  // 1. Mapping Field (Frontend pakai 'expertise', DB pakai 'subject')
  if (updateData.expertise !== undefined) {
      updateData.subject = updateData.expertise;
      delete updateData.expertise; 
  }
  
  // 2. Mapping Field (Frontend pakai 'phone', DB pakai 'phone_number')
  if (updateData.phone !== undefined) {
      updateData.phone_number = updateData.phone;
      delete updateData.phone;
  }

  // 3. 🛡️ SECURITY & VALIDATION
  if (userRole === 'MENTOR' && id !== userId) {
      return res.status(403).json({ message: "Akses ditolak. Anda hanya bisa mengedit profil sendiri." })
  }

  const allowedFinancialRoles = ['OWNER', 'BENDAHARA']
  const safeUserRole = (userRole || 'GUEST').toUpperCase() // ✅ Default ke GUEST untuk menghindari undefined

  if (!allowedFinancialRoles.includes(safeUserRole)) {
      delete updateData.salary_per_session
      delete updateData.status // ✅ Mentor juga tidak boleh edit status sendiri
  } else if (updateData.salary_per_session !== undefined) {
      // Pastikan tipe data Integer untuk DB
      updateData.salary_per_session = parseInt(updateData.salary_per_session) || 0
  }

  if (updateData.status && allowedFinancialRoles.includes(safeUserRole)) {
    updateData.status = updateData.status.toUpperCase()
  }

  try {
    const { data, error } = await supabase
      .from('mentors')
      .update(updateData)
      .eq('id', id)
      .select()
      // .single() // Dihapus jika sering error 500 saat data tidak ditemukan

    if (error) {
        console.error("Supabase Update Error:", error);
        throw error;
    }

    return res.status(200).json({ 
        message: 'Mentor berhasil diperbarui', 
        mentor: data ? data[0] : null 
    })
  } catch (err) {
    console.error("Update Mentor Error Detailed:", err)
    return res.status(500).json({ message: 'Gagal update mentor', error: err.message })
  }
}

// =================================================================
// E. DELETE
// =================================================================
const deleteMentor = async (req, res) => {
  const { id } = req.params
  try {
    const { error } = await supabase.from('mentors').delete().eq('id', id)
    if (error) throw error
    return res.status(200).json({ message: 'Mentor berhasil dihapus' })
  } catch (err) {
    console.error("Delete Mentor Error:", err)
    return res.status(500).json({ message: 'Gagal menghapus mentor', error: err.message })
  }
}

// EXPORT MODULE
module.exports = { 
    getAllMentor, 
    getMyProfile, 
    createMentor, 
    updateMentor, 
    deleteMentor 
}
