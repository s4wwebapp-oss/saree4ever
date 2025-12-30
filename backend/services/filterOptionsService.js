const { supabase } = require('../config/db');

const TABLE_NAME = 'filter_options';

/**
 * Get all filter options
 */
exports.getAllFilterOptions = async () => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('filter_type', { ascending: true })
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Get filter options by type (color, sort, size, etc.)
 */
exports.getFilterOptionsByType = async (filterType) => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('filter_type', filterType)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
};

/**
 * Get all active filter options grouped by type
 */
exports.getActiveFilterOptions = async () => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('is_active', true)
    .order('filter_type', { ascending: true })
    .order('display_order', { ascending: true });

  if (error) throw error;
  
  // Group by filter_type
  const grouped = data.reduce((acc, option) => {
    if (!acc[option.filter_type]) {
      acc[option.filter_type] = [];
    }
    acc[option.filter_type].push(option);
    return acc;
  }, {});

  return grouped;
};

/**
 * Get filter option by ID
 */
exports.getFilterOptionById = async (id) => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

/**
 * Create a new filter option
 */
exports.createFilterOption = async (filterData) => {
  const dataToInsert = {
    filter_type: filterData.filter_type,
    name: filterData.name,
    value: filterData.value,
    display_order: filterData.display_order || 0,
    is_active: filterData.is_active !== false,
    metadata: filterData.metadata || {},
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(dataToInsert)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update a filter option
 */
exports.updateFilterOption = async (id, filterData) => {
  const dataToUpdate = {};
  
  if (filterData.filter_type !== undefined) dataToUpdate.filter_type = filterData.filter_type;
  if (filterData.name !== undefined) dataToUpdate.name = filterData.name;
  if (filterData.value !== undefined) dataToUpdate.value = filterData.value;
  if (filterData.display_order !== undefined) dataToUpdate.display_order = filterData.display_order;
  if (filterData.is_active !== undefined) dataToUpdate.is_active = filterData.is_active;
  if (filterData.metadata !== undefined) dataToUpdate.metadata = filterData.metadata;

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(dataToUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Delete a filter option
 */
exports.deleteFilterOption = async (id) => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

/**
 * Bulk update display order
 */
exports.updateDisplayOrder = async (updates) => {
  // updates is an array of { id, display_order }
  const results = [];
  
  for (const update of updates) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ display_order: update.display_order })
      .eq('id', update.id)
      .select()
      .single();
    
    if (error) throw error;
    results.push(data);
  }
  
  return results;
};

/**
 * Get distinct filter types
 */
exports.getFilterTypes = async () => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('filter_type')
    .order('filter_type', { ascending: true });

  if (error) throw error;
  
  // Get unique filter types
  const uniqueTypes = [...new Set(data.map(item => item.filter_type))];
  return uniqueTypes;
};
