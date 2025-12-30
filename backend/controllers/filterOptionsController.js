const filterOptionsService = require('../services/filterOptionsService');

/**
 * Get all filter options
 */
exports.getAllFilterOptions = async (req, res) => {
  try {
    const options = await filterOptionsService.getAllFilterOptions();
    res.json({ options });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get filter options by type
 */
exports.getFilterOptionsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const options = await filterOptionsService.getFilterOptionsByType(type);
    res.json({ options });
  } catch (error) {
    console.error('Error fetching filter options by type:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all active filter options grouped by type
 */
exports.getActiveFilterOptions = async (req, res) => {
  try {
    const options = await filterOptionsService.getActiveFilterOptions();
    res.json({ options });
  } catch (error) {
    console.error('Error fetching active filter options:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get filter option by ID
 */
exports.getFilterOptionById = async (req, res) => {
  try {
    const { id } = req.params;
    const option = await filterOptionsService.getFilterOptionById(id);
    if (!option) {
      return res.status(404).json({ error: 'Filter option not found' });
    }
    res.json({ option });
  } catch (error) {
    console.error('Error fetching filter option:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create a new filter option
 */
exports.createFilterOption = async (req, res) => {
  try {
    const { filter_type, name, value, display_order, is_active, metadata } = req.body;

    if (!filter_type || !name || !value) {
      return res.status(400).json({ error: 'filter_type, name, and value are required' });
    }

    const option = await filterOptionsService.createFilterOption({
      filter_type,
      name,
      value,
      display_order,
      is_active,
      metadata,
    });

    res.status(201).json({ option, message: 'Filter option created successfully' });
  } catch (error) {
    console.error('Error creating filter option:', error);
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A filter option with this type and value already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update a filter option
 */
exports.updateFilterOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { filter_type, name, value, display_order, is_active, metadata } = req.body;

    const option = await filterOptionsService.updateFilterOption(id, {
      filter_type,
      name,
      value,
      display_order,
      is_active,
      metadata,
    });

    res.json({ option, message: 'Filter option updated successfully' });
  } catch (error) {
    console.error('Error updating filter option:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A filter option with this type and value already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete a filter option
 */
exports.deleteFilterOption = async (req, res) => {
  try {
    const { id } = req.params;
    await filterOptionsService.deleteFilterOption(id);
    res.json({ message: 'Filter option deleted successfully' });
  } catch (error) {
    console.error('Error deleting filter option:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update display order for multiple options
 */
exports.updateDisplayOrder = async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'updates must be an array of { id, display_order }' });
    }

    const results = await filterOptionsService.updateDisplayOrder(updates);
    res.json({ options: results, message: 'Display order updated successfully' });
  } catch (error) {
    console.error('Error updating display order:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get distinct filter types
 */
exports.getFilterTypes = async (req, res) => {
  try {
    const types = await filterOptionsService.getFilterTypes();
    res.json({ types });
  } catch (error) {
    console.error('Error fetching filter types:', error);
    res.status(500).json({ error: error.message });
  }
};
