const express = require('express');
const router = express.Router();
const typeController = require('../controllers/typeController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Public routes - Anyone can view types
router.get('/', typeController.getAllTypes);
router.get('/:slug', typeController.getTypeBySlug);

// Admin routes - Only admins can manage types
router.use(authenticate);
router.use(isAdmin);

router.get('/id/:id', typeController.getTypeById);
router.post('/', typeController.createType);
router.put('/:id', typeController.updateType);
router.delete('/:id', typeController.deleteType);

module.exports = router;

