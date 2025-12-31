const comingSoonService = require('../services/comingSoonService');

/**
 * Get coming soon settings (public)
 */
exports.getSettings = async (req, res) => {
  try {
    const settings = await comingSoonService.getSettings();
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update coming soon settings (admin)
 */
exports.updateSettings = async (req, res) => {
  try {
    const { is_enabled, title, subtitle } = req.body;

    const updates = {};
    if (typeof is_enabled === 'boolean') updates.is_enabled = is_enabled;
    if (title !== undefined) updates.title = title;
    if (subtitle !== undefined) updates.subtitle = subtitle;

    const settings = await comingSoonService.updateSettings(updates);
    res.json({ settings, message: 'Coming soon settings updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get active coming soon media (public)
 */
exports.getActiveMedia = async (req, res) => {
  try {
    const media = await comingSoonService.getActiveMedia();
    res.json({ media });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all coming soon media (admin)
 */
exports.getAllMedia = async (req, res) => {
  try {
    const media = await comingSoonService.getAllMedia();
    res.json({ media });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create coming soon media (admin)
 */
exports.createMedia = async (req, res) => {
  try {
    const { media_type, media_url, thumbnail_url, title, description, display_order, is_active, autoplay, muted, loop } = req.body;

    if (!media_type || !media_url) {
      return res.status(400).json({ error: 'media_type and media_url are required' });
    }

    if (!['video', 'image'].includes(media_type)) {
      return res.status(400).json({ error: 'media_type must be "video" or "image"' });
    }

    const media = await comingSoonService.createMedia({
      media_type,
      media_url,
      thumbnail_url,
      title,
      description,
      display_order: display_order ?? 0,
      is_active: is_active ?? true,
      autoplay: autoplay ?? true,
      muted: muted ?? true,
      loop: loop ?? true,
    });

    res.json({ media, message: 'Media created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update coming soon media (admin)
 */
exports.updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }

    const media = await comingSoonService.updateMedia(id, updates);
    res.json({ media, message: 'Media updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete coming soon media (admin)
 */
exports.deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }

    await comingSoonService.deleteMedia(id);
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Reorder coming soon media (admin)
 */
exports.reorderMedia = async (req, res) => {
  try {
    const { mediaOrders } = req.body;

    if (!Array.isArray(mediaOrders)) {
      return res.status(400).json({ error: 'mediaOrders must be an array' });
    }

    const media = await comingSoonService.reorderMedia(mediaOrders);
    res.json({ media, message: 'Media reordered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
