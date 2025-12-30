const { supabase } = require('./config/db');

async function fixLandingPageVideosTable() {
  try {
    console.log('Attempting to fix landing_page_videos table...');

    // Try to query with all columns to see what's missing
    const { data, error } = await supabase
      .from('landing_page_videos')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error querying table:', error.message);
      return;
    }

    console.log('Current columns:', Object.keys(data?.[0] || {}));

    // Now try to add missing columns using RPC or direct SQL
    // For now, let's try adding columns one by one with individual queries
    
    // Try selecting display_order to see if it exists
    try {
      const { data: displayOrderData, error: displayOrderError } = await supabase
        .from('landing_page_videos')
        .select('display_order')
        .limit(1);
      
      if (displayOrderError && displayOrderError.message?.includes('display_order')) {
        console.log('display_order column missing, attempting to add...');
        // Column is missing
      } else {
        console.log('display_order column exists');
      }
    } catch (e) {
      console.log('display_order column exists');
    }

    // Try selecting video_orientation
    try {
      const { data: orientationData, error: orientationError } = await supabase
        .from('landing_page_videos')
        .select('video_orientation')
        .limit(1);
      
      if (orientationError && orientationError.message?.includes('video_orientation')) {
        console.log('video_orientation column missing');
      } else {
        console.log('video_orientation column exists');
      }
    } catch (e) {
      console.log('video_orientation column exists');
    }

    console.log('\nTo add missing columns, run this SQL in Supabase SQL Editor:');
    console.log(`
ALTER TABLE public.landing_page_videos
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS video_orientation TEXT DEFAULT 'horizontal',
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

CREATE INDEX IF NOT EXISTS idx_landing_page_videos_display_order 
ON public.landing_page_videos(display_order);
    `);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixLandingPageVideosTable();
