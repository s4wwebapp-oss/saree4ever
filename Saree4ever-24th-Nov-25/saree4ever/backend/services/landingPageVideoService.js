const { supabase } = require('../config/db');

/**
 * Get all active landing page videos (ordered by display_order)
 */
exports.getActiveVideos = async () => {
  // Try with video_orientation first, fallback without it if schema cache hasn't refreshed
  let { data, error } = await supabase
    .from('landing_page_video')
    .select('id, video_url, video_file_path, is_active, autoplay, muted, loop, display_order, video_orientation, created_at, updated_at')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  // If error is about video_orientation column not found, retry without it
  if (error && (error.message?.includes('video_orientation') || error.message?.includes('schema cache'))) {
    const retryResult = await supabase
      .from('landing_page_video')
      .select('id, video_url, video_file_path, is_active, autoplay, muted, loop, display_order, created_at, updated_at')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (retryResult.error) throw retryResult.error;
    // Add default orientation to all videos
    return (retryResult.data || []).map(video => ({ ...video, video_orientation: 'horizontal' }));
  }

  if (error) throw error;
  return data || [];
};

/**
 * Get all videos (admin) - ordered by display_order
 */
exports.getAllVideos = async () => {
  // Try with video_orientation first, fallback without it if schema cache hasn't refreshed
  let { data, error } = await supabase
    .from('landing_page_video')
    .select('id, video_url, video_file_path, is_active, autoplay, muted, loop, display_order, video_orientation, created_at, updated_at')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  // If error is about video_orientation column not found, retry without it
  if (error && (error.message?.includes('video_orientation') || error.message?.includes('schema cache'))) {
    const retryResult = await supabase
      .from('landing_page_video')
      .select('id, video_url, video_file_path, is_active, autoplay, muted, loop, display_order, created_at, updated_at')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (retryResult.error) throw retryResult.error;
    // Add default orientation to all videos
    return (retryResult.data || []).map(video => ({ ...video, video_orientation: 'horizontal' }));
  }

  if (error) throw error;
  return data || [];
};

/**
 * Get single video by ID (admin)
 */
exports.getVideoById = async (id) => {
  // Try with video_orientation first, fallback without it if schema cache hasn't refreshed
  let { data, error } = await supabase
    .from('landing_page_video')
    .select('id, video_url, video_file_path, is_active, autoplay, muted, loop, display_order, video_orientation, created_at, updated_at')
    .eq('id', id)
    .single();

  // If error is about video_orientation column not found, retry without it
  if (error && error.code !== 'PGRST116' && (error.message?.includes('video_orientation') || error.message?.includes('schema cache'))) {
    const retryResult = await supabase
      .from('landing_page_video')
      .select('id, video_url, video_file_path, is_active, autoplay, muted, loop, display_order, created_at, updated_at')
      .eq('id', id)
      .single();
    
    if (retryResult.error && retryResult.error.code !== 'PGRST116') throw retryResult.error;
    // Add default orientation
    return retryResult.data ? { ...retryResult.data, video_orientation: 'horizontal' } : null;
  }

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Create new landing page video
 */
exports.createVideo = async (videoData) => {
  const {
    video_url,
    video_file_path,
    is_active = true,
    autoplay = true,
    muted = true,
    loop = true,
    display_order = 0,
    video_orientation = 'horizontal',
  } = videoData;

  // Get max display_order if not provided
  if (display_order === 0) {
    const { data: maxOrder } = await supabase
      .from('landing_page_video')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();
    
    const newOrder = maxOrder ? (maxOrder.display_order || 0) + 1 : 0;
    videoData.display_order = newOrder;
  }

  // Try with video_orientation first, fallback without it if schema cache hasn't refreshed
  let insertData = {
    video_url: video_url || null,
    video_file_path: video_file_path || null,
    is_active,
    autoplay,
    muted,
    loop,
    display_order: videoData.display_order,
    video_orientation: video_orientation || 'horizontal',
  };

  let { data, error } = await supabase
    .from('landing_page_video')
    .insert(insertData)
    .select('id, video_url, video_file_path, is_active, autoplay, muted, loop, display_order, video_orientation, created_at, updated_at')
    .single();

  // If error is about video_orientation column not found, retry without it
  if (error && (error.message?.includes('video_orientation') || error.message?.includes('schema cache'))) {
    // Remove video_orientation and retry (will use database default)
    delete insertData.video_orientation;
    const retryResult = await supabase
      .from('landing_page_video')
      .insert(insertData)
      .select('id, video_url, video_file_path, is_active, autoplay, muted, loop, display_order, created_at, updated_at')
      .single();
    
    if (retryResult.error) throw retryResult.error;
    // Return with default orientation
    return { ...retryResult.data, video_orientation: 'horizontal' };
  }

  if (error) throw error;
  return data;
};

/**
 * Update landing page video by ID
 */
exports.updateVideo = async (id, videoData) => {
  const {
    video_url,
    video_file_path,
    is_active,
    autoplay,
    muted,
    loop,
    display_order,
    video_orientation,
  } = videoData;

  const updateData = {};
  if (video_url !== undefined) updateData.video_url = video_url || null;
  if (video_file_path !== undefined) updateData.video_file_path = video_file_path || null;
  if (is_active !== undefined) updateData.is_active = is_active;
  if (autoplay !== undefined) updateData.autoplay = autoplay;
  if (muted !== undefined) updateData.muted = muted;
  if (loop !== undefined) updateData.loop = loop;
  if (display_order !== undefined) updateData.display_order = display_order;
  
  // Store video_orientation separately to handle schema cache issues
  const hasVideoOrientation = video_orientation !== undefined;
  const videoOrientationValue = video_orientation || 'horizontal';
  if (hasVideoOrientation) {
    updateData.video_orientation = videoOrientationValue;
  }

  let { data, error } = await supabase
    .from('landing_page_video')
    .update(updateData)
    .eq('id', id)
    .select('id, video_url, video_file_path, is_active, autoplay, muted, loop, display_order, video_orientation, created_at, updated_at')
    .single();

  // If error is about video_orientation column not found, retry without it
  if (error && hasVideoOrientation && (error.message?.includes('video_orientation') || error.message?.includes('schema cache'))) {
    // Remove video_orientation and retry
    delete updateData.video_orientation;
    const retryResult = await supabase
      .from('landing_page_video')
      .update(updateData)
      .eq('id', id)
      .select('id, video_url, video_file_path, is_active, autoplay, muted, loop, display_order, created_at, updated_at')
      .single();
    
    if (retryResult.error) throw retryResult.error;
    // Return with original orientation value (will be set once cache refreshes)
    return { ...retryResult.data, video_orientation: videoOrientationValue };
  }

  if (error) throw error;
  return data;
};

/**
 * Delete video by ID
 */
exports.deleteVideo = async (id) => {
  const { error } = await supabase
    .from('landing_page_video')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
};

/**
 * Reorder videos
 */
exports.reorderVideos = async (videoOrders) => {
  const updates = videoOrders.map(({ id, display_order }) =>
    supabase
      .from('landing_page_video')
      .update({ display_order })
      .eq('id', id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    throw new Error('Failed to reorder videos');
  }
  return { success: true };
};





