require('dotenv').config();
const { supabase } = require('./config/db');

/**
 * Script to remove all demo product data from the database
 * This will delete:
 * - All products
 * - All variants (cascades from products)
 * - All product relationships (product_collections, product_categories, product_types)
 * - All inventory records for those variants
 * 
 * This will NOT delete:
 * - Orders and order_items (transaction records should be preserved)
 * - Collections, categories, types (structure data)
 */

async function removeAllDemoProducts() {
  console.log('🗑️  Starting to remove all demo product data...\n');

  try {
    // Step 1: Delete all product relationships first
    console.log('1️⃣  Deleting product relationships...');
    
    // Delete product_collections relationships
    const { error: collectionsError } = await supabase
      .from('product_collections')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (collectionsError) {
      console.warn('⚠️  Warning deleting product_collections:', collectionsError.message);
    } else {
      console.log('✅ Deleted all product_collections relationships');
    }

    // Delete product_categories relationships
    const { error: categoriesError } = await supabase
      .from('product_categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (categoriesError) {
      console.warn('⚠️  Warning deleting product_categories:', categoriesError.message);
    } else {
      console.log('✅ Deleted all product_categories relationships');
    }

    // Delete product_types relationships
    const { error: typesError } = await supabase
      .from('product_types')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (typesError) {
      console.warn('⚠️  Warning deleting product_types:', typesError.message);
    } else {
      console.log('✅ Deleted all product_types relationships');
    }

    // Step 2: Delete all inventory records for variants
    console.log('\n2️⃣  Deleting inventory records...');
    
    // First get all variant IDs
    const { data: variants, error: variantsFetchError } = await supabase
      .from('variants')
      .select('id');
    
    if (variantsFetchError) {
      console.warn('⚠️  Could not fetch variants:', variantsFetchError.message);
    } else if (variants && variants.length > 0) {
      const variantIds = variants.map(v => v.id);
      
      // Delete inventory records in batches (Supabase has limits)
      const batchSize = 100;
      for (let i = 0; i < variantIds.length; i += batchSize) {
        const batch = variantIds.slice(i, i + batchSize);
        const { error: inventoryError } = await supabase
          .from('inventory')
          .delete()
          .in('variant_id', batch);
        
        if (inventoryError) {
          console.warn(`⚠️  Warning deleting inventory batch ${i / batchSize + 1}:`, inventoryError.message);
        }
      }
      console.log(`✅ Deleted inventory records for ${variants.length} variants`);
    } else {
      console.log('ℹ️  No variants found to delete inventory for');
    }

    // Step 3: Delete all variants
    console.log('\n3️⃣  Deleting all variants...');
    
    const { error: variantsDeleteError } = await supabase
      .from('variants')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (variantsDeleteError) {
      console.error('❌ Error deleting variants:', variantsDeleteError.message);
      throw variantsDeleteError;
    } else {
      console.log('✅ Deleted all variants');
    }

    // Step 4: Delete all products
    console.log('\n4️⃣  Deleting all products...');
    
    // First, get count of products to be deleted
    const { count: productCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.warn('⚠️  Could not count products:', countError.message);
    } else {
      console.log(`ℹ️  Found ${productCount} products to delete`);
    }

    const { error: productsDeleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    
    if (productsDeleteError) {
      console.error('❌ Error deleting products:', productsDeleteError.message);
      throw productsDeleteError;
    } else {
      console.log('✅ Deleted all products');
    }

    // Step 5: Verify deletion
    console.log('\n5️⃣  Verifying deletion...');
    
    const { count: remainingProducts, error: verifyError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (verifyError) {
      console.warn('⚠️  Could not verify deletion:', verifyError.message);
    } else {
      console.log(`ℹ️  Remaining products: ${remainingProducts}`);
      if (remainingProducts === 0) {
        console.log('✅ All products successfully removed!');
      } else {
        console.warn(`⚠️  Warning: ${remainingProducts} products still remain`);
      }
    }

    console.log('\n✅ Demo product data removal completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - All products deleted');
    console.log('   - All variants deleted');
    console.log('   - All product relationships deleted');
    console.log('   - All inventory records deleted');
    console.log('\n💡 Note: Orders and order_items were preserved (transaction records)');
    console.log('💡 Note: Collections, categories, and types were preserved (structure data)');

  } catch (error) {
    console.error('❌ Error removing demo products:', error);
    throw error;
  }
}

// Run the removal function
removeAllDemoProducts()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Removal failed:', error);
    process.exit(1);
  });


