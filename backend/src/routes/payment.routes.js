const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const controller = require('../controllers/payment.controller')

router.use(authMiddleware)

router.get('/', controller.getPayments)
router.post('/', controller.createPayment)
router.delete('/:id', controller.deletePayment)

module.exports = router