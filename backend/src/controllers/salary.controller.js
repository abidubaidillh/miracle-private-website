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
            
            // Hitung target_sessions dari planned_sessions di tabel schedules untuk bulan dan tahun tersebut
            let targetSessions = 4 // default fallback
            try {
                // Ambil total planned_sessions dari jadwal untuk mentor ini pada bulan dan tahun tersebut
                const { data: schedules, error: schedErr } = await supabase
                    .from('schedules')
                    .select('planned_sessions')
                    .eq('mentor_id', m.id)
                    .eq('month', currentMonth)
                    .eq('year', currentYear)
                
                if (!schedErr && schedules && schedules.length > 0) {
                    // Sum semua planned_sessions (jika ada multiple jadwal dalam bulan yang sama)
                    targetSessions = schedules.reduce((sum, s) => sum + (s.planned_sessions || 0), 0)
                }
            } catch (e) {
                console.error("Error fetching planned sessions:", e)
                // tetap menggunakan default
            }

            const salaryRecord = existingSalaries.find(s => s.mentor_id === m.id)

            if (salaryRecord) {
                const isPaid = salaryRecord.status === 'PAID'
                const finalSessions = isPaid ? salaryRecord.total_sessions : realSessionCount
                
                // Total amount: prioritaskan data DB, jika null hitung manual
                const finalAmount = salaryRecord.total_amount 
                    || ((finalSessions * m.salary_per_session) + (salaryRecord.bonus || 0) - (salaryRecord.deduction || 0))

                // ✅ AUDIT FIX: Selalu sertakan data real-time untuk perbandingan
                const isOutOfSync = isPaid && (realSessionCount !== salaryRecord.total_sessions)

                return { 
                    ...salaryRecord, 
                    mentor_name: m.name,
                    target_sessions: targetSessions,
                    total_sessions: finalSessions,
                    total_amount: finalAmount,
                    // ✅ TAMBAHAN: Data audit untuk sinkronisasi
                    realtime_sessions: realSessionCount,
                    recorded_sessions: salaryRecord.total_sessions,
                    is_out_of_sync: isOutOfSync,
                    sync_difference: realSessionCount - salaryRecord.total_sessions
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

        // ✅ SECURITY FIX: Proper mentor ID verification
        const { data: mentor, error: mentorErr } = await supabase
            .from('mentors')
            .select('id, name')
            .eq('user_id', authUserId) // ✅ PERBAIKAN: Gunakan user_id, bukan id
            .single()

        // ✅ SECURITY: Jika mentor tidak ditemukan, REJECT request
        if (!mentor || !mentor.id) {
            return res.status(403).json({ 
                error: 'Anda tidak memiliki akses ke data gaji. Hubungi administrator untuk setup profil mentor Anda dengan benar.' 
            })
        }

        const mentorId = mentor.id
        const mentorName = mentor.name

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

        // ✅ SECURITY FIX: Input validation
        if (!mentor_id || !month || !year) {
            return res.status(400).json({ error: 'Data wajib tidak lengkap: mentor_id, month, year' })
        }

        // ✅ SECURITY FIX: Type and range validation
        const monthNum = parseInt(month)
        const yearNum = parseInt(year)
        const sessionsNum = parseInt(total_sessions) || 0
        const salaryNum = parseFloat(salary_per_session) || 0
        const bonusNum = parseFloat(bonus) || 0
        const deductionNum = parseFloat(deduction) || 0

        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ error: 'Month harus antara 1-12' })
        }

        if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
            return res.status(400).json({ error: 'Year harus antara 2020-2030' })
        }

        if (sessionsNum < 0 || sessionsNum > 50) {
            return res.status(400).json({ error: 'Total sessions harus antara 0-50' })
        }

        if (salaryNum < 0 || salaryNum > 10000000) {
            return res.status(400).json({ error: 'Salary per session tidak valid' })
        }

        const { data, error } = await supabase
            .from('salaries')
            .upsert({
                mentor_id,
                month: monthNum,
                year: yearNum,
                total_sessions: sessionsNum,
                salary_per_session: salaryNum,
                bonus: bonusNum,
                deduction: deductionNum,
                status: 'PENDING' // Setelah disimpan draft, status jadi PENDING (Siap bayar)
            }, { 
                onConflict: 'mentor_id, month, year' 
            })
            .select()

        if (error) throw error
        return res.json({ message: 'Draft gaji berhasil disimpan', data })

    } catch (err) {
        console.error('Save salary draft error:', err)
        return res.status(500).json({ error: 'Gagal menyimpan draft gaji' })
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

// =========================================================
// 5. RECALCULATE SALARY (OWNER/BENDAHARA) - AUDIT FIX
// =========================================================
async function recalculateSalary(req, res) {
    try {
        const { id } = req.params // ID dari tabel salaries
        
        // 1. Ambil data salary yang akan direcalculate
        const { data: salaryData, error: errFetch } = await supabase
            .from('salaries')
            .select(`*, mentors(salary_per_session)`)
            .eq('id', id)
            .single()
        
        if (errFetch || !salaryData) {
            return res.status(404).json({ error: 'Data gaji tidak ditemukan.' })
        }

        // 2. Hitung ulang sesi real-time dari attendance
        const { count: actualSessions, error: countErr } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('mentor_id', salaryData.mentor_id)
            .eq('month', salaryData.month)
            .eq('year', salaryData.year)
            .eq('status', 'HADIR')

        if (countErr) throw countErr

        const realSessionCount = actualSessions || 0
        const salaryPerSession = salaryData.mentors?.salary_per_session || 0
        
        // 3. Hitung ulang total amount
        const newTotalAmount = (realSessionCount * salaryPerSession) + 
                              (salaryData.bonus || 0) - 
                              (salaryData.deduction || 0)

        // 4. Update data di tabel salaries
        // Hanya update total_sessions karena total_amount adalah generated column
        const { error: errUpdate } = await supabase
            .from('salaries')
            .update({ 
                total_sessions: realSessionCount
                // total_amount tidak diupdate karena kolom generated/dengan constraint DEFAULT
            })
            .eq('id', id)

        if (errUpdate) throw errUpdate

        return res.json({ 
            message: 'Data gaji berhasil direcalculate',
            old_sessions: salaryData.total_sessions,
            new_sessions: realSessionCount,
            old_amount: salaryData.total_amount,
            new_amount: newTotalAmount // Nilai yang dihitung ulang untuk response
        })

    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

module.exports = { getSalaries, getMySalaries, saveSalaryDraft, paySalary, recalculateSalary }
