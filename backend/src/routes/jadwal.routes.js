// src/routes/jadwal.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/jadwal.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const allowedRoles = require('../middlewares/role.middleware');

// GET: Owner, Admin, Mentor
router.get('/', authMiddleware, allowedRoles(['OWNER', 'ADMIN', 'MENTOR']), controller.getAllJadwal);

// POST, PUT, DELETE: Hanya Owner & Admin
router.post('/', authMiddleware, allowedRoles(['OWNER', 'ADMIN']), controller.createJadwal);
router.put('/:id', authMiddleware, allowedRoles(['OWNER', 'ADMIN']), controller.updateJadwal);
router.delete('/:id', authMiddleware, allowedRoles(['OWNER', 'ADMIN']), controller.deleteJadwal);

module.exports = router;