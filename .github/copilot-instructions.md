# Saree4Ever - AI Coding Agent Instructions

## Project Overview
E-commerce platform for sarees with separate frontend (Next.js 16/Vercel) and backend (Express/Render) deployments. Database is Supabase (PostgreSQL).

## Architecture

### Directory Structure
```
saree4ever/
├── frontend/          # Next.js 16 App Router (TypeScript, Tailwind)
│   └── src/
│       ├── app/       # Route handlers (file-based routing)
│       ├── components/# UI components + admin/ subfolder
│       ├── contexts/  # React contexts (CartContext, WishlistContext)
│       ├── hooks/     # Custom hooks
│       └── lib/       # API client, Supabase client, utilities
├── backend/           # Express.js REST API (JavaScript)
│   ├── routes/        # Express route definitions
│   ├── controllers/   # Request handlers
│   ├── services/      # Business logic (Supabase queries)
│   ├── middleware/    # Auth, validation
│   ├── config/        # Database connections (db.js)
│   └── utils/         # Helpers (slug generation, SKU generation)
```

### Data Flow Pattern
1. **Frontend API calls**: `src/lib/api.ts` wraps all backend requests with auth headers
2. **Backend routing**: `routes/*.js` → `controllers/*.js` → `services/*.js`
3. **Database**: Services use Supabase client from `config/db.js`, NOT direct SQL

### Key Tables (Many-to-Many Relationships)
- Products link to collections/categories/types via junction tables
- Product variants hold stock (not products table)
- Stock changes logged to `stock_adjustments` table

## Development Commands

### Frontend (in `/frontend`)
```bash
npm run dev          # Start Next.js dev server (localhost:3000)
npm run build        # Build for production
```

### Backend (in `/backend`)
```bash
npm run dev          # Start with nodemon (localhost:5001)
npm start            # Production start (server.js)
```

**Important**: Backend uses `server.js` (CommonJS), NOT the TypeScript entry in `src/index.ts`.

## Code Patterns

### Backend Service Layer
All database operations go through service files. Example pattern:
```javascript
// services/productService.js
const { supabase } = require('../config/db');

exports.getProductById = async (id) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, variants(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
};
```

### Frontend API Wrapper
Use the centralized API client, never raw fetch:
```typescript
// Use this pattern:
import { api } from '@/lib/api';
const products = await api.products.getAll(filters);

// NOT this:
const res = await fetch('/api/products'); // Don't do this
```

### Admin Routes Pattern
Admin routes require `authenticate` + `isAdmin` middleware:
```javascript
router.post('/', authenticate, isAdmin, controller.create);
```

### Cart & Wishlist
- Cart stored in `localStorage` (client-side only)
- Stock deducted at checkout (`POST /api/orders`), not when adding to cart
- Use `CartContext` and `WishlistContext` for state management

## Environment Variables

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Backend (`backend/.env`)
```
PORT=5001
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...  # Admin operations
SUPABASE_ANON_KEY=...
JWT_SECRET=...
FRONTEND_URL=http://localhost:3000  # CORS
```

## Naming Conventions
- **Routes**: kebab-case (`/api/hero-slides`, `/api/landing-page-sections`)
- **Database tables**: snake_case (`product_variants`, `stock_adjustments`)
- **React components**: PascalCase files in `/components`
- **Service files**: camelCase (`productService.js`, `orderService.js`)

## Common Pitfalls

1. **CORS issues**: Backend checks `FRONTEND_URL` env var. Ensure it matches exactly (no trailing slash).

2. **Cold starts**: Backend on Render free tier has cold starts. Frontend API client has 60s timeout.

3. **Stock management**: Stock is on `product_variants` table, not `products`. Always update variant stock.

4. **Auth tokens**: Frontend stores JWT in `localStorage` as both `token` and `admin_token`. API wrapper attaches automatically.

5. **Image URLs**: Products use `primary_image_url` field. Variants can have their own `image_url`.

## Key Files for Common Tasks

| Task | Files to Modify |
|------|----------------|
| Add new API endpoint | `backend/routes/`, `backend/controllers/`, `backend/services/` |
| Add frontend page | `frontend/src/app/[route]/page.tsx` |
| Add admin feature | `frontend/src/app/admin/[feature]/`, `frontend/src/components/admin/` |
| Modify database query | `backend/services/*Service.js` |
| Update API client | `frontend/src/lib/api.ts` |
| Add auth middleware | `backend/middleware/auth.js` |
