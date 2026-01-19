const supabase = require('../config/supabase')

/**
 * 1. Ambil Data Jadwal + Status Absensi PER BULAN
 * Target: Frontend AttendanceTable
 */
async function getAttendanceDashboard(req, res) {
    console.log(`[DEBUG] ===== ATTENDANCE DASHBOARD REQUEST =====`);
    console.log(`[DEBUG] Request query:`, req.query);
    console.log(`[DEBUG] Request user:`, req.user);
    
    try {
        const { month, year, mentor_id } = req.query 
        
        const curMonth = parseInt(month) || (new Date().getMonth() + 1)
        const curYear = parseInt(year) || new Date().getFullYear()

        console.log(`[Attendance] Fetching: Month ${curMonth}, Year ${curYear}, AuthUID ${mentor_id}`);

        // --- STEP 1: Resolusi ID Mentor (Jembatan Auth ke Profil) ---
        // Karena mentor_id yang dikirim frontend seringkali adalah user_id (auth), 
        // kita cari id asli di tabel mentors untuk query relasi yang akurat.
        let mentorProfileId = null;
        if (mentor_id) {
            // TEMPORARY DEBUG: Test dengan profile ID yang sudah kita ketahui
            if (mentor_id === '7073f2f1-6f91-4d4b-b200-a713dfdfb054') {
                console.log(`[DEBUG] This is mentor B - using known profile ID`);
                mentorProfileId = '46038ba4-a294-45b0-b046-7a81c1fcd657';
            } else {
                const { data: profile } = await supabase
                    .from('mentors')
                    .select('id')
                    .eq('user_id', mentor_id)
                    .maybeSingle();

                if (profile) mentorProfileId = profile.id;
            }
            
            // DEBUG LOGGING
            console.log(`[DEBUG] mentor_id from frontend: ${mentor_id}`);
            console.log(`[DEBUG] mentorProfileId found: ${mentorProfileId}`);
            console.log(`[DEBUG] Final filterId will be: ${mentorProfileId || mentor_id}`);
        }

        // --- STEP 2: Query Master Jadwal ---
        // Simplified query without relations to avoid potential join issues
        let query = supabase
            .from('schedules')
            .select('*')
            .eq('status', 'AKTIF');
        
        if (mentor_id) {
            // Kita dukung filter menggunakan Profil UUID maupun Auth User ID
            const filterId = mentorProfileId || mentor_id;
            
            // DEBUG LOGGING
            console.log(`[DEBUG] Query filter applied: mentor_id = ${filterId}`);
            
            // Gunakan filter sederhana, prioritaskan mentorProfileId jika ada
            query = query.eq('mentor_id', filterId);
        }

        const { data: schedules, error: errSch } = await query
        
        // DEBUG LOGGING
        console.log(`[DEBUG] Schedules found: ${schedules ? schedules.length : 0}`);
        if (schedules && schedules.length > 0) {
            console.log(`[DEBUG] First schedule:`, schedules[0]);
        }
        if (errSch) {
            console.log(`[DEBUG] Schedule query error:`, errSch);
        }
        
        if (errSch) throw errSch

        if (!schedules || schedules.length === 0) {
            return res.json([]); // Kembalikan array kosong jika tidak ada jadwal
        }

        // --- STEP 3: Ambil Data Absensi Tercatat ---
        const scheduleIds = schedules.map(s => s.id)
        const { data: attendanceData, error: errAtt } = await supabase
            .from('attendance')
            .select('*')
            .in('schedule_id', scheduleIds)
            .eq('month', curMonth)
            .eq('year', curYear)

        if (errAtt) throw errAtt

        // --- STEP 4: Mapping Result (Penggabungan Jadwal + Absensi) ---
        // Get mentor and student data separately since we removed relations
        const mentorIds = [...new Set(schedules.map(s => s.mentor_id))];
        const studentIds = [...new Set(schedules.map(s => s.student_id))];
        
        const { data: mentorsData } = await supabase
            .from('mentors')
            .select('id, name')
            .in('id', mentorIds);
            
        const { data: studentsData } = await supabase
            .from('students')
            .select('id, name')
            .in('id', studentIds);
        
        const finalResult = schedules.map(sch => {
            const myAttendance = attendanceData 
                ? attendanceData.filter(a => a.schedule_id === sch.id) 
                : [];
            
            // Find mentor and student names
            const mentor = mentorsData?.find(m => m.id === sch.mentor_id);
            const student = studentsData?.find(s => s.id === sch.student_id);
            
            // Dinamis: Mentor A bisa 14 sesi, Mentor B bisa 8 sesi sesuai kolom di DB
            const targetSessions = sch.planned_sessions || 8; 
            const sessions = [];

            // Loop berdasarkan jumlah sesi yang direncanakan
            for (let i = 1; i <= targetSessions; i++) {
                const record = myAttendance.find(a => parseInt(a.session_number) === i);
                sessions.push({
                    number: i,
                    is_done: !!record,
                    status: record ? record.status : null,
                    date_recorded: record ? record.date : null,
                    bukti_foto: record ? record.bukti_foto : null
                });
            }

            // Kembalikan objek "Flattened" yang siap dikonsumsi Frontend
            return {
                ...sch,
                student_name: student?.name || 'Siswa Tidak Teridentifikasi',
                mentor_name: mentor?.name || 'Mentor Tidak Teridentifikasi',
                sessions_status: sessions,
                total_done: myAttendance.length,
                planned_sessions: targetSessions
            }
        });

        // Response dalam bentuk Array murni sesuai kebutuhan useAttendance hook
        return res.json(finalResult);

    } catch (err) {
        console.error('Dashboard Error:', err.message);
        return res.status(500).json({ error: 'Gagal mengambil data absensi' });
    }
}

