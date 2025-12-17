const express = require('express')
const router = express.Router()
const controller = require('../controllers/salary.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const allowedRoles = require('../middlewares/role.middleware')

router.use(authMiddleware)

// 1. Lihat Daftar Gaji (Owner, Bendahara, Admin)
router.get('/', allowedRoles(['OWNER', 'BENDAHARA', 'ADMIN']), controller.getSalaries)

// 2. Simpan Draft (Owner, Bendahara) - Admin tidak boleh edit
router.post('/save', allowedRoles(['OWNER', 'BENDAHARA']), controller.saveSalaryDraft)

// 3. Bayar Gaji (Owner, Bendahara)
router.post('/:id/pay', allowedRoles(['OWNER', 'BENDAHARA']), controller.paySalary)

module.exports = router