require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

async function testPrisma() {
  console.log('🔍 Testing Prisma Configuration...\n');

  try {
    // Test 1: Check if Prisma Client is initialized
    console.log('✅ Prisma Client initialized');

    // Test 2: Try to connect to database
    console.log('🔄 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Test 3: Try a simple query
    console.log('🔄 Testing database query...');
    const collectionCount = await prisma.collection.count();
    console.log(`✅ Query successful - Found ${collectionCount} collections\n`);

    // Test 4: Test a few more models
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    const typeCount = await prisma.type.count();

    console.log('📊 Database Statistics:');
    console.log(`   - Collections: ${collectionCount}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Types: ${typeCount}\n`);

    console.log('✅ All Prisma tests passed!');
    console.log('✅ Prisma is running correctly\n');

  } catch (error) {
    console.error('❌ Prisma test failed:');
    console.error('   Error:', error.message);
    if (error.code) {
      console.error('   Code:', error.code);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Disconnected from database');
  }
}

testPrisma();

