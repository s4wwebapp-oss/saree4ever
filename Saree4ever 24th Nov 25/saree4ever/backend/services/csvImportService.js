const { parse } = require('csv-parse/sync');
const productService = require('./productService');
const variantService = require('./variantService');
const inventoryService = require('./inventoryService');
const { supabase } = require('../config/db');
const { generateSlug } = require('../utils/helpers');

/**
 * Validate product row
 */
function validateProductRow(row, rowNumber) {
  const errors = [];

  if (!row.name && !row.title) {
    errors.push('Name or title is required');
  }
  if (!row.base_price) {
    errors.push('Base price is required');
  }
  if (row.base_price && isNaN(parseFloat(row.base_price))) {
    errors.push('Base price must be a number');
  }
  if (row.collection_id && !isValidUUID(row.collection_id)) {
    errors.push('Invalid collection_id format');
  }
  if (row.category_id && !isValidUUID(row.category_id)) {
    errors.push('Invalid category_id format');
  }
  if (row.type_id && !isValidUUID(row.type_id)) {
    errors.push('Invalid type_id format');
  }

  return errors;
}

/**
 * Validate variant row
 */
function validateVariantRow(row, rowNumber) {
  const errors = [];

  if (!row.product_id && !row.product_sku && !row.product_slug) {
    errors.push('product_id, product_sku, or product_slug is required');
  }
  if (!row.name) {
    errors.push('Variant name is required');
  }
  if (row.price && isNaN(parseFloat(row.price))) {
    errors.push('Price must be a number');
  }
  if (row.stock_quantity && isNaN(parseInt(row.stock_quantity))) {
    errors.push('Stock quantity must be a number');
  }

  return errors;
}

/**
 * Validate stock update row
 */
function validateStockRow(row, rowNumber) {
  const errors = [];

  if (!row.variant_id && !row.sku) {
    errors.push('variant_id or sku is required');
  }
  if (!row.stock_quantity) {
    errors.push('stock_quantity is required');
  }
  if (isNaN(parseInt(row.stock_quantity))) {
    errors.push('Stock quantity must be a number');
  }

  return errors;
}

/**
 * Check if string is valid UUID
 */
function isValidUUID(str) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Find product by SKU or slug
 */
async function findProductByIdentifier(identifier, type = 'id') {
  let query = supabase.from('products').select('id');

  if (type === 'sku') {
    query = query.eq('sku', identifier);
  } else if (type === 'slug') {
    query = query.eq('slug', identifier);
  } else {
    query = query.eq('id', identifier);
  }

  const { data } = await query.single();
  return data?.id || null;
}

/**
 * Find variant by SKU
 */
async function findVariantBySku(sku) {
  const { data } = await supabase
    .from('variants')
    .select('id, product_id')
    .eq('sku', sku)
    .single();

  return data;
}

/**
 * Import products from CSV
 * STEP 1: Read CSV
 * STEP 2: Validate each row
 * STEP 3: Add or update products
 * STEP 4: Send back report
 */
