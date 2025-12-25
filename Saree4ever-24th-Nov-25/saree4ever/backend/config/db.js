const { createClient } = require('@supabase/supabase-js');

// Supabase client configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration in .env');
}

// Create Supabase client with service role key (for admin operations)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Create Supabase client with anon key (for public operations)
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

// Prisma client (optional - only initialize if DATABASE_URL is set)
let prisma = null;
try {
  if (process.env.DATABASE_URL) {
    const { PrismaClient } = require('@prisma/client');
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }
} catch (error) {
  console.warn('Prisma client not available:', error.message);
  console.warn('Using Supabase client only');
}

// Test database connections
async function testConnections() {
  try {
    // Test Supabase connection
    const { data: supabaseTest, error: supabaseError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
    
    if (supabaseError) {
      console.warn('Supabase connection test failed:', supabaseError.message);
    } else {
      console.log('✅ Supabase connection successful');
    }

    // Test Prisma connection (if available)
    if (prisma) {
      await prisma.$connect();
      console.log('✅ Prisma connection successful');
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

// Run connection tests on startup (only in development)
if (process.env.NODE_ENV === 'development') {
  testConnections();
}

// Graceful shutdown
process.on('beforeExit', async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
});

module.exports = {
  supabase,
  supabaseAnon,
  prisma,
};

