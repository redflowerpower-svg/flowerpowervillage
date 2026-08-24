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

async function syncOctoberToAugSept() {
  console.log('🚀 AVVIO ALLINEAMENTO TARIFFE E RESTRIZIONI: 23 Agosto -> 30 Settembre 2026');

  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (!tokenData?.access_token) {
    console.error('❌ Token Octorate non trovato.');
    return;
  }

  const rates = JSON.parse(fs.readFileSync('scratch/october1-full-rates.json', 'utf8'));
  console.log(`📋 Caricate ${rates.length} configurazioni tariffarie dal 1° Ottobre.`);

  const dateFrom = '2026-08-23';
  const dateTo = '2026-09-30';

  // Build the bulk payload for Octorate
  const bulkPayload = rates.map(r => {
    const values = {};
    if (r.price !== undefined && r.price !== null) values.price = Number(r.price);
    if (r.minStay !== undefined && r.minStay !== null) values.minstay = Number(r.minStay);
    if (r.stopSells !== undefined && r.stopSells !== null) values.closed = Boolean(r.stopSells);
    if (r.closeToArrival !== undefined && r.closeToArrival !== null) values.closedArrival = Boolean(r.closeToArrival);
    if (r.closeToDeparture !== undefined && r.closeToDeparture !== null) values.closedDeparture = Boolean(r.closeToDeparture);

    return {
      room: r.id,
      dateFrom,
      dateTo,
      values
    };
  });

  console.log(`📦 Totale operazioni generate: ${bulkPayload.length}`);

  // Send in batches of 25
  const BATCH_SIZE = 25;
  const results = [];

  for (let i = 0; i < bulkPayload.length; i += BATCH_SIZE) {
    const batch = bulkPayload.slice(i, i + BATCH_SIZE);
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(bulkPayload.length / BATCH_SIZE);

    console.log(`📡 Invio Batch ${batchIndex}/${totalBatches} (${batch.length} rateplans)...`);

    try {
      const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(batch)
      });

      const responseText = await res.text();
      console.log(`   -> Status: ${res.status} | Response: ${responseText.substring(0, 120)}`);
      results.push({ batch: batchIndex, status: res.status, ok: res.ok });

      // Small delay between batches to respect rate limits
      await new Promise(res => setTimeout(res, 400));
    } catch (e) {
      console.error(`   ❌ Errore durante l'invio del batch ${batchIndex}:`, e.message);
      results.push({ batch: batchIndex, status: 'ERROR', error: e.message });
    }
  }

  const allSuccess = results.every(r => r.ok);
  if (allSuccess) {
    console.log('\n✅ TUTTI I BATCH SONO STATI INVIATI CON SUCCESSO AD OCTORATE!');
    console.log(`📅 Periodo ${dateFrom} -> ${dateTo} sincronizzato e allineato al 1° Ottobre su tutti gli alloggi!`);
  } else {
    console.warn('\n⚠️ Alcuni batch hanno riportato errori:', results);
  }
}

syncOctoberToAugSept().catch(console.error);
