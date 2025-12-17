// backend/src/controllers/finance.controller.js
const supabase = require('../config/supabase')

async function getFinanceSummary(req, res) {
    try {
        // 1. Ambil Pemasukan dari Pembayaran Murid (Payments) yang LUNAS
        const { data: payments, error: errPay } = await supabase
            .from('payments')
            .select('id, amount, payment_date, method, students(name)')
            .eq('status', 'LUNAS')
            .order('payment_date', { ascending: false })

        if (errPay) throw errPay

        // 2. Ambil Pengeluaran (Jika Anda tidak pakai operasional, ini akan kosong, tidak error)
        // Kita tetap pasang agar sistem tidak crash jika nanti Anda berubah pikiran
        const { data: expenses, error: errExp } = await supabase
            .from('transactions')
            .select('id, amount, date, description, categories(name)')
            .eq('type', 'EXPENSE')
            .order('date', { ascending: false })
            
        // Jika tabel transactions belum ada, anggap array kosong agar tidak error
        const safeExpenses = errExp ? [] : expenses;

        // --- MENGHITUNG TOTAL ---
        const totalIncome = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
        const totalOperational = safeExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
        
        // Nanti ditambah Gaji Mentor di sini
        const totalSalary = 0 
        
        const totalExpense = totalOperational + totalSalary
        const netBalance = totalIncome - totalExpense

        // --- GABUNG DATA UNTUK RIWAYAT ---
        const historyPayments = payments.map(p => ({
            id: p.id,
            date: p.payment_date,
            description: `Pembayaran SPP - ${p.students?.name || 'Murid'}`,
            category: 'Pemasukan Les',
            type: 'INCOME',
            amount: p.amount
        }))

        const historyExpenses = safeExpenses.map(e => ({
            id: e.id,
            date: e.date,
            description: e.description || '-',
            category: e.categories?.name || 'Operasional',
            type: 'EXPENSE',
            amount: e.amount
        }))

        // Gabung & Sortir (Terbaru diatas)
        const combinedHistory = [...historyPayments, ...historyExpenses]
            .sort((a, b) => new Date(b.date) - new Date(a.date))

        return res.json({
            stats: {
                totalIncome,
                totalExpense,
                netBalance
            },
            history: combinedHistory
        })

    } catch (err) {
        console.error("Finance Summary Error:", err)
        return res.status(500).json({ error: err.message })
    }
}

module.exports = { getFinanceSummary }