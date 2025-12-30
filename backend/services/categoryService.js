const { supabase } = require('../config/db');

/**
 * Get all categories (with optional active filter)
 */
exports.getAllCategories = async (includeInactive = false) => {
  let query = supabase
    .from('categories')
    .select('*');
  
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query.order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * Get category by ID
 */
exports.getCategoryById = async (id) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Get category by slug
 */
exports.getCategoryBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Create new category
 */
exports.createCategory = async (categoryData) => {
  const {
    name,
    slug,
    description,
    image_url,
    icon,
    is_active = true,
    display_order = 0,
  } = categoryData;

  if (!name || !slug) {
    throw new Error('Name and slug are required');
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name,
      slug,
      description: description || null,
      image_url: image_url || null,
      icon: icon || null,
      is_active,
      display_order,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update category by ID
 */
exports.updateCategory = async (id, categoryData) => {
  const {
    name,
    slug,
    description,
    image_url,
    icon,
    is_active,
    display_order,
  } = categoryData;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;
  if (description !== undefined) updateData.description = description || null;
  if (image_url !== undefined) updateData.image_url = image_url || null;
  if (icon !== undefined) updateData.icon = icon || null;
  if (is_active !== undefined) updateData.is_active = is_active;
  if (display_order !== undefined) updateData.display_order = display_order;

  const { data, error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete category by ID
 */
exports.deleteCategory = async (id) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { message: 'Category deleted successfully' };
};
