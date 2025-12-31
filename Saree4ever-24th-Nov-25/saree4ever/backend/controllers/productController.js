const productService = require('../services/productService');

/**
 * Get all products with optional filters
 */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);
    res.json({ products, count: products?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get single product by slug
 */
exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get single product by ID
 */
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if request is from admin (has Authorization header with Bearer token)
    const isAdmin = req.headers.authorization?.startsWith('Bearer') && req.user?.role === 'admin';
    const product = await productService.getProductById(id, isAdmin);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create new product
 */
exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ product, message: 'Product created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update product
 */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ product, message: 'Product updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete product
 */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update product status (active/inactive)
 */
exports.updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active, is_featured } = req.body;
    const product = await productService.updateProductStatus(id, { is_active, is_featured });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ product, message: 'Product status updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
