require('dotenv').config();
const productService = require('./services/productService');
const { supabase } = require('./config/db');

async function testJewelsBlouses() {
    console.log('🧪 Testing "Jewels" + "Blouses" Filter Logic...');

    // 1. Check Jewels Category
    const { data: jewelsCat } = await supabase.from('categories').select('id, slug').eq('slug', 'jewels').single();
    const jewelsCount = await getCount(jewelsCat?.id);
    console.log(`💎 Jewels Category: ${jewelsCat ? 'Exists' : 'Missing'} | Products: ${jewelsCount}`);

    // 2. Check Blouses Category
    const { data: blousesCat } = await supabase.from('categories').select('id, slug').eq('slug', 'blouses').single();
    const blousesCount = await getCount(blousesCat?.id);
    console.log(`👚 Blouses Category: ${blousesCat ? 'Exists' : 'Missing'} | Products: ${blousesCount}`);

    // 3. Test Filter Logic: categories='jewels,blouses'
    console.log('\n🔄 Running Filter Query: categories="jewels,blouses"...');
    const filters = { categories: 'jewels,blouses' };

    try {
        const products = await productService.getAllProducts(filters);
        console.log(`✅ Returned Products: ${products.length}`);

        // Analyze Result
        const expected = jewelsCount + blousesCount; // Assuming no overlap for now
        console.log(`📊 Expected (Sum): ${expected}`);

        if (products.length === expected) {
            console.log('✅ Logic Validated: OR (Union) operation successful.');
        } else if (products.length === 0) {
            console.log('❌ Potential Issue: Returned 0 products.');
        } else {
            // Overlap check?
            console.log('ℹ️ Count differs from sum (possible overlap or inactive products).');
        }

        // List names to confirm
        if (products.length > 0) {
            console.log('📝 Sample Names:', products.slice(0, 5).map(p => p.name));
        }

    } catch (error) {
        console.error('❌ Service Error:', error);
    }

}

async function getCount(categoryId) {
    if (!categoryId) return 0;
    const { count } = await supabase
        .from('product_categories')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', categoryId);
    return count;
}

testJewelsBlouses()
    .then(() => process.exit(0));
