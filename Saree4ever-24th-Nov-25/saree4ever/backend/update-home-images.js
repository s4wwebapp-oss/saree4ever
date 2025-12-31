require('dotenv').config();
const { supabase } = require('./config/db');

async function updateCategoryImages() {
  console.log('🖼️  Updating homepage category images...\n');

  // Map of slugs to new appropriate images
  const updates = [
    {
      slug: 'blouses', // Matches "Readymade Blouses" or "Blouses" depending on what's in DB. 
      // Using a generic slug check or updating both potential slugs to be safe.
      // We'll target the one displayed on homepage.
      name: 'Blouses', 
      image_url: 'https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?w=500&q=80' // Detailed blouse/saree back
    },
    {
      slug: 'jewels',
      name: 'Jewels',
      image_url: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&q=80' // Traditional Gold Jewellery
    },
    {
      slug: 'new-arrivals',
      name: 'New Arrivals',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&q=80' // Model in Saree
    },
    {
      slug: 'hot-deals',
      name: 'Hot Deals',
      image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&q=80' // Stack of Sarees / Sale vibe
    }
  ];

  try {
    for (const update of updates) {
      // We try to update by slug first
      let { data, error } = await supabase
        .from('categories')
        .update({ image_url: update.image_url })
        .eq('slug', update.slug)
        .select();

      // If no rows updated (maybe slug is different, e.g. "readymade-blouses"), try by name
      if (!data || data.length === 0) {
        console.log(`   ⚠️ Slug '${update.slug}' not found, trying name '${update.name}'...`);
         const { data: nameData, error: nameError } = await supabase
          .from('categories')
          .update({ image_url: update.image_url })
          .ilike('name', update.name) // Case insensitive match
          .select();
          
          data = nameData;
          error = nameError;
      }

      if (error) {
        console.error(`❌ Error updating ${update.name}:`, error.message);
      } else if (data && data.length > 0) {
        console.log(`✅ Updated image for: ${update.name}`);
      } else {
        console.warn(`⚠️ Could not find category: ${update.name}`);
      }
    }

    console.log('\n✅ Homepage images updated successfully!');

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

updateCategoryImages()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


