const announcementService = require('../services/announcementService');

/**
 * Get active announcement (public)
 */
exports.getActiveAnnouncement = async (req, res) => {
  try {
    const announcement = await announcementService.getActiveAnnouncement();
    res.json({ announcement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all announcements (admin)
 */
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await announcementService.getAllAnnouncements();
    res.json({ announcements, count: announcements.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get announcement by ID (admin)
 */
exports.getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await announcementService.getAnnouncementById(id);
    
    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    res.json({ announcement });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create announcement (admin)
 */
exports.createAnnouncement = async (req, res) => {
  try {
    const announcement = await announcementService.createAnnouncement(req.body);
    res.status(201).json({ announcement, message: 'Announcement created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update announcement (admin)
 */
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await announcementService.updateAnnouncement(id, req.body);
    res.json({ announcement, message: 'Announcement updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete announcement (admin)
 */
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    await announcementService.deleteAnnouncement(id);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


