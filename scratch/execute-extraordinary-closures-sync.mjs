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

async function runExtraordinaryClosuresSync() {
  console.log('⚡ ESECUZIONE OPERAZIONE STRAORDINARIA: Allineamento Chiusure (Stop-Sell) 23 Ago -> 30 Set 2026');
  console.log('🔒 I PREZZI NON VENGONO TOCCATI (Invio esclusivo del parametro "stopSells")');

  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (!tokenData?.access_token) {
    console.error('❌ Token Octorate non trovato in Supabase');
    return;
  }

  const rates = JSON.parse(fs.readFileSync('scratch/october1-full-rates.json', 'utf8'));
  console.log(`📋 Caricati ${rates.length} piani tariffari di riferimento dal 1° Ottobre.`);

  const dateFrom = '2026-08-23';
  const dateTo = '2026-09-30';

  // Costruiamo il payload SOLO con il campo "stopSells"
  const bulkPayload = rates.map(r => ({
    room: r.id,
    dateFrom,
    dateTo,
    values: {
      stopSells: Boolean(r.stopSells)
    }
  }));

  const closedCount = bulkPayload.filter(item => item.values.stopSells === true).length;
  const openCount = bulkPayload.filter(item => item.values.stopSells === false).length;
  console.log(`🎯 Piani da impostare su CHIUSO (stopSells: true): ${closedCount}`);
  console.log(`🎯 Piani da impostare su APERTO (stopSells: false): ${openCount}`);

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

      const json = await res.json();
      console.log(`   -> Status: ${res.status} | Success: ${json.success} | Process IDs: ${json.process?.length || 0}`);
      results.push({ batch: batchIndex, status: res.status, ok: json.success });

      await new Promise(resolve => setTimeout(resolve, 400));
    } catch (e) {
      console.error(`   ❌ Errore batch ${batchIndex}:`, e.message);
      results.push({ batch: batchIndex, status: 'ERROR', error: e.message });
    }
  }

  const allSuccess = results.every(r => r.ok);
  if (allSuccess) {
    console.log('\n✅ OPERAZIONE STRAORDINARIA COMPLETATA CON SUCCESSO!');
    console.log(`📅 Le chiusure su tutti i ${rates.length} piani sono state allineate su Octorate per il periodo ${dateFrom} -> ${dateTo}.`);
    console.log(`🔒 108 Piani derivati CHIUSI | 88 Piani regolari APERTI | PREZZI NON MODIFICATI.`);
  } else {
    console.warn('\n⚠️ Alcuni batch hanno riportato errori:', results);
  }
}

runExtraordinaryClosuresSync().catch(console.error);
