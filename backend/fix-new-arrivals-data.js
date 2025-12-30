require('dotenv').config();
const { supabase } = require('./config/db');

async function fixNewArrivalsData() {
    console.log('✨ Populating New Arrivals data...');

    try {
        // 1. Get Category and Collection IDs
        const { data: category } = await supabase.from('categories').select('id').eq('slug', 'new-arrivals').single();
        const { data: collection } = await supabase.from('collections').select('id').eq('slug', 'new-arrivals').single();

        if (!category || !collection) {
            console.log('❌ Category or Collection not found.');
            return;
        }

        // 2. Get some products (e.g., latest 5)
        const { data: products } = await supabase
            .from('products')
            .select('id, name')
            .limit(5);

        if (!products || products.length === 0) {
            console.log('❌ No products found in database.');
            return;
        }

        console.log(`✅ Found ${products.length} products to add.`);

        // 3. Add to Category
        const categoryInserts = products.map(p => ({
            product_id: p.id,
            category_id: category.id,
            display_order: 0
        }));
        await supabase.from('product_categories').upsert(categoryInserts, { onConflict: 'product_id,category_id' });
        console.log('✅ Added products to "New Arrivals" Category.');

        // 4. Add to Collection
        const collectionInserts = products.map(p => ({
            product_id: p.id,
            collection_id: collection.id,
            display_order: 0
        }));
        await supabase.from('product_collections').upsert(collectionInserts, { onConflict: 'product_id,collection_id' });
        console.log('✅ Added products to "New Arrivals" Collection.');

    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

fixNewArrivalsData()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
