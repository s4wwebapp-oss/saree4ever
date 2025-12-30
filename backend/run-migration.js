// Quick script to run a migration
const { supabase } = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, 'migrations', 'add_button_target_to_hero_slides.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running migration...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // Try direct query if RPC fails
      console.log('RPC failed, trying direct query...');
      const result = await supabase.from('hero_slides').select('id').limit(1);

      if (result.error) {
        console.error('Error:', result.error);
        process.exit(1);
      }

      // Execute via raw SQL
      console.log('\nPlease run this SQL in your Supabase SQL Editor:');
      console.log('https://app.supabase.com/project/vyrsqtolsisgwfbiairv/sql/new');
      console.log('\n' + '='.repeat(80));
      console.log(sql);
      console.log('='.repeat(80) + '\n');
    } else {
      console.log('✅ Migration completed successfully!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
