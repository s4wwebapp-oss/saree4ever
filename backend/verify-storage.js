require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with Service Role Key
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET_NAME = 'products';

async function checkStorage() {
    console.log('--- Checking Supabase Storage ---');

    // 1. List Buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
        console.error('❌ Error listing buckets:', listError.message);
        return;
    }

    console.log('Available buckets:', buckets.map(b => b.name));

    const productBucket = buckets.find(b => b.name === BUCKET_NAME);

    if (productBucket) {
        console.log(`✅ Bucket '${BUCKET_NAME}' exists.`);
        console.log('Bucket details:', productBucket);
    } else {
        console.log(`⚠️ Bucket '${BUCKET_NAME}' NOT found.`);

        // Attempt creation
        console.log(`Attempting to create '${BUCKET_NAME}' bucket...`);
        const { data, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
            public: true,
            fileSizeLimit: 10485760, // 10MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
        });

        if (createError) {
            console.error('❌ Failed to create bucket:', createError.message);
        } else {
            console.log('✅ Bucket created successfully.');
        }
    }
}

checkStorage();
