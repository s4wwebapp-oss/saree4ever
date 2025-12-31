const { supabase } = require('../config/db');

// Note: Shipments table doesn't exist yet in the schema
// This service will work once the table is created
// For now, we'll use the orders table's tracking fields

/**
 * Get shipments by order ID
 * Note: Currently using orders table, can be extended when shipments table is added
 */
exports.getShipmentsByOrder = async (orderId) => {
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, order_number, tracking_number, status, shipped_at, delivered_at')
    .eq('id', orderId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  // Format as shipment data
  if (order && order.tracking_number) {
    return [{
      id: order.id,
      order_id: order.id,
      order_number: order.order_number,
      tracking_number: order.tracking_number,
      status: order.status,
      shipped_at: order.shipped_at,
      delivered_at: order.delivered_at,
    }];
  }
  
  return [];
};

/**
 * Get shipment by ID
 */
exports.getShipmentById = async (id) => {
  const { data: order, error } = await supabase
    .from('orders')
    .select('id, order_number, tracking_number, status, shipped_at, delivered_at')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  if (order && order.tracking_number) {
    return {
      id: order.id,
      order_id: order.id,
      order_number: order.order_number,
      tracking_number: order.tracking_number,
      status: order.status,
      shipped_at: order.shipped_at,
      delivered_at: order.delivered_at,
    };
  }
  
  return null;
};

/**
 * Create shipment
 * Note: Updates order with tracking info
 */
exports.createShipment = async (shipmentData) => {
  const { order_id, tracking_number, courier_name, tracking_url, estimated_delivery_date } = shipmentData;

  if (!order_id || !tracking_number) {
    throw new Error('order_id and tracking_number are required');
  }

  const updateData = {
    tracking_number,
    status: 'shipped',
    shipped_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: order, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', order_id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Order not found');
    }
    throw error;
  }

  return {
    id: order.id,
    order_id: order.id,
    order_number: order.order_number,
    tracking_number: order.tracking_number,
    courier_name: courier_name || null,
    tracking_url: tracking_url || null,
    status: order.status,
    estimated_delivery_date: estimated_delivery_date || null,
    shipped_at: order.shipped_at,
  };
};

/**
 * Update shipment
 */
exports.updateShipment = async (id, shipmentData) => {
  const updateData = {
    updated_at: new Date().toISOString(),
  };

  if (shipmentData.tracking_number) updateData.tracking_number = shipmentData.tracking_number;
  if (shipmentData.status) updateData.status = shipmentData.status;

  const { data: order, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Order not found');
    }
    throw error;
  }

  return {
    id: order.id,
    order_id: order.id,
    tracking_number: order.tracking_number,
    status: order.status,
  };
};

/**
 * Update tracking information
 */
exports.updateTracking = async (id, { tracking_number, courier_name, tracking_url }) => {
  const updateData = {
    tracking_number,
    updated_at: new Date().toISOString(),
  };

  const { data: order, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Order not found');
    }
    throw error;
  }

  return {
    id: order.id,
    order_id: order.id,
    tracking_number: order.tracking_number,
    courier_name: courier_name || null,
    tracking_url: tracking_url || null,
  };
};

/**
 * Update shipment status
 */
exports.updateShipmentStatus = async (id, { status, estimated_delivery_date, delivered_at }) => {
  const updateData = {
    updated_at: new Date().toISOString(),
  };

  if (status) updateData.status = status;
  if (delivered_at) {
    updateData.delivered_at = delivered_at;
    updateData.status = 'delivered';
  }

  const { data: order, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Order not found');
    }
    throw error;
  }

  return {
    id: order.id,
    order_id: order.id,
    status: order.status,
    estimated_delivery_date: estimated_delivery_date || null,
    delivered_at: order.delivered_at,
  };
};

