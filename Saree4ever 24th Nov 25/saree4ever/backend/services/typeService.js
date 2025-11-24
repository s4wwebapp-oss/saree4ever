const { supabase } = require('../config/db');

/**
 * Get all active types
 */
exports.getAllTypes = async () => {
  const { data, error } = await supabase
    .from('types')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
};

