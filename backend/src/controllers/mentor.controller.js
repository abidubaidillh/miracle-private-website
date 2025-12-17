// src/controllers/mentor.controller.js
const supabase = require('../config/supabase')

// A. GET (READ) - Ambil Data Mentor
const getAllMentor = async (req, res) => {
  const { status, search } = req.query
  
  // Pastikan req.user ada (mencegah crash jika middleware auth error/bypass)
  const userRole = req.user ? req.user.role : null
  const userId = req.user ? req.user.id : null

  try {
    let query = supabase
      .from('mentors')
      .select('*')
      .order('name', { ascending: true })

    // 🔐 FILTER: Jika yang login MENTOR, hanya tampilkan data dirinya sendiri
    if (userRole === 'MENTOR') {
      query = query.eq('id', userId) 
    }

    // Filter Status
    if (status && ['AKTIF', 'NON-AKTIF'].includes(status.toUpperCase())) {
      query = query.eq('status', status.toUpperCase())
    }

    // Filter Pencarian 
    // Mencari di kolom: name, email, phone_number, atau subject
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone_number.ilike.%${search}%,subject.ilike.%${search}%`)
    }

    const { data: mentors, error } = await query
    
    if (error) throw error

    // Kembalikan dengan key 'mentors' agar cocok dengan frontend
    return res.status(200).json({ mentors })

  } catch (err) {
    console.error("Get Mentor Error:", err)
    return res.status(500).json({ message: 'Gagal mengambil data mentor', error: err.message })
  }
}

// B. POST (CREATE) - Tambah Mentor Baru
const createMentor = async (req, res) => {
  // Tangkap variasi nama variabel (jaga-jaga frontend kirim 'expertise' atau 'phone')
  const { name, email, phone, phone_number, address, subject, expertise, salary_per_session, status } = req.body

  // 1. Standarisasi Input
  // Prioritaskan input, fallback ke string kosong atau nilai default
  const finalPhone = phone_number || phone || ''
  const finalSubject = subject || expertise || 'UMUM' 
  const finalSalary = salary_per_session ? parseInt(salary_per_session) : 0

  // Validasi Wajib
  if (!name || !email) {
    return res.status(400).json({ message: "Nama dan Email wajib diisi." })
  }

  try {
    const { data, error } = await supabase
      .from('mentors')
      .insert([{
        name,
        email,
        // Pastikan key ini sesuai nama kolom di DB (phone_number)
        phone_number: finalPhone, 
        address,
        
        // Pastikan key ini sesuai nama kolom di DB (subject)
        subject: finalSubject, 
        
        salary_per_session: finalSalary,
        status: status?.toUpperCase() || 'AKTIF',
      }])
      .select()
      .single()

    if (error) throw error

    return res.status(201).json({ message: 'Mentor berhasil ditambahkan', mentor: data })

  } catch (err) {
    // Error kode unik (biasanya email duplicate)
    if (err.code === '23505') { 
        return res.status(400).json({ message: 'Email mentor sudah terdaftar.' })
    }
    console.error("Create Mentor Error:", err)
    return res.status(500).json({ message: 'Gagal menambahkan mentor', error: err.message })
  }
}

// C. PUT (UPDATE) - Edit Data Mentor
const updateMentor = async (req, res) => {
  const { id } = req.params
  const userRole = req.user ? req.user.role : null
  const userId = req.user ? req.user.id : null
  
  // Salin body agar aman dimodifikasi
  const updateData = { ...req.body }

  // --- MAPPING INPUT KE KOLOM DB ---
  
  // 1. Mapping Expertise -> Subject
  if (updateData.expertise) {
      updateData.subject = updateData.expertise;
      delete updateData.expertise; 
  }

  // 2. Mapping Phone -> Phone Number
  if (updateData.phone) {
      updateData.phone_number = updateData.phone;
      delete updateData.phone;
  }

  // 🛡️ SECURITY CHECK
  // 1. Mentor hanya boleh edit profil sendiri
  if (userRole === 'MENTOR' && id !== userId) {
      return res.status(403).json({ message: "Akses ditolak." })
  }

  // 2. Hanya Owner/Bendahara yang boleh ubah gaji
  const allowedFinancialRoles = ['OWNER', 'BENDAHARA']
  if (userRole && !allowedFinancialRoles.includes(userRole)) {
      if (updateData.salary_per_session !== undefined) {
          delete updateData.salary_per_session
      }
  }

  // Standarisasi Status
  if (updateData.status) {
    updateData.status = updateData.status.toUpperCase()
  }

  try {
    const { data, error } = await supabase
      .from('mentors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return res.status(200).json({ message: 'Mentor berhasil diperbarui', mentor: data })
  } catch (err) {
    console.error("Update Mentor Error:", err)
    return res.status(500).json({ message: 'Gagal update mentor', error: err.message })
  }
}

// D. DELETE
const deleteMentor = async (req, res) => {
  const { id } = req.params
  try {
    const { error } = await supabase.from('mentors').delete().eq('id', id)
    if (error) throw error
    return res.status(200).json({ message: 'Mentor berhasil dihapus' })
  } catch (err) {
    return res.status(500).json({ message: 'Gagal menghapus mentor', error: err.message })
  }
}

module.exports = { getAllMentor, createMentor, updateMentor, deleteMentor }