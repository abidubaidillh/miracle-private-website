// backend/src/controllers/finance.controller.js
const supabase = require('../config/supabase')

async function getFinanceSummary(req, res) {
    try {
        const now = new Date()
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

        // 1. QUERY PEMASUKAN
        const { data: incomeData, error: errInc } = await supabase
            .from('payments')
            .select('amount')
            .eq('status', 'LUNAS')
            .gte('payment_date', firstDayOfMonth)

        if (errInc) throw errInc
        const totalIncome = incomeData.reduce((sum, item) => sum + (item.amount || 0), 0)

        // 2. QUERY PENGELUARAN
        // A. Operasional
        const { data: operationalData } = await supabase
            .from('transactions')
            .select('amount')
            .eq('type', 'EXPENSE')
            .gte('date', firstDayOfMonth)
        
        const operationalExpense = operationalData ? operationalData.reduce((sum, item) => sum + (item.amount || 0), 0) : 0

        // B. Gaji Mentor (Sudah Lunas Bulan Ini)
        const { data: salaryData } = await supabase
            .from('salaries')
            .select('total_amount')
            .eq('status', 'PAID')
            .gte('payment_date', firstDayOfMonth)

        const salaryExpense = salaryData ? salaryData.reduce((sum, item) => sum + (item.total_amount || 0), 0) : 0
        const totalExpense = operationalExpense + salaryExpense

        // 3. ACTIONABLE ITEMS (PENDING)
        // A. Tagihan Murid Belum Lunas
        const { count: unpaidInvoices } = await supabase
            .from('payments')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'LUNAS')

        // B. ✅ FIXED: Gaji Mentor Belum Dibayar
        // Kita harus menghitung jumlah Mentor Aktif yang status gajinya di tabel 'salaries' belum 'PAID'
        // untuk bulan dan tahun berjalan.
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Ambil semua mentor aktif
        const { data: activeMentors } = await supabase
            .from('mentors')
            .select('id')
            .eq('status', 'AKTIF');

        // Ambil data gaji yang sudah lunas untuk bulan ini
        const { data: paidSalaries } = await supabase
            .from('salaries')
            .select('mentor_id')
            .eq('month', currentMonth)
            .eq('year', currentYear)
            .eq('status', 'PAID');

        const paidMentorIds = (paidSalaries || []).map(s => s.mentor_id);
        
        // Unpaid = Semua mentor aktif MINUS mentor yang sudah dibayar
        const unpaidSalariesCount = (activeMentors || []).filter(m => !paidMentorIds.includes(m.id)).length;

        // 4. HISTORY (Sama seperti sebelumnya)
        const { data: recentPayments } = await supabase
            .from('payments')
            .select('id, payment_date, amount, title, students(name)')
            .eq('status', 'LUNAS')
            .order('payment_date', { ascending: false }).limit(10)

        const { data: recentOps } = await supabase
            .from('transactions')
            .select('id, date, amount, description, categories(name)')
            .eq('type', 'EXPENSE')
            .order('date', { ascending: false }).limit(10)

        const { data: recentSalaries } = await supabase
            .from('salaries')
            .select('id, payment_date, total_amount, mentors(name)')
            .eq('status', 'PAID')
            .order('payment_date', { ascending: false }).limit(10)

        const combinedHistory = [
            ...(recentPayments || []).map(p => ({
                date: p.payment_date,
                description: `Pembayaran: ${p.students?.name || 'Siswa'}`,
                category: 'Pemasukan Les',
                type: 'INCOME',
                amount: p.amount
            })),
            ...(recentOps || []).map(o => ({
                date: o.date,
                description: o.description,
                category: o.categories?.name || 'Operasional',
                type: 'EXPENSE',
                amount: o.amount
            })),
            ...(recentSalaries || []).map(s => ({
                date: s.payment_date,
                description: `Gaji: ${s.mentors?.name}`,
                category: 'Gaji Mentor',
                type: 'EXPENSE',
                amount: s.total_amount
            }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20)

        return res.json({
            stats: {
                totalIncome,
                totalExpense,
                netBalance: totalIncome - totalExpense,
                unpaid_invoices: unpaidInvoices || 0,
                unpaid_salaries: unpaidSalariesCount // ✅ Sekarang menampilkan angka yang benar
            },
            history: combinedHistory
        })

    } catch (err) {
        console.error("Finance Summary Error:", err)
        return res.status(500).json({ error: err.message })
    }
}

module.exports = { getFinanceSummary }