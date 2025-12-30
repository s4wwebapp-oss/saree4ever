require('dotenv').config();
const { supabase } = require('./config/db');

async function test() {
    console.log('Testing access to landing_page_sections...');
    try {
        const { data, error } = await supabase
            .from('landing_page_sections')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Failed:', error.message);
            console.error('Full Error:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Success! Data found:', data.length);
        }
    } catch (err) {
        console.error('❌ Exception:', err.message);
    }
}

test();
