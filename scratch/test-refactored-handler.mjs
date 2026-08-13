import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env');
const envVars = {};
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...rest] = trimmed.split('=');
    if (key) envVars[key.trim()] = rest.join('=').trim();
  }
}

const supabase = createClient(
  envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY
);

async function testBackendHandlers() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  🧪 VERIFICA REFRACTORING HANDLER E payload OCTORATE');
  console.log('════════════════════════════════════════════════════════════════\n');

  // Test calling local update-restriction endpoint for MAIN_BNB_7D (which has onlyCheckoutDays = 10)
  const res = await fetch('http://localhost:3000/api/update-restriction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      planId: 'main_bnb_7d',
      ratePlanKey: 'main_bnb_7d',
      dateFrom: '2026-10-01',
      dateTo: '2026-12-15',
      closedToArrival: true,
      onlyCheckoutDays: 10,
      onlyCheckOutDays: 10,
      strategy: 'failsafe_checkout',
      testOnly: true
    })
  });

  const txt = await res.text();
  console.log(`📌 Test update-restriction (MAIN_BNB_7D - 10gg CTA): HTTP ${res.status}`);
  console.log(`   Risposta: ${txt}\n`);
}

testBackendHandlers().catch(err => console.error(err));
