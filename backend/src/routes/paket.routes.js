// src/routes/paket.routes.js
const express = require('express');
const router = express.Router();

const paketController = require('../controllers/paket.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const allowedRoles = require('../middlewares/role.middleware');

// GET: Owner, Admin, Bendahara (Mentor TIDAK BOLEH akses)
router.get(
  '/',
  authMiddleware,
  allowedRoles(['OWNER', 'ADMIN', 'BENDAHARA']), 
  paketController.getAllPaket
);

// POST: Owner & Admin
router.post(
  '/',
  authMiddleware,
  allowedRoles(['OWNER', 'ADMIN']),
  paketController.createPaket
);

// PUT: Owner & Admin
router.put(
  '/:id',
  authMiddleware,
  allowedRoles(['OWNER', 'ADMIN']),
  paketController.updatePaket
);

// DELETE: Owner & Admin
router.delete(
  '/:id',
  authMiddleware,
  allowedRoles(['OWNER', 'ADMIN']),
  paketController.deletePaket
);

module.exports = router;