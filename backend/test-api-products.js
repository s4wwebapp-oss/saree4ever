const axios = require('axios');

async function testApi() {
    console.log('🌐 Testing API: http://localhost:5001/api/products');
    try {
        const response = await axios.get('http://localhost:5001/api/products');
        const products = response.data.products || response.data; // Handle { products: [...] } or [...]

        console.log(`✅ Status: ${response.status}`);
        console.log(`📦 Products fetched: ${Array.isArray(products) ? products.length : 'Not an array'}`);

        if (Array.isArray(products) && products.length > 0) {
            console.log('First product:', products[0].name);
        } else {
            console.log('⚠️  Response body:', JSON.stringify(response.data, null, 2));
        }
    } catch (error) {
        console.error('❌ API Verification Failed:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
        console.log('\nPossible causes:\n1. Server not running (npm run dev)\n2. Database permissions (run grant-permissions.sql)\n3. Code error in controller');
    }
}

testApi();
