const heroSlideService = require('../services/heroSlideService');

/**
 * Get active hero slides (public)
 */
exports.getActiveSlides = async (req, res) => {
  try {
    const slides = await heroSlideService.getActiveSlides();
    res.json({ slides });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all hero slides (admin)
 */
exports.getAllSlides = async (req, res) => {
  try {
    const slides = await heroSlideService.getAllSlides();
    res.json({ slides, count: slides.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get slide by ID (admin)
 */
exports.getSlideById = async (req, res) => {
  try {
    const { id } = req.params;
    const slide = await heroSlideService.getSlideById(id);
    
    if (!slide) {
      return res.status(404).json({ error: 'Hero slide not found' });
    }
    
    res.json({ slide });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create hero slide (admin)
 */
exports.createSlide = async (req, res) => {
  try {
    const slide = await heroSlideService.createSlide(req.body);
    res.status(201).json({ slide, message: 'Hero slide created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update hero slide (admin)
 */
exports.updateSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const slide = await heroSlideService.updateSlide(id, req.body);
    res.json({ slide, message: 'Hero slide updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete hero slide (admin)
 */
exports.deleteSlide = async (req, res) => {
  try {
    const { id } = req.params;
    await heroSlideService.deleteSlide(id);
    res.json({ message: 'Hero slide deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Reorder slides (admin)
 */
exports.reorderSlides = async (req, res) => {
  try {
    const { slideOrders } = req.body; // Array of { id, display_order }
    await heroSlideService.reorderSlides(slideOrders);
    res.json({ message: 'Hero slides reordered successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


