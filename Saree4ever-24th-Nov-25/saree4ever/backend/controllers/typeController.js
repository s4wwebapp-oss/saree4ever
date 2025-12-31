const typeService = require('../services/typeService');

/**
 * Get all types
 */
exports.getAllTypes = async (req, res) => {
  try {
    const { admin } = req.query;
    const includeInactive = admin === 'true';
    const types = await typeService.getAllTypes(includeInactive);
    res.json({ types });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get type by ID
 */
exports.getTypeById = async (req, res) => {
  try {
    const type = await typeService.getTypeById(req.params.id);
    if (!type) {
      return res.status(404).json({ error: 'Type not found' });
    }
    res.json({ type });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get type by slug
 */
exports.getTypeBySlug = async (req, res) => {
  try {
    const type = await typeService.getTypeBySlug(req.params.slug);
    if (!type) {
      return res.status(404).json({ error: 'Type not found' });
    }
    res.json({ type });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create new type
 */
exports.createType = async (req, res) => {
  try {
    const type = await typeService.createType(req.body);
    res.status(201).json({ type });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update type
 */
exports.updateType = async (req, res) => {
  try {
    const type = await typeService.updateType(req.params.id, req.body);
    res.json({ type });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete type
 */
exports.deleteType = async (req, res) => {
  try {
    await typeService.deleteType(req.params.id);
    res.json({ message: 'Type deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
