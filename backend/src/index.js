// src/index.js

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config() 

const app = express()

// ==========================================================
// 0. Debug Environment
// ==========================================================
if (process.env.NODE_ENV !== 'production') {
    console.log('--- SUPABASE BACKEND CONFIG DEBUG ---')
    console.log('1. URL Loaded:', !!process.env.SUPABASE_URL)
    console.log('2. KEY Loaded:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('-----------------------------------')
}

// ==========================================================
// 1. Middleware Utama (CORS HARUS DI ATAS)
// ==========================================================

// Menangani CORS agar domain frontend (cPanel) bisa akses backend (Render)
app.use(cors({ 
    origin: [
        'https://miracleprivateclass.com', 
        'https://www.miracleprivateclass.com', // Tambahkan varian www
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    optionsSuccessStatus: 200 // Untuk legacy browser (IE11, etc)
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ==========================================================
// 2. Import Routes
// ==========================================================
const authRoutes = require('./routes/auth.routes')
const muridRoutes = require('./routes/murid.routes')
const mentorRoutes = require('./routes/mentor.routes') 
const paketRoutes = require('./routes/paket.routes')
const jadwalRoutes = require('./routes/jadwal.routes') 
const paymentRoutes = require('./routes/payment.routes')
const attendanceRoutes = require('./routes/attendance.routes')
const transactionRoutes = require('./routes/transaction.routes') 
const financeRoutes = require('./routes/finance.routes') 
const salaryRoutes = require('./routes/salary.routes') 
const operasionalRoutes = require('./routes/operasional.routes')

// ==========================================================
// 3. Health Check & Root
// ==========================================================
app.get('/api/health', async (req, res) => {
    if (req.query.debug_mentor) {
        try {
            const supabase = require('./config/supabase');
            const mentor_auth_id = req.query.debug_mentor;
            
            const { data: mentorProfile, error: mentorError } = await supabase
                .from('mentors')
                .select('id, user_id, name, email')
                .eq('user_id', mentor_auth_id)
                .maybeSingle();
            
            let schedules = [];
            if (mentorProfile) {
                const { data: scheduleData } = await supabase
                    .from('schedules')
                    .select(`
                        *,
                        mentors(id, name, user_id),
                        students(id, name)
                    `)
                    .eq('mentor_id', mentorProfile.id)
                    .eq('status', 'AKTIF');
                    
                schedules = scheduleData || [];
            }
            
            const { data: directSchedules, error: directError } = await supabase
                .from('schedules')
                .select(`
                    *,
                    mentors(id, name, user_id),
                    students(id, name)
                `)
                .eq('mentor_id', mentor_auth_id)
                .eq('status', 'AKTIF');
            
            return res.json({
                debug: true,
                mentor_auth_id,
                mentorProfile,
                mentorError,
                schedules_with_profile_id: schedules,
                schedules_with_auth_id: directSchedules || [],
                directError
            });
            
        } catch (error) {
            return res.json({
                debug: true,
                error: error.message
            });
        }
    }
    
    res.json({ 
        status: 'ok', 
        serverTime: new Date().toISOString(),
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

const mount = (path, route, name) => {
    try {
        if (!route) throw new Error(`Route module is undefined.`)
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
mount('/api/finance', financeRoutes, 'Finance Routes')
mount('/api/salaries', salaryRoutes, 'Salary Routes')
mount('/api/operasional', operasionalRoutes, 'Operasional Routes')

console.log('-----------------------')

// ==========================================================
// 5. Error Handling
// ==========================================================

app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`)
    res.status(404)
    next(error)
})

app.use((error, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode
    console.error(`🔥 ERROR: ${error.message}`)
    
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