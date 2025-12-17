// src/controllers/absensi.controller.js
const supabase = require('../config/supabase');

// --- A. GET (Lihat Riwayat Absensi) ---
const getAbsensi = async (req, res) => {
    const { date, mentor_id, student_id, month, year } = req.query;

    try {
        let query = supabase
            .from('attendance')
            .select(`
                *,
                schedules (
                    id, start_time, end_time, subject,
                    students ( id, name ),
                    mentors ( id, name )
                )
            `)
            .order('date', { ascending: false });

        // Filter berdasarkan tanggal spesifik
        if (date) query = query.eq('date', date);
        
        // Filter berdasarkan Bulan & Tahun (untuk Laporan/Gaji)
        if (month && year) {
            const startDate = `${year}-${month}-01`;
            const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Akhir bulan
            query = query.gte('date', startDate).lte('date', endDate);
        }

        // Filter Relasional (Mentor/Murid) - Perlu filter manual atau inner join logic
        // Supabase basic filtering pada join table agak tricky, kita filter di JS atau gunakan !inner jika perlu
        // Untuk simplifikasi, kita ambil semua lalu filter di backend jika filter mentor/student diminta
        
        const { data, error } = await query;

        if (error) throw error;

        // Filter lanjutan di level JS (jika parameter dikirim)
        let filteredData = data;
        if (mentor_id) {
            filteredData = filteredData.filter(item => item.schedules?.mentors?.id === mentor_id);
        }
        if (student_id) {
            filteredData = filteredData.filter(item => item.schedules?.students?.id === student_id);
        }

        res.status(200).json({ attendance: filteredData });

    } catch (err) {
        console.error("[AbsensiController] Fetch Error:", err);
        res.status(500).json({ message: "Gagal mengambil data absensi.", error: err.message });
    }
};

// --- B. POST (Input Absensi Baru) ---
const createAbsensi = async (req, res) => {
    const { schedule_id, date, status, notes } = req.body;

    if (!schedule_id || !date || !status) {
        return res.status(400).json({ message: "Data tidak lengkap (Jadwal, Tanggal, Status wajib)." });
    }

    try {
        const { data, error } = await supabase
            .from('attendance')
            .upsert([{ schedule_id, date, status, notes }], { onConflict: 'schedule_id, date' }) // Upsert: Update jika sudah ada
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: "Absensi berhasil disimpan.", data });
    } catch (err) {
        console.error("[AbsensiController] Insert Error:", err);
        res.status(500).json({ message: "Gagal menyimpan absensi.", error: err.message });
    }
};

module.exports = { getAbsensi, createAbsensi };