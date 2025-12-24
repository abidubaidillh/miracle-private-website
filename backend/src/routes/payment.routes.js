const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const allowedRoles = require('../middlewares/role.middleware')
const controller = require('../controllers/payment.controller')

// Proteksi semua route dengan Auth Middleware
router.use(authMiddleware)

// 🔒 RBAC: Hanya OWNER, ADMIN, dan BENDAHARA yang boleh akses pembayaran
const PAYMENT_ROLES = ['OWNER', 'ADMIN', 'BENDAHARA']

// 1. Ambil Data Pembayaran
router.get('/', allowedRoles(PAYMENT_ROLES), controller.getPayments)

// 2. Buat Pembayaran Baru
router.post('/', allowedRoles(PAYMENT_ROLES), controller.createPayment)

// 3. Konfirmasi Pelunasan (Bayar + Upload Bukti)
// 🔥 PENTING: Gunakan POST agar sesuai dengan Frontend
router.post('/:id/pay', allowedRoles(PAYMENT_ROLES), controller.payPayment)

// 4. Hapus Data Pembayaran (Hanya OWNER dan BENDAHARA)
router.delete('/:id', allowedRoles(['OWNER', 'BENDAHARA']), controller.deletePayment)

module.exports = router
