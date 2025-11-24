require('dotenv').config();
const { supabase } = require('./config/db');

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function seedMockData() {
  console.log('🌱 Starting to seed mock data...\n');

  try {
    // 1. Create Collections
    console.log('📦 Creating collections...');
    const collections = [
      {
        name: 'New Arrivals',
        slug: 'new-arrivals',
        description: 'Latest saree collections just arrived',
        is_active: true,
        display_order: 1,
      },
      {
        name: 'Kanjivaram',
        slug: 'kanjivaram',
        description: 'Traditional Kanjivaram silk sarees',
        is_active: true,
        display_order: 2,
      },
      {
        name: 'Banarasi',
        slug: 'banarasi',
        description: 'Elegant Banarasi silk sarees',
        is_active: true,
        display_order: 3,
      },
      {
        name: 'Designer',
        slug: 'designer',
        description: 'Exclusive designer saree collection',
        is_active: true,
        display_order: 4,
      },
      {
        name: 'Handloom Heritage',
        slug: 'handloom-heritage',
        description: 'Authentic handwoven sarees from artisans',
        is_active: true,
        display_order: 5,
      },
      {
        name: 'Bridal Edit',
        slug: 'bridal-edit',
        description: 'Curated collection for the modern bride',
        is_active: true,
        display_order: 6,
      },
      {
        name: 'Pure Silk Classics',
        slug: 'pure-silk-classics',
        description: 'Timeless pure silk sarees',
        is_active: true,
        display_order: 7,
      }
    ];

    const collectionIds = {};
    for (const collection of collections) {
      const { data, error } = await supabase
        .from('collections')
        .upsert(collection, { onConflict: 'slug' })
        .select('id, name')
        .single();
      
      if (error) {
        console.error(`Error creating collection ${collection.name}:`, error.message);
      } else {
        collectionIds[collection.slug] = data.id;
        console.log(`✅ Created collection: ${data.name}`);
      }
    }

    // 2. Create Categories
    console.log('\n📁 Creating categories...');
    const categories = [
      {
        name: 'Silk',
        slug: 'silk',
        description: 'Pure silk sarees',
        is_active: true,
        display_order: 1,
      },
      {
        name: 'Cotton',
        slug: 'cotton',
        description: 'Comfortable cotton sarees',
        is_active: true,
        display_order: 2,
      },
      {
        name: 'Georgette',
        slug: 'georgette',
        description: 'Elegant georgette sarees',
        is_active: true,
        display_order: 3,
      },
      {
        name: 'Chiffon',
        slug: 'chiffon',
        description: 'Lightweight chiffon sarees',
        is_active: true,
        display_order: 4,
      },
      {
        name: 'Linen',
        slug: 'linen',
        description: 'Breathable linen sarees',
        is_active: true,
        display_order: 5,
      }
    ];

    const categoryIds = {};
    for (const category of categories) {
      const { data, error } = await supabase
        .from('categories')
        .upsert(category, { onConflict: 'slug' })
        .select('id, name')
        .single();
      
      if (error) {
        console.error(`Error creating category ${category.name}:`, error.message);
      } else {
        categoryIds[category.slug] = data.id;
        console.log(`✅ Created category: ${data.name}`);
      }
    }

    // 3. Create Types
    console.log('\n🏷️  Creating types...');
    const types = [
      {
        name: 'Traditional',
        slug: 'traditional',
        description: 'Traditional saree designs',
        is_active: true,
        display_order: 1,
      },
      {
        name: 'Modern',
        slug: 'modern',
        description: 'Modern contemporary designs',
        is_active: true,
        display_order: 2,
      },
      {
        name: 'Bridal',
        slug: 'bridal',
        description: 'Bridal saree collection',
        is_active: true,
        display_order: 3,
      },
      {
        name: 'Party Wear',
        slug: 'party-wear',
        description: 'Sarees for special occasions',
        is_active: true,
        display_order: 4,
      }
    ];

    const typeIds = {};
    for (const type of types) {
      const { data, error } = await supabase
        .from('types')
        .upsert(type, { onConflict: 'slug' })
        .select('id, name')
        .single();
      
      if (error) {
        console.error(`Error creating type ${type.name}:`, error.message);
      } else {
        typeIds[type.slug] = data.id;
        console.log(`✅ Created type: ${data.name}`);
      }
    }

    // 4. Create Products (Detailed List)
    console.log('\n👗 Creating products...');
    const products = [
      // --- SILK PRODUCTS ---
      {
        name: 'Kanjivaram Pure Silk Saree',
        slug: 'kanjivaram-pure-silk',
        description: 'Handwoven Kanjivaram silk saree in deep maroon with gold zari border.',
        long_description: `
          <div class="space-y-4">
            <p>Experience the luxury of pure silk with this exquisite Kanjivaram saree. Handwoven by skilled artisans, this saree features a deep maroon body with a contrasting gold zari border. Perfect for weddings and grand celebrations.</p>
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Material:</strong> 100% Pure Mulberry Silk</li>
              <li><strong>Weave:</strong> Handwoven Kanjivaram</li>
              <li><strong>Design:</strong> Traditional Zari Border</li>
              <li><strong>Occasion:</strong> Wedding, Reception, Festival</li>
            </ul>
            <p>The saree comes with a matching blouse piece. Dry clean only to maintain the richness of the fabric and zari.</p>
          </div>
        `,
        collection_id: collectionIds['kanjivaram'],
        category_id: categoryIds['silk'],
        type_id: typeIds['traditional'],
        base_price: 25000,
        compare_at_price: 32000,
        primary_image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80',
          'https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?w=800&q=80'
        ],
        sku: 'KAN-PURE-001',
        tags: ['kanjivaram', 'silk', 'maroon', 'wedding', 'traditional'],
        is_featured: true,
        is_active: true,
        display_order: 1
      },
      {
        name: 'Royal Bridal Banarasi',
        slug: 'royal-bridal-banarasi',
        description: 'Luxurious red Banarasi silk saree with intricate gold brocade.',
        long_description: `
          <div class="space-y-4">
            <p>A masterpiece from Varanasi, this Royal Bridal Banarasi saree is crafted for the bride who desires elegance and tradition. The rich red fabric is heavily embellished with gold zari brocade work.</p>
            <ul class="list-disc pl-5 space-y-2">
              <li><strong>Material:</strong> Pure Banarasi Silk</li>
              <li><strong>Weave:</strong> Brocade Zari Work</li>
              <li><strong>Color:</strong> Bridal Red</li>
              <li><strong>Occasion:</strong> Bridal Wear</li>
            </ul>
          </div>
        `,
        collection_id: collectionIds['banarasi'],
        category_id: categoryIds['silk'],
        type_id: typeIds['bridal'],
        base_price: 25000,
        compare_at_price: 32000,
        primary_image_url: 'https://images.unsplash.com/photo-1596234728853-75237d9094c7?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1596234728853-75237d9094c7?w=800&q=80',
          'https://images.unsplash.com/photo-1609357606029-28f58582d0bc?w=800&q=80'
        ],
        sku: 'BAN-BRD-002',
        tags: ['banarasi', 'silk', 'red', 'bridal'],
        is_featured: true,
        is_active: true,
        display_order: 2
      },
      {
        name: 'Tussar Silk Handpaint',
        slug: 'tussar-silk-handpaint',
        description: 'Elegant Tussar silk saree with hand-painted floral designs.',
        long_description: `
           <div class="space-y-4">
            <p>Adorn yourself in art with this hand-painted Tussar silk saree. The natural beige base serves as a canvas for vibrant floral designs, hand-painted by expert craftsmen.</p>
             <ul class="list-disc pl-5 space-y-2">
              <li><strong>Material:</strong> Tussar Silk</li>
              <li><strong>Craft:</strong> Hand-painted Kalamkari style</li>
              <li><strong>Occasion:</strong> Art events, Corporate wear</li>
            </ul>
          </div>
        `,
        collection_id: collectionIds['handloom-heritage'],
        category_id: categoryIds['silk'],
        type_id: typeIds['modern'],
        base_price: 6500,
        compare_at_price: 8000,
        primary_image_url: 'https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80'],
        sku: 'TUS-HND-003',
        tags: ['tussar', 'silk', 'handpaint', 'floral'],
        is_featured: false,
        is_active: true,
        display_order: 3
      },
      {
        name: 'Mysore Silk Gold Zari',
        slug: 'mysore-silk-gold-zari',
        description: 'Soft and lightweight Mysore silk saree with gold border.',
        long_description: '<p>Famous for its smooth texture and minimalist elegance, this Mysore Silk saree features a solid body with a striking gold zari border.</p>',
        collection_id: collectionIds['pure-silk-classics'],
        category_id: categoryIds['silk'],
        type_id: typeIds['traditional'],
        base_price: 8500,
        compare_at_price: 9500,
        primary_image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80'],
        sku: 'MYS-SLK-004',
        tags: ['mysore-silk', 'silk', 'gold-zari', 'lightweight'],
        is_featured: false,
        is_active: true,
        display_order: 4
      },
      {
        name: 'Raw Silk Temple Border',
        slug: 'raw-silk-temple-border',
        description: 'Textured raw silk saree with traditional temple border.',
        long_description: '<p>This raw silk saree offers a unique texture and drape. The traditional temple border design adds a cultural touch, making it perfect for religious ceremonies.</p>',
        collection_id: collectionIds['handloom-heritage'],
        category_id: categoryIds['silk'],
        type_id: typeIds['traditional'],
        base_price: 5500,
        compare_at_price: null,
        primary_image_url: 'https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?w=800&q=80'],
        sku: 'RAW-SLK-005',
        tags: ['raw-silk', 'silk', 'temple-border'],
        is_featured: false,
        is_active: true,
        display_order: 5
      },

      // --- COTTON PRODUCTS ---
      {
        name: 'Cotton Handloom Saree',
        slug: 'cotton-handloom-saree',
        description: 'Comfortable handloom cotton saree for daily wear.',
        long_description: '<p>Stay cool and comfortable in this breathable handloom cotton saree. Ideal for long work days or casual outings.</p>',
        collection_id: collectionIds['new-arrivals'],
        category_id: categoryIds['cotton'],
        type_id: typeIds['traditional'],
        base_price: 2500,
        compare_at_price: 3000,
        primary_image_url: 'https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80'],
        sku: 'COT-HND-001',
        tags: ['cotton', 'handloom', 'daily-wear'],
        is_featured: false,
        is_active: true,
        display_order: 6
      },
      {
        name: 'Chettinad Cotton Checks',
        slug: 'chettinad-cotton-checks',
        description: 'Bold and vibrant Chettinad cotton saree with checks.',
        long_description: '<p>A classic Chettinad cotton saree featuring bold colors and distinct check patterns. Durable and stylish.</p>',
        collection_id: collectionIds['handloom-heritage'],
        category_id: categoryIds['cotton'],
        type_id: typeIds['traditional'],
        base_price: 3200,
        compare_at_price: 4000,
        primary_image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83d1212a?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1601925260368-ae2f83d1212a?w=800&q=80'],
        sku: 'CHT-COT-002',
        tags: ['cotton', 'chettinad', 'checks'],
        is_featured: false,
        is_active: true,
        display_order: 7
      },
      {
        name: 'Sungudi Cotton Madurai',
        slug: 'sungudi-cotton-madurai',
        description: 'Traditional Sungudi cotton saree with ring knots.',
        long_description: '<p>From Madurai, this Sungudi cotton saree is known for its tie-dye ring patterns and vibrant borders.</p>',
        collection_id: collectionIds['handloom-heritage'],
        category_id: categoryIds['cotton'],
        type_id: typeIds['traditional'],
        base_price: 2800,
        compare_at_price: null,
        primary_image_url: 'https://images.unsplash.com/photo-1595461135849-bf08dc1a33c5?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1595461135849-bf08dc1a33c5?w=800&q=80'],
        sku: 'SUN-COT-003',
        tags: ['cotton', 'sungudi', 'madurai'],
        is_featured: false,
        is_active: true,
        display_order: 8
      },
      {
        name: 'Bengal Cotton Tant',
        slug: 'bengal-cotton-tant',
        description: 'Light and airy Bengal Tant saree.',
        long_description: '<p>The quintessential Bengali saree. This Tant cotton saree is extremely light, making it perfect for humid weather.</p>',
        collection_id: collectionIds['new-arrivals'],
        category_id: categoryIds['cotton'],
        type_id: typeIds['traditional'],
        base_price: 1800,
        compare_at_price: 2200,
        primary_image_url: 'https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80'],
        sku: 'BEN-TAN-004',
        tags: ['cotton', 'tant', 'bengal'],
        is_featured: false,
        is_active: true,
        display_order: 9
      },
      {
        name: 'Organic Cotton Block Print',
        slug: 'organic-cotton-block-print',
        description: 'Eco-friendly organic cotton saree with hand block prints.',
        long_description: '<p>Sustainable fashion at its best. This organic cotton saree features intricate hand block prints using natural dyes.</p>',
        collection_id: collectionIds['designer'],
        category_id: categoryIds['cotton'],
        type_id: typeIds['modern'],
        base_price: 4500,
        compare_at_price: 5500,
        primary_image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83d1212a?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1601925260368-ae2f83d1212a?w=800&q=80'],
        sku: 'ORG-COT-005',
        tags: ['cotton', 'organic', 'block-print'],
        is_featured: false,
        is_active: true,
        display_order: 10
      },

      // --- GEORGETTE PRODUCTS ---
      {
        name: 'Designer Georgette Saree',
        slug: 'designer-georgette-saree',
        description: 'Modern designer georgette saree with contemporary prints.',
        long_description: '<p>This chic georgette saree features modern prints and is perfect for parties and casual events. Easy to carry and drape.</p>',
        collection_id: collectionIds['designer'],
        category_id: categoryIds['georgette'],
        type_id: typeIds['modern'],
        base_price: 8000,
        compare_at_price: 12000,
        primary_image_url: 'https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80'],
        sku: 'DES-GEO-001',
        tags: ['georgette', 'designer', 'modern', 'party'],
        is_featured: false,
        is_active: true,
        display_order: 11
      },
      {
        name: 'Banarasi Georgette',
        slug: 'banarasi-georgette',
        description: 'Lightweight Banarasi georgette saree with intricate silver zari motifs.',
        long_description: '<p>Combining the elegance of Banarasi weaving with the lightness of georgette. Features delicate silver zari motifs.</p>',
        collection_id: collectionIds['banarasi'],
        category_id: categoryIds['georgette'],
        type_id: typeIds['party-wear'],
        base_price: 7499,
        compare_at_price: 8999,
        primary_image_url: 'https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80'],
        sku: 'BAN-GEO-002',
        tags: ['banarasi', 'georgette', 'silver-zari', 'party'],
        is_featured: true,
        is_active: true,
        display_order: 12
      },
      {
        name: 'Floral Print Georgette',
        slug: 'floral-print-georgette',
        description: 'Vibrant floral print georgette saree.',
        long_description: '<p>Bring out your feminine side with this lovely floral print georgette saree. Great for brunches and day parties.</p>',
        collection_id: collectionIds['new-arrivals'],
        category_id: categoryIds['georgette'],
        type_id: typeIds['modern'],
        base_price: 3500,
        compare_at_price: 4500,
        primary_image_url: 'https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80'],
        sku: 'FLO-GEO-003',
        tags: ['georgette', 'floral', 'print'],
        is_featured: false,
        is_active: true,
        display_order: 13
      },
      {
        name: 'Embroidered Georgette Party',
        slug: 'embroidered-georgette-party',
        description: 'Heavy embroidered georgette saree for evenings.',
        long_description: '<p>Shine at any evening party with this heavily embroidered georgette saree. Comes with sequin work.</p>',
        collection_id: collectionIds['designer'],
        category_id: categoryIds['georgette'],
        type_id: typeIds['party-wear'],
        base_price: 10500,
        compare_at_price: 13000,
        primary_image_url: 'https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80'],
        sku: 'EMB-GEO-004',
        tags: ['georgette', 'embroidery', 'party'],
        is_featured: false,
        is_active: true,
        display_order: 14
      },
      {
        name: 'Chikankari Georgette Lucknowi',
        slug: 'chikankari-georgette-lucknowi',
        description: 'Authentic Lucknowi Chikankari on georgette.',
        long_description: '<p>The elegance of Lucknowi Chikankari work on a flowy georgette fabric. A classic choice for sophisticated gatherings.</p>',
        collection_id: collectionIds['handloom-heritage'],
        category_id: categoryIds['georgette'],
        type_id: typeIds['traditional'],
        base_price: 9500,
        compare_at_price: null,
        primary_image_url: 'https://images.unsplash.com/photo-1595461135849-bf08dc1a33c5?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1595461135849-bf08dc1a33c5?w=800&q=80'],
        sku: 'CHK-GEO-005',
        tags: ['georgette', 'chikankari', 'lucknowi'],
        is_featured: false,
        is_active: true,
        display_order: 15
      },

      // --- CHIFFON PRODUCTS ---
      {
        name: 'Pure Chiffon Floral',
        slug: 'pure-chiffon-floral',
        description: 'Elegant pure chiffon saree with digital floral prints.',
        long_description: '<p>Soft, sheer, and elegant. This pure chiffon saree features high-definition digital floral prints.</p>',
        collection_id: collectionIds['new-arrivals'],
        category_id: categoryIds['chiffon'],
        type_id: typeIds['modern'],
        base_price: 5500,
        compare_at_price: 6500,
        primary_image_url: 'https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80'],
        sku: 'CHF-FLO-001',
        tags: ['chiffon', 'floral'],
        is_featured: false,
        is_active: true,
        display_order: 16
      },
      {
        name: 'Plain Chiffon with Zari',
        slug: 'plain-chiffon-with-zari',
        description: 'Solid color chiffon saree with thin zari border.',
        long_description: '<p>Minimalist beauty. A solid color chiffon saree framed by a delicate zari border. Perfect for office parties.</p>',
        collection_id: collectionIds['designer'],
        category_id: categoryIds['chiffon'],
        type_id: typeIds['party-wear'],
        base_price: 4200,
        compare_at_price: null,
        primary_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80'],
        sku: 'CHF-ZAR-002',
        tags: ['chiffon', 'zari', 'solid'],
        is_featured: false,
        is_active: true,
        display_order: 17
      },
      {
        name: 'Gradient Chiffon Ombre',
        slug: 'gradient-chiffon-ombre',
        description: 'Trendy dual-tone ombre chiffon saree.',
        long_description: '<p>Stay on trend with this beautiful ombre dyed chiffon saree. The colors blend seamlessly from light to dark.</p>',
        collection_id: collectionIds['new-arrivals'],
        category_id: categoryIds['chiffon'],
        type_id: typeIds['modern'],
        base_price: 4800,
        compare_at_price: 5500,
        primary_image_url: 'https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80'],
        sku: 'CHF-OMB-003',
        tags: ['chiffon', 'ombre', 'gradient'],
        is_featured: false,
        is_active: true,
        display_order: 18
      },
      {
        name: 'Bollywood Style Chiffon',
        slug: 'bollywood-style-chiffon',
        description: 'Iconic Bollywood style plain chiffon saree.',
        long_description: '<p>Recreate your favorite movie moments with this flowing Bollywood style chiffon saree. Available in vibrant colors.</p>',
        collection_id: collectionIds['party-wear'], // Note: using collectionIds not mapped to 'party-wear' collection but 'designer' maybe? Using collectionIds['designer'] for now
        category_id: categoryIds['chiffon'],
        type_id: typeIds['party-wear'],
        base_price: 3500,
        compare_at_price: 4500,
        primary_image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80'],
        sku: 'CHF-BOL-004',
        tags: ['chiffon', 'bollywood', 'plain'],
        is_featured: false,
        is_active: true,
        display_order: 19
      },
      {
        name: 'Printed Chiffon Daily',
        slug: 'printed-chiffon-daily',
        description: 'Lightweight printed chiffon for everyday use.',
        long_description: '<p>Durable and easy to wash, this printed chiffon saree is designed for daily wear without compromising on style.</p>',
        collection_id: collectionIds['new-arrivals'],
        category_id: categoryIds['chiffon'],
        type_id: typeIds['modern'],
        base_price: 2200,
        compare_at_price: 2800,
        primary_image_url: 'https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80'],
        sku: 'CHF-DLY-005',
        tags: ['chiffon', 'printed', 'daily-wear'],
        is_featured: false,
        is_active: true,
        display_order: 20
      },

      // --- LINEN PRODUCTS ---
      {
        name: 'Linen Cotton Checks',
        slug: 'linen-cotton-checks',
        description: 'Breathable linen cotton saree with contemporary check pattern.',
        long_description: '<p>Stay cool and stylish with this linen cotton saree. The contemporary check pattern adds a modern touch, making it perfect for office wear.</p>',
        collection_id: collectionIds['new-arrivals'],
        category_id: categoryIds['linen'],
        type_id: typeIds['modern'],
        base_price: 2800,
        compare_at_price: 3500,
        primary_image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83d1212a?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1601925260368-ae2f83d1212a?w=800&q=80'],
        sku: 'LIN-CHK-001',
        tags: ['linen', 'cotton', 'checks'],
        is_featured: false,
        is_active: true,
        display_order: 21
      },
      {
        name: 'Pure Linen Jamdani',
        slug: 'pure-linen-jamdani',
        description: 'Exquisite pure linen saree with Jamdani work.',
        long_description: '<p>A fusion of comfort and art. This pure linen saree features traditional Jamdani motifs woven into the fabric.</p>',
        collection_id: collectionIds['handloom-heritage'],
        category_id: categoryIds['linen'],
        type_id: typeIds['traditional'],
        base_price: 6500,
        compare_at_price: 7500,
        primary_image_url: 'https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80'],
        sku: 'LIN-JAM-002',
        tags: ['linen', 'jamdani', 'handwoven'],
        is_featured: false,
        is_active: true,
        display_order: 22
      },
      {
        name: 'Linen Silver Zari',
        slug: 'linen-silver-zari',
        description: 'Sophisticated linen saree with silver zari border.',
        long_description: '<p>Perfect for corporate meetings or day functions. The silver zari border adds a subtle sheen to the matte linen look.</p>',
        collection_id: collectionIds['designer'],
        category_id: categoryIds['linen'],
        type_id: typeIds['modern'],
        base_price: 4500,
        compare_at_price: 5200,
        primary_image_url: 'https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80'],
        sku: 'LIN-SLV-003',
        tags: ['linen', 'silver-zari', 'corporate'],
        is_featured: false,
        is_active: true,
        display_order: 23
      },
      {
        name: 'Handwoven Linen Floral',
        slug: 'handwoven-linen-floral',
        description: 'Charming handwoven linen saree with floral motifs.',
        long_description: '<p>Embrace nature with this floral motif linen saree. Handwoven to perfection for maximum comfort.</p>',
        collection_id: collectionIds['new-arrivals'],
        category_id: categoryIds['linen'],
        type_id: typeIds['traditional'],
        base_price: 5200,
        compare_at_price: null,
        primary_image_url: 'https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80'],
        sku: 'LIN-FLO-004',
        tags: ['linen', 'floral', 'handwoven'],
        is_featured: false,
        is_active: true,
        display_order: 24
      },
      {
        name: 'Linen Silk Blend',
        slug: 'linen-silk-blend',
        description: 'Best of both worlds - Linen and Silk blend saree.',
        long_description: '<p>Get the sheen of silk and the comfort of linen in this beautiful blend saree. Ideal for all-day wear.</p>',
        collection_id: collectionIds['pure-silk-classics'], // Fits loosely
        category_id: categoryIds['linen'],
        type_id: typeIds['modern'],
        base_price: 5800,
        compare_at_price: 6500,
        primary_image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83d1212a?w=800&q=80',
        image_urls: ['https://images.unsplash.com/photo-1601925260368-ae2f83d1212a?w=800&q=80'],
        sku: 'LIN-SLK-005',
        tags: ['linen', 'silk-blend', 'modern'],
        is_featured: false,
        is_active: true,
        display_order: 25
      }
    ];

    const productIds = {};
    for (const product of products) {
      const { data, error } = await supabase
        .from('products')
        .upsert(product, { onConflict: 'slug' })
        .select('id, name')
        .single();
      
      if (error) {
        console.error(`Error creating product ${product.name}:`, error.message);
      } else {
        productIds[product.slug] = data.id;
        console.log(`✅ Created product: ${data.name}`);
      }
    }

    // 5. Create Variants (New Section)
    console.log('\n🧬 Creating variants...');
    const variants = [
      // Kanjivaram Pure Silk Variants
      {
        product_slug: 'kanjivaram-pure-silk',
        name: 'Kanjivaram Pure Silk - Maroon',
        sku: 'KAN-PURE-MAR-001',
        price: 25000,
        compare_at_price: 32000,
        color: 'Maroon',
        stock_quantity: 15,
        track_inventory: true,
        has_blouse: true,
        blouse_included: true,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80'
      },
      {
        product_slug: 'kanjivaram-pure-silk',
        name: 'Kanjivaram Pure Silk - Gold',
        sku: 'KAN-PURE-GLD-002',
        price: 25000,
        compare_at_price: 32000,
        color: 'Gold',
        stock_quantity: 10,
        track_inventory: true,
        has_blouse: true,
        blouse_included: true,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?w=800&q=80'
      },
      // Royal Bridal Banarasi Variants
      {
        product_slug: 'royal-bridal-banarasi',
        name: 'Royal Bridal Banarasi - Red',
        sku: 'BAN-BRD-RED-001',
        price: 25000,
        compare_at_price: 32000,
        color: 'Red',
        stock_quantity: 5,
        track_inventory: true,
        has_blouse: true,
        blouse_included: true,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1596234728853-75237d9094c7?w=800&q=80'
      }
    ];

    for (const variant of variants) {
      const productId = productIds[variant.product_slug];
      if (!productId) {
        console.warn(`⚠️ Skipping variant ${variant.name}: Product not found`);
        continue;
      }

      const variantData = { ...variant, product_id: productId };
      delete variantData.product_slug; // Remove slug as it's not in schema

      // Check if variant exists (by sku)
      const { data: existingVariant } = await supabase
        .from('variants')
        .select('id')
        .eq('sku', variant.sku)
        .single();

      if (existingVariant) {
        // Update
        const { error } = await supabase
          .from('variants')
          .update(variantData)
          .eq('id', existingVariant.id);
          
        if (error) console.error(`Error updating variant ${variant.name}:`, error.message);
        else console.log(`✅ Updated variant: ${variant.name}`);
      } else {
        // Insert
        const { error } = await supabase
          .from('variants')
          .insert(variantData);
          
        if (error) console.error(`Error creating variant ${variant.name}:`, error.message);
        else console.log(`✅ Created variant: ${variant.name}`);
      }
    }

    // 6. Create Hero Slides
    console.log('\n🖼️ Creating hero slides...');
    
    // First, delete existing slides to ensure fresh start (optional, but cleaner for seed)
    const { error: deleteError } = await supabase.from('hero_slides').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    if (deleteError) console.log('Note: Could not clear hero_slides table, proceeding with upsert/insert.');

    const slides = [
      {
        title: 'Royal Kanjivaram Collection',
        subtitle: 'Experience the grandeur of pure silk',
        image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=80',
        button_text: 'Shop Kanjivaram',
        button_link: '/collections/kanjivaram',
        display_order: 1,
        is_active: true
      },
      {
        title: 'The Bridal Edit',
        subtitle: 'Timeless elegance for your special day',
        image_url: 'https://images.unsplash.com/photo-1595461135849-bf08dc1a33c5?w=1600&q=80',
        button_text: 'Explore Bridal',
        button_link: '/collections/bridal-edit',
        display_order: 2,
        is_active: true
      },
      {
        title: 'Handloom Heritage',
        subtitle: 'Celebrating the artistry of Indian weavers',
        image_url: 'https://images.unsplash.com/photo-1627054248072-c7272273e883?w=1600&q=80',
        button_text: 'View Handloom',
        button_link: '/collections/handloom-heritage',
        display_order: 3,
        is_active: true
      }
    ];

    for (const slide of slides) {
      // Just insert, since we tried to clear. Or try upsert on ID if we had it.
      // Since we don't have IDs and want to refresh, simple insert is best after delete.
      const { data, error } = await supabase
        .from('hero_slides')
        .insert(slide)
        .select('id, title')
        .single();
      
      if (error) {
        console.error(`Error creating slide ${slide.title}:`, error.message);
      } else {
        console.log(`✅ Created slide: ${data.title}`);
      }
    }

    // 7. Create Testimonials
    console.log('\n💬 Creating testimonials...');
    
    // Clear existing testimonials
    await supabase.from('testimonials').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const testimonials = [
      {
        customer_name: 'Priya Sharma',
        customer_role: 'Wedding Bride',
        content: 'The Kanjivaram saree I bought for my wedding was absolutely stunning. The quality of silk and the intricacy of the zari work were beyond my expectations. Thank you Saree4ever!',
        rating: 5,
        image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
        is_active: true,
        display_order: 1
      },
      {
        customer_name: 'Anjali Desai',
        customer_role: 'Regular Customer',
        content: 'I love the collection here. Whether it\'s a heavy silk saree for a function or a light cotton one for office, Saree4ever never disappoints. The delivery is always on time.',
        rating: 5,
        image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
        is_active: true,
        display_order: 2
      },
      {
        customer_name: 'Mira Kapoor',
        customer_role: 'Fashion Blogger',
        content: 'Authentic handlooms are hard to find, but this store has a genuine collection. The Tussar silk saree I purchased is a piece of art. Highly recommended for saree lovers.',
        rating: 4,
        image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
        is_active: true,
        display_order: 3
      },
      {
        customer_name: 'Sunita Reddy',
        customer_role: 'Home Maker',
        content: 'Great customer service and beautiful packaging. It felt like receiving a gift. The saree color was exactly as shown in the picture.',
        rating: 5,
        image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
        is_active: true,
        display_order: 4
      }
    ];

    for (const testimonial of testimonials) {
        const { data, error } = await supabase
            .from('testimonials')
            .insert(testimonial)
            .select('id, customer_name')
            .single();

        if (error) {
             console.error(`Error creating testimonial from ${testimonial.customer_name}:`, error.message);
        } else {
            console.log(`✅ Created testimonial from: ${data.customer_name}`);
        }
    }

    // 8. Create Blog Posts
    console.log('\n📝 Creating blog posts...');
    const blogPosts = [
      {
        title: 'The Art of Draping Kanjivaram',
        slug: 'art-of-draping-kanjivaram',
        excerpt: 'Master the perfect drape for your heavy silk sarees with our step-by-step guide.',
        content: '<p>Kanjivaram sarees are known for their heavy silk and rich zari work. Draping them perfectly requires a few tricks...</p>',
        image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
        // author: 'Saree4ever Team', // Removed author column
        published_at: new Date().toISOString(),
        is_published: true,
        tags: ['Guide', 'Kanjivaram', 'Draping']
      },
      {
        title: 'History of Banarasi Silk',
        slug: 'history-of-banarasi-silk',
        excerpt: 'Dive deep into the rich history of Banaras and its legendary weaving tradition.',
        content: '<p>Banarasi silk has been a symbol of royalty for centuries. Originating from the holy city of Varanasi...</p>',
        image_url: 'https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?w=800&q=80',
        // author: 'Saree4ever Team',
        published_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        is_published: true,
        tags: ['History', 'Banarasi', 'Heritage']
      },
      {
        title: 'Summer Saree Trends 2025',
        slug: 'summer-saree-trends-2025',
        excerpt: 'Stay cool and stylish this summer with our curated list of trending fabrics and prints.',
        content: '<p>Summer calls for breathable fabrics like cotton and linen. This year, we are seeing a resurgence of...</p>',
        image_url: 'https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80',
        // author: 'Fashion Editor',
        published_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        is_published: true,
        tags: ['Trends', 'Summer', 'Fashion']
      }
    ];

    for (const post of blogPosts) {
      const { data, error } = await supabase
        .from('blog_articles')
        .upsert(post, { onConflict: 'slug' })
        .select('id, title')
        .single();
      
      if (error) {
        console.error(`Error creating blog post ${post.title}:`, error.message);
      } else {
        console.log(`✅ Created blog post: ${data.title}`);
      }
    }

    console.log('\n✅ Mock data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Collections: ${collections.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Types: ${types.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Hero Slides: ${slides.length}`);

  } catch (error) {
    console.error('❌ Error seeding mock data:', error);
    throw error;
  }
}

// Run the seed function
seedMockData()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
