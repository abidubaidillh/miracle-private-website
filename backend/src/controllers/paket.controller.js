// src/controllers/paket.controller.js
const supabase = require('../config/supabase'); 

// --- A. GET (READ ALL & Search) ---
const getAllPaket = async (req, res) => {
    const { search } = req.query; 

    try {
        let query = supabase
            .from('packages')
            .select('*')
            .order('price', { ascending: true }); // Default urut harga termurah

        // Filter Pencarian (Nama Paket)
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data: packages, error } = await query;

        if (error) {
            console.error("[PaketController: getAllPaket] DATABASE ERROR:", error);
            return res.status(500).json({ 
                message: "Gagal mengambil data paket.", 
                error: error.message 
            });
        }

        // Statistik sederhana
        const totalPaket = packages.length;

        res.status(200).json({ 
            packages, 
            stats: { 
                total: totalPaket 
            } 
        });
        
    } catch (err) {
        console.error("[PaketController: getAllPaket] Server Error:", err);
        res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message });
    }
};

// --- B. POST (CREATE) ---
const createPaket = async (req, res) => {
    const { name, duration, price, description } = req.body; 
    
    // Validasi
    if (!name || !duration || price === undefined) {
        return res.status(400).json({ message: "Nama Paket, Durasi, dan Harga wajib diisi." });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ message: "Harga harus berupa angka valid." });
    }

    const insertData = { 
        name, 
        duration, 
        price: parsedPrice,
        description: description || ""
    };

    try {
        const { data, error } = await supabase
            .from('packages') 
            .insert([insertData])
            .select()
            .single(); 

        if (error) {
            console.error("[PaketController: createPaket] ERROR:", error);
            return res.status(500).json({ message: "Gagal menyimpan paket.", error: error.message });
        }
        
        res.status(201).json({ message: "Paket berhasil ditambahkan.", package: data });
    } catch (err) {
        res.status(500).json({ message: "Terjadi kesalahan server.", error: err.message });
    }
};

// --- C. PUT (UPDATE) ---
const updatePaket = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body; 

    try {
        // Validasi Harga jika ada update harga
        if (updateData.price !== undefined) {
             const parsedPrice = parseFloat(updateData.price);
             if (isNaN(parsedPrice) || parsedPrice < 0) {
                 return res.status(400).json({ message: "Harga harus berupa angka valid." });
             }
             updateData.price = parsedPrice;
        }

        const { data, error } = await supabase
            .from('packages') 
            .update(updateData)
            .eq('id', id)
            .select()
            .single(); 

        if (error) {
            return res.status(500).json({ message: "Gagal update paket.", error: error.message });
        }
        if (!data) {
            return res.status(404).json({ message: "Paket tidak ditemukan." });
        }

        res.status(200).json({ message: "Paket berhasil diperbarui.", package: data });
    } catch (err) {
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

// --- D. DELETE ---
const deletePaket = async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('packages') 
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({ message: "Gagal menghapus paket.", error: error.message });
        }
        
        res.status(200).json({ message: "Paket berhasil dihapus." });
    } catch (err) {
        res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

module.exports = {
    getAllPaket,
    createPaket,
    updatePaket,
    deletePaket
};