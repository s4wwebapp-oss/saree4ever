require('dotenv').config();
const { supabase } = require('./config/db');

async function testFilterLogic() {
    console.log('🔍 Testing Filter Intersection...');

    // 1. Get Category ID for 'new-arrivals'
    const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', 'new-arrivals')
        .single();

    if (!category) {
        console.log('❌ Category "new-arrivals" does not exist.');
        return;
    }
    console.log('✅ Category "new-arrivals" ID:', category.id);

    // 2. Get Collection IDs
    const collectionSlugs = ['new-arrivals', 'kanjivaram', 'banarasi'];
    const { data: collections } = await supabase
        .from('collections')
        .select('id, slug')
        .in('slug', collectionSlugs);

    const collectionIds = collections.map(c => c.id);
    console.log('✅ Collection IDs found:', collections.map(c => `${c.slug} (${c.id})`).join(', '));

    if (collectionIds.length === 0) {
        console.log('❌ No collections found.');
        return;
    }

    // 3. Find products in the Category
    const { data: catProducts } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', category.id);

    const catProductIds = catProducts.map(p => p.product_id);
    console.log(`📊 Products in "new-arrivals" Category: ${catProductIds.length}`);

    // 4. Find products in ANY of the Collections
    const { data: colProducts } = await supabase
        .from('product_collections')
        .select('product_id')
        .in('collection_id', collectionIds);

    const colProductIds = [...new Set(colProducts.map(p => p.product_id))]; // Unique IDs
    console.log(`📊 Products in Collections (Union): ${colProductIds.length}`);

    // 5. Find Intersection
    const resultIds = catProductIds.filter(id => colProductIds.includes(id));
    console.log(`🎯 Intersection (Result count): ${resultIds.length}`);

    if (resultIds.length > 0) {
        const { data: finalProducts } = await supabase
            .from('products')
            .select('name, slug')
            .in('id', resultIds);
        console.log('📝 Matching Products:', finalProducts.map(p => p.name));
    } else {
        console.log('⚠️ No products match ALL criteria.');
    }

}

testFilterLogic()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
