// backend/src/controllers/salary.controller.js
const supabase = require('../config/supabase')

// 1. Ambil Daftar Gaji + Ringkasan
async function getSalaries(req, res) {
    try {
        const { month, year } = req.query
        const currentMonth = parseInt(month || new Date().getMonth() + 1)
        const currentYear = parseInt(year || new Date().getFullYear())

        // 1. Ambil Mentor Aktif
        const { data: mentors, error: errMentor } = await supabase
            .from('mentors')
            .select('id, name, salary_per_session')
            .eq('status', 'AKTIF')

        if (errMentor) throw errMentor

        // 2. Ambil Data Gaji Existing
        const { data: existingSalaries, error: errSal } = await supabase
            .from('salaries')
            .select('*')
            .eq('month', currentMonth)
            .eq('year', currentYear)

        if (errSal) throw errSal

        // --- MERGE DATA ---
        const salaryList = await Promise.all(mentors.map(async (m) => {
            
            // Hitung Sesi Real-time dari Absensi
            const { count: actualSessions, error: countErr } = await supabase
                .from('attendance')
                .select('*', { count: 'exact', head: true })
                .eq('mentor_id', m.id)
                .eq('month', currentMonth)
                .eq('year', currentYear)
                .eq('status', 'HADIR')

            if (countErr) console.error("Error counting attendance:", countErr)

            const realSessionCount = actualSessions || 0
            const targetSessions = 4 

            const salaryRecord = existingSalaries.find(s => s.mentor_id === m.id)

            if (salaryRecord) {
                const isPaid = salaryRecord.status === 'PAID'
                const finalSessions = isPaid ? salaryRecord.total_sessions : realSessionCount
                
                // Karena total_amount generated column, kita ambil langsung dari DB
                // Tapi untuk presisi tampilan frontend saat belum lunas, kita hitung ulang di JS
                const finalAmount = isPaid 
                    ? salaryRecord.total_amount 
                    : (finalSessions * m.salary_per_session) + (salaryRecord.bonus || 0) - (salaryRecord.deduction || 0)

                return { 
                    ...salaryRecord, 
                    mentor_name: m.name,
                    target_sessions: targetSessions,
                    total_sessions: finalSessions,
                    total_amount: finalAmount
                }
            } else {
                return {
                    id: null,
                    mentor_id: m.id,
                    mentor_name: m.name,
                    month: currentMonth,
                    year: currentYear,
                    target_sessions: targetSessions,
                    total_sessions: realSessionCount,
                    salary_per_session: m.salary_per_session,
                    bonus: 0,
                    deduction: 0,
                    total_amount: realSessionCount * m.salary_per_session,
                    status: 'UNPROCESSED'
                }
            }
        }))

        // Hitung Ringkasan
        const stats = {
            total_gaji: salaryList.reduce((sum, s) => sum + (s.total_amount || 0), 0),
            sudah_dibayar: salaryList.filter(s => s.status === 'PAID').reduce((sum, s) => sum + (s.total_amount || 0), 0),
            belum_dibayar: salaryList.filter(s => s.status !== 'PAID').reduce((sum, s) => sum + (s.total_amount || 0), 0),
            count_paid: salaryList.filter(s => s.status === 'PAID').length,
            count_pending: salaryList.filter(s => s.status !== 'PAID').length
        }

        return res.json({ salaries: salaryList, stats }) 

    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// 2. Simpan Draft (DIPERBAIKI)
async function saveSalaryDraft(req, res) {
    try {
        const { mentor_id, month, year, total_sessions, salary_per_session, bonus, deduction } = req.body

        console.log("Saving Draft Payload:", req.body);

        // Konversi ke Number
        const safeMonth = Number(month)
        const safeYear = Number(year)
        const safeSessions = Number(total_sessions) || 0
        const safeRate = Number(salary_per_session) || 0
        const safeBonus = Number(bonus) || 0
        const safeDeduction = Number(deduction) || 0

        // ❌ HAPUS hitungan total manual di sini, karena DB generated column
        // const calculatedTotal = ... 

        const { data, error } = await supabase
            .from('salaries')
            .upsert({
                mentor_id,
                month: safeMonth,
                year: safeYear,
                total_sessions: safeSessions,
                salary_per_session: safeRate,
                bonus: safeBonus,
                deduction: safeDeduction,
                // 🛑 HAPUS total_amount DI SINI. Biarkan DB menghitung sendiri.
                // total_amount: calculatedTotal, 
                status: 'PENDING'
            }, { 
                onConflict: 'mentor_id, month, year' 
            })
            .select()

        if (error) {
            console.error("Supabase Error:", error)
            throw new Error(error.message)
        }

        return res.json({ message: 'Draft gaji disimpan', data })

    } catch (err) {
        console.error("Backend Save Error:", err.message)
        return res.status(500).json({ error: err.message })
    }
}

// 3. Bayar Gaji
async function paySalary(req, res) {
    try {
        const { id } = req.params 
        const { proof_image } = req.body 

        // Ambil data gaji
        const { data: salaryData, error: errFetch } = await supabase
            .from('salaries')
            .select(`*, mentors(name)`)
            .eq('id', id)
            .single()
        
        if (errFetch || !salaryData) return res.status(404).json({ error: 'Data gaji tidak ditemukan.' })
        if (salaryData.status === 'PAID') return res.status(400).json({ error: 'Gaji ini sudah dibayar.' })

        // Kategori
        let categoryId = null;
        const { data: catData } = await supabase.from('categories').select('id').eq('name', 'Gaji Mentor').single()
        if (catData) { categoryId = catData.id } 
        else {
            const { data: newCat } = await supabase.from('categories').insert([{ name: 'Gaji Mentor', type: 'EXPENSE' }]).select('id').single()
            categoryId = newCat?.id
        }

        // Update Status
        const { error: errUpdate } = await supabase
            .from('salaries')
            .update({ 
                status: 'PAID', 
                payment_date: new Date(),
                proof_image: proof_image 
            })
            .eq('id', id)

        if (errUpdate) throw errUpdate

        // Transaksi
        const { error: errTrans } = await supabase
            .from('transactions')
            .insert([{
                date: new Date(),
                type: 'EXPENSE',
                amount: salaryData.total_amount, // DB pasti sudah punya nilai ini
                category_id: categoryId,
                description: `Gaji ${salaryData.mentors.name} (Bulan ${salaryData.month}/${salaryData.year})`,
                reference_id: id,
                proof_image: proof_image
            }])

        return res.json({ message: 'Pembayaran berhasil dikonfirmasi' })

    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

module.exports = { getSalaries, saveSalaryDraft, paySalary }