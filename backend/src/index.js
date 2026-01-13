// src/index.js

const express = require('express')
const cors = require('cors')
require('dotenv').config() // Memuat .env di awal

const app = express()
const cookieParser = require('cookie-parser')

// ==========================================================
// 0. Debug Environment (Cek Koneksi Supabase) - REMOVED SENSITIVE LOGGING
// ==========================================================
if (process.env.NODE_ENV !== 'production') {
    console.log('--- SUPABASE BACKEND CONFIG DEBUG ---')
    console.log('1. URL Loaded:', !!process.env.SUPABASE_URL)
    console.log('2. KEY Loaded:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    // Tidak menampilkan prefix key untuk keamanan
    console.log('-----------------------------------')
}

// ==========================================================
// 1. Import Routes
// ==========================================================
// Pastikan semua file ini ada di folder src/routes/
const authRoutes = require('./routes/auth.routes')
const muridRoutes = require('./routes/murid.routes')
const mentorRoutes = require('./routes/mentor.routes') 
const paketRoutes = require('./routes/paket.routes')
const jadwalRoutes = require('./routes/jadwal.routes') 
const paymentRoutes = require('./routes/payment.routes')
const attendanceRoutes = require('./routes/attendance.routes')
const transactionRoutes = require('./routes/transaction.routes') 
const financeRoutes = require('./routes/finance.routes') // ✅ Penting untuk Dashboard Keuangan
const salaryRoutes = require('./routes/salary.routes')   // ✅ Penting untuk Gaji Mentor
const operasionalRoutes = require('./routes/operasional.routes') // ✅ Biaya Operasional

// ==========================================================
// 2. Middleware Utama
// ==========================================================
app.use(cors({ 
    origin: [
        'https://miracleprivateclass.com', 
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// WAJIB agar req.body terbaca sebagai JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())

// ==========================================================
// 3. Health Check & Root
// ==========================================================
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        serverTime: new Date().toISOString(),
        version: '1.0.0',
        message: 'Miracle Private Backend is Healthy 🚀'
    })
})

app.get('/', (req, res) => {
    res.send('Miracle Private Class Backend — API is running. See /api/health')
})

// ==========================================================
// 4. Mount Routes
// ==========================================================

console.log('--- MOUNTING ROUTES ---')

// Helper function untuk mount route dengan aman
const mount = (path, route, name) => {
    try {
        if (!route) throw new Error(`Route module is undefined. Check your require('./routes/...') path.`)
        app.use(path, route)
        console.log(`✅ ${name} mounted at ${path}`)
    } catch (e) {
        console.error(`❌ Failed to mount ${name}:`, e.message)
    }
}

mount('/api/auth', authRoutes, 'Auth Routes')
mount('/api/students', muridRoutes, 'Murid Routes')
mount('/api/mentors', mentorRoutes, 'Mentor Routes')
mount('/api/packages', paketRoutes, 'Paket Routes')
mount('/api/schedules', jadwalRoutes, 'Jadwal Routes')
mount('/api/payments', paymentRoutes, 'Payment Routes')
mount('/api/attendance', attendanceRoutes, 'Attendance Routes')
mount('/api/transactions', transactionRoutes, 'Transaction Routes')
mount('/api/finance', financeRoutes, 'Finance Routes') // Endpoint: /api/finance/summary
mount('/api/salaries', salaryRoutes, 'Salary Routes')
mount('/api/operasional', operasionalRoutes, 'Operasional Routes') // Endpoint: /api/operasional

console.log('-----------------------')

// ==========================================================
// 5. Error Handling Middleware (JANGAN DIPINDAH)
// ==========================================================

// 404 Handler (Endpoint tidak ditemukan)
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error)
})

// Global Error Handler
app.use((error, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    console.error(`🔥 ERROR: ${error.message}`)
    
    // Jangan tampilkan stack trace di production untuk keamanan
    res.status(statusCode).json({
        error: error.message, 
        stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
    })
})

// ==========================================================
// 6. Server Listener
// ==========================================================
const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`)
})
