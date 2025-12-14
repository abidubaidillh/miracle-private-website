// src/controllers/murid.controller.js

const supabase = require('../config/supabase'); 

// --- A. GET (READ ALL & Search) ---
const getAllMurid = async (req, res) => {
    // Variabel query dibiarkan agar tidak terjadi crash jika ada parameter
    const { status, search } = req.query; 

    try {
        // 1. QUERY UTAMA: Mengaktifkan kembali sorting dan count
        let query = supabase.from('students').select('*').order('name', { ascending: true }); 

        // 2. LOGIKA FILTERING DAN SEARCHING
        
        // Filter Status
        if (status && (status === 'AKTIF' || status === 'NON-AKTIF')) {
            query = query.eq('status', status);
        }
        
        // Filter Pencarian (Nama, No HP, Alamat, DAN NAMA ORANG TUA)
        if (search) {
            // Update: Menambahkan parent_name ke dalam pencarian
            query = query.or(`name.ilike.%${search}%,phone_number.ilike.%${search}%,address.ilike.%${search}%,parent_name.ilike.%${search}%`);
        }

        const { data: students, error } = await query;

        if (error) {
            console.error("[MuridController: getAllMurid] DATABASE ERROR (Filtered Query):", error);
            return res.status(500).json({ 
                message: "Gagal mengambil data murid. Kesalahan Query/Koneksi.", 
                error: error.message 
            });
        }

        // 3. LOGIKA PENGHITUNGAN STATISTIK
        const { count: totalActive } = await supabase.from('students').select('id', { count: 'exact', head: true }).eq('status', 'AKTIF');
        const { count: totalInactive } = await supabase.from('students').select('id', { count: 'exact', head: true }).eq('status', 'NON-AKTIF');

        
        // 4. RESPONSE
        res.status(200).json({ 
            students, 
            stats: { 
                active: totalActive || 0, 
                inactive: totalInactive || 0 
            } 
        });
        
    } catch (err) {
        console.error("[MuridController: getAllMurid] Unhandled Server Error:", err);
        res.status(500).json({ message: "Terjadi kesalahan server yang tidak terduga.", error: err.message });
    }
};


// --- B. POST (CREATE) ---
const createMurid = async (req, res) => {
    // 1. Ambil semua field yang dibutuhkan (TERMASUK DATA ORANG TUA)
    const { 
        name, 
        age, 
        phone_number, 
        address, 
        status, 
        package_id,
        parent_name,  // <--- TAMBAHAN
        parent_phone  // <--- TAMBAHAN
    } = req.body; 
    
    // ==========================================================
    // 🚨 DEBUGGING: LOG BODY REQUEST
    // ==========================================================
    console.log('[MuridController: createMurid] Request Body Received:', req.body);
    // ==========================================================

    // Validasi Wajib Isi (Update: Menambahkan parent_name & parent_phone sebagai wajib isi jika diinginkan)
    // Jika data ortu opsional, hapus parent_name/phone dari validasi di bawah ini.
    if (!name || !phone_number || !address || age === undefined || age === null || !parent_name || !parent_phone) {
        console.error("[MuridController: createMurid] Validation Failed: Missing required fields.");
        return res.status(400).json({ message: "Nama, Usia, No HP, Alamat, Nama Ortu, dan HP Ortu wajib diisi." });
    }
    
    // Validasi Usia
    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge <= 0) {
        return res.status(400).json({ message: "Usia harus berupa angka positif yang valid." });
    }

    // Validasi Status dan Normalisasi
    const studentStatus = status ? (status).toUpperCase() : 'AKTIF';
    const validStatuses = ['AKTIF', 'NON-AKTIF'];
    
    if (!validStatuses.includes(studentStatus)) {
        return res.status(400).json({ message: "Status tidak valid. Gunakan 'AKTIF' atau 'NON-AKTIF'." });
    }
    
    // Objek Data yang akan di-Insert (UPDATE FIELD DATABASE)
    const insertData = { 
        name, 
        age: parsedAge, 
        phone_number, 
        address, 
        status: studentStatus,
        parent_name,  // <--- MASUKKAN KE DB
        parent_phone  // <--- MASUKKAN KE DB
    };

    // Tambahkan package_id jika ada
    if (package_id !== undefined) {
          insertData.package_id = package_id;
    }

    try {
        const { data, error } = await supabase
            .from('students') 
            .insert([insertData])
            .select()
            .single(); 

        if (error) {
            console.error("[MuridController: createMurid] SUPABASE INSERT ERROR:", error);
            return res.status(500).json({ 
                message: "Gagal menyimpan data ke database.", 
                error: error.message 
            });
        }
        
        // Pengecekan Kegagalan Silent
        if (!data) {
            console.error("[MuridController: createMurid] WARNING: Insert failed silently.");
            return res.status(500).json({ 
               message: "Gagal menambahkan murid. Kegagalan database tidak terduga.", 
               error: "Silent Database Failure" 
            });
        }

        res.status(201).json({ message: "Data murid berhasil ditambahkan.", student: data });
    } catch (err) {
        console.error("[MuridController: createMurid] SERVER CRASHED:", err);
        res.status(500).json({ message: "Terjadi kesalahan server yang tidak terduga.", error: err.message });
    }
};

