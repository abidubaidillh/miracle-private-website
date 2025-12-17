// backend/src/routes/absensi.routes.js
const express = require('express');
const router = express.Router();

// ✅ Update: Arahkan ke attendance.controller (bukan absensi.controller)
const controller = require('../controllers/attendance.controller'); 
const authMiddleware = require('../middlewares/auth.middleware');
const allowedRoles = require('../middlewares/role.middleware');

// GET /api/attendance 
// Mengambil dashboard jadwal + status absensi
router.get('/', authMiddleware, controller.getAttendanceDashboard);

// POST /api/attendance/toggle
// Menyimpan atau menghapus absensi (Hadir/Batal)
router.post('/toggle', authMiddleware, allowedRoles(['OWNER', 'ADMIN', 'MENTOR']), controller.toggleAttendance);

module.exports = router;