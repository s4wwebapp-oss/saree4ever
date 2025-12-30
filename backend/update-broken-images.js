require('dotenv').config();
const { supabase } = require('./config/db');

async function updateBrokenImages() {
    console.log('🔄 Updating broken product images...');

    const updates = [
        {
            slug: 'cotton-handloom-saree',
            image: '/images/demo/cotton-handloom.png'
        },
        {
            slug: 'bengal-cotton-tant',
            image: '/images/demo/bengal-tant.png'
        },
        {
            slug: 'floral-print-georgette',
            image: '/images/demo/floral-georgette.png'
        },
        {
            slug: 'pure-chiffon-floral',
            image: '/images/demo/chiffon-floral.png'
        }
    ];

    for (const item of updates) {
        const { data, error } = await supabase
            .from('products')
            .update({
                primary_image_url: item.image,
                image_urls: [item.image]
            })
            .eq('slug', item.slug)
            .select('name');

        if (error) {
            console.error(`❌ Error updating ${item.slug}:`, error.message);
        } else {
            console.log(`✅ Updated image for: ${item.slug}`);
        }
    }
}

updateBrokenImages()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
