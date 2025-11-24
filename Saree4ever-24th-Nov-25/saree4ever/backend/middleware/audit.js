const { supabase } = require('../config/db');

/**
 * Log an audit event to the audit_logs table
 * @param {string} actorId - User ID who performed the action
 * @param {string} actorEmail - User email
 * @param {string} action - Action type (e.g., 'product.create', 'product.update', 'stock.adjust')
 * @param {string} resourceType - Resource type (e.g., 'product', 'order', 'variant')
 * @param {string} resourceId - Resource ID (UUID)
 * @param {object} beforeData - State before the action (optional)
 * @param {object} afterData - State after the action (optional)
 * @param {object} req - Express request object (for IP and user agent)
 */
exports.logAudit = async (
  actorId,
  actorEmail,
  action,
  resourceType,
  resourceId,
  beforeData = null,
  afterData = null,
  req = null
) => {
  try {
    const auditData = {
      actor_id: actorId || null,
      actor_email: actorEmail || null,
      action,
      resource_type: resourceType,
      resource_id: resourceId || null,
      before_data: beforeData ? JSON.parse(JSON.stringify(beforeData)) : null,
      after_data: afterData ? JSON.parse(JSON.stringify(afterData)) : null,
      ip_address: req?.ip || req?.connection?.remoteAddress || null,
      user_agent: req?.get('user-agent') || null,
    };

    const { error } = await supabase.from('audit_logs').insert(auditData);

    if (error) {
      console.error('Failed to log audit:', error);
      // Don't throw - audit logging should not break the main flow
    }
  } catch (error) {
    console.error('Error in logAudit:', error);
    // Don't throw - audit logging should not break the main flow
  }
};

/**
 * Log a stock adjustment to the stock_adjustments table
 * @param {string} variantId - Variant ID
 * @param {string} productId - Product ID
 * @param {number} previousStock - Stock before adjustment
 * @param {number} newStock - Stock after adjustment
 * @param {string} reason - Reason for adjustment
 * @param {string} adjustedById - User ID who made the adjustment
 * @param {string} adjustedByEmail - User email
 */
exports.logStockAdjustment = async (
  variantId,
  productId,
  previousStock,
  newStock,
  reason = 'Admin adjustment',
  adjustedById = null,
  adjustedByEmail = null
) => {
  try {
    const delta = newStock - previousStock;

    const adjustmentData = {
      variant_id: variantId || null,
      product_id: productId || null,
      previous_stock: previousStock,
      new_stock: newStock,
      delta, // Will also be auto-calculated by trigger, but we set it here too
      reason,
      adjusted_by_id: adjustedById || null,
      adjusted_by_email: adjustedByEmail || null,
    };

    const { error } = await supabase.from('stock_adjustments').insert(adjustmentData);

    if (error) {
      console.error('Failed to log stock adjustment:', error);
      // Don't throw - logging should not break the main flow
    }
  } catch (error) {
    console.error('Error in logStockAdjustment:', error);
    // Don't throw - logging should not break the main flow
  }
};

/**
 * Log a CSV import to the import_logs table
 * @param {string} importType - Type of import ('products', 'variants', 'stock', 'offers')
 * @param {string} fileName - Name of the imported file
 * @param {number} totalRows - Total rows in CSV
 * @param {number} importedCount - Number of rows successfully imported
 * @param {number} updatedCount - Number of rows updated
 * @param {number} failedCount - Number of rows that failed
 * @param {string} status - Status ('pending', 'processing', 'completed', 'failed')
 * @param {array} errors - Array of error objects
 * @param {string} importedById - User ID who performed the import
 * @param {string} importedByEmail - User email
 */
exports.logImport = async (
  importType,
  fileName,
  totalRows = 0,
  importedCount = 0,
  updatedCount = 0,
  failedCount = 0,
  status = 'completed',
  errors = [],
  importedById = null,
  importedByEmail = null
) => {
  try {
    const importData = {
      import_type: importType,
      file_name: fileName,
      total_rows: totalRows,
      imported_count: importedCount,
      updated_count: updatedCount,
      failed_count: failedCount,
      status,
      errors: errors.length > 0 ? errors : null,
      imported_by_id: importedById || null,
      imported_by_email: importedByEmail || null,
      completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from('import_logs')
      .insert(importData)
      .select()
      .single();

    if (error) {
      console.error('Failed to log import:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in logImport:', error);
    return null;
  }
};

/**
 * Middleware to automatically log route actions
 * Usage: router.put('/:id', authenticate, auditMiddleware('product.update'), controller.update);
 * @param {string} action - Action type to log
 */
exports.auditMiddleware = (action) => {
  return async (req, res, next) => {
    // Store original json method to capture response
    const originalJson = res.json.bind(res);
    
    res.json = function (data) {
      // If this is an update/create/delete and it succeeded, log it
      if (req.method !== 'GET' && res.statusCode < 400) {
        const resourceType = action.split('.')[0]; // Extract 'product' from 'product.update'
        const resourceId = req.params.id || data?.id || data?.product?.id || null;
        
        // Get before data if available (from req.beforeData set by controller)
        const beforeData = req.beforeData || null;
        const afterData = data || null;

        // Get user info from req.user (set by authenticate middleware)
        const actorId = req.user?.id || null;
        const actorEmail = req.user?.email || null;

        // Log asynchronously (don't wait)
        exports.logAudit(
          actorId,
          actorEmail,
          action,
          resourceType,
          resourceId,
          beforeData,
          afterData,
          req
        ).catch(err => console.error('Audit logging error:', err));
      }

      return originalJson(data);
    };

    next();
  };
};

/**
 * Helper to get user info from request
 */
exports.getUserInfo = (req) => {
  return {
    id: req.user?.id || null,
    email: req.user?.email || null,
  };
};



