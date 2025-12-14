// src/routes/murid.routes.js

const express = require('express');
const router = express.Router();
const muridController = require('../controllers/murid.controller');
// Biarkan require ini tetap ada agar tidak terjadi ReferenceError
const authMiddleware = require('../middlewares/auth.middleware'); 
const checkRole = require('../middlewares/role.middleware'); 

// Hak Akses Murid:
// CRUD: Owner, Admin
// View (GET): Owner, Admin, Bendahara


// =======================================================
// GET /api/students (READ ALL & Search)
// BYPASS AUTH SEMENTARA
// =======================================================
router.get(
    '/', 
    // authMiddleware,        // <-- DIKOMEN SEMENTARA
    // checkRole(['OWNER', 'ADMIN', 'BENDAHARA']), 
    muridController.getAllMurid
);

// =======================================================
// POST /api/students (CREATE)
// BYPASS AUTH SEMENTARA
// =======================================================
router.post(
    '/', 
    // authMiddleware, // <-- DIKOMEN SEMENTARA
    // checkRole(['OWNER', 'ADMIN']), // <-- DIKOMEN SEMENTARA
    muridController.createMurid
);

// =======================================================
// PUT /api/students/:id (UPDATE)
// BYPASS AUTH SEMENTARA
// =======================================================
router.put(
    '/:id', 
    // authMiddleware, // <-- DIKOMEN SEMENTARA
    // checkRole(['OWNER', 'ADMIN']), // <-- DIKOMEN SEMENTARA
    muridController.updateMurid
);

// =======================================================
// DELETE /api/students/:id (DELETE)
// BYPASS AUTH SEMENTARA
// =======================================================
router.delete(
    '/:id', 
    // authMiddleware, // <-- DIKOMEN SEMENTARA
    // checkRole(['OWNER', 'ADMIN']), // <-- DIKOMEN SEMENTARA
    muridController.deleteMurid
);

module.exports = router;