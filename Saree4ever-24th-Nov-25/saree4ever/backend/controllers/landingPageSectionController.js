const landingPageSectionService = require('../services/landingPageSectionService');

/**
 * Get all sections (admin)
 */
exports.getAllSections = async (req, res) => {
  try {
    const sections = await landingPageSectionService.getAllSections();
    res.json({ sections });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get visible sections (public)
 */
exports.getVisibleSections = async (req, res) => {
  try {
    const visibilityMap = await landingPageSectionService.getVisibleSections();
    res.json({ visibility: visibilityMap });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update section visibility (admin)
 */
exports.updateSectionVisibility = async (req, res) => {
  try {
    const { section_key, is_visible } = req.body;
    
    if (!section_key || typeof is_visible !== 'boolean') {
      return res.status(400).json({ error: 'section_key and is_visible (boolean) are required' });
    }

    const section = await landingPageSectionService.updateSectionVisibility(section_key, is_visible);
    res.json({ section, message: 'Section visibility updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Bulk update section visibility (admin)
 */
exports.bulkUpdateVisibility = async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'updates must be an array' });
    }

    // Validate each update
    for (const update of updates) {
      if (!update.section_key || typeof update.is_visible !== 'boolean') {
        return res.status(400).json({ 
          error: 'Each update must have section_key and is_visible (boolean)' 
        });
      }
    }

    const sections = await landingPageSectionService.bulkUpdateVisibility(updates);
    res.json({ sections, message: 'Sections updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};





