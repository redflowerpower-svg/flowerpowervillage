import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testExecSql() {
  console.log('📌 Attempting RPC exec_sql / SQL execution...');
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query: "ALTER TABLE accommodations ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]'::jsonb NOT NULL;"
    });
    if (error) {
      console.log('RPC exec_sql result:', error.message);
    } else {
      console.log('✅ RPC exec_sql succeeded:', data);
    }
  } catch (err) {
    console.log('RPC exception:', err.message);
  }
}

testExecSql();