exports.importProducts = async (csvBuffer) => {
  try {
    // STEP 1: Read the CSV
    const records = parse(csvBuffer.toString(), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: true,
    });

    const result = {
      total_rows: records.length,
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [],
      successes: [],
    };

    // STEP 2 & 3: Validate and process each row
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2; // +2 because of header and 0-index

      try {
        // STEP 2: Validate row
        const validationErrors = validateProductRow(row, rowNumber);
        if (validationErrors.length > 0) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            data: row,
            errors: validationErrors,
            type: 'validation',
          });
          continue;
        }

        // Check if product exists (by SKU or slug)
        const productName = row.name || row.title;
        const slug = generateSlug(productName);
        let existingProduct = null;

        if (row.sku) {
          const { data } = await supabase
            .from('products')
            .select('id')
            .eq('sku', row.sku)
            .single();
          existingProduct = data;
        }

        if (!existingProduct) {
          const { data } = await supabase
            .from('products')
            .select('id')
            .eq('slug', slug)
            .single();
          existingProduct = data;
        }

        // STEP 3: Add or update product
        let product;
        if (existingProduct) {
          // Update existing product
          product = await productService.updateProduct(existingProduct.id, {
            name: productName,
            description: row.description || null,
            long_description: row.long_description || null,
            collection_id: row.collection_id || null,
            category_id: row.category_id || null,
            type_id: row.type_id || null,
            base_price: parseFloat(row.base_price),
            compare_at_price: row.compare_at_price ? parseFloat(row.compare_at_price) : null,
            primary_image_url: row.primary_image_url || null,
            image_urls: row.image_urls ? row.image_urls.split(',').map(url => url.trim()) : [],
            sku: row.sku || null,
            tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
            is_featured: row.is_featured === 'true' || row.is_featured === '1' || false,
            meta_title: row.meta_title || null,
            meta_description: row.meta_description || null,
          });
          result.updated++;
        } else {
          // Create new product
          product = await productService.createProduct({
            name: productName,
            description: row.description || null,
            long_description: row.long_description || null,
            collection_id: row.collection_id || null,
            category_id: row.category_id || null,
            type_id: row.type_id || null,
            base_price: parseFloat(row.base_price),
            compare_at_price: row.compare_at_price ? parseFloat(row.compare_at_price) : null,
            primary_image_url: row.primary_image_url || null,
            image_urls: row.image_urls ? row.image_urls.split(',').map(url => url.trim()) : [],
            sku: row.sku || null,
            tags: row.tags ? row.tags.split(',').map(t => t.trim()) : [],
            is_featured: row.is_featured === 'true' || row.is_featured === '1' || false,
            meta_title: row.meta_title || null,
            meta_description: row.meta_description || null,
          });
          result.imported++;
        }

        // STEP 4: Track success
        result.successes.push({
          row: rowNumber,
          product_id: product.id,
          product_name: product.name,
          action: existingProduct ? 'updated' : 'created',
        });

      } catch (error) {
        // STEP 5: Save error for admin to fix
        result.failed++;
        result.errors.push({
          row: rowNumber,
          data: row,
          errors: [error.message],
          type: 'processing',
        });
      }
    }

    return result;
  } catch (error) {
    throw new Error(`CSV parsing error: ${error.message}`);
  }
};

/**
 * Import variants from CSV
 */
exports.importVariants = async (csvBuffer) => {
  try {
    // STEP 1: Read the CSV
    const records = parse(csvBuffer.toString(), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const result = {
      total_rows: records.length,
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [],
      successes: [],
    };

    // STEP 2 & 3: Validate and process each row
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2;

      try {
        // STEP 2: Validate row
        const validationErrors = validateVariantRow(row, rowNumber);
        if (validationErrors.length > 0) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            data: row,
            errors: validationErrors,
            type: 'validation',
          });
          continue;
        }

        // Find product
        let productId = row.product_id;
        if (!productId) {
          if (row.product_sku) {
            const { data: product } = await supabase
              .from('products')
              .select('id')
              .eq('sku', row.product_sku)
              .single();
            productId = product?.id;
          } else if (row.product_slug) {
            const { data: product } = await supabase
              .from('products')
              .select('id')
              .eq('slug', row.product_slug)
              .single();
            productId = product?.id;
          }
        }

        if (!productId) {
          throw new Error('Product not found');
        }

        // Check if variant exists (by SKU)
        let existingVariant = null;
        if (row.sku) {
          existingVariant = await findVariantBySku(row.sku);
        }

        // STEP 3: Add or update variant
        let variant;
        if (existingVariant) {
          // Update existing variant
          variant = await variantService.updateVariant(existingVariant.id, {
            name: row.name,
            price: row.price ? parseFloat(row.price) : null,
            compare_at_price: row.compare_at_price ? parseFloat(row.compare_at_price) : null,
            color: row.color || null,
            has_blouse: row.has_blouse === 'true' || row.has_blouse === '1' || false,
            blouse_included: row.blouse_included === 'true' || row.blouse_included === '1' || false,
            size: row.size || null,
            image_url: row.image_url || null,
            stock_quantity: row.stock_quantity ? parseInt(row.stock_quantity) : 0,
            track_inventory: row.track_inventory !== 'false' && row.track_inventory !== '0',
          });
          result.updated++;
        } else {
          // Create new variant
          variant = await variantService.createVariant({
            product_id: productId,
            name: row.name,
            sku: row.sku || null,
            price: row.price ? parseFloat(row.price) : null,
            compare_at_price: row.compare_at_price ? parseFloat(row.compare_at_price) : null,
            color: row.color || null,
            has_blouse: row.has_blouse === 'true' || row.has_blouse === '1' || false,
            blouse_included: row.blouse_included === 'true' || row.blouse_included === '1' || false,
            size: row.size || null,
            image_url: row.image_url || null,
            stock_quantity: row.stock_quantity ? parseInt(row.stock_quantity) : 0,
            track_inventory: row.track_inventory !== 'false' && row.track_inventory !== '0',
          });
          result.imported++;
        }

        // STEP 4: Track success
        result.successes.push({
          row: rowNumber,
          variant_id: variant.id,
          variant_name: variant.name,
          product_id: productId,
          action: existingVariant ? 'updated' : 'created',
        });

      } catch (error) {
        // STEP 5: Save error
        result.failed++;
        result.errors.push({
          row: rowNumber,
          data: row,
          errors: [error.message],
          type: 'processing',
        });
      }
    }

    return result;
  } catch (error) {
    throw new Error(`CSV parsing error: ${error.message}`);
  }
};

