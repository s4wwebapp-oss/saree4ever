const categoryService = require('../services/categoryService');

/**
 * Get all categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const { admin } = req.query;
    const includeInactive = admin === 'true';
    const categories = await categoryService.getAllCategories(includeInactive);
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get category by ID
 */
exports.getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get category by slug
 */
exports.getCategoryBySlug = async (req, res) => {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create new category
 */
exports.createCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update category
 */
exports.updateCategory = async (req, res) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.json({ category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete category
 */
exports.deleteCategory = async (req, res) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
