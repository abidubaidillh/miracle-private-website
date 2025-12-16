// src/controllers/mentor.controller.js

const supabase = require('../config/supabase')

// A. GET (READ)
const getAllMentor = async (req, res) => {
  const { status, search } = req.query
  const userRole = req.user.role
  const userId = req.user.id

  try {
    let query = supabase
      .from('mentors')
      .select('*')
      .order('name', { ascending: true })

    // 🔐 MENTOR hanya lihat dirinya sendiri
    if (userRole === 'MENTOR') {
      query = query.eq('id', userId) // Asumsi ID di mentors = ID user auth
    }

    if (status && ['AKTIF', 'NON-AKTIF'].includes(status)) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone_number.ilike.%${search}%`)
    }

    const { data: mentors, error } = await query
    if (error) throw error

    return res.status(200).json({ mentors })
  } catch (err) {
    return res.status(500).json({ message: 'Gagal mengambil data mentor', error: err.message })
  }
}

// B. POST (CREATE)
const createMentor = async (req, res) => {
  const { name, phone_number, address, expertise, salary_per_session, status, user_id } = req.body

  // Jika Admin yang buat, salary mungkin 0 atau null, itu OK.
  const salary = salary_per_session ? parseInt(salary_per_session) : 0

  try {
    const { data, error } = await supabase
      .from('mentors')
      .insert([{
        name,
        phone_number,
        address,
        expertise,
        salary_per_session: salary,
        status: status?.toUpperCase() || 'AKTIF',
        // Jika user_id dikirim (manual linking), pakai itu. Jika tidak, biarkan null (atau create user auth dulu terpisah)
        user_id: user_id || null 
      }])
      .select()
      .single()

    if (error) throw error

    return res.status(201).json({ message: 'Mentor berhasil ditambahkan', mentor: data })
  } catch (err) {
    return res.status(500).json({ message: 'Gagal menambahkan mentor', error: err.message })
  }
}

// C. PUT (UPDATE) - 🛡️ DENGAN PROTEKSI
const updateMentor = async (req, res) => {
  const { id } = req.params
  const userRole = req.user.role // Didapat dari authMiddleware
  const updateData = { ...req.body }

  // 🛡️ SECURITY: Hapus field gaji jika bukan OWNER
  if (userRole !== 'OWNER') {
      if (updateData.salary_per_session !== undefined) {
          console.warn(`[Security] User ${req.user.email} mencoba ubah gaji. Dibatalkan.`)
          delete updateData.salary_per_session
      }
  }

  // Validasi Status
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