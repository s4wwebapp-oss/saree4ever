const { supabase } = require('../config/db');

/**
 * Get all active collections
 */
exports.getAllCollections = async () => {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Get collection by ID
 */
exports.getCollectionById = async (id) => {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create a new collection
 */
exports.createCollection = async (collectionData) => {
  // Generate slug from name if not provided
  if (!collectionData.slug && collectionData.name) {
    collectionData.slug = collectionData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Set defaults
  const dataToInsert = {
    name: collectionData.name,
    slug: collectionData.slug,
    description: collectionData.description || null,
    image_url: collectionData.image_url || null,
    is_active: collectionData.is_active !== false,
    display_order: collectionData.display_order || 0,
  };

  const { data, error } = await supabase
    .from('collections')
    .insert(dataToInsert)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update a collection
 */
exports.updateCollection = async (id, collectionData) => {
  // Generate slug from name if name changed and slug not provided
  if (collectionData.name && !collectionData.slug) {
    collectionData.slug = collectionData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const { data, error } = await supabase
    .from('collections')
    .update(collectionData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a collection
 */
exports.deleteCollection = async (id) => {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

