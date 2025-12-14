// src/routes/auth.routes.js

const express = require('express')
const router = express.Router()
const controller = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.post('/register', controller.register)
router.post('/login', controller.login)
router.get('/me', authMiddleware, controller.me)

// --- ROUTE BARU UNTUK SETUP AWAL ADMIN/OWNER ---
// Route ini digunakan untuk membuat akun dengan role tinggi
router.post('/register-internal', controller.registerInternal) 

module.exports = router