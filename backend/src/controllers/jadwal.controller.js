// src/controllers/jadwal.controller.js
const supabase = require('../config/supabase');

// --- A. GET (Read All with Filtering) ---
const getAllJadwal = async (req, res) => {
    const { date, mentor_id, student_id } = req.query;
    
    // 🛡️ Ambil info user dari middleware auth
    const userRole = req.user.role;
    const authUserId = req.user.id;

    try {
        let query = supabase
            .from('schedules')
            .select(`
                *,
                students ( id, name ),
                mentors ( id, name, phone_number, user_id ) 
            `)
            .order('date', { ascending: true })
            .order('start_time', { ascending: true });

        // ✅ LOGIKA KEAMANAN: Jika Mentor, paksa filter berdasarkan profilnya
        if (userRole === 'MENTOR') {
            // 1. Cari dulu ID Mentor di tabel 'mentors' yang punya user_id ini
            const { data: mentorData } = await supabase
                .from('mentors')
                .select('id')
                .eq('user_id', authUserId)
                .single();

            if (mentorData) {
                query = query.eq('mentor_id', mentorData.id);
            } else {
                // Jika data mentor tidak ditemukan di tabel public.mentors
                // Gunakan ID login sebagai fallback (jika UUID disamakan)
                query = query.eq('mentor_id', authUserId);
            }
        } else {
            // Jika Admin/Owner, biarkan filter mentor_id opsional (dari query string)
            if (mentor_id) query = query.eq('mentor_id', mentor_id);
        }

        // Filter Tambahan
        if (date) query = query.eq('date', date);
        if (student_id) query = query.eq('student_id', student_id);

        const { data: schedules, error } = await query;

        if (error) throw error;

        // --- Hitung total sesi yang sudah dilakukan dari tabel attendance ---
        const schedulesWithAttendance = await Promise.all(schedules.map(async (schedule) => {
            // Hitung jumlah attendance untuk schedule ini
            const { count: totalDone, error: countError } = await supabase
                .from('attendance')
                .select('*', { count: 'exact', head: true })
                .eq('schedule_id', schedule.id);

            if (countError) {
                console.error(`Error counting attendance for schedule ${schedule.id}:`, countError);
                return {
                    ...schedule,
                    total_sessions: schedule.planned_sessions || 0,
                    total_done: 0
                };
            }

            return {
                ...schedule,
                total_sessions: schedule.planned_sessions || 0,
                total_done: totalDone || 0
            };
        }));

        res.status(200).json({ schedules: schedulesWithAttendance });

    } catch (err) {
        console.error("[JadwalController] Error:", err.message);
        res.status(500).json({ message: "Gagal ambil jadwal", error: err.message });
    }
};

// --- B. POST (Create) ---
const createJadwal = async (req, res) => {
    const { student_id, mentor_id, date, start_time, end_time, subject, planned_sessions } = req.body;

    // Validasi: 'date' wajib diisi
    if (!student_id || !mentor_id || !date || !start_time || !end_time) {
        return res.status(400).json({ message: "Data tidak lengkap (Murid, Mentor, Tanggal, Jam Wajib Diisi)." });
    }

    try {
        // Validasi: Cek konflik jadwal untuk mentor di tanggal dan waktu yang sama
        const { data: existingSchedules, error: conflictError } = await supabase
            .from('schedules')
            .select('id, mentor_id, date, start_time, end_time')
            .eq('mentor_id', mentor_id)
            .eq('date', date)
            .or(`start_time.lte.${end_time},end_time.gte.${start_time}`)
            .limit(1);

        if (conflictError) throw conflictError;

        if (existingSchedules && existingSchedules.length > 0) {
            return res.status(409).json({ 
                message: "Mentor sudah memiliki jadwal di waktu yang sama pada tanggal tersebut." 
            });
        }

        // Validasi: Cek konflik jadwal untuk siswa di tanggal dan waktu yang sama
        const { data: studentSchedules, error: studentConflictError } = await supabase
            .from('schedules')
            .select('id, student_id, date, start_time, end_time')
            .eq('student_id', student_id)
            .eq('date', date)
            .or(`start_time.lte.${end_time},end_time.gte.${start_time}`)
            .limit(1);

        if (studentConflictError) throw studentConflictError;

        if (studentSchedules && studentSchedules.length > 0) {
            return res.status(409).json({ 
                message: "Siswa sudah memiliki jadwal di waktu yang sama pada tanggal tersebut." 
            });
        }

        const { data, error } = await supabase
            .from('schedules')
            .insert([{
                student_id,
                mentor_id,
                date: date, // Simpan tanggal spesifik
                start_time,
                end_time,
                subject: subject || '-',
                planned_sessions: planned_sessions || 4
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: "Jadwal berhasil dibuat.", schedule: data });
    } catch (err) {
        console.error("[JadwalController] Create Error:", err);
        res.status(500).json({ message: "Gagal membuat jadwal.", error: err.message });
    }
};

// --- C. PUT (Update) ---
const updateJadwal = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const { data, error } = await supabase
            .from('schedules')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.status(200).json({ message: "Jadwal berhasil diperbarui.", schedule: data });
    } catch (err) {
        res.status(500).json({ message: "Gagal update jadwal.", error: err.message });
    }
};

// --- D. DELETE ---
const deleteJadwal = async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase.from('schedules').delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: "Jadwal berhasil dihapus." });
    } catch (err) {
        res.status(500).json({ message: "Gagal hapus jadwal.", error: err.message });
    }
};

module.exports = { getAllJadwal, createJadwal, updateJadwal, deleteJadwal };
