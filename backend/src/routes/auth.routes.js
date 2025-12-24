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
