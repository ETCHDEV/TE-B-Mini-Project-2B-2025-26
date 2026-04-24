import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function migrate() {
  console.log('🚀 Starting profile migration...');
  
  console.log('Attempting to add columns via SQL...');
  
  // Note: Since raw SQL isn't directly exposed via the client, 
  // we'll try to use the common 'admin_run_sql' RPC if it exists.
  // If it doesn't, I will provide the SQL to the user in the walkthrough.
  
  const sql = `
    ALTER TABLE public.students ADD COLUMN IF NOT EXISTS bio TEXT;
    ALTER TABLE public.students ADD COLUMN IF NOT EXISTS avatar_url TEXT;
    ALTER TABLE public.students ADD COLUMN IF NOT EXISTS target_role TEXT;
  `;

  const { data, error } = await supabase.rpc('admin_run_sql', { sql_query: sql });

  if (error) {
    console.warn('⚠️ Could not run migration via RPC automatically.');
    console.log('\n--- MANUAL ACTION REQUIRED ---');
    console.log('Please copy and run the following SQL in your Supabase SQL Editor:');
    console.log(sql);
    console.log('-------------------------------\n');
  } else {
    console.log('✅ Migration successful!', data);
  }
}

migrate();
