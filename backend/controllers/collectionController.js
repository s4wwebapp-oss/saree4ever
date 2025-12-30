const collectionService = require('../services/collectionService');

/**
 * Get all collections
 */
exports.getAllCollections = async (req, res) => {
  try {
    const collections = await collectionService.getAllCollections();
    res.json({ collections });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get collection by ID
 */
exports.getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await collectionService.getCollectionById(id);
    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }
    res.json({ collection });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new collection
 */
exports.createCollection = async (req, res) => {
  try {
    const { name, slug, description, image_url, is_active, display_order } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Collection name is required' });
    }

    const collection = await collectionService.createCollection({
      name,
      slug,
      description,
      image_url,
      is_active,
      display_order,
    });

    res.status(201).json({ collection, message: 'Collection created successfully' });
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A collection with this name or slug already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update a collection
 */
exports.updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image_url, is_active, display_order } = req.body;

    const collection = await collectionService.updateCollection(id, {
      name,
      slug,
      description,
      image_url,
      is_active,
      display_order,
    });

    res.json({ collection, message: 'Collection updated successfully' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A collection with this name or slug already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a collection
 */
exports.deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    await collectionService.deleteCollection(id);
    res.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

