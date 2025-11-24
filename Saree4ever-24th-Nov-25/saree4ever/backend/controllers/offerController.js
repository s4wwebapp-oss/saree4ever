const offerService = require('../services/offerService');

/**
 * Get active offers
 */
exports.getActiveOffers = async (req, res) => {
  try {
    const offers = await offerService.getActiveOffers();
    res.json({ offers, count: offers?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get all offers (admin)
 */
exports.getAllOffers = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const offers = await offerService.getAllOffers({ limit, offset });
    res.json({ offers, count: offers?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get offer by ID
 */
exports.getOfferById = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await offerService.getOfferById(id);
    
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    
    res.json({ offer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create offer (admin)
 */
exports.createOffer = async (req, res) => {
  try {
    const offer = await offerService.createOffer(req.body);
    res.status(201).json({ offer, message: 'Offer created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update offer (admin)
 */
exports.updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await offerService.updateOffer(id, req.body);
    
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    
    res.json({ offer, message: 'Offer updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete offer (admin)
 */
exports.deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    await offerService.deleteOffer(id);
    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update offer status (admin)
 */
exports.updateOfferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const offer = await offerService.updateOfferStatus(id, is_active);
    
    if (!offer) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    
    res.json({ offer, message: 'Offer status updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