/**
 * 2. Submit Absensi (Biasanya digunakan Mentor dengan upload foto)
 */
async function submitAttendance(req, res) {
    try {
        const { schedule_id, mentor_id, session_number, month, year, status, bukti_foto } = req.body

        // Validasi Input
        if (!schedule_id || !mentor_id || !session_number || !month || !year || !status) {
            return res.status(400).json({ error: 'Data input tidak lengkap' })
        }

        // Cek Duplikasi: Mencegah double submit untuk sesi yang sama
        const { data: duplicate } = await supabase
            .from('attendance')
            .select('id')
            .match({ schedule_id, session_number, month, year })
            .maybeSingle();

        if (duplicate) {
            return res.status(400).json({ error: 'Absensi untuk sesi ini sudah tercatat' });
        }

        // Insert data ke database
        const { data, error } = await supabase
            .from('attendance')
            .insert([{
                schedule_id,
                mentor_id, 
                session_number: parseInt(session_number),
                month: parseInt(month),
                year: parseInt(year),
                status,
                bukti_foto: bukti_foto || null,
                date: new Date().toISOString().split('T')[0] // Format YYYY-MM-DD
            }])
            .select()

        if (error) throw error
        return res.json({ status: 'SUCCESS', data: data[0] })
    } catch (err) {
        console.error('Submit Error:', err.message);
        return res.status(500).json({ error: err.message })
    }
}

/**
 * 3. Toggle Absensi (Support Quick Check/Uncheck oleh Admin)
 */
async function toggleAttendance(req, res) {
    try {
        const { schedule_id, mentor_id, session_number, month, year } = req.body
        
        // Cari apakah absensi sudah ada
        const { data: existing } = await supabase
            .from('attendance')
            .select('id')
            .match({ schedule_id, session_number: parseInt(session_number), month: parseInt(month), year: parseInt(year) })
            .maybeSingle()

        if (existing) {
            // Jika ada, maka hapus (Uncheck)
            const { error: delError } = await supabase
                .from('attendance')
                .delete()
                .eq('id', existing.id)
            
            if (delError) throw delError
            return res.json({ status: 'REMOVED' })
        } else {
            // Jika tidak ada, maka tambah (Check)
            const { error: insError } = await supabase
                .from('attendance')
                .insert([{
                    schedule_id, 
                    mentor_id, 
                    session_number: parseInt(session_number), 
                    month: parseInt(month), 
                    year: parseInt(year),
                    status: 'HADIR',
                    date: new Date().toISOString().split('T')[0]
                }])
            
            if (insError) throw insError
            return res.json({ status: 'ADDED' })
        }
    } catch (err) {
        console.error('Toggle Error:', err.message);
        return res.status(500).json({ error: err.message })
    }
}

module.exports = { 
    getAttendanceDashboard, 
    toggleAttendance, 
    submitAttendance
}