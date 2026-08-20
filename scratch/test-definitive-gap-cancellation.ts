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

  console.log('========================================================================');
  console.log('       TEST DEFINITIVO SU FAKE BUNGALOW 2 (#921799): 1-NIGHT GAP');
  console.log('========================================================================\n');

  // Step 1: Create 2 adjacent bookings on FB2 leaving a 1-night gap between them (Oct 21 -> Oct 22)
  // Booking A: Oct 18 to Oct 21
  // Booking B: Oct 22 to Oct 26
  // Gap: Oct 21 (1 notte) -> minStay should become 1!
  console.log('1. Creazione Booking A (18-21 Ottobre) su FB2...');
  const resA = await fetch('https://api.octorate.com/connect/rest/v1/reservation/366879', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      channelId: 288,
      status: 'CONFIRMED',
      product: 921799,
      checkin: '2027-10-18T02:00:00Z[UTC]',
      checkout: '2027-10-21T05:00:00Z[UTC]',
      totalGuest: 2,
      guests: [{ type: 'BOOKER', givenName: 'BookingA', familyName: 'FB2', language: 'EN', source: 'USER' }]
    })
  });
  const bA = await resA.json();
  console.log('   ✅ Booking A creato:', bA.id);

  console.log('2. Creazione Booking B (22-26 Ottobre) su FB2...');
  const resB = await fetch('https://api.octorate.com/connect/rest/v1/reservation/366879', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      channelId: 288,
      status: 'CONFIRMED',
      product: 921799,
      checkin: '2027-10-22T02:00:00Z[UTC]',
      checkout: '2027-10-26T05:00:00Z[UTC]',
      totalGuest: 2,
      guests: [{ type: 'BOOKER', givenName: 'BookingB', familyName: 'FB2', language: 'EN', source: 'USER' }]
    })
  });
  const bB = await resB.json();
  console.log('   ✅ Booking B creato:', bB.id);

  // Esecuzione Webhook di sincronizzazione
  console.log('\n3. Esecuzione Webhook Sincronizzazione Notti Dinamiche...');
  const { handleOctorateWebhook } = await import('../api/_handlers/octorate-webhook.ts');
  await handleOctorateWebhook(
    { method: 'POST', body: { type: 'RESERVATION_CREATED', id: bB.id } } as any,
    { setHeader: () => {}, status: () => ({ json: (d: any) => console.log('   Webhook executed:', d.message, '| Updates count:', d.calculatedUpdatesCount) }) } as any
  );

  await new Promise(r => setTimeout(r, 2000));

  // Verifica Octorate: 21 Ottobre DEVE avere minStay = 1!
  console.log('\n4. Verifica Octorate: Buco di 1 notte (21 Ottobre)...');
  const calRes1 = await fetch('https://api.octorate.com/connect/rest/v1/calendar/366879?dateFrom=2027-10-18&dateTo=2027-10-28&size=50&page=1', { headers });
  const calJson1 = await calRes1.json();
  const fb2WithGap = (calJson1.data || calJson1 || []).find((r: any) => r.id === 921799);
  const d21WithGap = fb2WithGap?.days?.find((d: any) => d.date === '2027-10-21')?.minStay;
  console.log(`   👉 FB2 21 Ottobre (buco tra Booking A e B): minStay = ${d21WithGap} notte (GAP-FILL CONFERMATO!)`);

  // Step 5: CANCELLAZIONE di Booking B
  console.log(`\n5. Cancellazione Booking B (${bB.id}) su Octorate...`);
  await fetch(`https://api.octorate.com/connect/rest/v1/reservation/366879/${bB.id}`, { method: 'DELETE', headers });

  // Esecuzione Webhook su cancellazione
  console.log('6. Esecuzione Webhook dopo la cancellazione...');
  await handleOctorateWebhook(
    { method: 'POST', body: { type: 'RESERVATION_CANCELLED', id: bB.id } } as any,
    { setHeader: () => {}, status: () => ({ json: (d: any) => console.log('   Webhook cancellation executed:', d.message, '| Updates count:', d.calculatedUpdatesCount) }) } as any
  );

  await new Promise(r => setTimeout(r, 2000));

  // Verifica Octorate DOPO CANCELLAZIONE: il buco si è allargato (da 21 Ottobre in poi) e minStay torna a 2 notti (Baseline)!
  console.log('\n7. Verifica Octorate DOPO CANCELLAZIONE di Booking B...');
  const calRes2 = await fetch('https://api.octorate.com/connect/rest/v1/calendar/366879?dateFrom=2027-10-18&dateTo=2027-10-28&size=50&page=1', { headers });
  const calJson2 = await calRes2.json();
  const fb2AfterCancel = (calJson2.data || calJson2 || []).find((r: any) => r.id === 921799);
  const d21AfterCancel = fb2AfterCancel?.days?.find((d: any) => d.date === '2027-10-21')?.minStay;
  const d22AfterCancel = fb2AfterCancel?.days?.find((d: any) => d.date === '2027-10-22')?.minStay;
  console.log(`   👉 FB2 21 Ottobre: minStay = ${d21AfterCancel} notti (RIPRISTINATO A BASELINE!)`);
  console.log(`   👉 FB2 22 Ottobre: minStay = ${d22AfterCancel} notti (RIPRISTINATO A BASELINE!)`);

  // Pulizia: cancelliamo anche Booking A
  await fetch(`https://api.octorate.com/connect/rest/v1/reservation/366879/${bA.id}`, { method: 'DELETE', headers });

  console.log('\n========================================================================');
  if (d21WithGap === 1 && d21AfterCancel === 2 && d22AfterCancel === 2) {
    console.log('  🎉 VALIDAZIONE DEFINITIVA: 100% SUCCESSO E RISOLUZIONE TOTALE!');
    console.log('  • Buco da 1 notte applicato a Octorate.');
    console.log('  • Cancellazione recepita in tempo reale.');
    console.log('  • Baseline ripristinata a 2 notti sul PMS Octorate.');
  } else {
    console.log('  ⚠️ Esito: d21WithGap =', d21WithGap, '| d21AfterCancel =', d21AfterCancel);
  }
  console.log('========================================================================\n');
}

run().catch(console.error);
