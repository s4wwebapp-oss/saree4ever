require('dotenv').config();
const { supabase } = require('./config/db');

async function debugOptimization() {
    console.log('🐞 Debugging Optimization...');

    // 1. Test basic select with join
    const { data: test1, error: err1 } = await supabase
        .from('product_collections')
        .select('product_id, collection!inner(slug)')
        .in('collection.slug', ['kanjivaram', 'banarasi'])
        .limit(5);

    if (err1) console.error('❌ Test 1 Error:', err1);
    else console.log('✅ Test 1 (Direct Junction) Found:', test1?.length);

    // 2. Test nested select from Products
    const { data: test2, error: err2 } = await supabase
        .from('products')
        .select(`
      id,
      product_collections!inner(
        collection:collections!inner(slug)
      )
    `)
        // Try explicit filter syntax if .in() fails
        .filter('product_collections.collection.slug', 'in', '("kanjivaram","banarasi")')
        .limit(5);

    if (err2) console.error('❌ Test 2 Error:', err2);
    else console.log('✅ Test 2 (Nested Filter) Found:', test2?.length);

    if (test2 && test2.length === 0) {
        // 3. Try "not inner" to see if data exists structure-wise
        const { data: test3 } = await supabase
            .from('products')
            .select(`
        id,
        product_collections(
            collection:collections(slug)
        )
      `)
            .limit(1);
        console.log('🔍 Test 3 Structure:', JSON.stringify(test3?.[0], null, 2));
    }

}

debugOptimization()
    .then(() => process.exit(0));
