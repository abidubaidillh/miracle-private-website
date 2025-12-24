const express = require('express')
const router = express.Router()
const controller = require('../controllers/attendance.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware)

// Mengambil data untuk dashboard absensi
router.get('/', controller.getAttendanceDashboard)

// Untuk mencentang kehadiran (tanpa foto jika dibutuhkan)
router.post('/toggle', controller.toggleAttendance)

// UNTUK SUBMIT ABSENSI DENGAN FOTO (Gunakan yang ini)
router.post('/submit', controller.submitAttendance)

module.exports = router