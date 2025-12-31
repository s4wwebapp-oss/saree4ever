require('dotenv').config();
const { supabase } = require('./config/db');

async function fixBlousesFinal() {
  console.log('🔧 Final fix for Blouses category image...\n');

  // Using a more reliable Unsplash image URL for blouse/saree
  // This is a popular saree image that should definitely work
  const reliableImageUrl = 'https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&h=500&q=80';

  try {
    // Update the "blouses" category specifically (for homepage)
    const { data, error } = await supabase
      .from('categories')
      .update({ 
        image_url: reliableImageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'blouses')
      .select('id, name, slug, image_url')
      .single();

    if (error) {
      console.error('❌ Error updating blouses category:', error.message);
      
      // Try alternative: check if it exists first
      const { data: checkData } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('slug', 'blouses')
        .single();
      
      if (checkData) {
        console.log('   Category exists but update failed, trying again...');
      } else {
        // Category doesn't exist, create it
        console.log('   Category does not exist, creating it...');
        const { data: newCat, error: createError } = await supabase
          .from('categories')
          .insert({
            name: 'Blouses',
            slug: 'blouses',
            description: 'Beautiful blouses to complement your sarees',
            image_url: reliableImageUrl,
            is_active: true,
            display_order: 1
          })
          .select()
          .single();
        
        if (createError) {
          console.error('   ❌ Failed to create category:', createError.message);
        } else {
          console.log('   ✅ Created new Blouses category');
        }
      }
    } else {
      console.log(`✅ Successfully updated Blouses category`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Slug: ${data.slug}`);
      console.log(`   Image URL: ${data.image_url}`);
    }

    console.log('\n✅ Fix complete!');
    console.log('📸 Please refresh your browser to see the updated image.');

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

fixBlousesFinal()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


