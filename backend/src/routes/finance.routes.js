// backend/src/routes/finance.routes.js
const express = require('express')
const router = express.Router()
const controller = require('../controllers/finance.controller')

// --- 1. IMPORT MIDDLEWARE DENGAN PENANGANAN FORMAT EXPORT ---
const authMiddlewareData = require('../middlewares/auth.middleware')

// Cek apakah export-nya berupa object { authMiddleware: fn } atau fungsi langsung
const authMiddleware = authMiddlewareData.authMiddleware || authMiddlewareData

// Validasi: Pastikan yang kita dapatkan benar-benar FUNCTION
if (typeof authMiddleware !== 'function') {
    console.error("❌ ERROR FATAL: authMiddleware gagal dimuat!")
    console.error("   Isi dari require('../middlewares/auth.middleware'):", authMiddlewareData)
    throw new Error("authMiddleware is not a function. Periksa file src/middlewares/auth.middleware.js")
}

// --- 2. PASANG MIDDLEWARE ---
router.use(authMiddleware)

// --- 3. DEFINISI ROLE & HELPER ---
const ALLOWED_ROLES = ['OWNER', 'BENDAHARA', 'ADMIN'];

const checkRole = (roles) => (req, res, next) => {
    // Pastikan req.user ada (dari authMiddleware)
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Akses ditolak. Role tidak diizinkan.' })
    }
    next()
}

// --- 4. ROUTE DEFINITION ---
// Method: GET /api/finance/summary
router.get('/summary', checkRole(ALLOWED_ROLES), controller.getFinanceSummary)

module.exports = router