require('dotenv').config();
const { supabase } = require('./config/db');

// Helper function to generate slug
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seedBlouses() {
  console.log('👚 Starting to seed blouse collection...\n');

  try {
    // 1. Create or Get "Readymade Blouses" Category
    console.log('📁 Setting up "Readymade Blouses" category...');
    
    const blouseCategory = {
      name: 'Readymade Blouses',
      slug: 'readymade-blouses',
      description: 'Designer readymade blouses perfectly stitched for your sarees',
      is_active: true,
      display_order: 10, // Ensure it appears
      image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80'
    };

    const { data: categoryData, error: catError } = await supabase
      .from('categories')
      .upsert(blouseCategory, { onConflict: 'slug' })
      .select('id, name')
      .single();

    if (catError) throw catError;
    const categoryId = categoryData.id;
    console.log(`✅ Category Ready: ${categoryData.name} (${categoryId})`);

    // 2. Define Blouse Products with Stock Images and Rich Descriptions
    const blouses = [
      {
        name: 'Classic Golden Tissue Blouse',
        base_price: 1899.00,
        sku: 'BL-GOLD-001',
        description: 'Elegant golden tissue blouse with elbow-length sleeves.',
        long_description: `
          <div class="space-y-4">
            <p>A versatile classic that pairs with almost any saree. This golden tissue blouse features a sophisticated boat neck and elbow-length sleeves.</p>
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Fabric:</strong> Premium Tissue</li>
              <li><strong>Color:</strong> Antique Gold</li>
              <li><strong>Neckline:</strong> Boat Neck</li>
              <li><strong>Sleeves:</strong> Elbow Length</li>
              <li><strong>Padding:</strong> Padded with cotton lining</li>
            </ul>
          </div>
        `,
        primary_image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80', // Saree/Blouse close up
        image_urls: [
            'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80',
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80'
        ],
        tags: ['blouse', 'golden', 'tissue', 'readymade', 'party-wear'],
        is_featured: true
      },
      {
        name: 'Maroon Velvet Embroidered Blouse',
        base_price: 2499.00,
        sku: 'BL-MAR-VEL-002',
        description: 'Rich maroon velvet blouse with intricate zardosi embroidery.',
        long_description: `
          <div class="space-y-4">
            <p>Add a royal touch to your look with this maroon velvet blouse. Heavily embroidered with zardosi work, it is perfect for weddings and winter festivities.</p>
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Fabric:</strong> Premium Velvet</li>
              <li><strong>Color:</strong> Deep Maroon</li>
              <li><strong>Work:</strong> Zardosi Hand Embroidery</li>
              <li><strong>Back:</strong> Deep round neck with dori tie-up</li>
            </ul>
          </div>
        `,
        primary_image_url: 'https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?w=800&q=80', // Rich fabric texture
        image_urls: [
            'https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?w=800&q=80'
        ],
        tags: ['blouse', 'velvet', 'maroon', 'embroidered', 'bridal'],
        is_featured: true
      },
      {
        name: 'Black Ikkat Cotton Blouse',
        base_price: 1299.00,
        sku: 'BL-BLK-IKK-003',
        description: 'Contemporary black Ikkat cotton blouse for daily wear.',
        long_description: `
          <div class="space-y-4">
            <p>Smart and stylish. This black Ikkat cotton blouse features a collar neck and front buttons, giving it a modern crop-top look suitable for office wear.</p>
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Fabric:</strong> Pure Ikkat Cotton</li>
              <li><strong>Color:</strong> Black & White</li>
              <li><strong>Style:</strong> Shirt Collar</li>
              <li><strong>Occasion:</strong> Work / Casual</li>
            </ul>
          </div>
        `,
        primary_image_url: 'https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80', // Cotton texture
        image_urls: [
             'https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80'
        ],
        tags: ['blouse', 'cotton', 'ikkat', 'daily-wear', 'black'],
        is_featured: false
      },
      {
        name: 'Pink Silk Brocade Blouse',
        base_price: 1599.00,
        sku: 'BL-PNK-BRO-004',
        description: 'Vibrant pink silk brocade blouse with puff sleeves.',
        long_description: `
          <div class="space-y-4">
            <p>A festive favorite. This bright pink brocade blouse comes with trendy puff sleeves to add a retro charm to your traditional sarees.</p>
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Fabric:</strong> Silk Brocade</li>
              <li><strong>Color:</strong> Hot Pink</li>
              <li><strong>Sleeves:</strong> Puff Sleeves</li>
              <li><strong>Pattern:</strong> Golden Self-Weave</li>
            </ul>
          </div>
        `,
        primary_image_url: 'https://images.unsplash.com/photo-1596234728853-75237d9094c7?w=800&q=80', // Pink/Red silk
        image_urls: [
            'https://images.unsplash.com/photo-1596234728853-75237d9094c7?w=800&q=80'
        ],
        tags: ['blouse', 'silk', 'pink', 'brocade', 'puff-sleeves'],
        is_featured: false
      },
      {
        name: 'Silver Sequin Party Blouse',
        base_price: 2199.00,
        sku: 'BL-SLV-SEQ-005',
        description: 'Glamorous silver sequin blouse for cocktail parties.',
        long_description: `
          <div class="space-y-4">
            <p>Shine all night with this dazzling silver sequin blouse. Sleeveless design with a plunging V-neck makes it a bold choice for evening parties.</p>
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Fabric:</strong> Georgette with Sequins</li>
              <li><strong>Color:</strong> Silver</li>
              <li><strong>Sleeves:</strong> Sleeveless</li>
              <li><strong>Style:</strong> Party Wear / Cocktail</li>
            </ul>
          </div>
        `,
        primary_image_url: 'https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80', // Glittery/Party texture
        image_urls: [
            'https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80'
        ],
        tags: ['blouse', 'sequin', 'silver', 'party', 'sleeveless'],
        is_featured: true
      },
      {
        name: 'Green Kalamkari Boat Neck',
        base_price: 1499.00,
        sku: 'BL-GRN-KAL-006',
        description: 'Artistic Green Kalamkari print blouse with boat neck.',
        long_description: `
          <div class="space-y-4">
            <p>Features authentic Kalamkari prints on a bottle green base. The high boat neck adds sophistication, making it suitable for both office and casual outings.</p>
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Fabric:</strong> Cotton Silk</li>
              <li><strong>Print:</strong> Kalamkari</li>
              <li><strong>Color:</strong> Bottle Green</li>
              <li><strong>Neck:</strong> Boat Neck</li>
            </ul>
          </div>
        `,
        primary_image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83d1212a?w=800&q=80', // Green/Cotton texture
        image_urls: [
            'https://images.unsplash.com/photo-1601925260368-ae2f83d1212a?w=800&q=80'
        ],
        tags: ['blouse', 'kalamkari', 'green', 'cotton-silk', 'artistic'],
        is_featured: false
      }
    ];

    // 3. Insert Products and Variants
    for (const blouse of blouses) {
      const slug = generateSlug(blouse.name);
      
      // Insert Product
      const { data: product, error: prodError } = await supabase
        .from('products')
        .upsert({
          name: blouse.name,
          slug: slug,
          description: blouse.description,
          long_description: blouse.long_description,
          base_price: blouse.base_price,
          compare_at_price: blouse.base_price * 1.2, // Mock MRP
          sku: blouse.sku,
          category_id: categoryId,
          primary_image_url: blouse.primary_image_url,
          image_urls: blouse.image_urls,
          tags: blouse.tags,
          is_featured: blouse.is_featured,
          is_active: true
        }, { onConflict: 'slug' })
        .select('id, name')
        .single();

      if (prodError) {
        console.error(`❌ Failed to create product ${blouse.name}:`, prodError.message);
        continue;
      }
      
      console.log(`✅ Created product: ${product.name}`);

      // Create Variants (Sizes)
      const sizes = ['34', '36', '38', '40', '42'];
      const variants = sizes.map(size => ({
        product_id: product.id,
        name: `${blouse.name} - Size ${size}`,
        sku: `${blouse.sku}-${size}`,
        price: blouse.base_price,
        size: size,
        stock_quantity: Math.floor(Math.random() * 10) + 1, // Random stock 1-10
        is_active: true,
        track_inventory: true
      }));

      const { error: varError } = await supabase
        .from('variants')
        .upsert(variants, { onConflict: 'sku' });

      if (varError) {
        console.error(`   ❌ Failed to create variants for ${blouse.name}:`, varError.message);
      } else {
        console.log(`   ✅ Created ${variants.length} size variants`);
      }

      // Link to Category (Junction Table)
      const { error: linkError } = await supabase
        .from('product_categories')
        .upsert({
          product_id: product.id,
          category_id: categoryId,
          display_order: 0
        }, { onConflict: 'product_id,category_id' }); // Assuming composite key exists or we just insert

       // Note: schema usually has composite PK on product_categories or unique constraint
       // If upsert fails due to missing constraint, we can try insert and ignore
       if (linkError && !linkError.message.includes('duplicate key')) {
          console.warn(`   ⚠️ Link warning: ${linkError.message}`);
       }
    }

    console.log('\n✅ Blouse seeding completed!');
    console.log(`✨ Added ${blouses.length} blouse designs with multiple sizes.`);

  } catch (error) {
    console.error('❌ Error in seeding blouses:', error);
    process.exit(1);
  }
}

seedBlouses()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


