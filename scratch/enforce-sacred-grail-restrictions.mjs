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

// Rate ID Reali per tutti i 18 alloggi (194 prodotti Octorate totali)
export const REAL_PRODUCTS_BY_PLAN = {
  be: [495980, 529784, 449684, 449678, 449422, 449699, 449724, 449348, 449730, 495807, 449736, 495566, 449742, 449385, 449668, 449675, 449674],
  '7d': [916110, 495976, 872182, 529778, 422300, 422296, 422293, 422422, 422445, 495803, 422325, 495549, 422213, 422351, 422131, 422265, 422402, 422149],
  main_bnb_7d: [916109, 529788, 496002, 496001, 495575, 421520, 332066, 332084, 332077, 332739, 332735, 332746, 332105, 332763, 332757, 332767, 332054, 332029],
  main_bnb_14d: [916107, 496010, 529792, 496009, 495580, 332055, 332070, 332081, 332089, 332737, 332741, 332743, 332109, 332759, 332769, 332765, 421516, 332030],
  ac_7d: [916114, 495978, 529780, 495552, 495805, 421522, 340367, 331921, 330964, 331923, 331970, 331972, 331966, 331968, 331974, 331976],
  ac_14d: [495979, 529781, 916105, 422157, 421527, 495806, 495565, 421998, 331922, 331924, 330970, 331969, 331971, 331967, 331977, 331973],
  ac_bnb_7d: [496022, 496021, 916818, 916816, 916840, 916829, 495587, 332057, 421525, 332072, 332121, 332123, 332119, 332129, 332125, 332035],
  ac_bnb_14d: [496031, 496030, 916402, 916838, 916830, 529801, 421530, 495593, 332060, 332074, 332138, 332140, 332134, 332136, 332142, 332036],
  agd_ac_7d: [921874, 921872, 921870, 921868],
  agd_ac_14d: [921873, 921871, 921869],
  airbnb: [529783, 495982, 916103, 421532, 495810, 495569, 297025, 297027, 297028, 297021, 297022, 297023, 297024, 297033, 297029, 297030, 297031, 297032],
  airbnb_ac: [529813, 496057, 496056, 916104, 421533, 495609, 422147, 340196, 340198, 340200, 421507, 421508, 421505, 421506, 421509, 421510]
};

