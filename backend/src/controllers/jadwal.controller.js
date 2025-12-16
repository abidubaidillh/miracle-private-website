// src/controllers/jadwal.controller.js
const supabase = require('../config/supabase');

// --- A. GET (Read All with Filtering) ---
const getAllJadwal = async (req, res) => {
    const { day, mentor_id, student_id } = req.query;

    try {
        // ✅ PERBAIKAN: Join ke tabel 'mentors' (bukan users)
        let query = supabase
            .from('schedules')
            .select(`
                *,
                students ( id, name ),
                mentors ( id, name, phone_number ) 
            `)
            .order('day_of_week', { ascending: true })
            .order('start_time', { ascending: true });

        if (day) query = query.eq('day_of_week', day.toUpperCase());
        if (mentor_id) query = query.eq('mentor_id', mentor_id);
        if (student_id) query = query.eq('student_id', student_id);

        const { data, error } = await query;

        if (error) {
            console.error("[JadwalController] Error Fetch:", error);
            return res.status(500).json({ message: "Gagal mengambil data jadwal.", error: error.message });
        }

        res.status(200).json({ schedules: data });

    } catch (err) {
        console.error("[JadwalController] Server Error Fetch:", err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// --- B. POST (Create) ---
const createJadwal = async (req, res) => {
    const { student_id, mentor_id, day_of_week, start_time, end_time, subject } = req.body;

    console.log("[JadwalController] Menerima Data:", req.body);

    if (!student_id || !mentor_id || !day_of_week || !start_time || !end_time) {
        return res.status(400).json({ message: "Data tidak lengkap (Murid, Mentor, Hari, Jam Wajib Diisi)." });
    }

    try {
        const { data, error } = await supabase
            .from('schedules')
            .insert([{
                student_id,
                mentor_id,
                day_of_week: day_of_week.toUpperCase(),
                start_time,
                end_time,
                subject: subject || '-'
            }])
            .select()
            .single();

        if (error) {
            console.error("[JadwalController] Database Insert Error:", error);
            throw error;
        }

        res.status(201).json({ message: "Jadwal berhasil dibuat.", schedule: data });
    } catch (err) {
        console.error("[JadwalController] Crash:", err);
        
        // Deteksi error spesifik foreign key
        let message = "Gagal membuat jadwal.";
        if (err.code === '23503') {
            message = "Data Mentor atau Murid tidak valid (ID tidak ditemukan di database). Pastikan data belum dihapus.";
        } else {
            message += " " + (err.message || JSON.stringify(err));
        }

        res.status(500).json({ message, error: err });
    }
};

// --- C. PUT (Update) ---
const updateJadwal = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        if (updateData.day_of_week) updateData.day_of_week = updateData.day_of_week.toUpperCase();

        const { data, error } = await supabase
            .from('schedules')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ message: "Jadwal berhasil diperbarui.", schedule: data });
    } catch (err) {
        console.error("[JadwalController] Update Error:", err);
        res.status(500).json({ message: "Gagal update jadwal: " + err.message, error: err.message });
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
        console.error("[JadwalController] Delete Error:", err);
        res.status(500).json({ message: "Gagal hapus jadwal: " + err.message, error: err.message });
    }
};

module.exports = { getAllJadwal, createJadwal, updateJadwal, deleteJadwal };