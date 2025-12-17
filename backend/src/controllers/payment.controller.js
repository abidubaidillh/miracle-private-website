const supabase = require('../config/supabase')

// GET: Ambil Data Pembayaran (Support Filter & Search)
const getPayments = async (req, res) => {
    const { search, status } = req.query

    try {
        let query = supabase
            .from('payments')
            .select(`
                *,
                students (name, phone_number) 
            `)
            .order('payment_date', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query
        if (error) throw error

        // Filter Search Manual (karena join table search agak kompleks di Supabase JS basic)
        let filteredData = data
        if (search) {
            const lowerSearch = search.toLowerCase()
            filteredData = data.filter(item => 
                item.title.toLowerCase().includes(lowerSearch) ||
                item.students?.name.toLowerCase().includes(lowerSearch)
            )
        }

        // Hitung Statistik Sederhana
        const stats = {
            total_lunas: filteredData.filter(p => p.status === 'LUNAS').length,
            total_pending: filteredData.filter(p => p.status === 'BELUM_LUNAS').length,
            total_uang: filteredData.reduce((acc, curr) => acc + (curr.status === 'LUNAS' ? curr.amount : 0), 0)
        }

        return res.status(200).json({ payments: filteredData, stats })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// POST: Tambah Pembayaran Baru
const createPayment = async (req, res) => {
    const { student_id, title, amount, method, status, notes, payment_date } = req.body

    try {
        const { data, error } = await supabase
            .from('payments')
            .insert([{
                student_id,
                title,
                amount: parseInt(amount),
                method,
                status,
                notes,
                payment_date: payment_date || new Date()
            }])
            .select()

        if (error) throw error
        return res.status(201).json({ message: 'Pembayaran berhasil disimpan', data })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// DELETE: Hapus Data
const deletePayment = async (req, res) => {
    const { id } = req.params
    try {
        const { error } = await supabase.from('payments').delete().eq('id', id)
        if (error) throw error
        return res.status(200).json({ message: 'Data dihapus' })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

module.exports = { getPayments, createPayment, deletePayment }