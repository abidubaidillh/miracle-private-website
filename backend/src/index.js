// src/index.js

const express = require('express')
const cors = require('cors')
require('dotenv').config() // Memuat .env di awal

const app = express()
const cookieParser = require('cookie-parser')

// Import Routes
const authRoutes = require('./routes/auth.routes')
const muridRoutes = require('./routes/murid.routes')

// --- Middleware Utama ---
app.use(cors({ 
    // Ganti dengan domain frontend Anda saat deploy:
    origin: process.env.CLIENT_URL || 'http://localhost:3000', 
    credentials: true 
}))

// ==========================================================
// 🚨 PERBAIKAN KRITIS: Middleware untuk mem-parse body JSON
// ==========================================================
app.use(express.json()) 
// ==========================================================

app.use(cookieParser()) // Untuk parsing cookie

// --- Health Check & Root Route ---
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

// --- Mount Routes Sebenarnya ---

// 1. Auth Routes
try {
    app.use('/api/auth', authRoutes)
    console.log('✅ Auth Routes mounted at /api/auth');
} catch (e) {
    console.warn('⚠️ Warning: auth.routes not found or failed to load. Authentication endpoints skipped.');
}

// 2. Murid/Students Routes
try {
    // Menggunakan /api/students sesuai dengan convention
    app.use('/api/students', muridRoutes); 
    console.log('✅ Murid Routes mounted at /api/students');
} catch (e) {
    console.error("❌ Failed to mount muridRoutes:", e.message);
}

// --- Penanganan Error Middleware (PENTING) ---

// 1. 404 Handler (Runs if no route above has matched)
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// 2. Global Error Handler (Handles errors passed by next(error) or thrown)
app.use((error, req, res, next) => {
    // Jika status masih 200, ubah ke 500
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
    });
});


// --- Server Listener ---
const port = process.env.PORT || 4000
app.listen(port, () => {
    console.log(`🚀 Server is listening on port ${port} (http://localhost:${port})`);
})