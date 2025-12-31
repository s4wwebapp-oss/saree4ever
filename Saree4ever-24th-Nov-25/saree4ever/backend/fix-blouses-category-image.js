require('dotenv').config();
const { supabase } = require('./config/db');

async function fixBlousesCategoryImage() {
  console.log('🔧 Fixing Blouses category image...\n');

  try {
    // First, let's check what categories exist with "blouse" in the name/slug
    const { data: allCategories, error: fetchError } = await supabase
      .from('categories')
      .select('id, name, slug, image_url')
      .or('name.ilike.%blouse%,slug.ilike.%blouse%');

    if (fetchError) {
      console.error('❌ Error fetching categories:', fetchError.message);
      return;
    }

    console.log('📋 Found categories with "blouse":');
    allCategories.forEach(cat => {
      console.log(`   - ${cat.name} (slug: ${cat.slug}) - Current image: ${cat.image_url ? 'Set' : 'Missing'}`);
    });

    // Update all blouse-related categories with a good image
    const newImageUrl = 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80';
    
    // This is a popular blouse/saree image that should work
    // Alternative backup: 'https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80'

    for (const cat of allCategories) {
      const { error: updateError } = await supabase
        .from('categories')
        .update({ 
          image_url: newImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', cat.id);

      if (updateError) {
        console.error(`❌ Error updating ${cat.name}:`, updateError.message);
      } else {
        console.log(`✅ Updated image for: ${cat.name} (${cat.slug})`);
      }
    }

    // Also check if there's a specific "Blouses" category (for homepage)
    const { data: blousesCat, error: blouseError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('slug', 'blouses')
      .single();

    if (blousesCat) {
      const { error: updateBlouses } = await supabase
        .from('categories')
        .update({ 
          image_url: newImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('slug', 'blouses');

      if (updateBlouses) {
        console.error('❌ Error updating blouses category:', updateBlouses.message);
      } else {
        console.log(`✅ Specifically updated "blouses" category image`);
      }
    } else if (blouseError && blouseError.code !== 'PGRST116') {
      console.error('⚠️ Error checking blouses category:', blouseError.message);
    }

    console.log('\n✅ Blouses category image fix complete!');
    console.log(`📸 New image URL: ${newImageUrl}`);

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

fixBlousesCategoryImage()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


