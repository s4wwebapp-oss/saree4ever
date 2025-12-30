# Demo Data Catalog

This document lists all the demo data found in the backend seed scripts (`seed-mock-data.js`, `seed-blouses.js`, `seed-specific-sarees.js`).

## 1. Collections
*Collections are curated groups of products, often used for homepage sections or special themes.*

| Name | Slug | Description |
|------|------|-------------|
| **New Arrivals** | `new-arrivals` | Latest saree collections just arrived |
| **Kanjivaram** | `kanjivaram` | Traditional Kanjivaram silk sarees |
| **Banarasi** | `banarasi` | Elegant Banarasi silk sarees |
| **Designer** | `designer` | Exclusive designer saree collection |
| **Handloom Heritage** | `handloom-heritage` | Authentic handwoven sarees from artisans |
| **Bridal Edit** | `bridal-edit` | Curated collection for the modern bride |
| **Pure Silk Classics** | `pure-silk-classics` | Timeless pure silk sarees |

## 2. Categories
*Categories are the primary classification for products, usually based on fabric or main product type.*

| Name | Slug | Description | Source |
|------|------|-------------|--------|
| **Silk** | `silk` | Pure silk sarees | `seed-mock-data.js` |
| **Cotton** | `cotton` | Comfortable cotton sarees | `seed-mock-data.js` |
| **Georgette** | `georgette` | Elegant georgette sarees | `seed-mock-data.js` |
| **Chiffon** | `chiffon` | Lightweight chiffon sarees | `seed-mock-data.js`, `seed-specific-sarees.js` |
| **Linen** | `linen` | Breathable linen sarees | `seed-mock-data.js` |
| **Readymade Blouses** | `readymade-blouses` | Designer readymade blouses | `seed-blouses.js` |
| **Designer** | `designer-cat` | Exclusive designer sarees | `seed-specific-sarees.js` |
| **Satin** | `satin` | Smooth and glossy Japan Satin sarees | `seed-specific-sarees.js` |

## 3. Types
*Types describe the style or occasion of the product.*

| Name | Slug | Description |
|------|------|-------------|
| **Traditional** | `traditional` | Traditional saree designs |
| **Modern** | `modern` | Modern contemporary designs |
| **Bridal** | `bridal` | Bridal saree collection |
| **Party Wear** | `party-wear` | Sarees for special occasions |
| **Designer** | `designer-type` | Designer wear (Specific Saree Seed) |
| **Daily Wear** | `daily-wear` | Comfortable daily wear (Specific Saree Seed) |

## 4. Products & Variants
*Products are the individual items. Variants are specific versions (e.g., Color, Size) of a product.*

### A. Silk Sarees
| Product Name | Slug | Type | Variants (SKU) |
|--------------|------|------|----------------|
| **Kanjivaram Pure Silk Saree** | `kanjivaram-pure-silk` | Traditional | • Maroon (KAN-PURE-MAR-001)<br>• Gold (KAN-PURE-GLD-002) |
| **Royal Bridal Banarasi** | `royal-bridal-banarasi` | Bridal | • Red (BAN-BRD-RED-001) |
| **Tussar Silk Handpaint** | `tussar-silk-handpaint` | Modern | Standard |
| **Mysore Silk Gold Zari** | `mysore-silk-gold-zari` | Traditional | Standard |
| **Raw Silk Temple Border** | `raw-silk-temple-border` | Traditional | Standard |
| **Ho Silk Traditional Saree** | `ho-silk-traditional` | Traditional | Standard (HO-SILK--001) |
| **Ho Silk Contemporary Weave** | `ho-silk-contemporary` | Designer | Standard (HO-SILK--001) |

### B. Cotton Sarees
| Product Name | Slug | Type | Variants |
|--------------|------|------|----------|
| **Cotton Handloom Saree** | `cotton-handloom-saree` | Traditional | Standard |
| **Chettinad Cotton Checks** | `chettinad-cotton-checks` | Traditional | Standard |
| **Sungudi Cotton Madurai** | `sungudi-cotton-madurai` | Traditional | Standard |
| **Bengal Cotton Tant** | `bengal-cotton-tant` | Traditional | Standard |
| **Organic Cotton Block Print** | `organic-cotton-block-print` | Modern | Standard |
| **Handblock Printed Indigo Cotton** | `handblock-indigo-cotton` | Daily Wear | Standard |
| **Mulmul Cotton Saree** | `mulmul-cotton-white` | Traditional | Standard |

### C. Georgette Sarees
| Product Name | Slug | Type | Variants |
|--------------|------|------|----------|
| **Designer Georgette Saree** | `designer-georgette-saree` | Modern | Standard |
| **Banarasi Georgette** | `banarasi-georgette` | Party Wear | Standard |
| **Floral Print Georgette** | `floral-print-georgette` | Modern | Standard |
| **Embroidered Georgette Party** | `embroidered-georgette-party` | Party Wear | Standard |
| **Chikankari Georgette Lucknowi** | `chikankari-georgette-lucknowi` | Traditional | Standard |

### D. Chiffon Sarees
| Product Name | Slug | Type | Variants |
|--------------|------|------|----------|
| **Pure Chiffon Floral** | `pure-chiffon-floral` | Modern | Standard |
| **Plain Chiffon with Zari** | `plain-chiffon-with-zari` | Party Wear | Standard |
| **Gradient Chiffon Ombre** | `gradient-chiffon-ombre` | Modern | Standard |
| **Bollywood Style Chiffon** | `bollywood-style-chiffon` | Party Wear | Standard |
| **Printed Chiffon Daily** | `printed-chiffon-daily` | Modern | Standard |
| **Electric Blue Chiffon Saree** | `electric-blue-chiffon` | Party Wear | Standard |
| **Floral Print Soft Chiffon** | `floral-print-soft-chiffon` | Daily Wear | Standard |

### E. Linen Sarees
| Product Name | Slug | Type | Variants |
|--------------|------|------|----------|
| **Linen Cotton Checks** | `linen-cotton-checks` | Modern | Standard |
| **Pure Linen Jamdani** | `pure-linen-jamdani` | Traditional | Standard |
| **Linen Silver Zari** | `linen-silver-zari` | Modern | Standard |
| **Handwoven Linen Floral** | `handwoven-linen-floral` | Traditional | Standard |
| **Linen Silk Blend** | `linen-silk-blend` | Modern | Standard |

### F. Readymade Blouses
*All blouses generate size variants: 34, 36, 38, 40, 42*
| Product Name | SKU Base | Price |
|--------------|----------|-------|
| **Classic Golden Tissue Blouse** | `BL-GOLD-001` | 1899.00 |
| **Maroon Velvet Embroidered Blouse** | `BL-MAR-VEL-002` | 2499.00 |
| **Black Ikkat Cotton Blouse** | `BL-BLK-IKK-003` | 1299.00 |
| **Pink Silk Brocade Blouse** | `BL-PNK-BRO-004` | 1599.00 |
| **Silver Sequin Party Blouse** | `BL-SLV-SEQ-005` | 2199.00 |
| **Green Kalamkari Boat Neck** | `BL-GRN-KAL-006` | 1499.00 |

### G. Other Specific Sarees
| Product Name | Category | Type | Variants |
|--------------|----------|------|----------|
| **Sequin Embellished Net Saree** | Designer | Designer | Standard |
| **Ruffle Border Saree** | Designer | Designer | Standard |
| **Japan Satin Ombre Saree** | Satin | Party Wear | Standard |
| **Solid Black Japan Satin** | Satin | Party Wear | Standard |
