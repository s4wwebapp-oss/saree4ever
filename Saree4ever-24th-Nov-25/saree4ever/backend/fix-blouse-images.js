require('dotenv').config();
const { supabase } = require('./config/db');

async function fixBlouseImages() {
  console.log('🔧 Fixing broken blouse images...\n');

  // Map of SKU to verified working Image URL
  const fixes = [
    {
      sku: 'BL-GOLD-001', // Classic Golden Tissue Blouse
      url: 'https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      sku: 'BL-MAR-VEL-002', // Maroon Velvet Embroidered Blouse
      url: 'https://images.unsplash.com/photo-1596234728853-75237d9094c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      sku: 'BL-BLK-IKK-003', // Black Ikkat Cotton Blouse
      url: 'https://images.unsplash.com/photo-1627054248072-c7272273e883?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      sku: 'BL-PNK-BRO-004', // Pink Silk Brocade Blouse
      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      sku: 'BL-SLV-SEQ-005', // Silver Sequin Party Blouse
      url: 'https://images.unsplash.com/photo-1610189012906-6c02db532609?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
      sku: 'BL-GRN-KAL-006', // Green Kalamkari Boat Neck
      url: 'https://images.unsplash.com/photo-1601925260368-ae2f83d1212a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
  ];

  try {
    for (const item of fixes) {
      // Update Product
      const { error: prodError } = await supabase
        .from('products')
        .update({ 
          primary_image_url: item.url,
          image_urls: [item.url] // Reset array to just this working one
        })
        .eq('sku', item.sku);

      if (prodError) {
        console.error(`❌ Error updating product ${item.sku}:`, prodError.message);
      } else {
        console.log(`✅ Fixed image for product SKU: ${item.sku}`);
      }

      // Update Variants for this product (they often have their own image_url)
      // We first need the product ID to find variants easily, or verify by SKU pattern
      const { data: variants } = await supabase
        .from('variants')
        .select('id, sku')
        .ilike('sku', `${item.sku}%`); // Matches BL-GOLD-001-34 etc.

      if (variants && variants.length > 0) {
        const variantIds = variants.map(v => v.id);
        const { error: varError } = await supabase
          .from('variants')
          .update({ image_url: item.url })
          .in('id', variantIds);

        if (varError) {
           console.error(`   ❌ Error updating variants for ${item.sku}:`, varError.message);
        } else {
           console.log(`   ✅ Fixed images for ${variants.length} variants`);
        }
      }
    }
    
    // Also fix the category image itself if that was broken
    console.log('\n📁 Checking "Readymade Blouses" category image...');
    const { error: catError } = await supabase
        .from('categories')
        .update({ image_url: 'https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80' })
        .ilike('name', 'Blouses'); // Matches "Blouses" or "Readymade Blouses"
    
    if (catError) console.error('Error updating category image:', catError.message);
    else console.log('✅ "Blouses" category image updated.');


    console.log('\n✅ Blouse images repair complete!');

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

fixBlouseImages()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


