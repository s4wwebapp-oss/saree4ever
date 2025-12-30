require('dotenv').config();
const { supabase } = require('./config/db');

async function fixOtherCollections() {
    console.log('✨ Populating Kanjivaram & Banarasi data...');

    try {
        // 1. Get Collection IDs
        const { data: collections } = await supabase
            .from('collections')
            .select('id, slug')
            .in('slug', ['kanjivaram', 'banarasi']);

        if (!collections || collections.length === 0) {
            console.log('❌ Collections not found.');
            return;
        }

        // 2. Get some products
        const { data: products } = await supabase
            .from('products')
            .select('id')
            .limit(10); // fetch different products if possible, but reusing is fine for perf test

        if (!products || products.length === 0) {
            console.log('❌ No products found.');
            return;
        }

        console.log(`✅ Found ${collections.length} collections and ${products.length} products.`);

        // 3. Link products to collections
        const inserts = [];

        // Assign first 5 to first collection, next 5 to second
        for (const col of collections) {
            for (const prod of products) {
                inserts.push({
                    product_id: prod.id,
                    collection_id: col.id,
                    display_order: 0
                });
            }
        }

        await supabase.from('product_collections').upsert(inserts, { onConflict: 'product_id,collection_id' });
        console.log(`✅ Added ${inserts.length} links to product_collections.`);

    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

fixOtherCollections()
    .then(() => process.exit(0));
