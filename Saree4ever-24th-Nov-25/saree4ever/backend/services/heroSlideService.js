const { supabase } = require('../config/db');

/**
 * Get active hero slides (for homepage)
 */
exports.getActiveSlides = async () => {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .limit(3); // Only return up to 3 slides

  if (error) throw error;
  return data || [];
};

/**
 * Get all hero slides (admin)
 */
exports.getAllSlides = async () => {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Get slide by ID (admin)
 */
exports.getSlideById = async (id) => {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Create hero slide (admin)
 */
exports.createSlide = async (slideData) => {
  const {
    title,
    subtitle,
    image_url,
    button_text,
    button_link,
    button_target = '_self',
    display_order = 0,
    is_active = false,
  } = slideData;

  if (!image_url) {
    throw new Error('Image URL is required');
  }

  const { data, error } = await supabase
    .from('hero_slides')
    .insert({
      title: title || null,
      subtitle: subtitle || null,
      image_url,
      button_text: button_text || null,
      button_link: button_link || null,
      button_target: button_target || '_self',
      display_order: display_order || 0,
      is_active: is_active || false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Update hero slide (admin)
 */
exports.updateSlide = async (id, slideData) => {
  const updateData = {
    updated_at: new Date().toISOString(),
  };

  if (slideData.title !== undefined) updateData.title = slideData.title;
  if (slideData.subtitle !== undefined) updateData.subtitle = slideData.subtitle;
  if (slideData.image_url !== undefined) updateData.image_url = slideData.image_url;
  if (slideData.button_text !== undefined) updateData.button_text = slideData.button_text;
  if (slideData.button_link !== undefined) updateData.button_link = slideData.button_link;
  if (slideData.button_target !== undefined) updateData.button_target = slideData.button_target;
  if (slideData.display_order !== undefined) updateData.display_order = slideData.display_order;
  if (slideData.is_active !== undefined) updateData.is_active = slideData.is_active;

  const { data, error } = await supabase
    .from('hero_slides')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Hero slide not found');
    }
    throw error;
  }
  return data;
};

/**
 * Delete hero slide (admin)
 */
exports.deleteSlide = async (id) => {
  const { error } = await supabase
    .from('hero_slides')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

/**
 * Reorder slides (admin)
 */
exports.reorderSlides = async (slideOrders) => {
  // slideOrders is an array of { id, display_order }
  const updates = slideOrders.map(({ id, display_order }) =>
    supabase
      .from('hero_slides')
      .update({ display_order })
      .eq('id', id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter(r => r.error);
  
  if (errors.length > 0) {
    throw new Error('Failed to reorder some slides');
  }

  return { success: true };
};


