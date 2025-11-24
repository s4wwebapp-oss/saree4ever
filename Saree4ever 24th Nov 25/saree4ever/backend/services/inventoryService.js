const { supabase } = require('../config/db');
const realtimeService = require('./realtimeService');

/**
 * Get inventory records by variant
 */
exports.getInventoryByVariant = async (variantId) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, variant:variants(*)')
    .eq('variant_id', variantId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get inventory records by order
 */
exports.getInventoryByOrder = async (orderId) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*, variant:variants(*)')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

/**
 * Get inventory history
 */
exports.getInventoryHistory = async (variantId, { limit = 50, offset = 0 } = {}) => {
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('variant_id', variantId)
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (error) throw error;
  return data;
};

/**
 * Helper: Get pending order IDs (orders that have reserved stock)
 */
async function getPendingOrderIds() {
  const { data: orders } = await supabase
    .from('orders')
    .select('id')
    .in('status', ['pending', 'confirmed'])
    .in('payment_status', ['pending']);

  return orders?.map(o => o.id) || [];
}

/**
 * Get available stock (total - reserved)
 */
exports.getAvailableStock = async (variantId) => {
  const { data: variant, error } = await supabase
    .from('variants')
    .select('stock_quantity, track_inventory')
    .eq('id', variantId)
    .single();

  if (error) throw error;
  if (!variant) throw new Error('Variant not found');

  if (!variant.track_inventory) {
    return {
      total_stock: 999999, // Unlimited
      reserved_stock: 0,
      available_stock: 999999,
    };
  }

  // Get pending order IDs
  const pendingOrderIds = await getPendingOrderIds();

  // Get reserved stock for this variant (only from pending orders)
  let reserved = 0;
  if (pendingOrderIds.length > 0) {
    const { data: reservedRecords } = await supabase
      .from('inventory')
      .select('quantity_change')
      .eq('variant_id', variantId)
      .eq('type', 'reserve')
      .in('order_id', pendingOrderIds);

    reserved = reservedRecords?.reduce((sum, r) => sum + Math.abs(r.quantity_change), 0) || 0;
  }

  const available = variant.stock_quantity - reserved;

  return {
    total_stock: variant.stock_quantity,
    reserved_stock: reserved,
    available_stock: Math.max(0, available),
  };
};

/**
 * STEP 1: Reserve stock (when checkout starts)
 * This holds stock temporarily while customer completes payment
 */
exports.reserveStock = async ({ variant_id, quantity, order_id, expires_at }) => {
  // Get current stock
  const { data: variant, error: variantError } = await supabase
    .from('variants')
    .select('stock_quantity, track_inventory')
    .eq('id', variant_id)
    .single();

  if (variantError) throw variantError;
  if (!variant) throw new Error('Variant not found');

  if (!variant.track_inventory) {
    // If not tracking inventory, just create a record
    return {
      reserved: true,
      message: 'Inventory tracking disabled for this variant',
    };
  }

  // Check available stock (total - already reserved)
  const stockInfo = await exports.getAvailableStock(variant_id);
  
  if (stockInfo.available_stock < quantity) {
    throw new Error(`Insufficient stock. Available: ${stockInfo.available_stock}, Requested: ${quantity}`);
  }

  const quantity_before = variant.stock_quantity;
  // Note: We don't actually reduce stock_quantity yet - we just track the reservation
  const quantity_after = quantity_before; // Stock stays the same until committed

  // Create reservation record (negative quantity_change indicates reservation)
  const { data: inventoryRecord, error: inventoryError } = await supabase
    .from('inventory')
    .insert({
      variant_id,
      quantity_change: -quantity, // Negative for reservation
      quantity_before,
      quantity_after,
      type: 'reserve', // New type for reservations
      order_id: order_id || null,
      notes: `Reserved ${quantity} units for order ${order_id || 'pending'}`,
      reference_number: order_id || `RES-${Date.now()}`,
    })
    .select()
    .single();

  if (inventoryError) throw inventoryError;

  return {
    reserved: true,
    inventory_record: inventoryRecord,
    available_stock: stockInfo.available_stock - quantity,
    message: `Reserved ${quantity} units`,
  };
};

/**
 * STEP 2: Commit stock (when payment succeeds)
 * This converts reserved stock to sold stock
 */
exports.commitStock = async ({ variant_id, quantity, order_id }) => {
  // Get variant
  const { data: variant, error: variantError } = await supabase
    .from('variants')
    .select('stock_quantity, track_inventory')
    .eq('id', variant_id)
    .single();

  if (variantError) throw variantError;
  if (!variant) throw new Error('Variant not found');

  if (!variant.track_inventory) {
    return {
      committed: true,
      message: 'Inventory tracking disabled for this variant',
    };
  }

  // Find and cancel the reservation
  const { data: reservations, error: reserveError } = await supabase
    .from('inventory')
    .select('*')
    .eq('variant_id', variant_id)
    .eq('order_id', order_id)
    .eq('type', 'reserve')
    .order('created_at', { ascending: false });

  if (reserveError) throw reserveError;

  const totalReserved = reservations?.reduce((sum, r) => sum + Math.abs(r.quantity_change), 0) || 0;
  
  if (totalReserved < quantity) {
    throw new Error(`Cannot commit ${quantity} units. Only ${totalReserved} units were reserved.`);
  }

  const quantity_before = variant.stock_quantity;

  // Actually reduce stock now (commit the sale)
  const quantity_after = quantity_before - quantity;

  if (quantity_after < 0) {
    throw new Error('Insufficient stock to commit');
  }

  // Create sale record
  const { data: saleRecord, error: saleError } = await supabase
    .from('inventory')
    .insert({
      variant_id,
      quantity_change: -quantity, // Negative for sale
      quantity_before,
      quantity_after,
      type: 'sale',
      order_id,
      notes: `Committed ${quantity} units for order ${order_id}`,
      reference_number: order_id,
    })
    .select()
    .single();

  if (saleError) throw saleError;

  // Update variant stock
  const { error: updateError } = await supabase
    .from('variants')
    .update({ stock_quantity: quantity_after })
    .eq('id', variant_id);

  if (updateError) throw updateError;

  // Note: Reservations remain in the database for audit trail
  // They are effectively cancelled by the fact that stock is now committed
  // The available stock calculation only counts reservations from pending orders

  return {
    committed: true,
    inventory_record: saleRecord,
    variant: { id: variant_id, stock_quantity: quantity_after },
    message: `Committed ${quantity} units`,
  };
};

/**
 * STEP 3: Release stock (when payment fails or order cancelled)
 * This returns reserved stock back to available
 */
exports.releaseStock = async ({ variant_id, quantity, order_id }) => {
  // Get variant
  const { data: variant, error: variantError } = await supabase
    .from('variants')
    .select('stock_quantity, track_inventory')
    .eq('id', variant_id)
    .single();

  if (variantError) throw variantError;
  if (!variant) throw new Error('Variant not found');

  if (!variant.track_inventory) {
    return {
      released: true,
      message: 'Inventory tracking disabled for this variant',
    };
  }

  // Find reservations for this order
  const { data: reservations, error: reserveError } = await supabase
    .from('inventory')
    .select('*')
    .eq('variant_id', variant_id)
    .eq('order_id', order_id)
    .eq('type', 'reserve')
    .order('created_at', { ascending: false });

  if (reserveError) throw reserveError;

  const totalReserved = reservations?.reduce((sum, r) => sum + Math.abs(r.quantity_change), 0) || 0;
  
  if (totalReserved < quantity) {
    throw new Error(`Cannot release ${quantity} units. Only ${totalReserved} units were reserved.`);
  }

  const quantity_before = variant.stock_quantity;
  const quantity_after = quantity_before; // Stock doesn't change, reservation is just cancelled

  // Create release record (positive to cancel the negative reservation)
  const { data: releaseRecord, error: releaseError } = await supabase
    .from('inventory')
    .insert({
      variant_id,
      quantity_change: quantity, // Positive to cancel reservation
      quantity_before,
      quantity_after,
      type: 'return', // Using return type for releasing reservations
      order_id,
      notes: `Released ${quantity} units from reservation for order ${order_id}`,
      reference_number: order_id,
    })
    .select()
    .single();

  if (releaseError) throw releaseError;

  const stockInfo = await exports.getAvailableStock(variant_id);

  // Broadcast stock released
  realtimeService.broadcast('stock_released', {
    variant_id,
    quantity,
    order_id,
    available_stock: stockInfo.available_stock,
  });

  return {
    released: true,
    inventory_record: releaseRecord,
    available_stock: stockInfo.available_stock,
    message: `Released ${quantity} units`,
  };
};

/**
 * Adjust inventory (admin only - for manual adjustments)
 */
exports.adjustInventory = async ({ variant_id, quantity_change, type, notes, reference_number, user_id, user_email }) => {
  // Get current stock
  const { data: variant, error: variantError } = await supabase
    .from('variants')
    .select('stock_quantity, product_id')
    .eq('id', variant_id)
    .single();

  if (variantError) throw variantError;
  if (!variant) throw new Error('Variant not found');

  const quantity_before = variant.stock_quantity;
  const quantity_after = quantity_before + quantity_change;

  if (quantity_after < 0) {
    throw new Error('Insufficient stock');
  }

  // Create inventory record
  const { data: inventoryRecord, error: inventoryError } = await supabase
    .from('inventory')
    .insert({
      variant_id,
      quantity_change,
      quantity_before,
      quantity_after,
      type: type || 'adjustment',
      notes: notes || null,
      reference_number: reference_number || null,
      user_id: user_id || null,
    })
    .select()
    .single();

  if (inventoryError) throw inventoryError;

  // Update variant stock
  const { error: updateError } = await supabase
    .from('variants')
    .update({ stock_quantity: quantity_after })
    .eq('id', variant_id);

  if (updateError) throw updateError;

  // Log stock adjustment to stock_adjustments table
  const { logStockAdjustment } = require('../middleware/audit');
  await logStockAdjustment(
    variant_id,
    variant.product_id,
    quantity_before,
    quantity_after,
    notes || type || 'Admin adjustment',
    user_id,
    user_email
  );

  // Broadcast stock update
  realtimeService.broadcast('stock_updated', {
    variant_id,
    stock_quantity: quantity_after,
    quantity_change,
    type,
  });

  return {
    inventory_record: inventoryRecord,
    variant: { id: variant_id, stock_quantity: quantity_after },
  };
};
