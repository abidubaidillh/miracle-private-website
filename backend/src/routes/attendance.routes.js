const express = require('express')
const router = express.Router()
const controller = require('../controllers/attendance.controller')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware)

router.get('/', controller.getAttendanceDashboard)
router.post('/toggle', controller.toggleAttendance)

module.exports = router