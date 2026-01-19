// backend/src/routes/auth.routes.js
const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')

// 🔥 PERBAIKAN IMPORT: 
// Jangan gunakan kurung kurawal { } karena auth.middleware.js export langsung (default).
const authMiddleware = require('../middlewares/auth.middleware')

// Import Role Middleware (Penting untuk membatasi register internal hanya untuk Owner/Admin)
// Pastikan path file ini benar sesuai struktur project Anda
const allowedRoles = require('../middlewares/role.middleware')

// =======================================================
// PUBLIC ROUTES (Tidak butuh token)
// =======================================================
router.post('/login', authController.login)
router.post('/register', authController.register)
router.post('/logout', authController.logout)

// TEMPORARY DEBUG ENDPOINT - REMOVE AFTER FIXING
router.get('/debug-attendance/:mentor_auth_id', async (req, res) => {
    try {
        const supabase = require('../config/supabase');
        const { mentor_auth_id } = req.params;
        
        // Step 1: Check mentor profile
        const { data: mentorProfile, error: mentorError } = await supabase
            .from('mentors')
            .select('id, user_id, name, email')
            .eq('user_id', mentor_auth_id)
            .maybeSingle();
        
        // Step 2: Check schedules with profile ID
        let schedules = [];
        if (mentorProfile) {
            const { data: scheduleData, error: scheduleError } = await supabase
                .from('schedules')
                .select(`
                    *,
                    mentors(id, name, user_id),
                    students(id, name)
                `)
                .eq('mentor_id', mentorProfile.id)
                .eq('status', 'AKTIF');
                
            schedules = scheduleData || [];
        }
        
        // Step 3: Check schedules with auth ID directly
        const { data: directSchedules, error: directError } = await supabase
            .from('schedules')
            .select(`
                *,
                mentors(id, name, user_id),
                students(id, name)
            `)
            .eq('mentor_id', mentor_auth_id)
            .eq('status', 'AKTIF');
        
        return res.json({
            mentor_auth_id,
            mentorProfile,
            mentorError,
            schedules_with_profile_id: schedules,
            schedules_with_auth_id: directSchedules || [],
            directError,
            debug: 'This endpoint will be removed after fixing'
        });
        
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// =======================================================
// PROTECTED ROUTES (Butuh Token)
// =======================================================

// 1. Cek Profile Sendiri (✅ Menggunakan 'me')
router.get('/me', authMiddleware, authController.me)

// 2. Register Internal (✅ INI YANG SEBELUMNYA HILANG)
// Digunakan oleh Admin/Owner untuk mendaftarkan Mentor/Admin lain dari dashboard
router.post(
    '/register-internal', 
    authMiddleware, 
    allowedRoles(['OWNER', 'ADMIN']), // Security: Hanya Owner & Admin yang boleh akses
    authController.registerInternal
)

// Jika ada route update profile nanti:
// router.put('/me', authMiddleware, authController.updateProfile)

module.exports = router
