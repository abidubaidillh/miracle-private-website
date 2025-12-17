const express = require('express')
const router = express.Router()
const controller = require('../controllers/transaction.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const allowedRoles = require('../middlewares/role.middleware')

router.use(authMiddleware)

// Hanya OWNER dan BENDAHARA yang boleh akses keuangan
const FINANCE_ROLES = ['OWNER', 'BENDAHARA']

router.get('/', allowedRoles(FINANCE_ROLES), controller.getTransactions)
router.get('/categories', allowedRoles(FINANCE_ROLES), controller.getCategories)
router.post('/', allowedRoles(FINANCE_ROLES), controller.createTransaction)
router.delete('/:id', allowedRoles(FINANCE_ROLES), controller.deleteTransaction)

module.exports = router