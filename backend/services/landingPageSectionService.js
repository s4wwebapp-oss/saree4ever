const { supabase } = require('../config/db');

/**
 * Get all sections (admin)
 */
exports.getAllSections = async () => {
  const { data, error } = await supabase
    .from('landing_page_sections')
    .select('*')
    .order('section_key', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * Get visible sections as a visibility map (public)
 */
exports.getVisibleSections = async () => {
  const { data, error } = await supabase
    .from('landing_page_sections')
    .select('section_key, is_visible');

  if (error) throw error;
  
  // Convert to a map: { section_key: is_visible }
  const visibilityMap = {};
  (data || []).forEach(section => {
    visibilityMap[section.section_key] = section.is_visible;
  });
  
  return visibilityMap;
};

/**
 * Update section visibility (admin)
 */
exports.updateSectionVisibility = async (sectionKey, isVisible) => {
  const { data, error } = await supabase
    .from('landing_page_sections')
    .update({ is_visible: isVisible })
    .eq('section_key', sectionKey)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Bulk update section visibility (admin)
 */
exports.bulkUpdateVisibility = async (updates) => {
  // updates: [{ section_key: 'hero', is_visible: true }, ...]
  
  const results = [];
  for (const update of updates) {
    const { section_key, is_visible } = update;
    
    const { data, error } = await supabase
      .from('landing_page_sections')
      .update({ is_visible })
      .eq('section_key', section_key)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${section_key}:`, error);
      results.push({ section_key, error: error.message, success: false });
    } else {
      results.push({ section_key, success: true, data });
    }
  }

  return results;
};

/**
 * Get single section by key (admin)
 */
exports.getSectionByKey = async (sectionKey) => {
  const { data, error } = await supabase
    .from('landing_page_sections')
    .select('*')
    .eq('section_key', sectionKey)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Create or update section (upsert)
 */
exports.upsertSection = async (sectionKey, isVisible, settings = null) => {
  const { data, error } = await supabase
    .from('landing_page_sections')
    .upsert({
      section_key: sectionKey,
      is_visible: isVisible,
      settings: settings,
    }, {
      onConflict: 'section_key'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
