/**
 * Utility helper functions
 */

/**
 * Generate unique order number
 */
exports.generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp}-${random}`;
};

/**
 * Generate slug from text
 */
exports.generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Format currency (Indian Rupees)
 */
exports.formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Validate email
 */
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 */
exports.isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, '')); // Remove non-digits
};

/**
 * Calculate pagination
 */
exports.getPagination = (page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  return { offset, limit };
};

/**
 * Sanitize input (basic XSS prevention)
 */
exports.sanitizeInput = (input) => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Generate SKU abbreviation from text
 * Takes first 3-4 letters of each word, uppercase
 */
exports.generateSKUAbbreviation = (text) => {
  if (!text) return '';
  
  const words = text
    .toUpperCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .split(/\s+/)
    .filter(Boolean);
  
  if (words.length === 0) return '';
  
  // If single word, take first 3-4 characters
  if (words.length === 1) {
    return words[0].substring(0, 4).toUpperCase();
  }
  
  // If multiple words, take first 2-3 chars of each
  return words
    .map(word => word.substring(0, 3))
    .join('')
    .substring(0, 6)
    .toUpperCase();
};

/**
 * Generate product SKU automatically
 * Format: [TYPE]-[COLOR]-[NUMBER]
 * Example: CHF-RED-001, COT-MAROON-002
 */
exports.generateProductSKU = async (supabase, name, typeId, typeSlug, color, existingSKU = null) => {
  // If SKU is already provided, use it
  if (existingSKU) return existingSKU;
  
  // Get type abbreviation
  let typeAbbr = 'PRD';
  if (typeSlug) {
    // Use type slug to generate abbreviation
    typeAbbr = exports.generateSKUAbbreviation(typeSlug.replace('-saree', '').replace('-', ' '));
  } else if (typeId) {
    // Fetch type if we have ID but not slug
    const { data: typeData } = await supabase
      .from('types')
      .select('slug')
      .eq('id', typeId)
      .single();
    
    if (typeData?.slug) {
      typeAbbr = exports.generateSKUAbbreviation(typeData.slug.replace('-saree', '').replace('-', ' '));
    }
  }
  
  // Get color abbreviation
  const colorAbbr = color ? exports.generateSKUAbbreviation(color) : 'GEN';
  
  // Find the next sequential number for this type-color combination
  const prefix = `${typeAbbr}-${colorAbbr}`;
  
  // Count existing products with similar SKU pattern
  const { data: existingProducts } = await supabase
    .from('products')
    .select('sku')
    .like('sku', `${prefix}-%`);
  
  // Find the highest number
  let maxNumber = 0;
  if (existingProducts && existingProducts.length > 0) {
    existingProducts.forEach(product => {
      if (product.sku) {
        const match = product.sku.match(/-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) maxNumber = num;
        }
      }
    });
  }
  
  // Generate next number (3 digits, zero-padded)
  const nextNumber = String(maxNumber + 1).padStart(3, '0');
  
  return `${prefix}-${nextNumber}`;
};

/**
 * Generate variant SKU automatically
 * Format: [PRODUCT_SKU]-V[NUMBER]
 * Example: CHF-RED-001-V1, CHF-RED-001-V2
 */
exports.generateVariantSKU = async (supabase, productId, productSKU, existingSKU = null) => {
  // If SKU is already provided, use it
  if (existingSKU) return existingSKU;
  
  // Get product SKU if not provided
  let baseSKU = productSKU;
  if (!baseSKU && productId) {
    const { data: productData } = await supabase
      .from('products')
      .select('sku')
      .eq('id', productId)
      .single();
    
    baseSKU = productData?.sku || 'VAR';
  }
  
  if (!baseSKU) {
    baseSKU = 'VAR';
  }
  
  // Find the next variant number for this product
  const { data: existingVariants } = await supabase
    .from('variants')
    .select('sku')
    .eq('product_id', productId)
    .like('sku', `${baseSKU}-V%`);
  
  // Find the highest variant number
  let maxVariant = 0;
  if (existingVariants && existingVariants.length > 0) {
    existingVariants.forEach(variant => {
      if (variant.sku) {
        const match = variant.sku.match(/-V(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxVariant) maxVariant = num;
        }
      }
    });
  }
  
  // Generate next variant number
  const nextVariant = maxVariant + 1;
  
  return `${baseSKU}-V${nextVariant}`;
};