/**
 * Import stock updates from CSV
 */
exports.importStock = async (csvBuffer) => {
  try {
    // STEP 1: Read the CSV
    const records = parse(csvBuffer.toString(), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const result = {
      total_rows: records.length,
      updated: 0,
      failed: 0,
      errors: [],
      successes: [],
    };

    // STEP 2 & 3: Validate and process each row
    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowNumber = i + 2;

      try {
        // STEP 2: Validate row
        const validationErrors = validateStockRow(row, rowNumber);
        if (validationErrors.length > 0) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            data: row,
            errors: validationErrors,
            type: 'validation',
          });
          continue;
        }

        // Find variant
        let variantId = row.variant_id;
        if (!variantId) {
          const variant = await findVariantBySku(row.sku);
          if (!variant) {
            throw new Error(`Variant with SKU ${row.sku} not found`);
          }
          variantId = variant.id;
        }

        const newStock = parseInt(row.stock_quantity);
        const currentStock = parseInt(row.current_stock || '0');

        // STEP 3: Update stock
        if (row.update_method === 'set' || !row.current_stock) {
          // Set absolute value
          const { data: variant } = await supabase
            .from('variants')
            .select('stock_quantity')
            .eq('id', variantId)
            .single();

          const quantityChange = newStock - (variant?.stock_quantity || 0);
          if (quantityChange !== 0) {
            await inventoryService.adjustInventory({
              variant_id: variantId,
              quantity_change: quantityChange,
              type: 'adjustment',
              notes: `Bulk import from CSV - Set to ${newStock}`,
              reference_number: `CSV-${Date.now()}`,
            });
          }
        } else {
          // Adjust from current stock
          const quantityChange = newStock - currentStock;
          if (quantityChange !== 0) {
            await inventoryService.adjustInventory({
              variant_id: variantId,
              quantity_change: quantityChange,
              type: 'adjustment',
              notes: `Bulk import from CSV - Adjusted by ${quantityChange}`,
              reference_number: `CSV-${Date.now()}`,
            });
          }
        }

        // STEP 4: Track success
        result.successes.push({
          row: rowNumber,
          variant_id: variantId,
          sku: row.sku || row.variant_id,
          stock_quantity: newStock,
        });
        result.updated++;

      } catch (error) {
        // STEP 5: Save error
        result.failed++;
        result.errors.push({
          row: rowNumber,
          data: row,
          errors: [error.message],
          type: 'processing',
        });
      }
    }

    return result;
  } catch (error) {
    throw new Error(`CSV parsing error: ${error.message}`);
  }
};

/**
 * Import offers from CSV
 */
exports.importOffers = async (csvBuffer) => {
  try {
    const records = parse(csvBuffer.toString(), {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const result = {
      total_rows: records.length,
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [],
      successes: [],
    };

    // Placeholder - implement when offers table is created
    throw new Error('Offers table not yet created. Please create the offers table first.');

    return result;
  } catch (error) {
    throw new Error(`CSV parsing error: ${error.message}`);
  }
};

/**
 * Generate error report CSV (for admin to download and fix)
 */
exports.generateErrorReport = (errors, originalHeaders) => {
  if (errors.length === 0) {
    return null;
  }

  // Create CSV with errors
  const headers = [...originalHeaders, 'error_message', 'error_type'];
  const rows = errors.map(err => {
    const row = [...Object.values(err.data)];
    row.push(err.errors.join('; '));
    row.push(err.type);
    return row;
  });

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csv;
};
