// backend/src/routes/operasional.routes.js
const express = require('express')
const router = express.Router()
const controller = require('../controllers/operasional.controller')

// --- 1. IMPORT MIDDLEWARE ---
const authMiddlewareData = require('../middlewares/auth.middleware')
const authMiddleware = authMiddlewareData.authMiddleware || authMiddlewareData

if (typeof authMiddleware !== 'function') {
    console.error("❌ ERROR: authMiddleware gagal dimuat!")
    throw new Error("authMiddleware is not a function")
}

// --- 2. PASANG AUTH MIDDLEWARE ---
router.use(authMiddleware)

// --- 3. ROLE DEFINITIONS ---
const OWNER_BENDAHARA = ['OWNER', 'BENDAHARA'] // Bisa CRUD
const ALL_ROLES = ['OWNER', 'BENDAHARA', 'ADMIN'] // Bisa READ

const checkRole = (allowedRoles) => (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
            error: 'Akses ditolak. Role tidak diizinkan.',
            requiredRoles: allowedRoles,
            userRole: req.user?.role 
        })
    }
    next()
}

// --- 4. ROUTES DEFINITION ---

// GET /api/operasional - Semua role bisa lihat
router.get('/', checkRole(ALL_ROLES), controller.getAllOperasional)

// GET /api/operasional/kategori - Semua role bisa lihat kategori
router.get('/kategori', checkRole(ALL_ROLES), controller.getAllKategori)

// GET /api/operasional/summary - Semua role bisa lihat summary untuk dashboard
router.get('/summary', checkRole(ALL_ROLES), controller.getOperasionalSummary)

// POST /api/operasional - Hanya OWNER & BENDAHARA bisa tambah
router.post('/', checkRole(OWNER_BENDAHARA), controller.createOperasional)

// PUT /api/operasional/:id - Hanya OWNER & BENDAHARA bisa edit
router.put('/:id', checkRole(OWNER_BENDAHARA), controller.updateOperasional)

// DELETE /api/operasional/:id - Hanya OWNER & BENDAHARA bisa hapus
router.delete('/:id', checkRole(OWNER_BENDAHARA), controller.deleteOperasional)

module.exports = router