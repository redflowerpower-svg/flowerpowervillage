import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) {
      const val = v.join('=').trim().replace(/^["']|["']$/g, '');
      envVars[k.trim()] = val;
      process.env[k.trim()] = val;
    }
  }
}

const supabase = createClient(
  envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY
);

async function run() {
  const { data } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  const token = data.access_token;
  const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' };

  // Create booking
  console.log('1. Creating booking on FB1: 2027-10-20 to 2027-10-25...');
  const createRes = await fetch(`https://api.octorate.com/connect/rest/v1/reservation/366879`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      channelId: 288,
      status: 'CONFIRMED',
      product: 649669,
      checkin: '2027-10-20T02:00:00Z[UTC]',
      checkout: '2027-10-25T05:00:00Z[UTC]',
      totalGuest: 2,
      guests: [{ type: 'BOOKER', givenName: 'Test', familyName: 'One', language: 'EN', source: 'USER' }]
    })
  });
  const bJson = await createRes.json();
  const bid = bJson.id;
  console.log('Created booking ID:', bid);

  // Wait 1s for Octorate to index
  await new Promise(r => setTimeout(r, 1000));

  // Run webhook
  console.log('2. Running webhook...');
  const { handleOctorateWebhook } = await import('../api/_handlers/octorate-webhook.ts');
  let webhookResult = null;
  await handleOctorateWebhook(
    { method: 'POST', body: { type: 'RESERVATION_CREATED', id: bid } } as any,
    { setHeader: () => {}, status: () => ({ json: (d: any) => { webhookResult = d; } }) } as any
  );
  console.log('Webhook result:', webhookResult);

  // Wait 2.5s for Octorate bulk process to complete
  await new Promise(r => setTimeout(r, 2500));

  // Read calendar
  const calRes = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/366879?dateFrom=2027-10-18&dateTo=2027-10-28&size=50&page=1`, { headers });
  const calJson = await calRes.json();
  const fb1 = (calJson.data || calJson || []).find((r: any) => r.id === 649669);
  console.log('3. Calendar state AFTER creation:');
  fb1?.days?.filter((d: any) => ['2027-10-18', '2027-10-19', '2027-10-20', '2027-10-25', '2027-10-26', '2027-10-27'].includes(d.date)).forEach((d: any) => console.log(`   ${d.date}: minStay = ${d.minStay}`));

  // Cancel booking
  console.log('4. Cancelling booking ID:', bid);
  await fetch(`https://api.octorate.com/connect/rest/v1/reservation/366879/${bid}`, { method: 'DELETE', headers });

  // Wait 1s
  await new Promise(r => setTimeout(r, 1000));

  // Run webhook on cancellation
  console.log('5. Running webhook on cancellation...');
  await handleOctorateWebhook(
    { method: 'POST', body: { type: 'RESERVATION_CANCELLED', id: bid } } as any,
    { setHeader: () => {}, status: () => ({ json: (d: any) => { webhookResult = d; } }) } as any
  );
  console.log('Cancellation Webhook result:', webhookResult);

  // Wait 2.5s
  await new Promise(r => setTimeout(r, 2500));

  // Read calendar again
  const calRes2 = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/366879?dateFrom=2027-10-18&dateTo=2027-10-28&size=50&page=1`, { headers });
  const calJson2 = await calRes2.json();
  const fb1After = (calJson2.data || calJson2 || []).find((r: any) => r.id === 649669);
  console.log('6. Calendar state AFTER cancellation (RESTORED TO BASELINE):');
  fb1After?.days?.filter((d: any) => ['2027-10-18', '2027-10-19', '2027-10-20', '2027-10-25', '2027-10-26', '2027-10-27'].includes(d.date)).forEach((d: any) => console.log(`   ${d.date}: minStay = ${d.minStay}`));
}

run().catch(console.error);
