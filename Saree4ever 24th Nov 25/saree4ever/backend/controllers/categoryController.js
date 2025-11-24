const categoryService = require('../services/categoryService');

/**
 * Get all categories
 */
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

