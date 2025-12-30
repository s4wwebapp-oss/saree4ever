const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

async function fixSupabaseSchemaCache() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase config');
    process.exit(1);
  }

  try {
    // Attempt 1: Try to directly access the REST API with a custom SQL request
    // Supabase admin API can execute SQL via /rest endpoint
    
    console.log('Attempting to refresh Supabase schema cache...');
    
    // Directly use axios to call Supabase admin API
    const response = await axios.post(
      `${supabaseUrl}/rest/v1/rpc/refresh_schema_cache`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    ).catch(async (err) => {
      // If RPC doesn't exist, try alternative: query the postgres connection
      console.log('RPC method not found, trying alternative approach...');
      
      // Instead, create a Supabase client and try a raw query via SQL endpoint if available
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Try to list tables to verify connectivity
      const result = await supabase.rpc('list_tables', {});
      console.log('RPC result:', result);
      
      return null;
    });

    if (response) {
      console.log('Schema cache refresh response:', response.data);
    }

    // Check if the plural table exists
    console.log('\nChecking tables...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try to query info_schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .ilike('table_name', '%landing%')
      .limit(10);

    if (error) {
      console.error('Error querying tables:', error);
    } else {
      console.log('Tables found:', data);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

fixSupabaseSchemaCache();
