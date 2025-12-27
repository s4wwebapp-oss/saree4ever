const { supabase } = require('../config/db');

/**
 * Get coming soon settings (public)
 */
exports.getSettings = async () => {
  const { data, error } = await supabase
    .from('coming_soon_settings')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    // If table doesn't exist yet, return default
    if (error.message?.includes('schema cache') || error.message?.includes('Could not find the table')) {
      console.warn('Coming soon settings table not found. Please run the migration.');
      return { is_enabled: false, title: 'Grand Opening', subtitle: 'We are working on something amazing!' };
    }
    throw error;
  }

  return data || { is_enabled: false, title: 'Grand Opening', subtitle: 'We are working on something amazing!' };
};

/**
 * Update coming soon settings (admin)
 */
exports.updateSettings = async (updates) => {
  // Get existing settings
  const { data: existing } = await supabase
    .from('coming_soon_settings')
    .select('*')
    .limit(1)
    .single();

  let result;
  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('coming_soon_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    result = data;
  } else {
    // Insert new
    const { data, error } = await supabase
      .from('coming_soon_settings')
      .insert({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    result = data;
  }

  return result;
};

/**
 * Get all coming soon media (public - only active)
 */
exports.getActiveMedia = async () => {
  const { data, error } = await supabase
    .from('coming_soon_media')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    if (error.message?.includes('schema cache') || error.message?.includes('Could not find the table')) {
      console.warn('Coming soon media table not found. Please run the migration.');
      return [];
    }
    throw error;
  }

  return data || [];
};

/**
 * Get all coming soon media (admin - all)
 */
exports.getAllMedia = async () => {
  const { data, error } = await supabase
    .from('coming_soon_media')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    if (error.message?.includes('schema cache') || error.message?.includes('Could not find the table')) {
      console.warn('Coming soon media table not found. Please run the migration.');
      return [];
    }
    throw error;
  }

  return data || [];
};

/**
 * Create coming soon media (admin)
 */
exports.createMedia = async (mediaData) => {
  const { data, error } = await supabase
    .from('coming_soon_media')
    .insert({
      ...mediaData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update coming soon media (admin)
 */
exports.updateMedia = async (id, updates) => {
  const { data, error } = await supabase
    .from('coming_soon_media')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete coming soon media (admin)
 */
exports.deleteMedia = async (id) => {
  const { error } = await supabase
    .from('coming_soon_media')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

/**
 * Reorder coming soon media (admin)
 */
exports.reorderMedia = async (mediaOrders) => {
  const updatePromises = mediaOrders.map(({ id, display_order }) =>
    supabase
      .from('coming_soon_media')
      .update({ display_order, updated_at: new Date().toISOString() })
      .eq('id', id)
  );

  const results = await Promise.all(updatePromises);
  
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    throw errors[0].error;
  }

  return exports.getAllMedia();
};
