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
  console.log('Testing RPC exec_sql...');
  const sql = `
    CREATE TABLE IF NOT EXISTS public.pizza_table_reservations (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      contact TEXT NOT NULL,
      email TEXT,
      guests INTEGER DEFAULT 2,
      reservation_date TEXT NOT NULL,
      reservation_time TEXT NOT NULL,
      seating_area TEXT DEFAULT 'any',
      occasion TEXT,
      notes TEXT,
      status TEXT DEFAULT 'pending',
      lang TEXT DEFAULT 'IT',
      telegram_message_id BIGINT,
      telegram_notified BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    GRANT SELECT ON public.pizza_table_reservations TO anon;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.pizza_table_reservations TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.pizza_table_reservations TO service_role;
  `;

  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error('exec_sql error:', error);
  } else {
    console.log('exec_sql success:', data);
  }

  // Verify
  const check = await supabase.from('pizza_table_reservations').select('*').limit(1);
  console.log('Verification check:', check.error ? `Error: ${check.error.message}` : `Table exists! Count: ${check.data?.length}`);
}

run();
