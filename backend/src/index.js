// src/index.js

const express = require('express')
const cors = require('cors')
require('dotenv').config() // Memuat .env di awal

const app = express()
const cookieParser = require('cookie-parser')

// ==========================================================
// 1. Import Routes
// ==========================================================
const authRoutes = require('./routes/auth.routes')
const muridRoutes = require('./routes/murid.routes')
const mentorRoutes = require('./routes/mentor.routes') 
const paketRoutes = require('./routes/paket.routes')
const jadwalRoutes = require('./routes/jadwal.routes') 
const paymentRoutes = require('./routes/payment.routes')
const absensiRoutes = require('./routes/absensi.routes')
const transactionRoutes = require('./routes/transaction.routes') 
const financeRoutes = require('./routes/finance.routes')
const salaryRoutes = require('./routes/salary.routes') // ✅ [BARU] Import Route Gaji

// ==========================================================
// 2. Middleware Utama
// ==========================================================
app.use(cors({ 
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true 
}))

// 🚨 WAJIB agar req.body tidak undefined
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
        version: '1.0.0'
    })
})

app.get('/', (req, res) => {
    res.send('Miracle Private Class Backend — API is running. See /api/health')
})

// ==========================================================
// 4. Mount Routes
// ==========================================================

console.log('--- MOUNTING ROUTES ---')

// 4.1 Auth
try {
    app.use('/api/auth', authRoutes)
    console.log('✅ Auth Routes mounted at /api/auth')
} catch (e) {
    console.warn('⚠️ auth.routes gagal dimuat:', e.message)
}

// 4.2 Murid / Students
try {
    app.use('/api/students', muridRoutes)
    console.log('✅ Murid Routes mounted at /api/students')
} catch (e) {
    console.error('❌ Failed to mount muridRoutes:', e.message)
}

// 4.3 Mentor
try {
    app.use('/api/mentors', mentorRoutes)
    console.log('✅ Mentor Routes mounted at /api/mentors')
} catch (e) {
    console.error('❌ Failed to mount mentorRoutes:', e.message)
}

// 4.4 Paket Kelas
try {
    app.use('/api/packages', paketRoutes)
    console.log('✅ Paket Routes mounted at /api/packages')
} catch (e) {
    console.error('❌ Failed to mount paketRoutes:', e.message)
}

// 4.5 Jadwal / Schedules
try {
    app.use('/api/schedules', jadwalRoutes)
    console.log('✅ Jadwal Routes mounted at /api/schedules')
} catch (e) {
    console.error('❌ Failed to mount jadwalRoutes:', e.message)
}

// 4.6 Pembayaran / Payments
try {
    app.use('/api/payments', paymentRoutes)
    console.log('✅ Payment Routes mounted at /api/payments')
} catch (e) {
    console.error('❌ Failed to mount paymentRoutes:', e.message)
}

// 4.7 Absensi / Attendance
try {
    app.use('/api/attendance', absensiRoutes)
    console.log('✅ Absensi Routes mounted at /api/attendance')
} catch (e) {
    console.error('❌ Failed to mount absensiRoutes:', e.message)
}

// 4.8 Transaksi / Operasional
try {
    app.use('/api/transactions', transactionRoutes)
    console.log('✅ Transaction Routes mounted at /api/transactions')
} catch (e) {
    console.error('❌ Failed to mount transactionRoutes:', e.message)
}

// 4.9 Finance / Keuangan (Dashboard Rekap)
try {
    app.use('/api/finance', financeRoutes)
    console.log('✅ Finance Routes mounted at /api/finance')
} catch (e) {
    console.error('❌ Failed to mount financeRoutes:', e.message)
}

// 4.10 Salary / Gaji Mentor (✅ INI YANG DITAMBAHKAN)
try {
    app.use('/api/salaries', salaryRoutes)
    console.log('✅ Salary Routes mounted at /api/salaries')
} catch (e) {
    console.error('❌ Failed to mount salaryRoutes:', e.message)
}

console.log('-----------------------')

// ==========================================================
// 5. Error Handling Middleware (JANGAN DIPINDAH)
// ==========================================================

// 404 Handler
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error)
})

// Global Error Handler
app.use((error, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    res.status(statusCode)
    res.json({
        message: error.message,
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