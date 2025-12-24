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

        const { data, error } = await query;

        if (error) throw error;
        res.status(200).json({ schedules: data });

    } catch (err) {
        console.error("[JadwalController] Error:", err.message);
        res.status(500).json({ message: "Gagal ambil jadwal", error: err.message });
    }
};

// --- B. POST (Create) ---
const createJadwal = async (req, res) => {
    const { student_id, mentor_id, date, start_time, end_time, subject } = req.body;

    // Validasi: 'date' wajib diisi
    if (!student_id || !mentor_id || !date || !start_time || !end_time) {
        return res.status(400).json({ message: "Data tidak lengkap (Murid, Mentor, Tanggal, Jam Wajib Diisi)." });
    }

    try {
        const { data, error } = await supabase
            .from('schedules')
            .insert([{
                student_id,
                mentor_id,
                date: date, // Simpan tanggal spesifik
                start_time,
                end_time,
                subject: subject || '-'
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