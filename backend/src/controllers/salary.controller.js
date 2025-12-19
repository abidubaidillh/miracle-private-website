// backend/src/controllers/salary.controller.js
const supabase = require('../config/supabase')

// =========================================================
// 1. GET SALARIES (ADMIN/OWNER/BENDAHARA)
// =========================================================
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

        // 2. Ambil Data Gaji Existing dari tabel salaries
        const { data: existingSalaries, error: errSal } = await supabase
            .from('salaries')
            .select('*')
            .eq('month', currentMonth)
            .eq('year', currentYear)

        if (errSal) throw errSal

        // --- MERGE DATA ---
        const salaryList = await Promise.all(mentors.map(async (m) => {
            
            // Hitung Sesi Real-time dari tabel Absensi
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
                
                // Total amount: prioritaskan data DB, jika null hitung manual
                const finalAmount = salaryRecord.total_amount 
                    || ((finalSessions * m.salary_per_session) + (salaryRecord.bonus || 0) - (salaryRecord.deduction || 0))

                return { 
                    ...salaryRecord, 
                    mentor_name: m.name,
                    target_sessions: targetSessions,
                    total_sessions: finalSessions,
                    total_amount: finalAmount
                }
            } else {
                // Return data virtual (belum ada di tabel salaries)
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

        // Hitung Ringkasan Statistik
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

// =========================================================
// 2. GET MY SALARIES (KHUSUS MENTOR LOGIN)
// =========================================================
async function getMySalaries(req, res) {
    try {
        const authUserId = req.user.id // UUID dari token JWT Supabase

        // 1. Cari ID Mentor di tabel 'mentors' yang kolom 'user_id'-nya cocok
        // Agar data tidak kosong jika ID Mentor berbeda dengan ID Auth
        const { data: mentor, error: mentorErr } = await supabase
            .from('mentors')
            .select('id, name')
            .eq('user_id', authUserId)
            .single()

        // Fallback: Jika kolom 'user_id' belum diisi, coba cari berdasarkan 'id' langsung
        let mentorId = mentor?.id
        let mentorName = mentor?.name

        if (!mentor) {
            const { data: fallbackMentor } = await supabase
                .from('mentors')
                .select('id, name')
                .eq('id', authUserId)
                .single()
            
            mentorId = fallbackMentor?.id
            mentorName = fallbackMentor?.name
        }

        if (!mentorId) {
            return res.status(404).json({ error: 'Profil mentor tidak ditemukan. Pastikan user login sudah terhubung ke data mentor.' })
        }

        // 2. Ambil data gaji dari tabel salaries
        const { data: salaries, error } = await supabase
            .from('salaries')
            .select('*')
            .eq('mentor_id', mentorId)
            .order('year', { ascending: false })
            .order('month', { ascending: false })

        if (error) throw error

        const totalPaid = (salaries || [])
            .filter(s => s.status === 'PAID')
            .reduce((sum, s) => sum + (s.total_amount || 0), 0)

        // Mapping format seragam untuk frontend
        const formattedSalaries = (salaries || []).map(s => ({
            ...s,
            mentor_name: mentorName,
            date: new Date(s.year, s.month - 1, 1).toISOString(),
            description: `Gaji Bulan ${s.month}/${s.year}`,
            amount: s.total_amount
        }))

        return res.json({
            salaries: formattedSalaries,
            stats: {
                total_paid: totalPaid,
                pending_count: formattedSalaries.filter(s => s.status !== 'PAID').length
            }
        })

    } catch (err) {
        console.error("Get My Salary Error:", err.message)
        return res.status(500).json({ error: err.message })
    }
}

// =========================================================
// 3. SAVE DRAFT (OWNER/BENDAHARA)
// =========================================================
async function saveSalaryDraft(req, res) {
    try {
        const { mentor_id, month, year, total_sessions, salary_per_session, bonus, deduction } = req.body

        const { data, error } = await supabase
            .from('salaries')
            .upsert({
                mentor_id,
                month: Number(month),
                year: Number(year),
                total_sessions: Number(total_sessions) || 0,
                salary_per_session: Number(salary_per_session) || 0,
                bonus: Number(bonus) || 0,
                deduction: Number(deduction) || 0,
                status: 'PENDING' // Setelah disimpan draft, status jadi PENDING (Siap bayar)
            }, { 
                onConflict: 'mentor_id, month, year' 
            })
            .select()

        if (error) throw error
        return res.json({ message: 'Draft gaji berhasil disimpan', data })

    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// =========================================================
// 4. PAY SALARY (OWNER/BENDAHARA)
// =========================================================
async function paySalary(req, res) {
    try {
        const { id } = req.params 
        const { proof_image } = req.body 

        // 1. Validasi
        const { data: salaryData, error: errFetch } = await supabase
            .from('salaries')
            .select(`*, mentors(name)`)
            .eq('id', id)
            .single()
        
        if (errFetch || !salaryData) return res.status(404).json({ error: 'Data tidak ditemukan.' })
        if (salaryData.status === 'PAID') return res.status(400).json({ error: 'Gaji sudah dibayar sebelumnya.' })

        // 2. Kategori "Gaji Mentor"
        let categoryId = null;
        const { data: catData } = await supabase.from('categories').select('id').eq('name', 'Gaji Mentor').single()
        
        if (catData) { 
            categoryId = catData.id 
        } else {
            const { data: newCat } = await supabase.from('categories').insert([{ name: 'Gaji Mentor', type: 'EXPENSE' }]).select('id').single()
            categoryId = newCat?.id
        }

        // 3. Update Status
        const { error: errUpdate } = await supabase
            .from('salaries')
            .update({ 
                status: 'PAID', 
                payment_date: new Date(),
                proof_image: proof_image 
            })
            .eq('id', id)

        if (errUpdate) throw errUpdate

        // 4. Catat ke Tabel Transaksi (Arus Kas Keluar)
        const { error: errTrans } = await supabase
            .from('transactions')
            .insert([{
                date: new Date(),
                type: 'EXPENSE',
                amount: salaryData.total_amount,
                category_id: categoryId,
                description: `Gaji: ${salaryData.mentors.name} (Bulan ${salaryData.month}/${salaryData.year})`,
                reference_id: id,
                proof_image: proof_image
            }])

        if (errTrans) console.error("Gagal catat transaksi otomatis:", errTrans)

        return res.json({ message: 'Pembayaran gaji berhasil dicatat!' })

    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

module.exports = { getSalaries, getMySalaries, saveSalaryDraft, paySalary }