# Admin Features Implementation Plan

## Current Status Assessment

### ✅ Already Implemented

1. **CSV Import (Basic)**
   - ✅ Backend route: `backend/routes/csv-import.js`
   - ✅ Controller: `backend/controllers/csvImportController.js`
   - ✅ Service: `backend/services/csvImportService.js`
   - ✅ Frontend page: `frontend/src/app/admin/import/page.tsx`
   - ✅ Supports: Products, Variants, Stock, Offers

2. **Inventory Management (Basic)**
   - ✅ Backend route: `backend/routes/inventory.js`
   - ✅ Controller: `backend/controllers/inventoryController.js`
   - ✅ Service: `backend/services/inventoryService.js`
   - ✅ Features: Reserve, Commit, Release stock
   - ✅ Admin: Adjust inventory, view history

3. **Admin UI Structure**
   - ✅ Admin dashboard: `/admin`
   - ✅ Products management: `/admin/products`
   - ✅ CSV import page: `/admin/import`

### ❌ Missing Features (From ADMIN_MANAGEMENT_COMPLETE.md)

1. **CSV Import Enhancements**
   - ❌ Preview endpoint (validate before import)
   - ❌ Import history tracking
   - ❌ Preview UI with validation markers
   - ❌ Column mapping UI

2. **Inventory Management Enhancements**
   - ❌ Stock levels dashboard (with low-stock alerts)
   - ❌ Bulk stock update endpoint
   - ❌ Stock adjustment history table
   - ❌ Inline stock editing in products table

3. **Audit System**
   - ❌ `audit_logs` table
   - ❌ Audit middleware
   - ❌ Audit log viewer UI

4. **Database Tables**
   - ❌ `audit_logs` table
   - ❌ `stock_adjustments` table
   - ❌ `import_logs` table

---

## Implementation Plan

### Phase 1: Database Schema (Priority: High)

#### 1.1 Create Audit Logs Table
```sql
-- File: backend/migrations/create_audit_tables.sql
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES user_profiles(id),
  actor_email TEXT,
  action TEXT NOT NULL, -- 'product.create', 'product.update', etc.
  resource_type TEXT NOT NULL, -- 'product', 'order', etc.
  resource_id UUID,
  before_data JSONB,
  after_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

#### 1.2 Create Stock Adjustments Table
```sql
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID REFERENCES variants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  previous_stock INT NOT NULL,
  new_stock INT NOT NULL,
  delta INT NOT NULL, -- new_stock - previous_stock
  reason TEXT,
  adjusted_by_id UUID REFERENCES user_profiles(id),
  adjusted_by_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_stock_adjustments_variant ON stock_adjustments(variant_id);
CREATE INDEX idx_stock_adjustments_product ON stock_adjustments(product_id);
CREATE INDEX idx_stock_adjustments_created_at ON stock_adjustments(created_at DESC);
```

#### 1.3 Create Import Logs Table
```sql
CREATE TABLE IF NOT EXISTS import_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_type TEXT NOT NULL, -- 'products', 'variants', 'stock', 'offers'
  file_name TEXT,
  total_rows INT,
  imported_count INT DEFAULT 0,
  updated_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  errors JSONB, -- Array of error objects
  imported_by_id UUID REFERENCES user_profiles(id),
  imported_by_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_import_logs_type ON import_logs(import_type);
CREATE INDEX idx_import_logs_status ON import_logs(status);
CREATE INDEX idx_import_logs_created_at ON import_logs(created_at DESC);
```

---

### Phase 2: Backend Enhancements (Priority: High)

#### 2.1 CSV Import Preview Endpoint
**File:** `backend/routes/csv-import.js`
```javascript
router.post('/preview', uploadSingle, csvImportController.previewImport);
```

**File:** `backend/controllers/csvImportController.js`
```javascript
exports.previewImport = async (req, res) => {
  // Parse CSV, validate first 50 rows
  // Return preview with validation errors
  // Don't import, just validate
};
```

#### 2.2 CSV Import History Endpoint
```javascript
router.get('/history', authenticate, isAdmin, csvImportController.getImportHistory);
```

#### 2.3 Stock Levels Dashboard Endpoint
**File:** `backend/routes/inventory.js`
```javascript
router.get('/stock-levels', authenticate, isAdmin, inventoryController.getStockLevels);
```

#### 2.4 Bulk Stock Update Endpoint
```javascript
router.post('/bulk-stock', authenticate, isAdmin, inventoryController.bulkUpdateStock);
```

#### 2.5 Stock Adjustment History Endpoint
```javascript
router.get('/adjustments', authenticate, isAdmin, inventoryController.getStockAdjustments);
```

#### 2.6 Audit Middleware
**File:** `backend/middleware/audit.js` (NEW)
```javascript
const logAudit = async (actorId, actorEmail, action, resourceType, resourceId, beforeData, afterData, req) => {
  // Log to audit_logs table
};

