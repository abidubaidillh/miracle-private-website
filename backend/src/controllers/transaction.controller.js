const supabase = require('../config/supabase')

// Ambil semua transaksi (Bisa difilter tipe)
async function getTransactions(req, res) {
    try {
        const { type, startDate, endDate } = req.query

        // Validasi query parameters
        if (type && !['EXPENSE', 'INCOME'].includes(type)) {
            return res.status(400).json({ error: 'Invalid transaction type. Must be EXPENSE or INCOME' })
        }

        if ((startDate && !endDate) || (!startDate && endDate)) {
            return res.status(400).json({ error: 'Both startDate and endDate must be provided together' })
        }

        if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' })
            }
            if (start > end) {
                return res.status(400).json({ error: 'startDate cannot be after endDate' })
            }
        }

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

        if (error) {
            console.error('Database error in getTransactions:', error)
            return res.status(500).json({ error: 'Failed to retrieve transactions' })
        }

        // Hitung Total
        const totalAmount = data.reduce((sum, item) => sum + item.amount, 0)

        return res.json({ 
            transactions: data, 
            stats: { total: totalAmount, count: data.length } 
        })

    } catch (err) {
        console.error('Unexpected error in getTransactions:', err)
        return res.status(500).json({ error: 'Internal server error' })
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
