// backend/src/controllers/operasional.controller.js
const supabase = require('../config/supabase')

// Helper untuk validasi input
const validateOperasionalInput = (data) => {
  const { nama_pengeluaran, kategori_id, jumlah, tipe_periode, tanggal } = data
  
  if (!nama_pengeluaran || nama_pengeluaran.trim().length === 0) {
    return { valid: false, message: 'Nama pengeluaran wajib diisi' }
  }
  
  if (!kategori_id) {
    return { valid: false, message: 'Kategori wajib dipilih' }
  }
  
  if (!jumlah || jumlah <= 0) {
    return { valid: false, message: 'Jumlah harus lebih dari 0' }
  }
  
  if (!tipe_periode || !['HARIAN', 'MINGGUAN', 'BULANAN'].includes(tipe_periode)) {
    return { valid: false, message: 'Tipe periode harus HARIAN, MINGGUAN, atau BULANAN' }
  }
  
  if (!tanggal) {
    return { valid: false, message: 'Tanggal wajib diisi' }
  }
  
  return { valid: true }
}

// GET /api/operasional - Ambil semua data operasional
const getAllOperasional = async (req, res) => {
  try {
    const { page = 1, limit = 10, kategori, tipe_periode, bulan, tahun } = req.query
    
    let query = supabase
      .from('operasional')
      .select(`
        *,
        kategori_operasional (
          id,
          nama_kategori,
          deskripsi
        )
      `)
      .order('tanggal', { ascending: false })
    
    // Filter berdasarkan kategori
    if (kategori) {
      query = query.eq('kategori_id', kategori)
    }
    
    // Filter berdasarkan tipe periode
    if (tipe_periode) {
      query = query.eq('tipe_periode', tipe_periode)
    }
    
    // Filter berdasarkan bulan dan tahun
    if (bulan && tahun) {
      const startDate = `${tahun}-${bulan.padStart(2, '0')}-01`
      const endDate = new Date(tahun, bulan, 0).toISOString().split('T')[0]
      query = query.gte('tanggal', startDate).lte('tanggal', endDate)
    }
    
    // Pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Error fetching operasional:', error)
      return res.status(500).json({ error: 'Gagal mengambil data operasional' })
    }
    
    // Hitung total untuk pagination
    const { count: totalCount } = await supabase
      .from('operasional')
      .select('*', { count: 'exact', head: true })
    
    res.json({
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    })
    
  } catch (err) {
    console.error('Error in getAllOperasional:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// GET /api/operasional/kategori - Ambil semua kategori operasional
const getAllKategori = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('kategori_operasional')
      .select('*')
      .order('nama_kategori')
    
    if (error) {
      console.error('Error fetching kategori:', error)
      return res.status(500).json({ error: 'Gagal mengambil data kategori' })
    }
    
    res.json({ data })
    
  } catch (err) {
    console.error('Error in getAllKategori:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// GET /api/operasional/summary - Summary untuk dashboard
const getOperasionalSummary = async (req, res) => {
  try {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()
    
    // Total pengeluaran bulan ini
    const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`
    const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
    
    const { data: monthlyData, error: monthlyError } = await supabase
      .from('operasional')
      .select('jumlah')
      .gte('tanggal', startDate)
      .lte('tanggal', endDate)
    
    if (monthlyError) {
      console.error('Error fetching monthly operasional:', monthlyError)
      return res.status(500).json({ error: 'Gagal mengambil data bulanan' })
    }
    
    const totalBulanIni = monthlyData.reduce((sum, item) => sum + item.jumlah, 0)
    
    // Total per kategori bulan ini
    const { data: categoryData, error: categoryError } = await supabase
      .from('operasional')
      .select(`
        jumlah,
        kategori_operasional (
          nama_kategori
        )
      `)
      .gte('tanggal', startDate)
      .lte('tanggal', endDate)
    
    if (categoryError) {
      console.error('Error fetching category data:', categoryError)
      return res.status(500).json({ error: 'Gagal mengambil data kategori' })
    }
    
    const perKategori = categoryData.reduce((acc, item) => {
      const kategori = item.kategori_operasional?.nama_kategori || 'Lainnya'
      acc[kategori] = (acc[kategori] || 0) + item.jumlah
      return acc
    }, {})
    
    res.json({
      totalBulanIni,
      perKategori,
      periode: `${currentMonth}/${currentYear}`
    })
    
  } catch (err) {
    console.error('Error in getOperasionalSummary:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// POST /api/operasional - Tambah data operasional baru
const createOperasional = async (req, res) => {
  try {
    const validation = validateOperasionalInput(req.body)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message })
    }
    
    const { nama_pengeluaran, kategori_id, jumlah, tipe_periode, tanggal, deskripsi } = req.body
    
    const { data, error } = await supabase
      .from('operasional')
      .insert([{
        nama_pengeluaran: nama_pengeluaran.trim(),
        kategori_id,
        jumlah: parseFloat(jumlah),
        tipe_periode: tipe_periode.toUpperCase(),
        tanggal,
        deskripsi: deskripsi?.trim() || null,
        created_by: req.user.id
      }])
      .select(`
        *,
        kategori_operasional (
          id,
          nama_kategori,
          deskripsi
        )
      `)
    
    if (error) {
      console.error('Error creating operasional:', error)
      return res.status(500).json({ error: 'Gagal menambah data operasional' })
    }
    
    res.status(201).json({
      message: 'Data operasional berhasil ditambahkan',
      data: data[0]
    })
    
  } catch (err) {
    console.error('Error in createOperasional:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// PUT /api/operasional/:id - Update data operasional
const updateOperasional = async (req, res) => {
  try {
    const { id } = req.params
    
    const validation = validateOperasionalInput(req.body)
    if (!validation.valid) {
      return res.status(400).json({ error: validation.message })
    }
    
    const { nama_pengeluaran, kategori_id, jumlah, tipe_periode, tanggal, deskripsi } = req.body
    
    const { data, error } = await supabase
      .from('operasional')
      .update({
        nama_pengeluaran: nama_pengeluaran.trim(),
        kategori_id,
        jumlah: parseFloat(jumlah),
        tipe_periode: tipe_periode.toUpperCase(),
        tanggal,
        deskripsi: deskripsi?.trim() || null
      })
      .eq('id', id)
      .select(`
        *,
        kategori_operasional (
          id,
          nama_kategori,
          deskripsi
        )
      `)
    
    if (error) {
      console.error('Error updating operasional:', error)
      return res.status(500).json({ error: 'Gagal mengupdate data operasional' })
    }
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Data operasional tidak ditemukan' })
    }
    
    res.json({
      message: 'Data operasional berhasil diupdate',
      data: data[0]
    })
    
  } catch (err) {
    console.error('Error in updateOperasional:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// DELETE /api/operasional/:id - Hapus data operasional
const deleteOperasional = async (req, res) => {
  try {
    const { id } = req.params
    
    const { error } = await supabase
      .from('operasional')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting operasional:', error)
      return res.status(500).json({ error: 'Gagal menghapus data operasional' })
    }
    
    res.json({ message: 'Data operasional berhasil dihapus' })
    
  } catch (err) {
    console.error('Error in deleteOperasional:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = {
  getAllOperasional,
  getAllKategori,
  getOperasionalSummary,
  createOperasional,
  updateOperasional,
  deleteOperasional
}