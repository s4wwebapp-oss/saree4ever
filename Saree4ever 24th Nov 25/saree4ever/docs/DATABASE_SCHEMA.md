# Database Schema Documentation

## Overview

Complete database schema for Saree4ever e-commerce platform. All tables are created with Row Level Security (RLS) enabled for data protection.

## Tables Created

### 1. Collections
Stores product collections (Bridal Edit, Festive, New Arrivals, etc.)

**Columns:**
- `id` (UUID, Primary Key)
- `name` (TEXT, Unique)
- `slug` (TEXT, Unique)
- `description` (TEXT)
- `image_url` (TEXT)
- `is_active` (BOOLEAN, Default: true)
- `display_order` (INTEGER, Default: 0)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Relationships:**
- One-to-Many with `products`

### 2. Categories
Stores product categories (Bridal, Office Wear, etc.)

**Columns:**
- `id` (UUID, Primary Key)
- `name` (TEXT, Unique)
- `slug` (TEXT, Unique)
- `description` (TEXT)
- `image_url` (TEXT)
- `is_active` (BOOLEAN, Default: true)
- `display_order` (INTEGER, Default: 0)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Relationships:**
- One-to-Many with `products`

### 3. Types
Stores saree types (Kanjivaram, Banarasi, etc.)

**Columns:**
- `id` (UUID, Primary Key)
- `name` (TEXT, Unique)
- `slug` (TEXT, Unique)
- `description` (TEXT)
- `image_url` (TEXT)
- `is_active` (BOOLEAN, Default: true)
- `display_order` (INTEGER, Default: 0)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Relationships:**
- One-to-Many with `products`

### 4. Products
Main saree products table

**Columns:**
- `id` (UUID, Primary Key)
- `name` (TEXT)
- `slug` (TEXT, Unique)
- `description` (TEXT)
- `long_description` (TEXT)
- `collection_id` (UUID, Foreign Key → collections)
- `category_id` (UUID, Foreign Key → categories)
- `type_id` (UUID, Foreign Key → types)
- `base_price` (DECIMAL(10, 2))
- `compare_at_price` (DECIMAL(10, 2))
- `primary_image_url` (TEXT)
- `image_urls` (TEXT[])
- `sku` (TEXT, Unique)
- `tags` (TEXT[])
- `is_featured` (BOOLEAN, Default: false)
- `is_active` (BOOLEAN, Default: true)
- `display_order` (INTEGER, Default: 0)
- `meta_title` (TEXT)
- `meta_description` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Relationships:**
- Many-to-One with `collections`
- Many-to-One with `categories`
- Many-to-One with `types`
- One-to-Many with `variants`

### 5. Variants
Product variants (color, with/without blouse, etc.)

**Columns:**
- `id` (UUID, Primary Key)
- `product_id` (UUID, Foreign Key → products, CASCADE DELETE)
- `name` (TEXT)
- `sku` (TEXT, Unique)
- `price` (DECIMAL(10, 2))
- `compare_at_price` (DECIMAL(10, 2))
- `color` (TEXT)
- `has_blouse` (BOOLEAN, Default: false)
- `blouse_included` (BOOLEAN, Default: false)
- `size` (TEXT)
- `image_url` (TEXT)
- `stock_quantity` (INTEGER, Default: 0)
- `track_inventory` (BOOLEAN, Default: true)
- `is_active` (BOOLEAN, Default: true)
- `display_order` (INTEGER, Default: 0)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Relationships:**
- Many-to-One with `products`
- One-to-Many with `inventory`
- One-to-Many with `order_items`

### 6. Inventory
Stock change transactions

**Columns:**
- `id` (UUID, Primary Key)
- `variant_id` (UUID, Foreign Key → variants, CASCADE DELETE)
- `quantity_change` (INTEGER) - positive for additions, negative for deductions
- `quantity_before` (INTEGER)
- `quantity_after` (INTEGER)
- `type` (TEXT) - 'purchase', 'sale', 'return', 'adjustment', 'damage', 'transfer'
- `order_id` (UUID, Optional)
- `reference_number` (TEXT)
- `notes` (TEXT)
- `user_id` (UUID, Foreign Key → auth.users)
- `created_at` (TIMESTAMPTZ)

