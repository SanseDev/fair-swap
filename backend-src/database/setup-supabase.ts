import { supabase } from '../config/database.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupSupabase() {
  try {
    console.log('Setting up Supabase database schema...');
    
    const sqlPath = join(__dirname, '../../supabase/migrations/001_initial_schema.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    
    // Note: Supabase client doesn't support raw SQL execution directly
    // You need to execute this in the Supabase SQL editor
    console.log('\n⚠️  Please execute the following SQL in your Supabase SQL Editor:\n');
    console.log('Location: supabase/migrations/001_initial_schema.sql');
    console.log('\nOr visit: https://supabase.com/dashboard/project/_/sql/new');
    console.log('\n' + '='.repeat(80));
    console.log(sql);
    console.log('='.repeat(80) + '\n');
    
    // Test connection
    const { data, error } = await supabase.from('indexer_state').select('*').limit(1);
    
    if (error) {
      console.error('❌ Error connecting to Supabase:', error.message);
      console.log('\nMake sure you have:');
      console.log('1. Created the tables by running the SQL above in Supabase SQL Editor');
      console.log('2. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
      process.exit(1);
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log(`✅ Found ${data?.length || 0} records in indexer_state table`);
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupSupabase();

