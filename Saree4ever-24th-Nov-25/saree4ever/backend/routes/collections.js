const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes - Anyone can view collections
router.get('/', collectionController.getAllCollections);

// Admin routes - Only admins can manage collections
// TODO: Add admin routes when needed
// router.post('/', authenticate, isAdmin, collectionController.createCollection);
// router.put('/:id', authenticate, isAdmin, collectionController.updateCollection);
// router.delete('/:id', authenticate, isAdmin, collectionController.deleteCollection);

module.exports = router;

