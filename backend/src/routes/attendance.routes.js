const express = require('express')
const router = express.Router()
const controller = require('../controllers/attendance.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const supabase = require('../config/supabase') // For debug endpoint

// TEMPORARY DEBUG ENDPOINT - REMOVE AFTER FIXING (NO AUTH REQUIRED)
router.get('/debug-no-auth/:mentor_auth_id', async (req, res) => {
    try {
        const { mentor_auth_id } = req.params;
        
        console.log(`[DEBUG ENDPOINT] Testing for mentor_auth_id: ${mentor_auth_id}`);
        
        // Step 1: Check mentor profile
        const { data: mentorProfile, error: mentorError } = await supabase
            .from('mentors')
            .select('id, user_id, name, email')
            .eq('user_id', mentor_auth_id)
            .maybeSingle();
            
        console.log(`[DEBUG] Mentor profile:`, mentorProfile);
        
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
            console.log(`[DEBUG] Schedules found:`, schedules.length);
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
            
        console.log(`[DEBUG] Direct schedules found:`, directSchedules?.length || 0);
        
        return res.json({
            mentor_auth_id,
            mentorProfile,
            schedules_with_profile_id: schedules,
            schedules_with_auth_id: directSchedules || [],
            debug: 'This endpoint will be removed after fixing'
        });
        
    } catch (error) {
        console.error('[DEBUG ENDPOINT] Error:', error);
        return res.status(500).json({ error: error.message });
    }
});

router.use(authMiddleware)

// TEMPORARY DEBUG ENDPOINT - REMOVE AFTER FIXING
router.get('/debug/:mentor_auth_id', async (req, res) => {
    try {
        const { mentor_auth_id } = req.params;
        
        console.log(`[DEBUG ENDPOINT] Testing for mentor_auth_id: ${mentor_auth_id}`);
        
        // Step 1: Check mentor profile
        const { data: mentorProfile, error: mentorError } = await supabase
            .from('mentors')
            .select('id, user_id, name, email')
            .eq('user_id', mentor_auth_id)
            .maybeSingle();
            
        console.log(`[DEBUG] Mentor profile:`, mentorProfile);
        
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
            console.log(`[DEBUG] Schedules found:`, schedules.length);
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
            
        console.log(`[DEBUG] Direct schedules found:`, directSchedules?.length || 0);
        
        return res.json({
            mentor_auth_id,
            mentorProfile,
            schedules_with_profile_id: schedules,
            schedules_with_auth_id: directSchedules || [],
            debug: 'This endpoint will be removed after fixing'
        });
        
    } catch (error) {
        console.error('[DEBUG ENDPOINT] Error:', error);
        return res.status(500).json({ error: error.message });
    }
});

// Mengambil data untuk dashboard absensi
router.get('/', controller.getAttendanceDashboard)

// Untuk mencentang kehadiran (tanpa foto jika dibutuhkan)
router.post('/toggle', controller.toggleAttendance)

// UNTUK SUBMIT ABSENSI DENGAN FOTO (Gunakan yang ini)
router.post('/submit', controller.submitAttendance)

module.exports = router