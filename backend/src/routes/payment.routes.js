const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const controller = require('../controllers/payment.controller')

// Proteksi semua route dengan Auth Middleware
router.use(authMiddleware)

// 1. Ambil Data Pembayaran
router.get('/', controller.getPayments)

// 2. Buat Pembayaran Baru
router.post('/', controller.createPayment)

// 3. Konfirmasi Pelunasan (Bayar + Upload Bukti)
// 🔥 PENTING: Gunakan POST agar sesuai dengan Frontend
router.post('/:id/pay', controller.payPayment)

// 4. Hapus Data Pembayaran
router.delete('/:id', controller.deletePayment)

module.exports = router