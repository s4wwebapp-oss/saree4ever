require('dotenv').config();
const productService = require('./services/productService');

async function benchmark() {
    console.log('⏱️ Starting benchmark for collections=kanjivaram,banarasi...');
    const start = performance.now();

    try {
        // Simulate the filter passing
        const filters = {
            collections: 'kanjivaram,banarasi'
        };

        const products = await productService.getAllProducts(filters);

        const end = performance.now();
        console.log(`✅ Fetched ${products.length} products.`);
        console.log(`⏱️ Time taken: ${(end - start).toFixed(2)}ms`);

        // Log breakdown if possible (requires modifying service, but this gives overall)
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

benchmark()
    .then(() => process.exit(0));