**Relationships:**
- Many-to-One with `variants`
- Optional relationship with `orders`

### 7. Orders
Customer orders

**Columns:**
- `id` (UUID, Primary Key)
- `order_number` (TEXT, Unique)
- `user_id` (UUID, Foreign Key → auth.users)
- `email` (TEXT)
- `phone` (TEXT)
- `shipping_name` (TEXT)
- `shipping_address_line1` (TEXT)
- `shipping_address_line2` (TEXT)
- `shipping_city` (TEXT)
- `shipping_state` (TEXT)
- `shipping_postal_code` (TEXT)
- `shipping_country` (TEXT, Default: 'India')
- `billing_name` (TEXT)
- `billing_address_line1` (TEXT)
- `billing_address_line2` (TEXT)
- `billing_city` (TEXT)
- `billing_state` (TEXT)
- `billing_postal_code` (TEXT)
- `billing_country` (TEXT)
- `subtotal` (DECIMAL(10, 2))
- `tax_amount` (DECIMAL(10, 2), Default: 0)
- `shipping_amount` (DECIMAL(10, 2), Default: 0)
- `discount_amount` (DECIMAL(10, 2), Default: 0)
- `total_amount` (DECIMAL(10, 2))
- `payment_status` (TEXT) - 'pending', 'paid', 'failed', 'refunded'
- `payment_method` (TEXT)
- `payment_transaction_id` (TEXT)
- `status` (TEXT) - 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'
- `tracking_number` (TEXT)
- `shipped_at` (TIMESTAMPTZ)
- `delivered_at` (TIMESTAMPTZ)
- `customer_notes` (TEXT)
- `admin_notes` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Relationships:**
- Many-to-One with `auth.users`
- One-to-Many with `order_items`

### 8. Order Items
Items in each order

**Columns:**
- `id` (UUID, Primary Key)
- `order_id` (UUID, Foreign Key → orders, CASCADE DELETE)
- `variant_id` (UUID, Foreign Key → variants)
- `product_id` (UUID, Foreign Key → products)
- `product_name` (TEXT) - snapshot at time of order
- `variant_name` (TEXT)
- `sku` (TEXT)
- `unit_price` (DECIMAL(10, 2))
- `quantity` (INTEGER, > 0)
- `total_price` (DECIMAL(10, 2))
- `product_image_url` (TEXT) - snapshot
- `variant_image_url` (TEXT) - snapshot
- `created_at` (TIMESTAMPTZ)

**Relationships:**
- Many-to-One with `orders`
- Many-to-One with `variants`
- Many-to-One with `products`

### 9. User Profiles
Extended user information (extends auth.users)

**Columns:**
- `id` (UUID, Primary Key, Foreign Key → auth.users, CASCADE DELETE)
- `full_name` (TEXT)
- `phone` (TEXT)
- `avatar_url` (TEXT)
- `address_line1` (TEXT)
- `address_line2` (TEXT)
- `city` (TEXT)
- `state` (TEXT)
- `postal_code` (TEXT)
- `country` (TEXT, Default: 'India')
- `email_notifications` (BOOLEAN, Default: true)
- `sms_notifications` (BOOLEAN, Default: false)
- `is_active` (BOOLEAN, Default: true)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

**Relationships:**
- One-to-One with `auth.users`

## Security (RLS Policies)

All tables have Row Level Security (RLS) enabled:

- **Public Read Access**: Collections, Categories, Types, Products, Variants (active items only)
- **User Access**: Users can view/update their own profiles and orders
- **Service Role**: Full access for backend operations

## Indexes

All tables have appropriate indexes for:
- Foreign keys
- Unique constraints (slug, sku, etc.)
- Frequently queried fields (is_active, status, etc.)
- Search optimization

## Triggers

- **Auto-update timestamps**: `updated_at` automatically updates on row changes
- **Auto-create profiles**: User profile automatically created when user signs up

## Next Steps

1. **Seed Initial Data**: Add sample collections, categories, and types
2. **Create API Endpoints**: Build REST API for CRUD operations
3. **Add Product Images**: Upload images to `product-media` storage bucket
4. **Set up Order Number Generation**: Create function to generate unique order numbers