// --- C. PUT (UPDATE) ---
const updateMurid = async (req, res) => {
    const { id } = req.params;
    
    // req.body akan otomatis berisi parent_name & parent_phone jika dikirim dari frontend
    // karena kita mengambil seluruh objek body.
    const updateData = req.body; 

    try {
        // Normalisasi dan Validasi Status
        if (updateData.status) {
             const normalizedStatus = updateData.status.toUpperCase();
             const validStatuses = ['AKTIF', 'NON-AKTIF'];

             if (!validStatuses.includes(normalizedStatus)) {
                 return res.status(400).json({ message: "Status yang diperbarui tidak valid." });
             }
             updateData.status = normalizedStatus;
        }
        
        // Validasi Usia
        if (updateData.age !== undefined && updateData.age !== null) {
             const parsedAge = parseInt(updateData.age);
             if (isNaN(parsedAge) || parsedAge <= 0) {
                 return res.status(400).json({ message: "Usia harus berupa angka positif yang valid." });
             }
             updateData.age = parsedAge;
        }

        const { data, error } = await supabase
            .from('students') 
            .update(updateData) // Update dinamis (field baru otomatis ter-update)
            .eq('id', id)
            .select()
            .single(); 

        if (error) {
            console.error("[MuridController: updateMurid] Database Error updating student:", error);
            return res.status(500).json({ message: "Gagal memperbarui data murid (Database Error).", error: error.message });
        }
        if (!data) {
            return res.status(404).json({ message: "Murid tidak ditemukan." });
        }

        res.status(200).json({ message: "Data murid berhasil diperbarui.", student: data });
    } catch (err) {
        console.error("[MuridController: updateMurid] Unhandled Error:", err);
        res.status(500).json({ message: "Terjadi kesalahan server yang tidak terduga." });
    }
};

// --- D. DELETE ---
const deleteMurid = async (req, res) => {
    const { id } = req.params;

    try {
        // Lakukan DELETE
        const { error: deleteError, count } = await supabase
            .from('students') 
            .delete()
            .eq('id', id)
            .select('*', { count: 'exact' });

        if (deleteError) {
            console.error("[MuridController: deleteMurid] Error executing delete:", deleteError);
            return res.status(500).json({ message: "Gagal menghapus data murid (Database Error).", error: deleteError.message });
        }
        
        res.status(200).json({ message: "Data murid berhasil dihapus." });
    } catch (err) {
        console.error("[MuridController: deleteMurid] Unhandled Error:", err);
        res.status(500).json({ message: "Terjadi kesalahan server yang tidak terduga." });
    }
};

module.exports = {
    getAllMurid,
    createMurid,
    updateMurid,
    deleteMurid
};