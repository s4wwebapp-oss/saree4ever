const { supabase } = require('../config/db');
const { generateSlug, generateProductSKU } = require('../utils/helpers');

/**
 * Get all products with optional filters
 * Now supports many-to-many relationships via junction tables
 * Enhanced with advanced filters: price range, multiple categories/types/collections, color, sorting
 */
exports.getAllProducts = async (filters = {}) => {
  const { 
    collection, 
    collections, // comma-separated slugs
    category, 
    categories, // comma-separated slugs
    type, 
    types, // comma-separated slugs
    featured, 
    active, 
    limit = 50, 
    offset = 0, 
    search,
    minPrice,
    maxPrice,
    color, // color filter
    subcategories, // comma-separated subcategories
    sortBy = 'newest' // newest, price-low, price-high, popularity, relevance, name
  } = filters;

  // Helper function to check if a string is a UUID
  const isUUID = (str) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Helper to resolve multiple slugs to IDs
  const resolveSlugsToIds = async (slugs, tableName) => {
    if (!slugs) return [];
    const slugArray = Array.isArray(slugs) ? slugs : slugs.split(',').map(s => s.trim()).filter(Boolean);
    if (slugArray.length === 0) return [];
    
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .in('slug', slugArray)
      .eq('is_active', true);
    
    if (error || !data) return [];
    return data.map(item => item.id);
  };

  // Resolve single collection/category/type (backward compatibility)
  let collectionId = collection;
  let categoryId = category;
  let typeId = type;
  
  if (collection && !isUUID(collection)) {
    const { data: collectionData } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', collection)
      .eq('is_active', true)
      .single();
    collectionId = collectionData?.id;
  }
  
  if (category && !isUUID(category)) {
    const { data: categoryData } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .eq('is_active', true)
      .single();
    categoryId = categoryData?.id;
  }
  
  if (type && !isUUID(type)) {
    const { data: typeData } = await supabase
      .from('types')
      .select('id')
      .eq('slug', type)
      .eq('is_active', true)
      .single();
    typeId = typeData?.id;
  }

  // Resolve multiple collections/categories/types
  const collectionIds = collections ? await resolveSlugsToIds(collections, 'collections') : [];
  const categoryIds = categories ? await resolveSlugsToIds(categories, 'categories') : [];
  const typeIds = types ? await resolveSlugsToIds(types, 'types') : [];
  
  // Combine single and multiple filters
  const allCollectionIds = [...(collectionId ? [collectionId] : []), ...collectionIds];
  const allCategoryIds = [...(categoryId ? [categoryId] : []), ...categoryIds];
  const allTypeIds = [...(typeId ? [typeId] : []), ...typeIds];

  // Get product IDs from junction tables
  let productIds = null;
  const productIdQueries = [];
  
  if (allCollectionIds.length > 0) {
    const { data: collectionProducts } = await supabase
      .from('product_collections')
      .select('product_id')
      .in('collection_id', allCollectionIds);
    if (collectionProducts && collectionProducts.length > 0) {
      productIdQueries.push(collectionProducts.map(p => p.product_id));
    }
  }
  
  if (allCategoryIds.length > 0) {
    const { data: categoryProducts } = await supabase
      .from('product_categories')
      .select('product_id')
      .in('category_id', allCategoryIds);
    if (categoryProducts && categoryProducts.length > 0) {
      productIdQueries.push(categoryProducts.map(p => p.product_id));
    }
  }
  
  if (allTypeIds.length > 0) {
    const { data: typeProducts } = await supabase
      .from('product_types')
      .select('product_id')
      .in('type_id', allTypeIds);
    if (typeProducts && typeProducts.length > 0) {
      productIdQueries.push(typeProducts.map(p => p.product_id));
    }
  }
  
  // Intersect all product ID arrays (products must match all selected filters)
  if (productIdQueries.length > 0) {
    productIds = productIdQueries.reduce((acc, ids) => 
      acc.filter(id => ids.includes(id))
    );
    
    if (productIds.length === 0) {
      return []; // No products match all filters
    }
  }

  // Build base query
  let query = supabase
    .from('products')
    .select(`
      *,
      product_collections(collection:collections(*)),
      product_categories(category:categories(*)),
      product_types(type:types(*)),
      variants(*)
    `)
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  // Apply active filter - default to active only for regular users
  // This ensures deleted/inactive products (is_active=false) are hidden from regular users
  // Admins can explicitly set active='false' to see inactive products, or active='all' to see all
  if (active === 'all') {
    // Show all products (active and inactive) - admin only
    // Don't filter by is_active
  } else if (active === 'false') {
    // Show only inactive products - admin only
    query = query.eq('is_active', false);
  } else {
    // Default: show only active products (for regular users and when active is undefined/null/'true')
    query = query.eq('is_active', true);
  }
  
  // Filter by product IDs from junction tables
  if (productIds && productIds.length > 0) {
    query = query.in('id', productIds);
  }
  
  // Fallback to old column-based filtering if no junction table filtering
  if (!productIds) {
    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (typeId) {
      query = query.eq('type_id', typeId);
    }
  }
  
  // Price range filter
  if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
    query = query.gte('base_price', parseFloat(minPrice));
  }
  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
    query = query.lte('base_price', parseFloat(maxPrice));
  }
  
  if (featured === 'true') {
    query = query.eq('is_featured', true);
  }
  
  // Enhanced search across name, description, and SKU
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,sku.ilike.%${search}%`);
  }
  
  // Apply sorting
  switch (sortBy) {
    case 'price-low':
      query = query.order('base_price', { ascending: true });
      break;
    case 'price-high':
      query = query.order('base_price', { ascending: false });
      break;
    case 'name':
      query = query.order('name', { ascending: true });
      break;
    case 'popularity':
      // TODO: Add popularity field or use order count
      query = query.order('display_order', { ascending: true });
      break;
    case 'relevance':
      // For search, relevance is handled by search ranking
      query = query.order('created_at', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('display_order', { ascending: true });
      query = query.order('created_at', { ascending: false });
      break;
  }

  const { data, error } = await query;
  if (error) throw error;
  
  // Transform the data to flatten collections/categories/types arrays
  let transformedData = [];
  if (data) {
    transformedData = data.map(product => ({
      ...product,
      collections: product.product_collections?.map(pc => pc.collection).filter(Boolean) || [],
      categories: product.product_categories?.map(pc => pc.category).filter(Boolean) || [],
      types: product.product_types?.map(pt => pt.type).filter(Boolean) || [],
      // Keep backward compatibility with single collection/category/type
      collection: product.product_collections?.[0]?.collection || product.collection || null,
      category: product.product_categories?.[0]?.category || product.category || null,
      type: product.product_types?.[0]?.type || product.type || null,
    }));
  }
  
  // Apply color filter if specified (filter by variant colors)
  if (color && transformedData.length > 0) {
    const colorArray = Array.isArray(color) ? color : color.split(',').map(c => c.trim().toLowerCase());
    transformedData = transformedData.filter(product => {
      if (!product.variants || product.variants.length === 0) return false;
      // Check if any variant has a matching color attribute
      return product.variants.some(variant => {
        const variantColor = variant.color?.toLowerCase() || variant.name?.toLowerCase() || '';
        return colorArray.some(filterColor => variantColor.includes(filterColor));
      });
    });
  }
  
  // Apply subcategories filter if specified (filter by tags or categories)
  if (subcategories && transformedData.length > 0) {
    const subcategoryArray = Array.isArray(subcategories) ? subcategories : subcategories.split(',').map(s => s.trim().toLowerCase());
    transformedData = transformedData.filter(product => {
      const productTags = (product.tags || []).map(t => t.toLowerCase());
      const productCategoryNames = (product.categories || []).map(c => c.name?.toLowerCase() || '');
      const allSubcategories = [...productTags, ...productCategoryNames];
      return subcategoryArray.some(subcat => 
        allSubcategories.some(pc => pc.includes(subcat))
      );
    });
  }
  
  return transformedData;
};

/**
 * Get single product by slug
 * Returns product with all collections, categories, and types
 */
exports.getProductBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_collections(collection:collections(*)),
      product_categories(category:categories(*)),
      product_types(type:types(*)),
      variants(*)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  
  if (data) {
    return {
      ...data,
      collections: data.product_collections?.map(pc => pc.collection).filter(Boolean) || [],
      categories: data.product_categories?.map(pc => pc.category).filter(Boolean) || [],
      types: data.product_types?.map(pt => pt.type).filter(Boolean) || [],
      // Backward compatibility
      collection: data.product_collections?.[0]?.collection || null,
      category: data.product_categories?.[0]?.category || null,
      type: data.product_types?.[0]?.type || null,
    };
  }
  
  return data;
};

/**
 * Get single product by ID
 * Returns product with all collections, categories, and types
 * @param {string} id - Product ID
 * @param {boolean} isAdmin - Whether the request is from an admin (allows access to inactive products)
 */
exports.getProductById = async (id, isAdmin = false) => {
  let query = supabase
    .from('products')
    .select(`
      *,
      product_collections(collection:collections(*)),
      product_categories(category:categories(*)),
      product_types(type:types(*)),
      variants(*)
    `)
    .eq('id', id);
  
  // Filter by active status for non-admin users
  if (!isAdmin) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query.single();

  if (error && error.code !== 'PGRST116') throw error;
  
  if (data) {
    return {
      ...data,
      collections: data.product_collections?.map(pc => pc.collection).filter(Boolean) || [],
      categories: data.product_categories?.map(pc => pc.category).filter(Boolean) || [],
      types: data.product_types?.map(pt => pt.type).filter(Boolean) || [],
      // Backward compatibility
      collection: data.product_collections?.[0]?.collection || null,
      category: data.product_categories?.[0]?.category || null,
      type: data.product_types?.[0]?.type || null,
    };
  }
  
  return data;
};

/**
 * Create new product
 * Supports multiple collections, categories, and types via arrays
 * Also supports backward compatibility with single collection_id, category_id, type_id
 */
exports.createProduct = async (productData) => {
  const {
    name,
    description,
    long_description,
    // Support both single IDs (backward compat) and arrays (new)
    collection_id,
    collection_ids = [],
    category_id,
    category_ids = [],
    type_id,
    type_ids = [],
    base_price,
    compare_at_price,
    mrp,
    primary_image_url,
    image_urls = [],
    sku,
    tags = [],
    // Taxonomy attributes
    color,
    weave,
    length_m,
    blouse_included = false,
    subcategories = [],
    is_featured = false,
    display_order = 0,
    meta_title,
    meta_description,
  } = productData;

  if (!name || !base_price) {
    throw new Error('Name and base_price are required');
  }

  const slug = generateSlug(name);

  // Auto-generate SKU if not provided
  let finalSKU = sku;
  if (!finalSKU) {
    // Get type information for SKU generation
    let typeSlug = null;
    const typeIdToUse = type_id || (Array.isArray(type_ids) && type_ids.length > 0 ? type_ids[0] : null);
    
    if (typeIdToUse) {
      const { data: typeData } = await supabase
        .from('types')
        .select('slug')
        .eq('id', typeIdToUse)
        .single();
      
      if (typeData) {
        typeSlug = typeData.slug;
      }
    }
    
    // Generate SKU automatically
    finalSKU = await generateProductSKU(supabase, name, typeIdToUse, typeSlug, color, null);
  }

  // Create the product first
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      name,
      slug,
      description,
      long_description,
      // Keep old columns for backward compatibility
      collection_id: collection_id || null,
      category_id: category_id || null,
      type_id: type_id || null,
      base_price,
      compare_at_price: compare_at_price || null,
      mrp: mrp || null,
      primary_image_url: primary_image_url || null,
      image_urls: Array.isArray(image_urls) ? image_urls : [],
      sku: finalSKU,
      tags: Array.isArray(tags) ? tags : [],
      // Taxonomy attributes
      color: color || null,
      weave: weave || null,
      length_m: length_m ? parseFloat(length_m) : null,
      blouse_included: blouse_included || false,
      subcategories: Array.isArray(subcategories) ? subcategories : (subcategories ? [subcategories] : []),
      is_featured,
      is_active: true,
      display_order,
      meta_title: meta_title || null,
      meta_description: meta_description || null,
    })
    .select()
    .single();

  if (productError) throw productError;
  if (!product) throw new Error('Failed to create product');

  // Build arrays of IDs to link (support both old and new format)
  const collectionsToLink = [
    ...(collection_id ? [collection_id] : []),
    ...(Array.isArray(collection_ids) ? collection_ids : [])
  ].filter(Boolean);

  const categoriesToLink = [
    ...(category_id ? [category_id] : []),
    ...(Array.isArray(category_ids) ? category_ids : [])
  ].filter(Boolean);

  const typesToLink = [
    ...(type_id ? [type_id] : []),
    ...(Array.isArray(type_ids) ? type_ids : [])
  ].filter(Boolean);

  // Create junction table entries
  if (collectionsToLink.length > 0) {
    const { error: collectionsError } = await supabase
      .from('product_collections')
      .insert(collectionsToLink.map((id, index) => ({
        product_id: product.id,
        collection_id: id,
        display_order: index,
      })));

    if (collectionsError) throw collectionsError;
  }

  if (categoriesToLink.length > 0) {
    const { error: categoriesError } = await supabase
      .from('product_categories')
      .insert(categoriesToLink.map((id, index) => ({
        product_id: product.id,
        category_id: id,
        display_order: index,
      })));

    if (categoriesError) throw categoriesError;
  }

  if (typesToLink.length > 0) {
    const { error: typesError } = await supabase
      .from('product_types')
      .insert(typesToLink.map((id, index) => ({
        product_id: product.id,
        type_id: id,
        display_order: index,
      })));

    if (typesError) throw typesError;
  }

  // Fetch the complete product with relationships
  return await exports.getProductById(product.id);
};

/**
 * Update product
 * Supports updating multiple collections, categories, and types
 */
exports.updateProduct = async (id, productData) => {
  const updateData = { ...productData };
  
  // Extract relationship arrays before updating product
  const collection_ids = updateData.collection_ids;
  const category_ids = updateData.category_ids;
  const type_ids = updateData.type_ids;
  
  // Remove relationship arrays from update data (they go to junction tables)
  delete updateData.collection_ids;
  delete updateData.category_ids;
  delete updateData.type_ids;
  
  // Generate slug if name is being updated
  if (updateData.name) {
    updateData.slug = generateSlug(updateData.name);
  }

  // Remove undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  updateData.updated_at = new Date().toISOString();

  // Update the product
  const { error: updateError } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id);

  if (updateError) {
    if (updateError.code === 'PGRST116') {
      throw new Error('Product not found');
    }
    throw updateError;
  }

  // Update junction tables if arrays are provided
  if (Array.isArray(collection_ids)) {
    // Delete existing relationships
    await supabase.from('product_collections').delete().eq('product_id', id);
    
    // Insert new relationships
    if (collection_ids.length > 0) {
      const { error: collectionsError } = await supabase
        .from('product_collections')
        .insert(collection_ids.map((collectionId, index) => ({
          product_id: id,
          collection_id: collectionId,
          display_order: index,
        })));

      if (collectionsError) throw collectionsError;
    }
  }

  if (Array.isArray(category_ids)) {
    // Delete existing relationships
    await supabase.from('product_categories').delete().eq('product_id', id);
    
    // Insert new relationships
    if (category_ids.length > 0) {
      const { error: categoriesError } = await supabase
        .from('product_categories')
        .insert(category_ids.map((categoryId, index) => ({
          product_id: id,
          category_id: categoryId,
          display_order: index,
        })));

      if (categoriesError) throw categoriesError;
    }
  }

  if (Array.isArray(type_ids)) {
    // Delete existing relationships
    await supabase.from('product_types').delete().eq('product_id', id);
    
    // Insert new relationships
    if (type_ids.length > 0) {
      const { error: typesError } = await supabase
        .from('product_types')
        .insert(type_ids.map((typeId, index) => ({
          product_id: id,
          type_id: typeId,
          display_order: index,
        })));

      if (typesError) throw typesError;
    }
  }

  // Fetch and return the updated product with relationships
  return await exports.getProductById(id);
};

/**
 * Delete product (soft delete by setting is_active to false)
 */
exports.deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
  return true;
};

/**
 * Update product status
 */
exports.updateProductStatus = async (id, { is_active, is_featured }) => {
  const updateData = { updated_at: new Date().toISOString() };
  
  if (is_active !== undefined) updateData.is_active = is_active;
  if (is_featured !== undefined) updateData.is_featured = is_featured;

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Product not found');
    }
    throw error;
  }
  return data;
};
