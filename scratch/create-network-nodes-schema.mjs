import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

const supabaseUrl = envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Creating restaurant_network_nodes table...');
  const sql = `
    CREATE TABLE IF NOT EXISTS public.restaurant_network_nodes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      location TEXT NOT NULL DEFAULT 'ranong_pizzeria',
      public_ip TEXT NOT NULL,
      label TEXT DEFAULT 'Router Ristorante Ranong (2.4G/5G/Extender)',
      last_heartbeat_at TIMESTAMPTZ DEFAULT NOW(),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT uq_location_ip UNIQUE (location, public_ip)
    );

    GRANT SELECT ON public.restaurant_network_nodes TO anon;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_network_nodes TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.restaurant_network_nodes TO service_role;
  `;

  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error('exec_sql error:', error);
  } else {
    console.log('exec_sql success:', data);
  }

  // Verify
  const check = await supabase.from('restaurant_network_nodes').select('*').limit(5);
  console.log('Verification check:', check.error ? `Error: ${check.error.message}` : `Table exists! Rows: ${JSON.stringify(check.data)}`);
}

run();
