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
            .select('schedule_id, session_number, status, date')
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
                    date_recorded: record ? record.date : null
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

// 2. Toggle Absensi
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
            // Simpan (Hadir)
            await supabase.from('attendance').insert([{
                schedule_id,
                mentor_id,
                session_number,
                month,
                year,
                status: status || 'HADIR',
                date: new Date()
            }])
            return res.json({ status: 'ADDED', message: 'Absensi tersimpan' })
        }

    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

module.exports = { getAttendanceDashboard, toggleAttendance }