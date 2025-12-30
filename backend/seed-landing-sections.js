require('dotenv').config();
const { supabase } = require('./config/db');

async function seedLandingPageSections() {
  console.log('Seeding landing page sections...');

  // First, try to add missing columns (will fail silently if they exist)
  try {
    await supabase.rpc('exec_sql', { 
      sql: `
        ALTER TABLE landing_page_sections ADD COLUMN IF NOT EXISTS section_name VARCHAR(100);
        ALTER TABLE landing_page_sections ADD COLUMN IF NOT EXISTS description TEXT;
        ALTER TABLE landing_page_sections ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
      `
    });
  } catch (err) {
    // Ignore errors - columns might already exist or rpc might not be available
    console.log('Note: Could not add columns via RPC (this is normal if columns already exist)');
  }

  const sections = [
    { section_key: 'hero_carousel', section_name: 'Hero Carousel', description: 'Main hero banner carousel at the top of the page', is_visible: true, display_order: 1 },
    { section_key: 'quick_categories', section_name: 'Quick Categories', description: 'Quick access category icons (Blouses, Jewels, New Arrivals, Hot Deals)', is_visible: true, display_order: 2 },
    { section_key: 'landing_videos', section_name: 'Landing Videos', description: 'Video section showcasing products or brand story', is_visible: true, display_order: 3 },
    { section_key: 'shop_by_category', section_name: 'Shop by Category', description: 'Full category grid with images and links', is_visible: true, display_order: 4 },
    { section_key: 'featured_products', section_name: 'Featured Products', description: 'Highlighted products marked as featured', is_visible: true, display_order: 5 },
    { section_key: 'collections', section_name: 'Collections', description: 'Curated collections like Festive, Bridal, etc.', is_visible: true, display_order: 6 },
    { section_key: 'reels', section_name: 'Reels / Short Videos', description: 'Instagram Reels or YouTube Shorts style content', is_visible: true, display_order: 7 },
    { section_key: 'stories', section_name: 'Stories / Blog', description: 'Featured blog posts and brand stories', is_visible: true, display_order: 8 },
    { section_key: 'testimonials', section_name: 'Testimonials', description: 'Customer testimonials and reviews', is_visible: true, display_order: 9 },
    { section_key: 'reviews', section_name: 'Customer Reviews', description: 'Product reviews section', is_visible: true, display_order: 10 },
    { section_key: 'about_preview', section_name: 'About Preview', description: 'Brief about us section with link to full page', is_visible: true, display_order: 11 },
    { section_key: 'why_choose_us', section_name: 'Why Choose Us', description: 'Key selling points and benefits', is_visible: true, display_order: 12 },
  ];

  // Try inserting with all columns first, fall back to basic columns if needed
  for (const section of sections) {
    let result = await supabase
      .from('landing_page_sections')
      .upsert(section, { onConflict: 'section_key' })
      .select();

    if (result.error && result.error.message.includes('column')) {
      // Columns don't exist, try with just the basic columns
      const basicSection = {
        section_key: section.section_key,
        is_visible: section.is_visible,
      };
      result = await supabase
        .from('landing_page_sections')
        .upsert(basicSection, { onConflict: 'section_key' })
        .select();
    }

    if (result.error) {
      console.error(`Error upserting ${section.section_key}:`, result.error.message);
    } else {
      console.log(`✓ ${section.section_key}: ${section.section_name || section.section_key} (visible: ${section.is_visible})`);
    }
  }

  console.log('\nDone! All sections seeded.');
  console.log('\n⚠️  If you see column errors above, run this SQL in Supabase SQL Editor:');
  console.log('   backend/migrations/update_landing_page_sections.sql');
}

seedLandingPageSections()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error seeding sections:', error);
    process.exit(1);
  });
