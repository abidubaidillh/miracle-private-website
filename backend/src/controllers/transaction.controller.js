const supabase = require('../config/supabase')

// Ambil semua transaksi (Bisa difilter tipe)
async function getTransactions(req, res) {
    try {
        const { type, startDate, endDate } = req.query

        let query = supabase
            .from('transactions')
            .select(`
                *,
                categories (name)
            `)
            .order('date', { ascending: false })

        if (type) query = query.eq('type', type)
        if (startDate && endDate) query = query.gte('date', startDate).lte('date', endDate)

        const { data, error } = await query

        if (error) throw error

        // Hitung Total
        const totalAmount = data.reduce((sum, item) => sum + item.amount, 0)

        return res.json({ 
            transactions: data, 
            stats: { total: totalAmount, count: data.length } 
        })

    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// Ambil Kategori (untuk Dropdown)
async function getCategories(req, res) {
    try {
        const { type } = req.query
        let query = supabase.from('categories').select('*')
        
        if (type) query = query.eq('type', type)
        
        const { data, error } = await query
        if (error) throw error

        return res.json(data)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// Tambah Transaksi Baru
async function createTransaction(req, res) {
    try {
        const { date, category_id, amount, description, type } = req.body

        const { data, error } = await supabase
            .from('transactions')
            .insert([{
                date, 
                category_id, 
                amount: parseInt(amount), 
                description, 
                type // 'EXPENSE' atau 'INCOME'
            }])
            .select()

        if (error) throw error

        return res.status(201).json({ message: 'Transaksi berhasil disimpan', data })

    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// Hapus Transaksi
async function deleteTransaction(req, res) {
    try {
        const { id } = req.params
        const { error } = await supabase.from('transactions').delete().eq('id', id)
        if (error) throw error

        return res.json({ message: 'Transaksi dihapus' })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

module.exports = { getTransactions, getCategories, createTransaction, deleteTransaction }