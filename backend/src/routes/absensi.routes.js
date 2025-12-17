// src/routes/absensi.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/absensi.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const allowedRoles = require('../middlewares/role.middleware');

// GET: Semua role boleh melihat (Mentor hanya lihat miliknya nanti difilter di frontend/controller)
router.get('/', authMiddleware, controller.getAbsensi);

// POST: Owner, Admin, Mentor boleh absen
router.post('/', authMiddleware, allowedRoles(['OWNER', 'ADMIN', 'MENTOR']), controller.createAbsensi);

module.exports = router;