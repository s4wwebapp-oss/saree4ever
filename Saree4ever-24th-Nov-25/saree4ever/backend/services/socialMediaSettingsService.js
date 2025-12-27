const { supabase } = require('../config/db');

/**
 * Get all social media settings (admin)
 */
exports.getAllSettings = async () => {
  const { data, error } = await supabase
    .from('social_media_settings')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    // If table doesn't exist yet (schema cache), return empty array
    if (error.message?.includes('schema cache') || error.message?.includes('Could not find the table')) {
      console.warn('PostgREST schema cache not refreshed, returning empty array');
      return [];
    }
    throw error;
  }

  return data || [];
};

/**
 * Get visible social media links (public)
 */
exports.getVisibleLinks = async () => {
  const { data, error } = await supabase
    .from('social_media_settings')
    .select('platform, url')
    .eq('is_visible', true)
    .order('display_order', { ascending: true });

  if (error) {
    // If table doesn't exist yet, return empty array
    if (error.message?.includes('schema cache') || error.message?.includes('Could not find the table')) {
      console.warn('⚠️ Social media settings table not found. Please run the migration: backend/migrations/create_social_media_settings.sql');
      return [];
    }
    console.error('Error fetching visible social media links:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.warn('⚠️ No visible social media links found. Check admin settings at /admin/settings to enable links.');
  }

  return data || [];
};

/**
 * Update social media setting (admin)
 */
exports.updateSetting = async (platform, updates) => {
  const { data, error } = await supabase
    .from('social_media_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('platform', platform)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Bulk update social media settings (admin)
 */
exports.bulkUpdate = async (updates) => {
  const updatePromises = updates.map(({ platform, ...rest }) =>
    supabase
      .from('social_media_settings')
      .update({
        ...rest,
        updated_at: new Date().toISOString(),
      })
      .eq('platform', platform)
  );

  const results = await Promise.all(updatePromises);
  
  // Check for errors
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    throw errors[0].error;
  }

  // Return all updated settings
  return exports.getAllSettings();
};





