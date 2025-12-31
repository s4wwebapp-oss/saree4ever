require('dotenv').config();
const { supabase } = require('./config/db');

// ============================================
// CONFIGURATION: Set your image URL here
// ============================================
// If you've uploaded the image to Supabase Storage, the URL will look like:
// https://{your-project-id}.supabase.co/storage/v1/object/public/{bucket-name}/{file-path}
// 
// Or if you've uploaded it elsewhere, just paste the full URL here:
const CUSTOM_BLOUSE_IMAGE_URL = process.env.BLOUSE_IMAGE_URL || '';

// ============================================

async function updateBlousesWithCustomImage() {
  console.log('👚 Updating blouses with custom uploaded image...\n');

  if (!CUSTOM_BLOUSE_IMAGE_URL) {
    console.error('❌ Error: Please set the BLOUSE_IMAGE_URL environment variable or update it in this script.');
    console.log('\n📝 To use this script:');
    console.log('   1. Upload your image to Supabase Storage or any hosting service');
    console.log('   2. Get the public URL');
    console.log('   3. Run: BLOUSE_IMAGE_URL="your-image-url" node update-blouses-custom-image.js');
    console.log('   4. Or edit this script and set CUSTOM_BLOUSE_IMAGE_URL directly');
    process.exit(1);
  }

  console.log(`📸 Using image URL: ${CUSTOM_BLOUSE_IMAGE_URL}\n`);

  try {
    // 1. Update the "Blouses" category image (for homepage quick section)
    console.log('📁 Updating "Blouses" category image (homepage quick section)...');
    const { error: catError } = await supabase
      .from('categories')
      .update({ 
        image_url: CUSTOM_BLOUSE_IMAGE_URL,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'blouses');

    if (catError) {
      console.error('❌ Error updating Blouses category:', catError.message);
    } else {
      console.log('✅ Updated "Blouses" category image');
    }

    // 2. Update "Readymade Blouses" category if it exists
    console.log('\n📁 Updating "Readymade Blouses" category...');
    const { error: readymadeError } = await supabase
      .from('categories')
      .update({ 
        image_url: CUSTOM_BLOUSE_IMAGE_URL,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'readymade-blouses');

    if (readymadeError && !readymadeError.message.includes('0 rows')) {
      console.error('⚠️ Warning updating Readymade Blouses:', readymadeError.message);
    } else {
      console.log('✅ Updated "Readymade Blouses" category image');
    }

    // 3. Optionally update all blouse products to use this image too
    console.log('\n👗 Updating all blouse products with this image...');
    
    // Find all products in the readymade-blouses category
    const { data: blouseCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'readymade-blouses')
      .single();

    if (blouseCategory) {
      // Get all products in this category
      const { data: products } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', blouseCategory.id);

      if (products && products.length > 0) {
        const productIds = products.map(p => p.product_id);
        
        for (const productId of productIds) {
          const { error: prodError } = await supabase
            .from('products')
            .update({ 
              primary_image_url: CUSTOM_BLOUSE_IMAGE_URL,
              image_urls: [CUSTOM_BLOUSE_IMAGE_URL],
              updated_at: new Date().toISOString()
            })
            .eq('id', productId);

          if (prodError) {
            console.error(`   ⚠️ Warning updating product ${productId}:`, prodError.message);
          }
        }
        
        console.log(`✅ Updated ${productIds.length} blouse products`);
      }
    }

    console.log('\n✨ All updates complete!');
    console.log(`🔄 Please refresh your browser to see the updated "Blouses" category icon.`);

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

updateBlousesWithCustomImage()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


