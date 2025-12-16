// src/controllers/mentor.controller.js

const supabase = require('../config/supabase')

/**
 * =====================================================
 * A. GET (READ)
 * =====================================================
 * OWNER, ADMIN, BENDAHARA → lihat semua mentor
 * MENTOR → hanya lihat data dirinya sendiri
 */
const getAllMentor = async (req, res) => {
  const { status, search } = req.query
  const userRole = req.user.role
  const userId = req.user.id

  try {
    let query = supabase
      .from('mentors')
      .select('*')
      .order('name', { ascending: true })

    // 🔐 Mentor hanya lihat dirinya sendiri
    // CATATAN: mentors.user_id HARUS ADA
    if (userRole === 'MENTOR') {
      query = query.eq('user_id', userId)
    }

    if (status && ['AKTIF', 'NON-AKTIF'].includes(status)) {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,phone_number.ilike.%${search}%,expertise.ilike.%${search}%`
      )
    }

    const { data: mentors, error } = await query
    if (error) throw error

    let stats = { active: 0, inactive: 0 }

    // Mentor tidak perlu statistik global
    if (userRole !== 'MENTOR') {
      const { count: active } = await supabase
        .from('mentors')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'AKTIF')

      const { count: inactive } = await supabase
        .from('mentors')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'NON-AKTIF')

      stats = {
        active: active || 0,
        inactive: inactive || 0,
      }
    }

    return res.status(200).json({
      mentors,
      stats,
    })
  } catch (err) {
    return res.status(500).json({
      message: 'Gagal mengambil data mentor',
      error: err.message,
    })
  }
}

/**
 * =====================================================
 * B. POST (CREATE)
 * =====================================================
 * OWNER, ADMIN
 */
const createMentor = async (req, res) => {
  const {
    name,
    phone_number,
    address,
    expertise,
    salary_per_session,
    status,
    user_id,
  } = req.body

  if (!name || !phone_number || salary_per_session === undefined) {
    return res.status(400).json({
      message: 'Nama, No HP, dan Gaji per sesi wajib diisi',
    })
  }

  const salary = parseInt(salary_per_session)
  if (isNaN(salary) || salary < 0) {
    return res.status(400).json({
      message: 'Gaji per sesi tidak valid',
    })
  }

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
        user_id: user_id || null,
      }])
      .select()
      .single()

    if (error) throw error

    return res.status(201).json({
      message: 'Mentor berhasil ditambahkan',
      mentor: data,
    })
  } catch (err) {
    return res.status(500).json({
      message: 'Gagal menambahkan mentor',
      error: err.message,
    })
  }
}

/**
 * =====================================================
 * C. PUT (UPDATE)
 * =====================================================
 * OWNER → full update
 * ADMIN → tidak boleh ubah salary
 */
const updateMentor = async (req, res) => {
  const { id } = req.params
  const userRole = req.user.role
  const updateData = { ...req.body }

  // 🔐 ADMIN tidak boleh ubah gaji
  if (userRole === 'ADMIN') {
    delete updateData.salary_per_session
  }

  if (updateData.status) {
    const normalized = updateData.status.toUpperCase()
    if (!['AKTIF', 'NON-AKTIF'].includes(normalized)) {
      return res.status(400).json({
        message: 'Status mentor tidak valid',
      })
    }
    updateData.status = normalized
  }

  if (updateData.salary_per_session !== undefined) {
    const salary = parseInt(updateData.salary_per_session)
    if (isNaN(salary) || salary < 0) {
      return res.status(400).json({
        message: 'Gaji per sesi tidak valid',
      })
    }
    updateData.salary_per_session = salary
  }

  try {
    const { data, error } = await supabase
      .from('mentors')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      return res.status(404).json({
        message: 'Mentor tidak ditemukan',
      })
    }

    return res.status(200).json({
      message: 'Data mentor berhasil diperbarui',
      mentor: data,
    })
  } catch (err) {
    return res.status(500).json({
      message: 'Gagal memperbarui mentor',
      error: err.message,
    })
  }
}

/**
 * =====================================================
 * D. DELETE
 * =====================================================
 * OWNER ONLY (dibatasi di routes)
 */
const deleteMentor = async (req, res) => {
  const { id } = req.params

  try {
    const { error } = await supabase
      .from('mentors')
      .delete()
      .eq('id', id)

    if (error) throw error

    return res.status(200).json({
      message: 'Mentor berhasil dihapus',
    })
  } catch (err) {
    return res.status(500).json({
      message: 'Gagal menghapus mentor',
      error: err.message,
    })
  }
}

module.exports = {
  getAllMentor,
  createMentor,
  updateMentor,
  deleteMentor,
}
