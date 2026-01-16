// backend/src/controllers/payment.controller.js
const supabase = require('../config/supabase')

// GET: Ambil Data Pembayaran (Support Filter & Search)
const getPayments = async (req, res) => {
    const { search, status } = req.query
    try {
        // Gunakan seleksi kolom eksplisit untuk menghindari Supabase memanggil kolom yang tidak ada (cache issue)
        let query = supabase
            .from('payments')
            .select(`
                id,
                student_id,
                title,
                amount,
                status,
                method,
                notes,
                payment_date,
                proof_image,
                students!inner (
                    name, 
                    school_origin
                )
            `)
            .order('payment_date', { ascending: false })

        if (status) {
            query = query.eq('status', status)
        }

        const { data, error } = await query
        
        if (error) {
            console.error("Supabase Query Error:", error);
            throw error
        }

        let filteredData = data
        
        // Logika Filter di sisi Server (Javascript) agar lebih fleksibel
        if (search) {
            const lowerSearch = search.toLowerCase()
            filteredData = data.filter(item => {
                const studentName = item.students?.name?.toLowerCase() || ''
                const schoolOrigin = item.students?.school_origin?.toLowerCase() || ''
                const title = item.title?.toLowerCase() || ''
                
                return title.includes(lowerSearch) || 
                       studentName.includes(lowerSearch) || 
                       schoolOrigin.includes(lowerSearch)
            })
        }

        // Hitung Statistik berdasarkan data yang sudah difilter
        const stats = {
            total_lunas: filteredData.filter(p => p.status === 'LUNAS').length,
            total_pending: filteredData.filter(p => p.status !== 'LUNAS').length,
            total_uang: filteredData.reduce((acc, curr) => acc + (curr.status === 'LUNAS' ? curr.amount : 0), 0)
        }

        return res.status(200).json({ payments: filteredData, stats })
    } catch (err) {
        console.error("Controller Error:", err.message);
        return res.status(500).json({ message: err.message })
    }
}

// POST: Tambah Pembayaran Baru
const createPayment = async (req, res) => {
    const { student_id, title, amount, method, status, notes, payment_date, proof_image } = req.body
    try {
        const { data, error } = await supabase
            .from('payments')
            .insert([{
                student_id,
                title,
                amount: parseInt(amount),
                method: status === 'LUNAS' ? method : null,
                status, 
                notes,
                payment_date: payment_date || new Date(),
                proof_image: proof_image || null
            }])
            .select()
            .single()

        if (error) throw error

        // Jika langsung lunas saat dibuat, catat ke transaksi
        if (status === 'LUNAS') {
            await recordTransaction(data.id, title, amount, payment_date, proof_image, method)
        }

        return res.status(201).json({ message: 'Pembayaran berhasil disimpan', data })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// UPDATE: Pelunasan Pembayaran
const payPayment = async (req, res) => {
    const { id } = req.params
    const { proof_image, method } = req.body 

    try {
        // 1. Cek data lama
        const { data: oldPayment, error: fetchError } = await supabase
            .from('payments')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !oldPayment) return res.status(404).json({ error: 'Data pembayaran tidak ditemukan' })
        if (oldPayment.status === 'LUNAS') return res.status(400).json({ error: 'Pembayaran ini sudah lunas sebelumnya' })

        // 2. Update Status jadi LUNAS
        const { data: updatedPayment, error: updateError } = await supabase
            .from('payments')
            .update({
                status: 'LUNAS',
                method: method,
                proof_image: proof_image, 
                payment_date: new Date() 
            })
            .eq('id', id)
            .select()
            .single()

        if (updateError) throw updateError

        // 3. Catat ke Jurnal Transaksi
        await recordTransaction(id, oldPayment.title, oldPayment.amount, new Date(), proof_image, method)

        return res.json({ message: 'Pembayaran berhasil dilunasi', data: updatedPayment })

    } catch (err) {
        console.error("Pay Error:", err)
        return res.status(500).json({ error: err.message })
    }
}

// DELETE: Hapus Pembayaran
const deletePayment = async (req, res) => {
    const { id } = req.params
    try {
        const { error } = await supabase.from('payments').delete().eq('id', id)
        // Hapus juga record di transaksi jika ada
        await supabase.from('transactions').delete().eq('reference_id', id)
        
        if (error) throw error
        return res.status(200).json({ message: 'Data dihapus' })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

// HELPER: Mencatat ke tabel Transactions
async function recordTransaction(refId, title, amount, date, proofImage = null, method = null) {
    try {
        let categoryId = null
        // Cari atau buat kategori "Pembayaran Les"
        const { data: catData } = await supabase
            .from('categories')
            .select('id')
            .eq('name', 'Pembayaran Les')
            .single()
        
        if (catData) {
            categoryId = catData.id
        } else {
            const { data: newCat } = await supabase
                .from('categories')
                .insert([{ name: 'Pembayaran Les', type: 'INCOME' }])
                .select('id')
                .single()
            categoryId = newCat?.id
        }

        await supabase.from('transactions').insert([{
            date: date || new Date(),
            type: 'INCOME',
            amount: amount,
            category_id: categoryId,
            description: `Pelunasan (${method || 'Tanpa Metode'}): ${title}`,
            reference_id: refId,
            proof_image: proofImage
        }])
    } catch (e) {
        console.error("Gagal mencatat transaksi otomatis:", e.message)
    }
}

module.exports = { getPayments, createPayment, deletePayment, payPayment }