require('dotenv').config();
const { supabase } = require('./config/db');

// Helper function to generate slug from name
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

async function seedSpecificSarees() {
    console.log('🌱 Starting to seed specific saree types...\n');

    try {
        // 1. Ensure Categories Exist
        console.log('📁 Verifying/Creating categories...');
        const categories = [
            { name: 'Chiffon', slug: 'chiffon', description: 'Lightweight and shear chiffon sarees', is_active: true, display_order: 10 },
            { name: 'Cotton', slug: 'cotton', description: 'Breathable and comfortable cotton sarees', is_active: true, display_order: 11 },
            { name: 'Designer', slug: 'designer-cat', description: 'Exclusive designer sarees', is_active: true, display_order: 12 },
            { name: 'Satin', slug: 'satin', description: 'Smooth and glossy Japan Satin sarees', is_active: true, display_order: 13 },
            { name: 'Silk', slug: 'silk', description: 'Traditional and modern Silk sarees (including Ho Silk)', is_active: true, display_order: 14 }
        ];

        const categoryIds = {};
        for (const cat of categories) {
            const { data, error } = await supabase.from('categories').upsert(cat, { onConflict: 'slug' }).select('id, name').single();
            if (error) throw error;
            categoryIds[cat.slug] = data.id;
            console.log(`   - Verified category: ${data.name}`);
        }

        // 2. Ensure Types Exist
        console.log('\n🏷️  Verifying/Creating types...');
        const types = [
            { name: 'Designer', slug: 'designer-type', description: 'Designer wear', is_active: true, display_order: 1 },
            { name: 'Traditional', slug: 'traditional', description: 'Traditional wear', is_active: true, display_order: 2 },
            { name: 'Party Wear', slug: 'party-wear', description: 'Party and festive wear', is_active: true, display_order: 3 },
            { name: 'Daily Wear', slug: 'daily-wear', description: 'Comfortable daily wear', is_active: true, display_order: 4 }
        ];

        const typeIds = {};
        for (const type of types) {
            const { data, error } = await supabase.from('types').upsert(type, { onConflict: 'slug' }).select('id, name').single();
            if (error) throw error;
            typeIds[type.slug] = data.id;
            console.log(`   - Verified type: ${data.name}`);
        }

        // 3. Create Products
        console.log('\n👗 Creating requested products...');
        const products = [
            // --- CHIFFON ---
            {
                name: 'Electric Blue Chiffon Saree',
                slug: 'electric-blue-chiffon',
                description: 'Vibrant electric blue chiffon saree with stone work border.',
                base_price: 3500,
                category_slug: 'chiffon',
                type_slug: 'party-wear',
                image: '/images/demo/electric-blue-chiffon-saree.png',
                tags: ['chiffon', 'blue', 'party', 'stone-work']
            },
            {
                name: 'Floral Print Soft Chiffon',
                slug: 'floral-print-soft-chiffon',
                description: 'Elegant floral print on soft chiffon, perfect for summer days.',
                base_price: 1800,
                category_slug: 'chiffon',
                type_slug: 'daily-wear',
                image: '/images/demo/floral-print-soft-chiffon-saree.png',
                tags: ['chiffon', 'floral', 'summer', 'daily']
            },

            // --- COTTON ---
            {
                name: 'Handblock Printed Indigo Cotton',
                slug: 'handblock-indigo-cotton',
                description: 'Traditional Indigo handblock printed cotton saree.',
                base_price: 2200,
                category_slug: 'cotton',
                type_slug: 'daily-wear',
                image: '/images/demo/handblock-indigo-cotton-saree.png',
                tags: ['cotton', 'indigo', 'handblock', 'office-wear']
            },
            {
                name: 'Mulmul Cotton Saree',
                slug: 'mulmul-cotton-white',
                description: 'Softest Mulmul cotton saree in pure white with subtle embroidery.',
                base_price: 2500,
                category_slug: 'cotton',
                type_slug: 'traditional',
                image: '/images/demo/mulmul-cotton-saree.png',
                tags: ['cotton', 'mulmul', 'white', 'embroidery']
            },

            // --- DESIGNER ---
            {
                name: 'Sequin Embellished Net Saree',
                slug: 'sequin-embellished-net',
                description: 'Glamorous net saree heavily embellished with sequins available in gold.',
                base_price: 8500,
                category_slug: 'designer-cat',
                type_slug: 'designer-type',
                image: '/images/demo/sequin-embellished-net-saree.png',
                tags: ['designer', 'sequin', 'party', 'gold']
            },
            {
                name: 'Ruffle Border Saree',
                slug: 'ruffle-border-saree',
                description: 'Trendy saree with ruffle borders and modern silhouette.',
                base_price: 4500,
                category_slug: 'designer-cat',
                type_slug: 'designer-type',
                image: '/images/demo/ruffle-border-saree.png',
                tags: ['designer', 'ruffle', 'trendy', 'modern']
            },

            // --- JAPAN SATIN ---
            {
                name: 'Japan Satin Ombre Saree',
                slug: 'japan-satin-ombre',
                description: 'Premium Japan Satin saree with glossy finish and ombre dual-tone effect.',
                base_price: 4200,
                category_slug: 'satin',
                type_slug: 'party-wear',
                image: '/images/demo/japan-satin-ombre-saree.png',
                tags: ['satin', 'japan-satin', 'ombre', 'glossy']
            },
            {
                name: 'Solid Black Japan Satin',
                slug: 'solid-black-japan-satin',
                description: 'Classic plain black Japan Satin saree, elegant and timeless.',
                base_price: 3800,
                category_slug: 'satin',
                type_slug: 'party-wear',
                image: '/images/demo/solid-black-japan-satin-saree.png', // Fallback similar image
                tags: ['satin', 'black', 'classic', 'party']
            },

            // --- HO SILK (Assuming Art Silk/Tribal Silk variant) ---
            {
                name: 'Ho Silk Traditional Saree',
                slug: 'ho-silk-traditional',
                description: 'Traditional Ho Silk saree with tribal motifs and natural colors.',
                base_price: 5500,
                category_slug: 'silk',
                type_slug: 'traditional',
                image: '/images/demo/ho-silk-traditional-saree.png',
                tags: ['silk', 'ho-silk', 'tribal', 'traditional']
            },
            {
                name: 'Ho Silk Contemporary Weave',
                slug: 'ho-silk-contemporary',
                description: 'Contemporary take on the Ho Silk weave with modern borders.',
                base_price: 6000,
                category_slug: 'silk',
                type_slug: 'designer-type',
                image: '/images/demo/ho-silk-contemporary-weave-saree.png',
                tags: ['silk', 'ho-silk', 'modern', 'weave']
            }
        ];

        for (const p of products) {
            // Create Product
            const { data: product, error: prodError } = await supabase
                .from('products')
                .upsert({
                    name: p.name,
                    slug: p.slug,
                    description: p.description,
                    long_description: `<p>${p.description}</p>`,
                    base_price: p.base_price,
                    category_id: categoryIds[p.category_slug],
                    type_id: typeIds[p.type_slug],
                    primary_image_url: p.image,
                    image_urls: [p.image],
                    tags: p.tags,
                    is_active: true,
                    is_featured: false
                }, { onConflict: 'slug' })
                .select()
                .single();

            if (prodError) {
                console.error(`❌ Error creating product ${p.name}:`, prodError.message);
                continue;
            }
            console.log(`✅ Created Product: ${product.name}`);

            // Create Variant (Required for stock)
            const { error: varError } = await supabase
                .from('variants')
                .upsert({
                    product_id: product.id,
                    name: `${product.name} - Standard`,
                    sku: `${product.slug.toUpperCase().slice(0, 8)}-001`,
                    price: product.base_price,
                    stock_quantity: 20,
                    track_inventory: true,
                    is_active: true,
                    image_url: product.primary_image_url
                }, { onConflict: 'sku' }); // Note: SKU conflict might trigger if re-running, which is fine handled by upsert usually if ID matches, but here we depend on SKU uniqueness

            if (varError) {
                console.error(`   ⚠️ Error creating variant for ${product.name}:`, varError.message);
            } else {
                console.log(`   - Variant created`);
            }
        }

        console.log('\n✨ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Fatal Error:', error);
    }
}

seedSpecificSarees();
