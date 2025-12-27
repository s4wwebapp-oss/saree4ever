require('dotenv').config();
const { supabase } = require('./config/db');

async function updateBlousesWithPinkImage() {
  console.log('👚 Updating blouses with pink embroidered blouse image...\n');

  // High-quality pink embroidered blouse image URLs (similar to the image shown)
  // Using Unsplash images that match the pink embroidered blouse aesthetic
  const pinkBlouseImage = 'https://images.unsplash.com/photo-1596234728853-75237d9094c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800&q=80';
  
  // Alternative URLs for variety (all pink/embroidered blouse related)
  const alternativeImages = [
    'https://images.unsplash.com/photo-1596234728853-75237d9094c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Pink/Red embroidered
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', // Rich silk/pink
    'https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'  // Maroon/embellished
  ];

  try {
    // 1. Update the "Blouses" category image with pink embroidered blouse
    console.log('📁 Updating Blouses category image...');
    const { error: catError } = await supabase
      .from('categories')
      .update({ 
        image_url: pinkBlouseImage,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'blouses');

    if (catError) {
      console.error('❌ Error updating category:', catError.message);
    } else {
      console.log('✅ Updated Blouses category image');
    }

    // 2. Update all blouse products - prioritize pink/embroidered styles
    console.log('\n👗 Updating blouse products...');
    
    const blouseUpdates = [
      {
        sku: 'BL-PNK-BRO-004', // Pink Silk Brocade Blouse - use pink image
        image: pinkBlouseImage
      },
      {
        sku: 'BL-MAR-VEL-002', // Maroon Velvet Embroidered - use rich embroidered
        image: alternativeImages[2] // Maroon/rich color
      },
      {
        sku: 'BL-GOLD-001', // Golden Tissue Blouse - keep elegant
        image: alternativeImages[1] // Rich silk
      },
      {
        sku: 'BL-SLV-SEQ-005', // Silver Sequin Party Blouse
        image: alternativeImages[1] // Party/glamorous
      },
      {
        sku: 'BL-BLK-IKK-003', // Black Ikkat Cotton Blouse
        image: alternativeImages[2] // Cotton texture appropriate
      },
      {
        sku: 'BL-GRN-KAL-006', // Green Kalamkari Boat Neck
        image: alternativeImages[2] // Artistic/Kalamkari style
      }
    ];

    for (const update of blouseUpdates) {
      // Update product primary image
      const { error: prodError } = await supabase
        .from('products')
        .update({ 
          primary_image_url: update.image,
          image_urls: [update.image],
          updated_at: new Date().toISOString()
        })
        .eq('sku', update.sku);

      if (prodError) {
        console.error(`❌ Error updating product ${update.sku}:`, prodError.message);
      } else {
        console.log(`✅ Updated product: ${update.sku}`);

        // Update all variants for this product
        const { data: variants } = await supabase
          .from('variants')
          .select('id')
          .ilike('sku', `${update.sku}%`);

        if (variants && variants.length > 0) {
          const variantIds = variants.map(v => v.id);
          const { error: varError } = await supabase
            .from('variants')
            .update({ 
              image_url: update.image,
              updated_at: new Date().toISOString()
            })
            .in('id', variantIds);

          if (varError) {
            console.error(`   ⚠️ Warning updating variants:`, varError.message);
          } else {
            console.log(`   ✅ Updated ${variants.length} variants`);
          }
        }
      }
    }

    // 3. Also update "Readymade Blouses" category if it exists
    console.log('\n📁 Checking Readymade Blouses category...');
    const { error: readymadeError } = await supabase
      .from('categories')
      .update({ 
        image_url: pinkBlouseImage,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'readymade-blouses');

    if (readymadeError && !readymadeError.message.includes('0 rows')) {
      console.error('⚠️ Warning updating readymade-blouses:', readymadeError.message);
    } else {
      console.log('✅ Updated Readymade Blouses category image');
    }

    console.log('\n✨ All blouse images updated successfully!');
    console.log(`📸 Main image URL: ${pinkBlouseImage}`);
    console.log('🔄 Please refresh your browser to see the updated images.');

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

updateBlousesWithPinkImage()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


