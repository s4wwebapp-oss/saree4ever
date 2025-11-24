const blogService = require('../services/blogService');

/**
 * Get all published articles
 */
exports.getAllArticles = async (req, res) => {
  try {
    const { limit = 20, offset = 0, category, featured, search } = req.query;
    const articles = await blogService.getAllArticles({
      limit: parseInt(limit),
      offset: parseInt(offset),
      category,
      featured: featured === 'true',
      search,
    });
    res.json({ articles, count: articles.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get article by slug
 */
exports.getArticleBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await blogService.getArticleBySlug(slug);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json({ article });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get article by ID (admin)
 */
exports.getArticleById = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await blogService.getArticleById(id);
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json({ article });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create article (admin)
 */
exports.createArticle = async (req, res) => {
  try {
    const article = await blogService.createArticle(req.body);
    res.status(201).json({ article, message: 'Article created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update article (admin)
 */
exports.updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const article = await blogService.updateArticle(id, req.body);
    res.json({ article, message: 'Article updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete article (admin)
 */
exports.deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;
    await blogService.deleteArticle(id);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get all articles for admin
 */
exports.getAllArticlesAdmin = async (req, res) => {
  try {
    const { limit = 50, offset = 0, status, category, search } = req.query;
    const articles = await blogService.getAllArticlesAdmin({
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      category,
      search,
    });
    res.json({ articles, count: articles.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get categories
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await blogService.getCategories();
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


