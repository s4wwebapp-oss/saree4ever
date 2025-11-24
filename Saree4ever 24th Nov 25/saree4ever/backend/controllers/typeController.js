const typeService = require('../services/typeService');

/**
 * Get all types
 */
exports.getAllTypes = async (req, res) => {
  try {
    const types = await typeService.getAllTypes();
    res.json({ types });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

