const { supabase } = require('../config/db');

/**
 * Get all types (with optional active filter)
 */
exports.getAllTypes = async (includeInactive = false) => {
  let query = supabase
    .from('types')
    .select('*');
  
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  
  const { data, error } = await query.order('display_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * Get type by ID
 */
exports.getTypeById = async (id) => {
  const { data, error } = await supabase
    .from('types')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Get type by slug
 */
exports.getTypeBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('types')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Create new type
 */
exports.createType = async (typeData) => {
  const {
    name,
    slug,
    description,
    image_url,
    is_active = true,
    display_order = 0,
  } = typeData;

  if (!name || !slug) {
    throw new Error('Name and slug are required');
  }

  const { data, error } = await supabase
    .from('types')
    .insert({
      name,
      slug,
      description: description || null,
      image_url: image_url || null,
      is_active,
      display_order,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update type by ID
 */
exports.updateType = async (id, typeData) => {
  const {
    name,
    slug,
    description,
    image_url,
    is_active,
    display_order,
  } = typeData;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;
  if (description !== undefined) updateData.description = description || null;
  if (image_url !== undefined) updateData.image_url = image_url || null;
  if (is_active !== undefined) updateData.is_active = is_active;
  if (display_order !== undefined) updateData.display_order = display_order;

  const { data, error } = await supabase
    .from('types')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete type by ID
 */
exports.deleteType = async (id) => {
  const { error } = await supabase
    .from('types')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { message: 'Type deleted successfully' };
};
