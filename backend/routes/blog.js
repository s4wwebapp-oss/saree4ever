const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { authenticate, isAdmin, optionalAuth } = require('../middleware/auth');

// Public routes - Anyone can read published articles
router.get('/', optionalAuth, blogController.getAllArticles);
router.get('/categories', blogController.getCategories);
router.get('/:slug', optionalAuth, blogController.getArticleBySlug);

// Admin routes - Only admins can create, update, delete
router.use(authenticate);
router.use(isAdmin);

router.get('/admin/all', blogController.getAllArticlesAdmin);
router.get('/admin/:id', blogController.getArticleById);
router.post('/admin', blogController.createArticle);
router.put('/admin/:id', blogController.updateArticle);
router.delete('/admin/:id', blogController.deleteArticle);

module.exports = router;


