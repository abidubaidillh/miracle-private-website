// backend/src/routes/finance.routes.js
const express = require('express')
const router = express.Router()
const controller = require('../controllers/finance.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const allowedRoles = require('../middlewares/role.middleware')

router.use(authMiddleware)

const ALLOWED_ROLES = ['OWNER', 'BENDAHARA', 'ADMIN'];

router.get('/summary', allowedRoles(ALLOWED_ROLES), controller.getFinanceSummary)

module.exports = router