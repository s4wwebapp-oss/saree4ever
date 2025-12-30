require('dotenv').config();
const { supabase } = require('./config/db');

async function debugJoin() {
    console.log('🐞 Debugging Join Syntax...');

    // Try standard table name
    const { data: d1, error: e1 } = await supabase
        .from('product_collections')
        .select('product_id, collections!inner(slug)')
        .limit(1);

    if (e1) console.log('❌ "collections" failed:', e1.message);
    else console.log('✅ "collections" worked:', d1?.length);

    // Try singular
    const { data: d2, error: e2 } = await supabase
        .from('product_collections')
        .select('product_id, collection!inner(slug)')
        .limit(1);

    if (e2) console.log('❌ "collection" failed:', e2.message);
    else console.log('✅ "collection" worked:', d2?.length);

    // Try aliased
    const { data: d3, error: e3 } = await supabase
        .from('product_collections')
        .select('product_id, collection:collections!inner(slug)')
        .limit(1);

    if (e3) console.log('❌ "collection:collections" failed:', e3.message);
    else console.log('✅ "collection:collections" worked:', d3?.length);
}

debugJoin()
    .then(() => process.exit(0));
