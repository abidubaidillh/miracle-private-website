// backend/src/controllers/attendance.controller.js
const supabase = require('../config/supabase')

// 1. Ambil Data Jadwal + Status Absensi PER BULAN
async function getAttendanceDashboard(req, res) {
    try {
        const { month, year, mentor_id } = req.query
        
        const curMonth = parseInt(month || new Date().getMonth() + 1)
        const curYear = parseInt(year || new Date().getFullYear())

        // --- 1. Query Jadwal (Master Data) ---
        let query = supabase
            .from('schedules')
            .select(`
                id, 
                day_of_week, 
                start_time, 
                subject, 
                planned_sessions,
                mentors!inner(id, name),
                students(name)
            `)
        
        // Filter Mentor jika ada parameter mentor_id
        if (mentor_id) {
            query = query.eq('mentors.id', mentor_id)
        }

        const { data: schedules, error: errSch } = await query
        if (errSch) throw errSch

        // --- 2. Ambil data absensi ---
        const { data: attendanceData, error: errAtt } = await supabase
            .from('attendance')
            .select('schedule_id, session_number, status, date, bukti_foto')
            .eq('month', curMonth)
            .eq('year', curYear)

        if (errAtt) throw errAtt

        // --- 3. Gabungkan Data ---
        const result = schedules.map(sch => {
            const myAttendance = attendanceData.filter(a => a.schedule_id === sch.id)
            const sessions = []
            const target = sch.planned_sessions || 4 

            for (let i = 1; i <= target; i++) {
                const record = myAttendance.find(a => a.session_number === i)
                sessions.push({
                    number: i,
                    is_done: !!record,
                    status: record ? record.status : null,
                    date_recorded: record ? record.date : null,
                    bukti_foto: record ? record.bukti_foto : null
                })
            }

            return {
                ...sch,
                sessions_status: sessions,
                total_done: myAttendance.length
            }
        })

        return res.json(result) // ✅ Return Array

    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

// 2. Submit Absensi dengan Foto Bukti (URL dari frontend)
async function submitAttendance(req, res) {
    try {
        const { schedule_id, mentor_id, session_number, month, year, status, bukti_foto } = req.body

        // ✅ SECURITY FIX: Input validation
        if (!schedule_id || !mentor_id || !session_number || !month || !year || !status) {
            return res.status(400).json({ 
                error: 'Data wajib tidak lengkap: schedule_id, mentor_id, session_number, month, year, status' 
            })
        }

        // ✅ SECURITY FIX: Type validation
        const sessionNum = parseInt(session_number)
        const monthNum = parseInt(month)
        const yearNum = parseInt(year)

        if (isNaN(sessionNum) || sessionNum < 1 || sessionNum > 20) {
            return res.status(400).json({ error: 'Session number harus antara 1-20' })
        }

        if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ error: 'Month harus antara 1-12' })
        }

        if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2030) {
            return res.status(400).json({ error: 'Year harus antara 2020-2030' })
        }

        // ✅ SECURITY FIX: Status validation
        const validStatuses = ['HADIR', 'IZIN', 'ALPA']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Status harus HADIR, IZIN, atau ALPA' })
        }

        // Validasi: Jika status HADIR dan role MENTOR, bukti_foto wajib
        if (status === 'HADIR' && req.user?.role === 'MENTOR' && !bukti_foto) {
            return res.status(400).json({ 
                error: 'Bukti foto wajib diupload untuk status HADIR' 
            })
        }

        // Cek duplicate - gunakan maybeSingle untuk menghindari error jika tidak ada data
        const { data: existing, error: existingError } = await supabase
            .from('attendance')
            .select('id')
            .eq('schedule_id', schedule_id)
            .eq('session_number', sessionNum)
            .eq('month', monthNum)
            .eq('year', yearNum)
            .maybeSingle()

        if (existingError) {
            console.error('Error checking duplicate attendance:', existingError)
            return res.status(500).json({ error: 'Gagal memeriksa data absensi' })
        }

        if (existing) {
            return res.status(400).json({ 
                error: 'Absensi untuk sesi ini sudah tercatat' 
            })
        }

        // Simpan absensi dengan bukti_foto URL
        // Dapatkan tanggal jadwal dari schedule untuk sinkronisasi
        const { data: scheduleData, error: scheduleError } = await supabase
            .from('schedules')
            .select('date')
            .eq('id', schedule_id)
            .maybeSingle()
        
        if (scheduleError) {
            console.error('Error fetching schedule date:', scheduleError)
            return res.status(500).json({ error: 'Gagal mengambil data jadwal' })
        }

        if (!scheduleData) {
            return res.status(400).json({ error: 'Jadwal tidak ditemukan' })
        }

        const scheduleDate = scheduleData.date
        const attendanceDate = new Date()
        
        // Validasi: apakah tanggal absensi sesuai dengan tanggal jadwal?
        // Konversi ke tanggal saja (tanpa waktu) untuk perbandingan
        const scheduleDateOnly = new Date(scheduleDate).toISOString().split('T')[0]
        const attendanceDateOnly = attendanceDate.toISOString().split('T')[0]
        
        if (scheduleDateOnly !== attendanceDateOnly) {
            console.warn(`⚠️ Absensi tanggal ${attendanceDateOnly} untuk jadwal tanggal ${scheduleDateOnly}`)
            // Tidak menghentikan proses, hanya warning log
        }

        const { data, error } = await supabase
            .from('attendance')
            .insert([{
                schedule_id,
                mentor_id,
                session_number: sessionNum,
                month: monthNum,
                year: yearNum,
                status,
                bukti_foto, // URL dari Supabase Storage
                date: scheduleDate // Gunakan tanggal jadwal, bukan tanggal absensi
                // recorded_at dihapus karena kolom tidak ada di database
            }])
            .select()

        if (error) throw error

        return res.json({ 
            status: 'SUCCESS', 
            message: 'Absensi berhasil disimpan',
            data: data[0]
        })

    } catch (err) {
        console.error('Submit attendance error:', err)
        return res.status(500).json({ error: 'Gagal menyimpan absensi' })
    }
}

// 3. Toggle Absensi (Legacy - untuk backward compatibility)
async function toggleAttendance(req, res) {
    try {
        const { schedule_id, mentor_id, session_number, month, year, status } = req.body

        // Cek duplicate
        const { data: existing } = await supabase
            .from('attendance')
            .select('id')
            .eq('schedule_id', schedule_id)
            .eq('session_number', session_number)
            .eq('month', month)
            .eq('year', year)
            .single()

        if (existing) {
            // Hapus (Batal Hadir)
            await supabase.from('attendance').delete().eq('id', existing.id)
            return res.json({ status: 'REMOVED', message: 'Absensi dibatalkan' })
        } else {
            // Simpan (Hadir) - tanpa bukti foto untuk backward compatibility
            // Dapatkan tanggal jadwal untuk sinkronisasi
            const { data: scheduleData, error: scheduleError } = await supabase
                .from('schedules')
                .select('date')
                .eq('id', schedule_id)
                .single()
            
            let scheduleDate = new Date()
            if (!scheduleError && scheduleData) {
                scheduleDate = scheduleData.date
            }

            await supabase.from('attendance').insert([{
                schedule_id,
                mentor_id,
                session_number,
                month,
                year,
                status: status || 'HADIR',
                date: scheduleDate // Gunakan tanggal jadwal
                // recorded_at dihapus karena kolom tidak ada di database
            }])
            return res.json({ status: 'ADDED', message: 'Absensi tersimpan' })
        }

    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

module.exports = { 
    getAttendanceDashboard, 
    toggleAttendance, 
    submitAttendance
}
