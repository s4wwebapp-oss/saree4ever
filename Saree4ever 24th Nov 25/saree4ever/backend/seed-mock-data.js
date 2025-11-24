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

    // 4. Create Products
    console.log('\n👗 Creating products...');
    const products = [
      {
        name: 'Royal Kanjivaram Silk Saree',
        slug: 'royal-kanjivaram-silk-saree',
        description: 'Exquisite handwoven Kanjivaram silk saree with traditional zari work',
        long_description: '<p>This beautiful Kanjivaram saree features intricate zari work and traditional motifs. Perfect for weddings and special occasions.</p>',
        collection_id: collectionIds['kanjivaram'],
        category_id: categoryIds['silk'],
        type_id: typeIds['traditional'],
        base_price: 25000,
        compare_at_price: 30000,
        primary_image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80',
        ],
        sku: 'KAN-001',
        tags: ['kanjivaram', 'silk', 'traditional', 'wedding'],
        is_featured: true,
        is_active: true,
        display_order: 1,
      },
      {
        name: 'Elegant Banarasi Silk Saree',
        slug: 'elegant-banarasi-silk-saree',
        description: 'Luxurious Banarasi silk saree with intricate brocade work',
        long_description: '<p>This stunning Banarasi saree showcases the finest silk with elaborate brocade patterns. A timeless piece for any occasion.</p>',
        collection_id: collectionIds['banarasi'],
        category_id: categoryIds['silk'],
        type_id: typeIds['bridal'],
        base_price: 35000,
        compare_at_price: 42000,
        primary_image_url: 'https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?w=800&q=80',
          'https://images.unsplash.com/photo-1595461135849-bf08dc1a33c5?w=800&q=80',
        ],
        sku: 'BAN-001',
        tags: ['banarasi', 'silk', 'bridal', 'luxury'],
        is_featured: true,
        is_active: true,
        display_order: 2,
      },
      {
        name: 'Designer Georgette Saree',
        slug: 'designer-georgette-saree',
        description: 'Modern designer georgette saree with contemporary prints',
        long_description: '<p>This chic georgette saree features modern prints and is perfect for parties and casual events.</p>',
        collection_id: collectionIds['designer'],
        category_id: categoryIds['georgette'],
        type_id: typeIds['modern'],
        base_price: 8000,
        compare_at_price: 12000,
        primary_image_url: 'https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80',
        ],
        sku: 'GEO-001',
        tags: ['georgette', 'designer', 'modern', 'party'],
        is_featured: false,
        is_active: true,
        display_order: 3,
      },
      {
        name: 'Cotton Handloom Saree',
        slug: 'cotton-handloom-saree',
        description: 'Comfortable handloom cotton saree for daily wear',
        long_description: '<p>This soft cotton saree is perfect for everyday wear. Lightweight and comfortable with traditional patterns.</p>',
        collection_id: collectionIds['new-arrivals'],
        category_id: categoryIds['cotton'],
        type_id: typeIds['traditional'],
        base_price: 3500,
        compare_at_price: 4500,
        primary_image_url: 'https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80',
        ],
        sku: 'COT-001',
        tags: ['cotton', 'handloom', 'traditional', 'daily-wear'],
        is_featured: false,
        is_active: true,
        display_order: 4,
      },
      {
        name: 'Bridal Silk Saree with Blouse',
        slug: 'bridal-silk-saree-with-blouse',
        description: 'Luxurious bridal silk saree with matching blouse piece',
        long_description: '<p>This exquisite bridal saree comes with a matching blouse piece. Perfect for your special day.</p>',
        collection_id: collectionIds['kanjivaram'],
        category_id: categoryIds['silk'],
        type_id: typeIds['bridal'],
        base_price: 45000,
        compare_at_price: 55000,
        primary_image_url: 'https://images.unsplash.com/photo-1596234728853-75237d9094c7?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1596234728853-75237d9094c7?w=800&q=80',
          'https://images.unsplash.com/photo-1609357606029-28f58582d0bc?w=800&q=80',
        ],
        sku: 'BRD-001',
        tags: ['bridal', 'silk', 'kanjivaram', 'wedding'],
        is_featured: true,
        is_active: true,
        display_order: 5,
      },
      {
        name: 'Kanjivaram Pure Silk',
        slug: 'kanjivaram-pure-silk',
        description: 'Handwoven Kanjivaram silk saree in deep maroon with gold zari border.',
        long_description: '<p>Experience the luxury of pure silk with this exquisite Kanjivaram saree. Handwoven by skilled artisans, this saree features a deep maroon body with a contrasting gold zari border. Perfect for weddings and grand celebrations.</p>',
        collection_id: collectionIds['kanjivaram'],
        category_id: categoryIds['silk'],
        type_id: typeIds['traditional'],
        base_price: 9999,
        compare_at_price: 12999,
        primary_image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80',
          'https://images.unsplash.com/photo-1583391726247-e99ecdf93da2?w=800&q=80'
        ],
        sku: 'KAN-PURE-001',
        tags: ['kanjivaram', 'silk', 'maroon', 'wedding'],
        is_featured: true,
        is_active: true,
        display_order: 6
      },
      {
        name: 'Banarasi Georgette',
        slug: 'banarasi-georgette',
        description: 'Lightweight Banarasi georgette saree with intricate silver zari motifs.',
        long_description: '<p>Combining the elegance of Banarasi weaving with the lightness of georgette, this saree is a masterpiece. It features delicate silver zari motifs all over the body, making it suitable for both day and evening events.</p>',
        collection_id: collectionIds['banarasi'],
        category_id: categoryIds['georgette'],
        type_id: typeIds['party-wear'],
        base_price: 7499,
        compare_at_price: 8999,
        primary_image_url: 'https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1610189012906-6c02db532609?w=800&q=80'
        ],
        sku: 'BAN-GEO-002',
        tags: ['banarasi', 'georgette', 'silver-zari', 'party'],
        is_featured: true,
        is_active: true,
        display_order: 7
      },
      {
        name: 'Tussar Silk Handpaint',
        slug: 'tussar-silk-handpaint',
        description: 'Elegant Tussar silk saree with hand-painted floral designs.',
        long_description: '<p>Adorn yourself in art with this hand-painted Tussar silk saree. The natural beige base serves as a canvas for vibrant floral designs, hand-painted by expert craftsmen. A sophisticated choice for corporate events or art gatherings.</p>',
        collection_id: collectionIds['handloom-heritage'],
        category_id: categoryIds['silk'],
        type_id: typeIds['modern'],
        base_price: 6500,
        compare_at_price: null,
        primary_image_url: 'https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1627054248072-c7272273e883?w=800&q=80'
        ],
        sku: 'TUS-HND-003',
        tags: ['tussar', 'silk', 'handpaint', 'floral'],
        is_featured: false,
        is_active: true,
        display_order: 8
      },
      {
        name: 'Linen Cotton Checks',
        slug: 'linen-cotton-checks',
        description: 'Breathable linen cotton saree with contemporary check pattern.',
        long_description: '<p>Stay cool and stylish with this linen cotton saree. The contemporary check pattern adds a modern touch, making it perfect for office wear or casual outings. Lightweight and easy to drape.</p>',
        collection_id: collectionIds['new-arrivals'],
        category_id: categoryIds['linen'],
        type_id: typeIds['modern'],
        base_price: 2800,
        compare_at_price: 3500,
        primary_image_url: 'https://images.unsplash.com/photo-1601925260368-ae2f83d1212a?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1601925260368-ae2f83d1212a?w=800&q=80'
        ],
        sku: 'LIN-CHK-004',
        tags: ['linen', 'cotton', 'checks', 'office-wear'],
        is_featured: false,
        is_active: true,
        display_order: 9
      },
      {
        name: 'Bridal Red Kanjivaram',
        slug: 'bridal-red-kanjivaram',
        description: 'Traditional bridal red Kanjivaram saree with heavy gold zari pallu.',
        long_description: '<p>The quintessential bridal saree. This deep red Kanjivaram saree features a heavy gold zari pallu and broad borders. A symbol of auspiciousness and tradition, perfect for the bride on her wedding day.</p>',
        collection_id: collectionIds['bridal-edit'],
        category_id: categoryIds['silk'],
        type_id: typeIds['bridal'],
        base_price: 45000,
        compare_at_price: 55000,
        primary_image_url: 'https://images.unsplash.com/photo-1596234728853-75237d9094c7?w=800&q=80',
        image_urls: [
          'https://images.unsplash.com/photo-1596234728853-75237d9094c7?w=800&q=80'
        ],
        sku: 'BRD-KAN-005',
        tags: ['bridal', 'kanjivaram', 'red', 'gold-zari'],
        is_featured: true,
        is_active: true,
        display_order: 10
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

    // 5. Create Hero Slides
    console.log('\n🖼️ Creating hero slides...');
    const slides = [
      {
        title: 'Ethereal Silk Collection',
        subtitle: 'Handwoven masterpieces for the modern woman',
        image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=80',
        button_text: 'Shop Collection',
        button_link: '/collections/pure-silk-classics',
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

    // Try to create hero_slides table if it doesn't exist (or rely on migration)
    // For now assuming table exists as per conversation history
    for (const slide of slides) {
      const { data, error } = await supabase
        .from('hero_slides')
        .upsert(slide, { onConflict: 'display_order' }) // Assuming display_order is unique enough for seed
        .select('id, title')
        .single();
      
      if (error) {
        // If unique constraint fails or other error, try inserting without upsert on display_order logic if needed
        // But for seed, let's just log
        console.error(`Error creating slide ${slide.title}:`, error.message);
      } else {
        console.log(`✅ Created slide: ${data.title}`);
      }
    }

    // 6. Create Testimonials
    console.log('\n💬 Creating testimonials...');
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

    // Assuming testimonials table exists from migration
    for (const testimonial of testimonials) {
        // We don't have a unique key for upsert easily, so we'll just insert if table is empty or log error
        // To avoid duplicates on re-run, we might want to check existence first or clear table?
        // For simplicity in this seed script, we'll try to insert
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

    // 7. Create Blog Posts
    console.log('\n📝 Creating blog posts...');
    const blogPosts = [
      {
        title: 'The Art of Draping Kanjivaram',
        slug: 'art-of-draping-kanjivaram',
        excerpt: 'Master the perfect drape for your heavy silk sarees with our step-by-step guide.',
        content: '<p>Kanjivaram sarees are known for their heavy silk and rich zari work. Draping them perfectly requires a few tricks...</p>',
        image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
        author: 'Saree4ever Team',
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
        author: 'Saree4ever Team',
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
        author: 'Fashion Editor',
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

    // 8. Create Variants for Products (Expanded)
    console.log('\n🎨 Creating variants...');
    // Note: In a real seed script, we'd map these carefully.
    // For brevity, ensuring the base logic works. The original script had variants.
    // We'll re-run the variant creation logic for the NEW products if needed, 
    // but for this update, I'll stick to the pattern used in step 4 where we get IDs.
    
    // Let's add a few variants for the new products
    const additionalVariants = [
        {
            product_id: productIds['kanjivaram-pure-silk'],
            name: 'Maroon',
            sku: 'KAN-PURE-001-MAR',
            price: 9999,
            color: 'Maroon',
            has_blouse: true,
            blouse_included: true,
            stock_quantity: 10,
            track_inventory: true,
            is_active: true
        },
        {
            product_id: productIds['banarasi-georgette'],
            name: 'Silver Grey',
            sku: 'BAN-GEO-002-SLV',
            price: 7499,
            color: 'Silver',
            has_blouse: true,
            blouse_included: true,
            stock_quantity: 8,
            track_inventory: true,
            is_active: true
        }
    ];

    for (const variant of additionalVariants) {
        if (!variant.product_id) continue; // Skip if product creation failed
        const { data, error } = await supabase
            .from('variants')
            .upsert(variant, { onConflict: 'sku' })
            .select('id, name')
            .single();
        
        if (error) {
            console.error(`Error creating variant ${variant.name}:`, error.message);
        } else {
            console.log(`✅ Created variant: ${data.name}`);
        }
    }

    console.log('\n✅ Mock data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Collections: ${Object.keys(collectionIds).length}`);
    console.log(`   - Categories: ${Object.keys(categoryIds).length}`);
    console.log(`   - Types: ${Object.keys(typeIds).length}`);
    console.log(`   - Products: ${Object.keys(productIds).length}`);
    console.log(`   - Hero Slides: ${slides.length}`);
    console.log(`   - Testimonials: ${testimonials.length}`);
    console.log(`   - Blog Posts: ${blogPosts.length}`);

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
