const express = require('express')
const router = express.Router()
const controller = require('../controllers/salary.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const allowedRoles = require('../middlewares/role.middleware')

router.use(authMiddleware)

// 1. Lihat Gaji PRIBADI (Khusus Mentor) - 🔥 WAJIB ADA SEBELUM ROUTE '/'
router.get(
    '/my-salary', 
    allowedRoles(['MENTOR', 'OWNER', 'ADMIN']), 
    controller.getMySalaries
)

// 2. Lihat Daftar Gaji SEMUA (Owner, Bendahara, Admin)
router.get(
    '/', 
    allowedRoles(['OWNER', 'BENDAHARA', 'ADMIN']), 
    controller.getSalaries
)

// 3. Simpan Draft (Owner, Bendahara) - Admin tidak boleh edit
router.post(
    '/save', 
    allowedRoles(['OWNER', 'BENDAHARA']), 
    controller.saveSalaryDraft
)

// 4. Bayar Gaji (Owner, Bendahara)
router.post(
    '/:id/pay', 
    allowedRoles(['OWNER', 'BENDAHARA']), 
    controller.paySalary
)

// 5. Recalculate Gaji (Owner, Bendahara) - AUDIT FIX
router.post(
    '/:id/recalculate', 
    allowedRoles(['OWNER', 'BENDAHARA']), 
    controller.recalculateSalary
)

module.exports = router