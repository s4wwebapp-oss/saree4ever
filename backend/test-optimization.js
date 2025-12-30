require('dotenv').config();
const { supabase } = require('./config/db');

async function testOptimization() {
    console.log('🚀 Testing Optimized Query...');
    const start = performance.now();

    const collections = ['kanjivaram', 'banarasi'];
    // const categories = ['new-arrivals']; 

    // 1. Find Matching IDs
    let query = supabase.from('products')
        .select('id');

    // Add filters
    // Note: We need to ensure the join is performed.
    // Syntax: relation!inner(nested_relation!inner(column))

    query = query.select(`
    id,
    product_collections!inner(
      collection:collections!inner(slug)
    )
  `);

    query = query.in('product_collections.collection.slug', collections);

    const { data: idData, error } = await query;

    if (error) {
        console.error('❌ Query Error:', error);
        return;
    }

    const ids = [...new Set(idData.map(p => p.id))];
    const mid = performance.now();
    console.log(`✅ Found ${ids.length} matching IDs in ${(mid - start).toFixed(2)}ms`);

    // 2. Fetch Full Data
    if (ids.length > 0) {
        const { data: products } = await supabase
            .from('products')
            .select(`
        *,
        product_collections(collection:collections(*)),
        product_categories(category:categories(*)),
        product_types(type:types(*))
      `)
            .in('id', ids)
            .order('created_at', { ascending: false });

        const end = performance.now();
        console.log(`✅ Fetched full data for ${products.length} products.`);
        console.log(`⏱️ Total Time: ${(end - start).toFixed(2)}ms`);
    }
}

testOptimization()
    .then(() => process.exit(0));
