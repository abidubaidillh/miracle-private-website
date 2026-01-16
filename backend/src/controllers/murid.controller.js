// backend/src/controllers/murid.controller.js

const supabase = require('../config/supabase'); 

// --- A. GET (READ ALL & Search) ---
const getAllMurid = async (req, res) => {
    const { status, search } = req.query; 

    try {
        // 1. QUERY UTAMA: Mengaktifkan sorting berdasarkan nama
        let query = supabase.from('students').select('*').order('name', { ascending: true }); 

        // 2. LOGIKA FILTERING DAN SEARCHING
        
        // Filter Status
        if (status && (status === 'AKTIF' || status === 'NON-AKTIF')) {
            query = query.eq('status', status);
        }
        
        // Filter Pencarian
        if (search) {
            query = query.or(`name.ilike.%${search}%,school_origin.ilike.%${search}%,address.ilike.%${search}%,parent_name.ilike.%${search}%`);
        }

        const { data: students, error } = await query;

        if (error) {
            console.error("[MuridController: getAllMurid] DATABASE ERROR:", error);
            return res.status(500).json({ 
                message: "Gagal mengambil data murid.", 
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
        res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message });
    }
};


// --- B. POST (CREATE) ---
const createMurid = async (req, res) => {
    // 1. Ambil field dari body (Update: Menggunakan school_origin)
    const { 
        name, 
        age, 
        school_origin, 
        address, 
        status, 
        package_id,
        parent_name,
        parent_phone
    } = req.body; 

    // Validasi Wajib Isi
    if (!name || !school_origin || !address || age === undefined || age === null || !parent_name || !parent_phone) {
        return res.status(400).json({ message: "Nama, Usia, Asal Sekolah, Alamat, Nama Ortu, dan HP Ortu wajib diisi." });
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
        return res.status(400).json({ message: "Status tidak valid." });
    }
    
    // Objek Data untuk Insert
    const insertData = { 
        name, 
        age: parsedAge, 
        school_origin, 
        address, 
        status: studentStatus,
        parent_name,
        parent_phone
    };

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
            console.error("[MuridController: createMurid] SUPABASE ERROR:", error);
            return res.status(500).json({ message: "Gagal menyimpan ke database.", error: error.message });
        }

        res.status(201).json({ message: "Data murid berhasil ditambahkan.", student: data });
    } catch (err) {
        console.error("[MuridController: createMurid] SERVER ERROR:", err);
        res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message });
    }
};

// --- C. PUT (UPDATE) ---
const updateMurid = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body; 

    try {
        // Normalisasi Status jika ada
        if (updateData.status) {
             const normalizedStatus = updateData.status.toUpperCase();
             const validStatuses = ['AKTIF', 'NON-AKTIF'];
             if (!validStatuses.includes(normalizedStatus)) {
                 return res.status(400).json({ message: "Status tidak valid." });
             }
             updateData.status = normalizedStatus;
        }
        
        // Validasi Usia jika ada
        if (updateData.age !== undefined && updateData.age !== null) {
             const parsedAge = parseInt(updateData.age);
             if (isNaN(parsedAge) || parsedAge <= 0) {
                 return res.status(400).json({ message: "Usia tidak valid." });
             }
             updateData.age = parsedAge;
        }

        const { data, error } = await supabase
            .from('students') 
            .update(updateData)
            .eq('id', id)
            .select()
            .single(); 

        if (error) {
            return res.status(500).json({ message: "Gagal memperbarui data (Database Error).", error: error.message });
        }
        if (!data) {
            return res.status(404).json({ message: "Murid tidak ditemukan." });
        }

        res.status(200).json({ message: "Data murid berhasil diperbarui.", student: data });
    } catch (err) {
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// --- D. DELETE ---
const deleteMurid = async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('students') 
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({ message: "Gagal menghapus data (Database Error).", error: error.message });
        }
        
        res.status(200).json({ message: "Data murid berhasil dihapus." });
    } catch (err) {
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

module.exports = {
    getAllMurid,
    createMurid,
    updateMurid,
    deleteMurid
};