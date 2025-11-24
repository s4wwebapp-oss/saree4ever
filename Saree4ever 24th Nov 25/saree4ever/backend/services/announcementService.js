const { supabase } = require('../config/db');

/**
 * Get active announcement
 */
exports.getActiveAnnouncement = async () => {
  const { data, error } = await supabase
    .from('announcement_bar')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Get all announcements (admin)
 */
exports.getAllAnnouncements = async () => {
  const { data, error } = await supabase
    .from('announcement_bar')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Get announcement by ID (admin)
 */
exports.getAnnouncementById = async (id) => {
  const { data, error } = await supabase
    .from('announcement_bar')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Create announcement (admin)
 */
exports.createAnnouncement = async (announcementData) => {
  const {
    text,
    link_url,
    link_target = '_self',
    is_active = false,
    display_order = 0,
  } = announcementData;

  if (!text) {
    throw new Error('Text is required');
  }

  // If setting this as active, deactivate all others
  if (is_active) {
    await supabase
      .from('announcement_bar')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all except non-existent ID
  }

  const { data, error } = await supabase
    .from('announcement_bar')
    .insert({
      text,
      link_url: link_url || null,
      link_target: link_target || '_self',
      is_active,
      display_order: display_order || 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update announcement (admin)
 */
exports.updateAnnouncement = async (id, announcementData) => {
  const updateData = {
    updated_at: new Date().toISOString(),
  };

  if (announcementData.text !== undefined) updateData.text = announcementData.text;
  if (announcementData.link_url !== undefined) updateData.link_url = announcementData.link_url;
  if (announcementData.link_target !== undefined) updateData.link_target = announcementData.link_target;
  if (announcementData.display_order !== undefined) updateData.display_order = announcementData.display_order;
  
  // Handle is_active - if setting to true, deactivate all others first
  if (announcementData.is_active === true) {
    await supabase
      .from('announcement_bar')
      .update({ is_active: false })
      .neq('id', id);
    updateData.is_active = true;
  } else if (announcementData.is_active === false) {
    updateData.is_active = false;
  }

  const { data, error } = await supabase
    .from('announcement_bar')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Announcement not found');
    }
    throw error;
  }
  return data;
};

/**
 * Delete announcement (admin)
 */
exports.deleteAnnouncement = async (id) => {
  const { error } = await supabase
    .from('announcement_bar')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};


