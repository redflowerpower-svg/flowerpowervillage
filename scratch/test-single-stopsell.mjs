import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envVars = {};
['.env', '.env.local'].forEach(file => {
  const filePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...rest] = trimmed.split('=');
        if (key) envVars[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
});

const supabase = createClient(
  envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY
);

async function testSingleStopSell() {
  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const testPayload = [
    {
      room: 529813, // JV AirBnB AC
      dateFrom: '2026-08-23',
      dateTo: '2026-09-30',
      values: {
        stopSells: true
      }
    }
  ];

  const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(testPayload)
  });

  console.log('Status:', res.status);
  console.log('Response:', await res.text());
}

testSingleStopSell().catch(console.error);
