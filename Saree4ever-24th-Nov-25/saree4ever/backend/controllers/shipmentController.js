const shipmentService = require('../services/shipmentService');

/**
 * Get shipments by order ID
 */
exports.getShipmentsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const shipments = await shipmentService.getShipmentsByOrder(orderId);
    res.json({ shipments, count: shipments?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get shipment by ID
 */
exports.getShipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await shipmentService.getShipmentById(id);
    
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    res.json({ shipment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create shipment (admin only)
 */
exports.createShipment = async (req, res) => {
  try {
    const shipment = await shipmentService.createShipment(req.body);
    res.status(201).json({ shipment, message: 'Shipment created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update shipment (admin only)
 */
exports.updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const shipment = await shipmentService.updateShipment(id, req.body);
    
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    res.json({ shipment, message: 'Shipment updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update tracking information (admin only)
 */
exports.updateTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const { tracking_number, courier_name, tracking_url } = req.body;
    
    const shipment = await shipmentService.updateTracking(id, {
      tracking_number,
      courier_name,
      tracking_url,
    });
    
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    res.json({ shipment, message: 'Tracking updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update shipment status (admin only)
 */
exports.updateShipmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, estimated_delivery_date, delivered_at } = req.body;
    
    const shipment = await shipmentService.updateShipmentStatus(id, {
      status,
      estimated_delivery_date,
      delivered_at,
    });
    
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }
    
    res.json({ shipment, message: 'Shipment status updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

