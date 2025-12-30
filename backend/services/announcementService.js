const { supabase } = require('../config/db');

// Table name - using plural form as defined in Prisma schema
const TABLE_NAME = 'announcement_bars';

/**
 * Get active announcement
 */
exports.getActiveAnnouncement = async () => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
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
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Get announcement by ID (admin)
 */
exports.getAnnouncementById = async (id) => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
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
    background_color = '#000000',
    text_color = '#ffffff',
    is_active = false,
  } = announcementData;

  if (!text) {
    throw new Error('Text is required');
  }

  // If setting this as active, deactivate all others
  if (is_active) {
    await supabase
      .from(TABLE_NAME)
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      text,
      link_url: link_url || null,
      background_color,
      text_color,
      is_active,
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
  if (announcementData.background_color !== undefined) updateData.background_color = announcementData.background_color;
  if (announcementData.text_color !== undefined) updateData.text_color = announcementData.text_color;
  
  // Handle is_active - if setting to true, deactivate all others first
  if (announcementData.is_active === true) {
    await supabase
      .from(TABLE_NAME)
      .update({ is_active: false })
      .neq('id', id);
    updateData.is_active = true;
  } else if (announcementData.is_active === false) {
    updateData.is_active = false;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
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
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};


