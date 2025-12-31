const { supabase } = require('../config/db');
const { generateVariantSKU } = require('../utils/helpers');

/**
 * Get variants by product ID
 */
exports.getVariantsByProduct = async (productId) => {
  const { data, error } = await supabase
    .from('variants')
    .select('*, product:products(*)')
    .eq('product_id', productId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Get single variant by ID
 */
exports.getVariantById = async (id) => {
  const { data, error } = await supabase
    .from('variants')
    .select('*, product:products(*)')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Create new variant
 */
exports.createVariant = async (variantData) => {
  const {
    product_id,
    name,
    sku,
    price,
    compare_at_price,
    color,
    has_blouse = false,
    blouse_included = false,
    size,
    image_url,
    stock_quantity = 0,
    track_inventory = true,
    display_order = 0,
  } = variantData;

  if (!product_id || !name) {
    throw new Error('product_id and name are required');
  }

  // Auto-generate SKU if not provided
  let finalSKU = sku;
  if (!finalSKU) {
    // Get product SKU for variant SKU generation
    const { data: productData } = await supabase
      .from('products')
      .select('sku')
      .eq('id', product_id)
      .single();
    
    const productSKU = productData?.sku || null;
    
    // Generate variant SKU automatically
    finalSKU = await generateVariantSKU(supabase, product_id, productSKU, null);
  }

  const { data, error } = await supabase
    .from('variants')
    .insert({
      product_id,
      name,
      sku: finalSKU,
      price: price || null,
      compare_at_price: compare_at_price || null,
      color: color || null,
      has_blouse,
      blouse_included,
      size: size || null,
      image_url: image_url || null,
      stock_quantity,
      track_inventory,
      is_active: true,
      display_order,
    })
    .select('*, product:products(*)')
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update variant
 */
exports.updateVariant = async (id, variantData) => {
  const updateData = { ...variantData };
  updateData.updated_at = new Date().toISOString();

  // Remove undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  const { data, error } = await supabase
    .from('variants')
    .update(updateData)
    .eq('id', id)
    .select('*, product:products(*)')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Variant not found');
    }
    throw error;
  }
  return data;
};

/**
 * Delete variant
 */
exports.deleteVariant = async (id) => {
  const { error } = await supabase
    .from('variants')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
  return true;
};

/**
 * Update variant stock
 */
exports.updateStock = async (id, stock_quantity) => {
  if (stock_quantity === undefined || stock_quantity === null) {
    throw new Error('stock_quantity is required');
  }

  const { data, error } = await supabase
    .from('variants')
    .update({ 
      stock_quantity: Number(stock_quantity),
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Variant not found');
    }
    throw error;
  }
  return data;
};

