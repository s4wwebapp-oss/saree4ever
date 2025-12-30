require('dotenv').config();
const { supabase } = require('./config/db');

async function seedJewels() {
    console.log('💎 Seeding Jewels category and products...');

    try {
        // 1. Create Jewels Category
        let categoryId;
        const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .upsert({
                name: 'Jewels',
                slug: 'jewels',
                description: 'Exquisite Indian traditional and modern jewellery',
                image_url: '/images/demo/diamond-choker.png',
                is_active: true,
                display_order: 10
            }, { onConflict: 'slug' })
            .select('id')
            .single();

        if (categoryError) throw categoryError;
        categoryId = categoryData.id;
        console.log('✅ Created/Updated Category: Jewels');

        // 2. Create Jewelry Type
        let typeId;
        const { data: typeData, error: typeError } = await supabase
            .from('types')
            .upsert({
                name: 'Jewellery',
                slug: 'jewellery',
                description: 'Precious items for adornment',
                is_active: true
            }, { onConflict: 'slug' })
            .select('id')
            .single();

        if (typeError) throw typeError;
        typeId = typeData.id;
        console.log('✅ Created/Updated Type: Jewellery');

        // 3. Create Products
        const products = [
            {
                name: 'Antique Gold Ruby & Emerald Necklace',
                slug: 'antique-gold-ruby-emerald-necklace',
                description: 'Traditional antique gold necklace studded with original rubies and emeralds.',
                base_price: 150000,
                compare_at_price: 180000,
                primary_image_url: '/images/demo/antique-gold-necklace.png',
                image_urls: ['/images/demo/antique-gold-necklace.png'],
                category_id: categoryId,
                type_id: typeId,
                is_active: true,
                is_featured: true,
                tags: ['gold', 'antique', 'necklace', 'ruby', 'emerald']
            },
            {
                name: 'Royal Diamond Choker Set',
                slug: 'royal-diamond-choker-set',
                description: 'Luxurious diamond choker with matching earrings in platinum setting.',
                base_price: 250000,
                compare_at_price: 300000,
                primary_image_url: '/images/demo/diamond-choker.png',
                image_urls: ['/images/demo/diamond-choker.png'],
                category_id: categoryId,
                type_id: typeId,
                is_active: true,
                is_featured: true,
                tags: ['diamond', 'choker', 'platinum', 'luxury']
            },
            {
                name: 'Traditional Temple Jewellery Set',
                slug: 'traditional-temple-jewellery-set',
                description: 'South Indian style matte finish gold necklace with Lakshmi pendant.',
                base_price: 85000,
                compare_at_price: 95000,
                primary_image_url: '/images/demo/temple-jewellery.png',
                image_urls: ['/images/demo/temple-jewellery.png'],
                category_id: categoryId,
                type_id: typeId,
                is_active: true,
                is_featured: false,
                tags: ['temple-jewellery', 'gold', 'traditional', 'south-indian']
            },
            {
                name: 'Kundan Polki Bridal Set',
                slug: 'kundan-polki-bridal-set',
                description: 'Grand Kundan bridal necklace set with pearl drops and polki diamonds.',
                base_price: 120000,
                compare_at_price: 145000,
                primary_image_url: '/images/demo/kundan-bridal.png',
                image_urls: ['/images/demo/kundan-bridal.png'],
                category_id: categoryId,
                type_id: typeId,
                is_active: true,
                is_featured: true,
                tags: ['kundan', 'bridal', 'polki', 'wedding']
            },
            {
                name: 'Filigree Gold Bangles (Set of 4)',
                slug: 'filigree-gold-bangles-set',
                description: 'Intricately designed gold bangles with traditional filigree work.',
                base_price: 65000,
                compare_at_price: 72000,
                primary_image_url: '/images/demo/gold-bangles.png',
                image_urls: ['/images/demo/gold-bangles.png'],
                category_id: categoryId,
                type_id: typeId,
                is_active: true,
                is_featured: false,
                tags: ['gold', 'bangles', 'filigree', 'traditional']
            }
        ];

        for (const product of products) {
            const { data, error } = await supabase
                .from('products')
                .upsert(product, { onConflict: 'slug' })
                .select('name');

            if (error) {
                console.error(`❌ Error creating ${product.name}:`, error.message);
            } else {
                console.log(`✅ Created Product: ${data.name}`);
            }
        }

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    }
}

seedJewels()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
