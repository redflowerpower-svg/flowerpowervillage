import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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

async function testAlterTable() {
  console.log('📌 Attempting SQL execution for ALTER TABLE accommodations...');
  const sql = "ALTER TABLE accommodations ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]'::jsonb NOT NULL;";

  // Try RPC candidates
  const rpcCandidates = ['exec', 'exec_sql', 'sql', 'run_sql', 'query'];
  for (const rpcName of rpcCandidates) {
    try {
      const { data, error } = await supabase.rpc(rpcName, { query: sql, sql: sql });
      if (!error) {
        console.log(`✅ RPC '${rpcName}' succeeded!`, data);
        return;
      }
    } catch {}
  }

  // Try fetch to Supabase API
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: sql })
    });
    console.log('HTTP RPC Status:', res.status, await res.text());
  } catch (e) {
    console.log('Fetch error:', e.message);
  }
}

testAlterTable();
