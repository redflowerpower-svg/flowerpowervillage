import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function restoreOriginalDerivedRestrictions() {
  console.log('🔄 AVVIO RIPRISTINO REALE TARIFFE DERIVATE SU OCTORATE...\n');

  const { data: tokenData, error: tokenError } = await supabaseAdmin
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (tokenError || !tokenData?.access_token) {
    console.error('❌ Impossibile recuperare il token OAuth da Supabase:', tokenError);
    process.exit(1);
  }

  const accessToken = tokenData.access_token;
  const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || process.env.OCTORATE_STRUCTURE_ID || '366879';

  console.log(`✅ Token OAuth valido recuperato da Supabase per Struttura ID: ${structureId}`);

  // Fetch all room rates
  const resRates = await fetch(`https://api.octorate.com/connect/rest/v1/roomrates/${structureId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
  });

  if (!resRates.ok) {
    console.error('❌ Errore durante il recupero delle tariffe da Octorate:', await resRates.text());
    process.exit(1);
  }

  const rawData = await resRates.json();
  const rates = Array.isArray(rawData) ? rawData : (rawData.roomRates || rawData.rates || []);

  console.log(`📌 Trovate ${rates.length} tariffe attive su Octorate.`);

  const dateFrom = '2026-10-01';
  const dateTo = '2027-05-31';

  let restoredCount = 0;

  // Interroga ed azzera stopSell / CA sulle tariffe derivate
  for (const rate of rates) {
    const rName = String(rate.name || rate.title || '').toLowerCase();
    const rateId = rate.id;

    // Se è una delle 12 tariffe derivate o alloggi
    const isDerivedTarget = rName.includes('7d') || rName.includes('14d') || rName.includes('airbnb') || rName.includes('agd') || rName.includes('main bnb') || rName.includes('ac');

    if (isDerivedTarget && rateId) {
      restoredCount++;
      console.log(`[${restoredCount}] Ripristino per "${rate.name}" (ID ${rateId})...`);

      try {
        await fetch(`https://api.octorate.com/connect/rest/v1/calendar/${structureId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            rateId: String(rateId),
            dateFrom,
            dateTo,
            closed: false,
            closedArrival: false,
            closedDeparture: false
          })
        });
      } catch (err) {
        console.warn(`⚠️ Errore su tariffa ${rateId}:`, err);
      }
    }
  }

  console.log(`\n✅ RIPRISTINO COMPLETATO SU OCTORATE! ${restoredCount} tariffe ripristinate allo stato APERTO/PULITO.`);
}

restoreOriginalDerivedRestrictions().catch(err => {
  console.error('❌ Errore fatale ripristino:', err);
  process.exit(1);
});
