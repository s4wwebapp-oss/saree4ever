const csvImportService = require('../services/csvImportService');
const fs = require('fs');
const path = require('path');

/**
 * Import products from CSV
 * STEP 1: Read CSV
 * STEP 2: Validate each row
 * STEP 3: Add or update products
 * STEP 4: Send back report
 * STEP 5: Save errors for re-upload
 */
exports.importProducts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    // STEP 1-4: Process CSV
    const result = await csvImportService.importProducts(req.file.buffer);

    // STEP 5: Save error report if there are errors
    let errorReportPath = null;
    if (result.errors.length > 0) {
      const errorReport = csvImportService.generateErrorReport(
        result.errors,
        Object.keys(result.errors[0]?.data || {})
      );
      
      if (errorReport) {
        const errorFileName = `product-import-errors-${Date.now()}.csv`;
        const errorFilePath = path.join(__dirname, '../../uploads', errorFileName);
        
        // Ensure uploads directory exists
        const uploadsDir = path.dirname(errorFilePath);
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        fs.writeFileSync(errorFilePath, errorReport);
        errorReportPath = `/uploads/${errorFileName}`;
      }
    }

    // Log import to import_logs table
    const { logImport } = require('../middleware/audit');
    const user_id = req.user?.id;
    const user_email = req.user?.email;
    
    await logImport(
      'products',
      req.file.originalname,
      result.total_rows,
      result.imported,
      result.updated,
      result.failed,
      result.failed > 0 ? 'completed' : 'completed',
      result.errors,
      user_id,
      user_email
    );

    // STEP 4: Send back detailed report
    res.json({
      message: 'Product import completed',
      summary: {
        total_rows: result.total_rows,
        imported: result.imported,
        updated: result.updated,
        failed: result.failed,
        success_rate: `${((result.imported + result.updated) / result.total_rows * 100).toFixed(1)}%`,
      },
      successes: result.successes.slice(0, 10), // First 10 successes
      errors: result.errors.slice(0, 20), // First 20 errors
      error_report_url: errorReportPath,
      has_more_errors: result.errors.length > 20,
      has_more_successes: result.successes.length > 10,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Import variants from CSV
 */
exports.importVariants = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const result = await csvImportService.importVariants(req.file.buffer);

    // Save error report if there are errors
    let errorReportPath = null;
    if (result.errors.length > 0) {
      const errorReport = csvImportService.generateErrorReport(
        result.errors,
        Object.keys(result.errors[0]?.data || {})
      );
      
      if (errorReport) {
        const errorFileName = `variant-import-errors-${Date.now()}.csv`;
        const errorFilePath = path.join(__dirname, '../../uploads', errorFileName);
        
        const uploadsDir = path.dirname(errorFilePath);
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        fs.writeFileSync(errorFilePath, errorReport);
        errorReportPath = `/uploads/${errorFileName}`;
      }
    }

    res.json({
      message: 'Variant import completed',
      summary: {
        total_rows: result.total_rows,
        imported: result.imported,
        updated: result.updated,
        failed: result.failed,
        success_rate: `${((result.imported + result.updated) / result.total_rows * 100).toFixed(1)}%`,
      },
      successes: result.successes.slice(0, 10),
      errors: result.errors.slice(0, 20),
      error_report_url: errorReportPath,
      has_more_errors: result.errors.length > 20,
      has_more_successes: result.successes.length > 10,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Import stock updates from CSV
 */
exports.importStock = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const result = await csvImportService.importStock(req.file.buffer);

    // Save error report if there are errors
    let errorReportPath = null;
    if (result.errors.length > 0) {
      const errorReport = csvImportService.generateErrorReport(
        result.errors,
        Object.keys(result.errors[0]?.data || {})
      );
      
      if (errorReport) {
        const errorFileName = `stock-import-errors-${Date.now()}.csv`;
        const errorFilePath = path.join(__dirname, '../../uploads', errorFileName);
        
        const uploadsDir = path.dirname(errorFilePath);
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        fs.writeFileSync(errorFilePath, errorReport);
        errorReportPath = `/uploads/${errorFileName}`;
      }
    }

    res.json({
      message: 'Stock import completed',
      summary: {
        total_rows: result.total_rows,
        updated: result.updated,
        failed: result.failed,
        success_rate: `${(result.updated / result.total_rows * 100).toFixed(1)}%`,
      },
      successes: result.successes.slice(0, 10),
      errors: result.errors.slice(0, 20),
      error_report_url: errorReportPath,
      has_more_errors: result.errors.length > 20,
      has_more_successes: result.successes.length > 10,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get import history (admin only)
 */
exports.getImportHistory = async (req, res) => {
  try {
    const auditController = require('./auditController');
    await auditController.getImportHistory(req, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Import offers from CSV
 */
exports.importOffers = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSV file is required' });
    }

    const result = await csvImportService.importOffers(req.file.buffer);

    res.json({
      message: 'Offers import completed',
      summary: {
        total_rows: result.total_rows,
        imported: result.imported,
        updated: result.updated,
        failed: result.failed,
      },
      successes: result.successes,
      errors: result.errors,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
