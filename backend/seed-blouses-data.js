require('dotenv').config();
const { supabase } = require('./config/db');

async function seedBlousesData() {
    console.log('✨ Populating Blouses data...');

    try {
        // 1. Get Category ID
        const { data: category } = await supabase.from('categories').select('id, slug').eq('slug', 'blouses').single();

        if (!category) {
            console.log('❌ Category "blouses" not found. Creating it...');
            // Optionally create it, but for now assume it exists or fail
            return;
        }
        console.log('✅ Found Category:', category.slug, category.id);

        // 2. Define Products
        const productsToSeed = [
            {
                name: 'Black Ikkat Cotton Blouse',
                description: 'Traditional black ikkat cotton blouse with boat neck.',
                base_price: 1299,
                image_url: '/images/demo/black-ikkat-cotton-blouse.png',
                sku: 'BLOUSE-BLK-IKKAT'
            },
            {
                name: 'Classic Golden Tissue Blouse',
                description: 'Shimmering golden tissue blouse, perfect for festive wear.',
                base_price: 1899,
                image_url: '/images/demo/classic-golden-tissue-blouse.png',
                sku: 'BLOUSE-GOLD-TISSUE'
            },
            {
                name: 'Green Kalamkari Boat Neck Blouse',
                description: 'Hand-painted kalamkari designs on green cotton fabric.',
                base_price: 1499,
                image_url: '/images/demo/green-kalamkari-boat-neck-blouse.png',
                sku: 'BLOUSE-GRN-KALAM'
            },
            {
                name: 'Maroon Velvet Embroidered Blouse',
                description: 'Rich maroon velvet blouse with intricate embroidery.',
                base_price: 2499,
                image_url: '/images/demo/maroon-velvet-embroidered-blouse.png',
                sku: 'BLOUSE-MRN-VELVET'
            },
            {
                name: 'Pink Silk Brocade Blouse',
                description: 'Elegant pink silk blouse with brocade patterns.',
                base_price: 1699,
                image_url: '/images/demo/pink-silk-brocade-blouse.png',
                sku: 'BLOUSE-PNK-SILK'
            }
        ];

        // 3. Upsert Products
        const productInserts = productsToSeed.map(p => ({
            name: p.name,
            slug: p.name.toLowerCase().replace(/ /g, '-'),
            description: p.description,
            base_price: p.base_price,
            primary_image_url: p.image_url,
            sku: p.sku,
            is_active: true,
            category_id: category.id // Backward compat
        }));

        const { data: insertedProducts, error } = await supabase
            .from('products')
            .upsert(productInserts, { onConflict: 'slug' }) // Use Slug as unique key
            .select();

        if (error) throw error;
        console.log(`✅ Upserted ${insertedProducts.length} blouse products.`);

        // 4. Link to Category (Product Categories Junction)
        const junctionInserts = insertedProducts.map((p, index) => ({
            product_id: p.id,
            category_id: category.id,
            display_order: index
        }));

        const { error: junctionError } = await supabase
            .from('product_categories')
            .upsert(junctionInserts, { onConflict: 'product_id,category_id' });

        if (junctionError) throw junctionError;
        console.log('✅ Linked products to "Blouses" category.');

    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

seedBlousesData()
    .then(() => process.exit(0));
