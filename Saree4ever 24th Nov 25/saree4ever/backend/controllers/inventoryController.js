const inventoryService = require('../services/inventoryService');

/**
 * Get inventory records by variant
 */
exports.getInventoryByVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const records = await inventoryService.getInventoryByVariant(variantId);
    res.json({ records, count: records?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get inventory records by order
 */
exports.getInventoryByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const records = await inventoryService.getInventoryByOrder(orderId);
    res.json({ records, count: records?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get inventory history for a variant
 */
exports.getInventoryHistory = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const history = await inventoryService.getInventoryHistory(variantId, { limit, offset });
    res.json({ history, count: history?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get available stock (total - reserved)
 */
exports.getAvailableStock = async (req, res) => {
  try {
    const { variantId } = req.params;
    const stockInfo = await inventoryService.getAvailableStock(variantId);
    // Return in format expected by frontend
    res.json({ 
      available_stock: stockInfo.available_stock,
      total_stock: stockInfo.total_stock,
      reserved_stock: stockInfo.reserved_stock,
      ...stockInfo 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * STEP 1: Reserve stock (when checkout starts)
 */
exports.reserveStock = async (req, res) => {
  try {
    const { variant_id, quantity, order_id, expires_at } = req.body;
    
    if (!variant_id || !quantity) {
      return res.status(400).json({ error: 'variant_id and quantity are required' });
    }

    const result = await inventoryService.reserveStock({
      variant_id,
      quantity,
      order_id,
      expires_at,
    });
    
    res.json({ 
      ...result,
      message: 'Stock reserved successfully' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * STEP 2: Commit stock (when payment succeeds)
 */
exports.commitStock = async (req, res) => {
  try {
    const { variant_id, quantity, order_id } = req.body;
    
    if (!variant_id || !quantity || !order_id) {
      return res.status(400).json({ error: 'variant_id, quantity, and order_id are required' });
    }

    const result = await inventoryService.commitStock({
      variant_id,
      quantity,
      order_id,
    });
    
    res.json({ 
      ...result,
      message: 'Stock committed successfully' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * STEP 3: Release stock (when payment fails or order cancelled)
 */
exports.releaseStock = async (req, res) => {
  try {
    const { variant_id, quantity, order_id } = req.body;
    
    if (!variant_id || !quantity || !order_id) {
      return res.status(400).json({ error: 'variant_id, quantity, and order_id are required' });
    }

    const result = await inventoryService.releaseStock({
      variant_id,
      quantity,
      order_id,
    });
    
    res.json({ 
      ...result,
      message: 'Stock released successfully' 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Adjust inventory (admin only - for manual adjustments)
 */
exports.adjustInventory = async (req, res) => {
  try {
    const { variant_id, quantity_change, type, notes, reference_number } = req.body;
    const user_id = req.user?.id;
    const user_email = req.user?.email;
    
    if (!variant_id || quantity_change === undefined) {
      return res.status(400).json({ error: 'variant_id and quantity_change are required' });
    }
    
    const result = await inventoryService.adjustInventory({
      variant_id,
      quantity_change,
      type: type || 'adjustment',
      notes,
      reference_number,
      user_id,
      user_email,
    });
    
    res.json({ result, message: 'Inventory adjusted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get stock levels for all products (admin only)
 */
exports.getStockLevels = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;
    const { supabase } = require('../config/db');
    
    const { data: variants, error } = await supabase
      .from('variants')
      .select(`
        id,
        name,
        sku,
        stock_quantity,
        track_inventory,
        product:products(id, name, sku)
      `)
      .eq('is_active', true)
      .order('stock_quantity', { ascending: true });

    if (error) throw error;

    const stockLevels = variants.map(v => ({
      variant_id: v.id,
      variant_name: v.name,
      variant_sku: v.sku,
      product_id: v.product?.id,
      product_name: v.product?.name,
      product_sku: v.product?.sku,
      current_stock: v.stock_quantity,
      is_low_stock: v.track_inventory && v.stock_quantity <= parseInt(threshold),
      track_inventory: v.track_inventory,
    }));

    res.json({ stock_levels: stockLevels, count: stockLevels.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get stock adjustment history (admin only)
 */
exports.getStockAdjustments = async (req, res) => {
  try {
    const { variant_id, product_id, limit = 50, offset = 0 } = req.query;
    const { supabase } = require('../config/db');
    
    let query = supabase
      .from('stock_adjustments')
      .select(`
        *,
        variant:variants(id, name, sku),
        product:products(id, name, sku)
      `)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (variant_id) {
      query = query.eq('variant_id', variant_id);
    }
    if (product_id) {
      query = query.eq('product_id', product_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ adjustments: data || [], count: data?.length || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
