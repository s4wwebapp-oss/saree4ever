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

