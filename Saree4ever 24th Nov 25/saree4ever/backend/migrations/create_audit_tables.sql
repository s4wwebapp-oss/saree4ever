-- Migration: Create Audit System Tables
-- This creates tables for tracking admin actions, stock adjustments, and import history
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. Audit Logs Table
-- ============================================
-- Tracks all admin actions (who, what, when, what changed)

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL, -- 'product.create', 'product.update', 'product.delete', 'stock.adjust', etc.
  resource_type TEXT NOT NULL, -- 'product', 'order', 'variant', 'collection', etc.
  resource_id UUID,
  before_data JSONB, -- State before the action
  after_data JSONB, -- State after the action
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_email ON audit_logs(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Add helpful comment
COMMENT ON TABLE audit_logs IS 'Audit trail of all admin actions - tracks who did what, when, and what changed';

-- ============================================
-- 2. Stock Adjustments Table
-- ============================================
-- History of all stock changes with reasons and who made them

CREATE TABLE IF NOT EXISTS stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID REFERENCES variants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  delta INT NOT NULL, -- new_stock - previous_stock (can be positive or negative)
  reason TEXT, -- 'Restock', 'Sale', 'Return', 'Damage', 'Admin adjustment', etc.
  adjusted_by_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  adjusted_by_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_variant_id ON stock_adjustments(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_product_id ON stock_adjustments(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_adjusted_by ON stock_adjustments(adjusted_by_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_created_at ON stock_adjustments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_delta ON stock_adjustments(delta);

-- Add helpful comment
COMMENT ON TABLE stock_adjustments IS 'History of all stock changes - tracks previous/new stock, delta, reason, and who made the change';

-- ============================================
-- 3. Import Logs Table
-- ============================================
-- Tracks CSV import history and results

CREATE TABLE IF NOT EXISTS import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_type TEXT NOT NULL, -- 'products', 'variants', 'stock', 'offers'
  file_name TEXT,
  total_rows INT DEFAULT 0,
  imported_count INT DEFAULT 0, -- New records created
  updated_count INT DEFAULT 0, -- Existing records updated
  failed_count INT DEFAULT 0, -- Rows that failed validation/import
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  errors JSONB, -- Array of error objects: [{"row": 2, "error": "Invalid price"}, ...]
  imported_by_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  imported_by_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_import_logs_type ON import_logs(import_type);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_logs_imported_by ON import_logs(imported_by_id);
CREATE INDEX IF NOT EXISTS idx_import_logs_created_at ON import_logs(created_at DESC);

-- Add helpful comment
COMMENT ON TABLE import_logs IS 'History of CSV imports - tracks file name, results (imported/updated/failed counts), errors, and who imported';

-- ============================================
-- 4. Helper Functions (Optional)
-- ============================================

-- Function to automatically calculate delta in stock_adjustments
CREATE OR REPLACE FUNCTION calculate_stock_delta()
RETURNS TRIGGER AS $$
BEGIN
  NEW.delta = NEW.new_stock - NEW.previous_stock;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate delta
DROP TRIGGER IF EXISTS trigger_calculate_stock_delta ON stock_adjustments;
CREATE TRIGGER trigger_calculate_stock_delta
  BEFORE INSERT OR UPDATE ON stock_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION calculate_stock_delta();

-- ============================================
-- 5. Sample Queries for Testing
-- ============================================

-- View recent audit logs
-- SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;

-- View stock adjustments for a product
-- SELECT * FROM stock_adjustments WHERE product_id = 'xxx' ORDER BY created_at DESC;

-- View import history
-- SELECT * FROM import_logs ORDER BY created_at DESC LIMIT 10;

-- View failed imports
-- SELECT * FROM import_logs WHERE status = 'failed' OR failed_count > 0 ORDER BY created_at DESC;

-- ============================================
-- Migration Complete
-- ============================================
-- All three tables have been created with proper indexes and relationships.
-- The system is now ready to track:
-- 1. All admin actions (audit_logs)
-- 2. All stock changes (stock_adjustments)
-- 3. All CSV imports (import_logs)



