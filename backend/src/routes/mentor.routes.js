// src/routes/mentor.routes.js

const express = require('express')
const router = express.Router()

const mentorController = require('../controllers/mentor.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const allowedRoles = require('../middlewares/role.middleware')

// =======================================================
// GET /api/mentors
// OWNER, ADMIN, BENDAHARA, MENTOR
// NOTE:
// - Mentor HANYA boleh melihat data dirinya sendiri
// - Filtering mentor dilakukan di controller (berdasarkan req.user)
// =======================================================
router.get(
  '/',
  authMiddleware,
  allowedRoles(['OWNER', 'ADMIN', 'BENDAHARA', 'MENTOR']),
  mentorController.getAllMentor
)

// =======================================================
// POST /api/mentors
// OWNER & ADMIN
// =======================================================
router.post(
  '/',
  authMiddleware,
  allowedRoles(['OWNER', 'ADMIN']),
  mentorController.createMentor
)

// =======================================================
// PUT /api/mentors/:id
// OWNER & ADMIN
// NOTE:
// - ADMIN TIDAK BOLEH mengubah salary_per_session
// - Validasi dilakukan di controller
// =======================================================
router.put(
  '/:id',
  authMiddleware,
  allowedRoles(['OWNER', 'ADMIN']),
  mentorController.updateMentor
)

// =======================================================
// DELETE /api/mentors/:id
// OWNER ONLY
// =======================================================
router.delete(
  '/:id',
  authMiddleware,
  allowedRoles('OWNER'),
  mentorController.deleteMentor
)

module.exports = router
