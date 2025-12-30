# Frontend UI Update Plan

## Current Status from Browser Testing

### ✅ Already Modern (Working)
- `/collections/[id]` — Enhanced filters, modern design
- `/categories/[slug]` — Enhanced filters, modern design
- `/types/[slug]` — Enhanced filters, modern design
- `/search` — Enhanced filters, modern design
- `/admin/*` — All admin pages have modern UI

### ❌ Needs Update (Old Design)
- `/` (Homepage) — Old basic design
- `/product/[id]` — Needs taxonomy badges
- Navbar — No category/type menus
- ProductCard component — Old styling

---

## Updates Needed

### 1. Homepage
Add sections for:
- Categories grid (11 category cards)
- Types/Fabrics grid (featured types)
- Keep existing hero, featured, new arrivals

### 2. Navbar
Add dropdown menus for:
- Categories (11 items)
- Types (top 10-12 popular types)

### 3. Product Detail Page
Add:
- Category badges
- Type/Fabric badges
- Attributes (color, weave, length, blouse)

### 4. ProductCard Component
Modernize styling to match new design system

---

## Implementation Order

1. Update ProductCard component (affects all pages)
2. Update Homepage (add category/type sections)
3. Update Navbar (add dropdowns)
4. Update Product Detail (add taxonomy)

Starting now...
