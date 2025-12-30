require('dotenv').config();
const { supabase } = require('./config/db');

async function fixJewelsJunction() {
    console.log('🔧 Fixing Jewels product categories junction table...');

    try {
        // 1. Get Jewels Category ID
        const { data: category, error: catError } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', 'jewels')
            .single();

        if (catError || !category) {
            throw new Error('Jewels category not found');
        }
        console.log(`✅ Found Jewels Category ID: ${category.id}`);

        // 2. Get Products with this category_id
        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('id, name')
            .eq('category_id', category.id);

        if (prodError) throw prodError;
        console.log(`✅ Found ${products.length} products in Jewels category`);

        // 3. Insert into product_categories
        if (products.length > 0) {
            const junctionData = products.map(p => ({
                product_id: p.id,
                category_id: category.id,
                display_order: 0
            }));

            const { error: insertError } = await supabase
                .from('product_categories')
                .upsert(junctionData, { onConflict: 'product_id,category_id' });

            if (insertError) throw insertError;
            console.log(`✅ Successfully synced ${products.length} products to product_categories table`);
        }

    } catch (error) {
        console.error('❌ Fix failed:', error.message);
    }
}

fixJewelsJunction()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
