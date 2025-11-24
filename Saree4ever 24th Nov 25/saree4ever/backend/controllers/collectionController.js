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

