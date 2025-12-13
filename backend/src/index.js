const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())
const cookieParser = require('cookie-parser')
app.use(cookieParser())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Root route so visiting http://localhost:PORT/ returns a friendly message
app.get('/', (req, res) => {
  res.send('Miracle Backend — API is running. See /api/health')
})

app.get('/api/students', (req, res) => {
  res.json({ students: [] })
})

app.get('/api/mentors', (req, res) => {
  res.json({ mentors: [] })
})

app.get('/api/schedules', (req, res) => {
  res.json({ schedules: [] })
})

// mount auth routes if present
try {
  const authRoutes = require('./routes/auth.routes')
  app.use('/api/auth', authRoutes)
} catch (e) {
  // ignore if routes file not present yet
}

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
