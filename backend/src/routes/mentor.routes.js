// src/routes/mentor.routes.js
const express = require('express')
const router = express.Router()

const mentorController = require('../controllers/mentor.controller')

// 🔥 PERBAIKAN: Hapus kurung kurawal { } agar sesuai dengan auth.middleware.js baru
const authMiddleware = require('../middlewares/auth.middleware')

// Pastikan role middleware di-import dengan benar (sesuaikan dengan file aslinya)
const allowedRoles = require('../middlewares/role.middleware')

// Gunakan Auth Middleware
router.use(authMiddleware)

// 1. GET /api/mentors/me
router.get(
  '/me',
  allowedRoles(['MENTOR', 'OWNER', 'ADMIN']),
  mentorController.getMyProfile
)

// 2. GET /api/mentors
router.get(
  '/',
  allowedRoles(['OWNER', 'ADMIN', 'BENDAHARA', 'MENTOR']),
  mentorController.getAllMentor
)

// 3. POST /api/mentors
router.post(
  '/',
  allowedRoles(['OWNER', 'ADMIN']),
  mentorController.createMentor
)

// 4. PUT /api/mentors/:id
router.put(
  '/:id',
  allowedRoles(['OWNER', 'ADMIN', 'MENTOR']),
  mentorController.updateMentor
)

// 5. DELETE /api/mentors/:id
router.delete(
  '/:id',
  allowedRoles(['OWNER', 'ADMIN']),
  mentorController.deleteMentor
)

module.exports = router