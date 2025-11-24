const { supabase } = require('../config/db');

/**
 * Get all active categories
 */
exports.getAllCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
};