async function enforceAllRestrictions() {
  const todayStr = new Date().toISOString().slice(0, 10);
  console.log(`🛡️ AVVIO ALLINEAMENTO CATEGORICO "SACRO GRAAL" (Data odierna: ${todayStr})...`);

  const { data: tokenData } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  const token = tokenData.access_token;
  const clientId = envVars.VITE_OCTORATE_CLIENT_ID || envVars.OCTORATE_CLIENT_ID || '';

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (clientId) headers['Octorate-Api-Key'] = clientId;

  const bulkPayload = [];

  const clampPeriod = (from, to) => {
    const safeFrom = from < todayStr ? todayStr : from;
    if (safeFrom > to) return null;
    return { dateFrom: safeFrom, dateTo: to };
  };

  // 1. TARIFFE CHIUSE CATEGORICAMENTE PER TUTTA LA STAGIONE (2026-10-16 -> 2027-05-31)
  // AC7d, AC14d, AC bnb-7d, AC bnb-14d, AirBnB AC
  const fullyClosedPlans = ['ac_7d', 'ac_14d', 'ac_bnb_7d', 'ac_bnb_14d', 'airbnb_ac'];
  for (const plan of fullyClosedPlans) {
    const productIds = REAL_PRODUCTS_BY_PLAN[plan] || [];
    console.log(`🔒 Imposizione Chiusura Totale per ${plan} (${productIds.length} alloggi)...`);
    for (const pid of productIds) {
      bulkPayload.push({
        room: pid,
        dateFrom: todayStr,
        dateTo: '2027-05-31',
        values: {
          stopSells: true,
          closed: true,
          closedArrival: true,
          closedDeparture: true
        }
      });
    }
  }

  // 2. TARIFFA STANDARD 7D (Booking, Expedia, Agoda)
  // Oggi -> 2026-12-15: APERTA
  // 2026-12-16 -> 2026-12-25: ONLY CHECK-OUT / CTA (no nuovi arrivi)
  // 2026-12-26 -> 2027-03-31: STOP SELL TOTALE (HIGH SEASON BLOCCATA)
  // 2027-04-01 -> 2027-05-31: APERTA
  const stdIds = REAL_PRODUCTS_BY_PLAN['7d'] || [];
  console.log(`🔒 Imposizione Regole per Standard 7d (${stdIds.length} alloggi)...`);
  for (const pid of stdIds) {
    const p1 = clampPeriod('2026-10-01', '2026-12-15');
    if (p1) bulkPayload.push({ room: pid, ...p1, values: { stopSells: false, closed: false, closedArrival: false, closedDeparture: false } });

    bulkPayload.push({
      room: pid,
      dateFrom: '2026-12-16',
      dateTo: '2026-12-25',
      values: { stopSells: false, closed: false, closedArrival: true, closedDeparture: false }
    });

    bulkPayload.push({
      room: pid,
      dateFrom: '2026-12-26',
      dateTo: '2027-03-31',
      values: { stopSells: true, closed: true, closedArrival: true, closedDeparture: true }
    });

    bulkPayload.push({
      room: pid,
      dateFrom: '2027-04-01',
      dateTo: '2027-05-31',
      values: { stopSells: false, closed: false, closedArrival: false, closedDeparture: false }
    });
  }

  // 3. MAIN BNB-14D & AGD AC-14D (APERTE SOLO A CAPODANNO: 16 Dic -> 15 Gen)
  const plans14d = [
    { key: 'main_bnb_14d', ids: REAL_PRODUCTS_BY_PLAN.main_bnb_14d },
    { key: 'agd_ac_14d', ids: REAL_PRODUCTS_BY_PLAN.agd_ac_14d }
  ];
  for (const p of plans14d) {
    console.log(`🔒 Imposizione Finestra 14d per ${p.key} (${p.ids.length} alloggi)...`);
    for (const pid of p.ids) {
      const p1 = clampPeriod('2026-10-01', '2026-12-15');
      if (p1) bulkPayload.push({ room: pid, ...p1, values: { stopSells: true, closed: true, closedArrival: true, closedDeparture: true } });

      bulkPayload.push({
        room: pid,
        dateFrom: '2026-12-16',
        dateTo: '2027-01-15',
        values: { stopSells: false, closed: false, closedArrival: false, closedDeparture: false }
      });

      bulkPayload.push({
        room: pid,
        dateFrom: '2027-01-16',
        dateTo: '2027-01-25',
        values: { stopSells: false, closed: false, closedArrival: true, closedDeparture: false }
      });

      bulkPayload.push({
        room: pid,
        dateFrom: '2027-01-26',
        dateTo: '2027-05-31',
        values: { stopSells: true, closed: true, closedArrival: true, closedDeparture: true }
      });
    }
  }

  // 4. MAIN BNB-7D & AGD AC-7D (CHIUSE A CAPODANNO, APERTE DOPO: 16 Gen -> 31 Mag)
  const plans7d = [
    { key: 'main_bnb_7d', ids: REAL_PRODUCTS_BY_PLAN.main_bnb_7d },
    { key: 'agd_ac_7d', ids: REAL_PRODUCTS_BY_PLAN.agd_ac_7d }
  ];
  for (const p of plans7d) {
    console.log(`🔒 Imposizione Finestra 7d per ${p.key} (${p.ids.length} alloggi)...`);
    for (const pid of p.ids) {
      const p1 = clampPeriod('2026-10-01', '2026-12-15');
      if (p1) bulkPayload.push({ room: pid, ...p1, values: { stopSells: false, closed: false, closedArrival: false, closedDeparture: false } });

      bulkPayload.push({
        room: pid,
        dateFrom: '2026-12-16',
        dateTo: '2026-12-25',
        values: { stopSells: false, closed: false, closedArrival: true, closedDeparture: false }
      });

      bulkPayload.push({
        room: pid,
        dateFrom: '2026-12-26',
        dateTo: '2027-01-15',
        values: { stopSells: true, closed: true, closedArrival: true, closedDeparture: true }
      });

      bulkPayload.push({
        room: pid,
        dateFrom: '2027-01-16',
        dateTo: '2027-05-31',
        values: { stopSells: false, closed: false, closedArrival: false, closedDeparture: false }
      });
    }
  }

  // 5. OFFICIAL BOOKING ENGINE (be) & AIRBNB BASE
  const openAlwaysPlans = [
    { key: 'be', ids: REAL_PRODUCTS_BY_PLAN.be },
    { key: 'airbnb', ids: REAL_PRODUCTS_BY_PLAN.airbnb }
  ];
  for (const p of openAlwaysPlans) {
    console.log(`🟢 Apertura Completa per ${p.key} (${p.ids.length} alloggi)...`);
    for (const pid of p.ids) {
      bulkPayload.push({
        room: pid,
        dateFrom: todayStr,
        dateTo: '2027-05-31',
        values: { stopSells: false, closed: false, closedArrival: false, closedDeparture: false }
      });
    }
  }

  console.log(`\n📦 TOTALE OPERAZIONI BULK PREPARATE: ${bulkPayload.length}`);

  // Invia a Octorate in blocchi da 50 elementi per affidabilità massima
  const BATCH_SIZE = 50;
  for (let i = 0; i < bulkPayload.length; i += BATCH_SIZE) {
    const chunk = bulkPayload.slice(i, i + BATCH_SIZE);
    const chunkIdx = Math.floor(i / BATCH_SIZE) + 1;
    const totalChunks = Math.ceil(bulkPayload.length / BATCH_SIZE);
    console.log(`🚀 Invio blocco ${chunkIdx}/${totalChunks} (${chunk.length} operazioni)...`);

    const res = await fetch('https://api.octorate.com/connect/rest/v1/calendar/bulk', {
      method: 'POST',
      headers,
      body: JSON.stringify(chunk)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ Errore blocco ${chunkIdx}: HTTP ${res.status} - ${errText}`);
      throw new Error(`Octorate API error on chunk ${chunkIdx}`);
    }

    const resJson = await res.json().catch(() => ({}));
    console.log(`✅ Blocco ${chunkIdx} applicato! Processi Octorate:`, resJson.process?.length || 0);
  }

  console.log('\n🏆 ALLINEAMENTO SACRO GRAAL COMPLETATO CON SUCCESSO SU OCTORATE!');
}

enforceAllRestrictions().catch(console.error);
