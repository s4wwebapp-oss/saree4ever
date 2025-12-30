const socialMediaSettingsService = require('../services/socialMediaSettingsService');

/**
 * Get all social media settings (admin)
 */
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await socialMediaSettingsService.getAllSettings();
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get visible social media links (public)
 */
exports.getVisibleLinks = async (req, res) => {
  try {
    const links = await socialMediaSettingsService.getVisibleLinks();
    res.json({ links });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update social media setting (admin)
 */
exports.updateSetting = async (req, res) => {
  try {
    const { platform } = req.params;
    const { url, is_visible, display_order } = req.body;

    if (!platform) {
      return res.status(400).json({ error: 'platform is required' });
    }

    const updates = {};
    if (url !== undefined) updates.url = url;
    if (is_visible !== undefined) updates.is_visible = is_visible;
    if (display_order !== undefined) updates.display_order = display_order;

    const setting = await socialMediaSettingsService.updateSetting(platform, updates);
    res.json({ setting, message: 'Social media setting updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Bulk update social media settings (admin)
 */
exports.bulkUpdate = async (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'updates must be an array' });
    }

    // Validate each update
    for (const update of updates) {
      if (!update.platform) {
        return res.status(400).json({ error: 'Each update must have a platform' });
      }
    }

    const settings = await socialMediaSettingsService.bulkUpdate(updates);
    res.json({ settings, message: 'Social media settings updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};





