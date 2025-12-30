const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes - Anyone can view collections
router.get('/', collectionController.getAllCollections);
router.get('/:id', collectionController.getCollectionById);

// Admin routes - Only admins can manage collections
router.post('/', authenticate, isAdmin, collectionController.createCollection);
router.put('/:id', authenticate, isAdmin, collectionController.updateCollection);
router.delete('/:id', authenticate, isAdmin, collectionController.deleteCollection);

module.exports = router;

