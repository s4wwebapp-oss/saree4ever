require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase with Service Role Key for Admin privileges (Storage upload)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const IMAGE_PATH = '/Users/abhishekmr/.gemini/antigravity/brain/7221f0e1-cc3d-4bcd-a92a-5d8322135ded/ho_silk_contemporary_saree_1766870904325.png';
const BUCKET_NAME = 'products';
const PRODUCT_NAME = 'Ho Silk Contemporary Weave';

async function uploadAndLinkImage() {
    try {
        console.log(`Starting upload process for ${PRODUCT_NAME}...`);

        // 1. Check/Create Bucket
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets.find(b => b.name === BUCKET_NAME)) {
            console.log(`Creating bucket '${BUCKET_NAME}'...`);
            await supabase.storage.createBucket(BUCKET_NAME, { public: true });
        }

        // 2. Read file
        const fileBuffer = fs.readFileSync(IMAGE_PATH);
        const fileName = `ho-silk-contemporary-${Date.now()}.png`;

        // 3. Upload to Storage
        console.log(`Uploading ${fileName} to storage...`);
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, fileBuffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        // 4. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        console.log(`Image uploaded successfully: ${publicUrl}`);

        // 5. Update Product in Database
        console.log(`Updating database for product: ${PRODUCT_NAME}`);
        const { data: product, error: dbError } = await supabase
            .from('products')
            .update({ primary_image_url: publicUrl })
            .eq('name', PRODUCT_NAME)
            .select();

        if (dbError) throw new Error(`Database update failed: ${dbError.message}`);

        console.log('✅ Success! Product updated:', product);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

uploadAndLinkImage();
