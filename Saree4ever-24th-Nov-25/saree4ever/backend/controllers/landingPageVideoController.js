const landingPageVideoService = require('../services/landingPageVideoService');

/**
 * Get all active videos (public)
 */
exports.getActiveVideos = async (req, res) => {
  try {
    const videos = await landingPageVideoService.getActiveVideos();
    res.json({ videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all videos (admin)
 */
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await landingPageVideoService.getAllVideos();
    res.json({ videos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get single video by ID (admin)
 */
exports.getVideoById = async (req, res) => {
  try {
    const video = await landingPageVideoService.getVideoById(req.params.id);
    res.json({ video });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

/**
 * Create new video (admin)
 */
exports.createVideo = async (req, res) => {
  try {
    const video = await landingPageVideoService.createVideo(req.body);
    res.json({ video, message: 'Video created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update video by ID (admin)
 */
exports.updateVideo = async (req, res) => {
  try {
    const video = await landingPageVideoService.updateVideo(req.params.id, req.body);
    res.json({ video, message: 'Video updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete video by ID (admin)
 */
exports.deleteVideo = async (req, res) => {
  try {
    await landingPageVideoService.deleteVideo(req.params.id);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Reorder videos (admin)
 */
exports.reorderVideos = async (req, res) => {
  try {
    await landingPageVideoService.reorderVideos(req.body.videoOrders);
    res.json({ message: 'Videos reordered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};





