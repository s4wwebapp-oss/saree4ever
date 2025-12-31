const variantService = require('../services/variantService');

/**
 * Get variants by product ID
 */
exports.getVariantsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const variants = await variantService.getVariantsByProduct(productId);
    res.json({ variants, count: variants?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get single variant by ID
 */
exports.getVariantById = async (req, res) => {
  try {
    const { id } = req.params;
    const variant = await variantService.getVariantById(id);
    
    if (!variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    
    res.json({ variant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create new variant
 */
exports.createVariant = async (req, res) => {
  try {
    const variant = await variantService.createVariant(req.body);
    res.status(201).json({ variant, message: 'Variant created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update variant
 */
exports.updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const variant = await variantService.updateVariant(id, req.body);
    
    if (!variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    
    res.json({ variant, message: 'Variant updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete variant
 */
exports.deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;
    await variantService.deleteVariant(id);
    res.json({ message: 'Variant deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update variant stock
 */
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity } = req.body;
    const variant = await variantService.updateStock(id, stock_quantity);
    
    if (!variant) {
      return res.status(404).json({ error: 'Variant not found' });
    }
    
    res.json({ variant, message: 'Stock updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