const auditMiddleware = (action) => {
  return async (req, res, next) => {
    // Auto-log route actions
  };
};
```

---

### Phase 3: Frontend UI (Priority: Medium)

#### 3.1 Enhanced CSV Import Page
**File:** `frontend/src/app/admin/import/page.tsx`

**Add:**
- Preview step before import
- Preview table with validation markers
- Import history table
- Progress indicator

#### 3.2 Inventory Management Page (NEW)
**File:** `frontend/src/app/admin/inventory/page.tsx`

**Features:**
- Stock levels table with low-stock alerts
- Inline stock editing
- Bulk update modal
- Stock adjustment history

#### 3.3 Audit Log Viewer (NEW)
**File:** `frontend/src/app/admin/audit/page.tsx`

**Features:**
- Filterable audit log table
- Before/after diff viewer
- Filter by user, action, resource type, date range

#### 3.4 Stock History Page (NEW)
**File:** `frontend/src/app/admin/stock-history/page.tsx`

**Features:**
- All stock adjustments
- Filter by product
- Delta indicators (green/red)

---

## Implementation Order

### Week 1: Database & Backend Core
1. ✅ Create migration SQL files
2. ✅ Run migrations in Supabase
3. ✅ Create audit middleware
4. ✅ Add audit logging to existing routes
5. ✅ Enhance CSV import with preview
6. ✅ Add import history tracking

### Week 2: Inventory Enhancements
1. ✅ Add stock levels endpoint
2. ✅ Add bulk stock update endpoint
3. ✅ Add stock adjustment logging
4. ✅ Add stock adjustment history endpoint

### Week 3: Frontend UI
1. ✅ Enhance CSV import page with preview
2. ✅ Create inventory management page
3. ✅ Add inline stock editing to products table
4. ✅ Create audit log viewer
5. ✅ Create stock history page

---

## Quick Wins (Can Implement Now)

### 1. Add Preview to CSV Import (2-3 hours)
- Add preview endpoint
- Update frontend to show preview before import

### 2. Stock Levels Dashboard (2-3 hours)
- Add stock levels endpoint
- Create simple inventory page

### 3. Audit Logging (3-4 hours)
- Create audit_logs table
- Add basic audit middleware
- Log product updates

---

## Compatibility Notes

### Current System Uses:
- **Backend:** Express.js (JavaScript)
- **Database:** Supabase (PostgreSQL)
- **Frontend:** Next.js 16 (TypeScript/React)
- **Auth:** JWT tokens

### The ADMIN_MANAGEMENT_COMPLETE.md References:
- TypeScript backend (`backend/src/routes/csv-import.ts`)
- Different file structure

### Adaptation Needed:
- Convert TypeScript examples to JavaScript
- Adapt to current file structure
- Use existing Supabase client setup
- Match current authentication pattern

---

## Recommended Next Steps

1. **Start with Database Migrations** (30 min)
   - Create the 3 SQL migration files
   - Run them in Supabase SQL Editor

2. **Add CSV Preview** (2-3 hours)
   - Easiest win, high value
   - Users can validate before importing

3. **Add Stock Levels Dashboard** (2-3 hours)
   - Very useful for admin
   - Shows low stock alerts

4. **Add Basic Audit Logging** (3-4 hours)
   - Log product updates
   - Log stock adjustments
   - Simple viewer

5. **Enhance Frontend UI** (1-2 days)
   - Better CSV import UX
   - Inventory management dashboard
   - Audit log viewer

---

## Files to Create/Modify

### New Files:
- `backend/migrations/create_audit_tables.sql`
- `backend/middleware/audit.js`
- `frontend/src/app/admin/inventory/page.tsx`
- `frontend/src/app/admin/audit/page.tsx`
- `frontend/src/app/admin/stock-history/page.tsx`

### Modify Existing:
- `backend/routes/csv-import.js` - Add preview/history routes
- `backend/controllers/csvImportController.js` - Add preview/history methods
- `backend/routes/inventory.js` - Add stock-levels, bulk-update routes
- `backend/controllers/inventoryController.js` - Add new methods
- `frontend/src/app/admin/import/page.tsx` - Add preview UI
- `frontend/src/app/admin/products/page.tsx` - Add inline stock editing

---

## Testing Checklist

- [ ] CSV preview validates correctly
- [ ] CSV import logs to import_logs table
- [ ] Stock adjustments logged to stock_adjustments table
- [ ] Audit logs capture product updates
- [ ] Stock levels endpoint returns correct data
- [ ] Bulk stock update works
- [ ] Frontend pages load without errors
- [ ] Admin authentication works on all new routes

---

**Status:** Ready to implement. All features are compatible with current architecture.



