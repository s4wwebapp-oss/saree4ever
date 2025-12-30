require('dotenv').config();
const { supabase } = require('./config/db');

async function checkProducts() {
    console.log('🔍 Checking products table...');
    const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Error checking products:', error.message);
    } else {
        console.log(`✅ Total Products Found: ${count}`);
    }
}

checkProducts();
