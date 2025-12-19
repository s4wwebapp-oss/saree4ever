const { supabase, pgPool } = require('../config/db');

/**
 * Get all sections with their visibility status
 * Uses RPC function to bypass PostgREST schema cache issues
 */
exports.getAllSections = async () => {
  // First try using the RPC function (bypasses schema cache)
  let { data, error } = await supabase.rpc('get_landing_page_sections');
  
  // If RPC function doesn't exist or fails, try direct table query
  if (error && (error.message?.includes('function') || error.message?.includes('does not exist'))) {
    console.warn('RPC function not available, trying direct table query');
    const directQuery = await supabase
      .from('landing_page_sections')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (directQuery.error) {
      // If both fail, return default sections
      if (directQuery.error.message?.includes('schema cache') || directQuery.error.message?.includes('Could not find the table')) {
        console.warn('PostgREST schema cache not refreshed, returning default sections');
        return getDefaultSections();
      }
      throw directQuery.error;
    }
    return directQuery.data || [];
  }

  if (error) throw error;
  return data || [];
};

/**
 * Helper function to return default sections
 */
function getDefaultSections() {
  return [
    { id: '1', section_key: 'quick_categories', section_name: 'Quick Categories', description: 'Circular category icons above hero section', is_visible: true, display_order: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', section_key: 'landing_videos', section_name: 'Landing Page Videos', description: 'Video section after quick categories', is_visible: true, display_order: 2, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '3', section_key: 'hero_carousel', section_name: 'Hero Carousel', description: 'Main hero banner carousel', is_visible: true, display_order: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '4', section_key: 'shop_by_category', section_name: 'Shop by Category', description: 'Expandable category grid section', is_visible: true, display_order: 4, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '5', section_key: 'featured_products', section_name: 'Featured Products', description: 'Featured products showcase', is_visible: true, display_order: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '6', section_key: 'reels', section_name: 'Reels Section', description: 'Instagram/YouTube reels section', is_visible: true, display_order: 6, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '7', section_key: 'stories', section_name: 'Stories Section', description: 'Blog/stories preview section', is_visible: true, display_order: 7, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '8', section_key: 'testimonials', section_name: 'Testimonials', description: 'Customer testimonials section', is_visible: true, display_order: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '9', section_key: 'about_preview', section_name: 'About Preview', description: 'About us preview section', is_visible: true, display_order: 9, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '10', section_key: 'why_choose_us', section_name: 'Why Choose Us', description: 'Benefits/features section', is_visible: true, display_order: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '11', section_key: 'collections', section_name: 'Collections', description: 'Showcase of collections grid section', is_visible: true, display_order: 11, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '12', section_key: 'reviews', section_name: 'Reviews', description: 'Customer reviews section with Google-style review cards', is_visible: true, display_order: 12, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];
}

/**
 * Get visibility status for all sections (public - returns only visible sections)
 * Uses RPC function to bypass PostgREST schema cache issues
 */
exports.getVisibleSections = async () => {
  // First try using the RPC function (bypasses schema cache)
  let { data, error } = await supabase.rpc('get_visible_landing_page_sections');
  
  // If RPC function doesn't exist or fails, try direct table query
  if (error && (error.message?.includes('function') || error.message?.includes('does not exist'))) {
    console.warn('RPC function not available, trying direct table query');
    const directQuery = await supabase
      .from('landing_page_sections')
      .select('section_key, is_visible')
      .eq('is_visible', true)
      .order('display_order', { ascending: true });
    
    if (directQuery.error) {
      // If both fail, return all sections visible by default
      if (directQuery.error.message?.includes('schema cache') || directQuery.error.message?.includes('Could not find the table')) {
        console.warn('PostgREST schema cache not refreshed, returning all sections visible by default');
        return {
          quick_categories: true,
          landing_videos: true,
          hero_carousel: true,
          shop_by_category: true,
          featured_products: true,
          reels: true,
          stories: true,
          testimonials: true,
          about_preview: true,
          why_choose_us: true,
          collections: true,
          reviews: true,
        };
      }
      throw directQuery.error;
    }
    data = directQuery.data;
  }

  if (error && !error.message?.includes('function')) throw error;
  
  // Return as a map for easy lookup
  const visibilityMap = {};
  (data || []).forEach(section => {
    visibilityMap[section.section_key] = true;
  });
  
  return visibilityMap;
};

/**
 * Get visibility status for a specific section
 */
exports.isSectionVisible = async (sectionKey) => {
  const { data, error } = await supabase
    .from('landing_page_sections')
    .select('is_visible')
    .eq('section_key', sectionKey)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.is_visible ?? true; // Default to visible if section doesn't exist
};

/**
 * Update section visibility
 * Uses RPC function to bypass PostgREST schema cache issues
 */
exports.updateSectionVisibility = async (sectionKey, isVisible) => {
  // Use direct PostgreSQL connection to bypass PostgREST schema cache entirely
  if (pgPool) {
    try {
      // Use direct SQL query - bypasses PostgREST completely
      const result = await pgPool.query(
        `UPDATE landing_page_sections 
         SET is_visible = $1, updated_at = NOW() 
         WHERE section_key = $2 
         RETURNING *`,
        [isVisible, sectionKey]
      );

      if (result.rows && result.rows.length > 0) {
        return result.rows[0];
      }
      throw new Error(`Section '${sectionKey}' not found`);
    } catch (error) {
      console.error('Direct PostgreSQL query error:', error);
      throw error;
    }
  }

  // Fallback to Supabase client if pgPool not available
  try {
    const { data, error } = await supabase.rpc('update_landing_page_section_visibility', {
      p_section_key: sectionKey,
      p_is_visible: isVisible
    });

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Supabase RPC error:', error);
    throw error;
  }
};

/**
 * Update multiple sections visibility at once
 * Uses RPC function to bypass PostgREST schema cache issues
 */
exports.bulkUpdateVisibility = async (updates) => {
  // Use direct PostgreSQL connection to bypass PostgREST schema cache entirely
  if (pgPool) {
    try {
      // Update all sections in a transaction
      const client = await pgPool.connect();
      try {
        await client.query('BEGIN');
        
        // Update each section
        for (const update of updates) {
          await client.query(
            `UPDATE landing_page_sections 
             SET is_visible = $1, updated_at = NOW() 
             WHERE section_key = $2`,
            [update.is_visible, update.section_key]
          );
        }
        
        await client.query('COMMIT');
        
        // Fetch all updated sections
        const result = await client.query(
          'SELECT * FROM landing_page_sections ORDER BY display_order ASC'
        );
        
        return result.rows || [];
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Direct PostgreSQL bulk update error:', error);
      throw error;
    }
  }

  // Fallback to Supabase client if pgPool not available
  try {
    const updatesJson = updates.map(u => ({
      section_key: u.section_key,
      is_visible: u.is_visible
    }));

    const { data, error } = await supabase.rpc('bulk_update_landing_page_sections_visibility', {
      p_updates: updatesJson
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Supabase RPC bulk update error:', error);
    throw error;
  }
};
