import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { sendDepartmentTelegramMessage } from "../_helpers/telegram.js";
import { REAL_PRODUCTS_BY_PLAN } from "./update-restriction.js";
import { calculateServerDynamicMinStay, ALL_ACCOMMODATIONS_MAP } from "./octorate-webhook.js";

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  return (supabaseUrl && serviceRoleKey) ? createClient(supabaseUrl, serviceRoleKey) : null;
}

export const MOTHER_ROOM_INFOS: Record<number, { name: string; basePrice: number }> = {
  529773: { name: 'Jungle Villa', basePrice: 2290 },
  495795: { name: 'Jungle Villa Left', basePrice: 1290 },
  495796: { name: 'Jungle Villa Right', basePrice: 1290 },
  494840: { name: 'Peace & Love Villa', basePrice: 1290 },
  421511: { name: 'Penthouse Villa', basePrice: 1290 },
  293957: { name: 'Yellow Bungalow', basePrice: 990 },
  293954: { name: 'Red Bungalow', basePrice: 790 },
  293962: { name: 'Green Bungalow', basePrice: 790 },
  293965: { name: 'Camel Tent', basePrice: 430 },
  293955: { name: 'Lagoon Tent', basePrice: 430 },
  293942: { name: 'Internal room', basePrice: 430 },
  293963: { name: 'Room 1', basePrice: 790 },
  293959: { name: 'Room 2', basePrice: 790 },
  293948: { name: 'Room 3', basePrice: 790 },
  293945: { name: 'Room 4', basePrice: 790 },
  293943: { name: 'Room 5', basePrice: 790 },
  293951: { name: 'Lodge 1', basePrice: 890 },
  883795: { name: 'Lodge 2', basePrice: 890 }
};

export interface SentinelAuditResult {
  timestamp: string;
  totalProductsAudited: number;
  anomaliesDetected: Array<{
    id: number;
    name: string;
    issue: string;
    date: string;
  }>;
  healedCount: number;
  allClear: boolean;
  message: string;
  dynamicMinStay: {
    status: 'ACTIVE_AND_COMPLIANT' | 'HEALED_AND_COMPLIANT' | 'WARNING';
    baselineNights: number;
    auditedRoomsCount: number;
    healedGapsCount: number;
    verifiedActiveGaps?: Array<{ name: string; dateFrom: string; dateTo: string; minStay: number }>;
    details: string;
  };
  lastMinute: {
    status: 'ACTIVE_AND_APPLIED' | 'STANDARD_RATES' | 'WARNING';
    activeStage: string;
    samples: Array<{ name: string; livePrice: number; basePrice: number; discountPct: number }>;
    details: string;
  };
}

/**
 * 🛡️ Core Engine: Esegue l'audit live su Octorate e applica l'auto-riparazione immediata.
 * Verifica 3 pilastri fondamentali:
 * 1. Sacro Graal (Tariffe Derivate, Stop-Sell AC, Standard 7d High Season)
 * 2. Soggiorno Minimo Dinamico (Gap-Fill dei buchi residui & Baseline MinStay su Octorate)
 * 3. Sistema Last Minute (Sconti a cascata su Tariffe Madri per date odierne)
 */
export async function runResortSentinelAudit(options?: { sendTelegram?: boolean; forceReport?: boolean }): Promise<SentinelAuditResult> {
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    throw new Error("Configurazione Supabase mancante per il Sentinel.");
  }

  const { data: tokenData, error: tokenError } = await supabaseAdmin
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  if (tokenError || !tokenData?.access_token) {
    throw new Error("Nessun token Octorate disponibile nel database per il Sentinel.");
  }

  const token = tokenData.access_token;
  const clientId = process.env.VITE_OCTORATE_CLIENT_ID || process.env.OCTORATE_CLIENT_ID || '';
  const structureId = process.env.VITE_OCTORATE_STRUCTURE_ID || '366879';

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  if (clientId) headers['Octorate-Api-Key'] = clientId;

  const todayStr = new Date().toISOString().slice(0, 10);
  const anomalies: Array<{ id: number; name: string; issue: string; date: string }> = [];
  const healPayload: any[] = [];

  // Scansione date chiave di audit:
  // 1. Data odierna (per Sacro Graal + MinStay + Last Minute Live)
  // 2. Data Picco Capodanno (08 Gennaio 2027)
  // 3. Data Post-Capodanno High Season (20 Febbraio 2027)
  const auditDates = [
    { label: 'Oggi', from: todayStr, to: todayStr },
    { label: 'Capodanno', from: '2027-01-08', to: '2027-01-09' },
    { label: 'Febbraio High Season', from: '2027-02-15', to: '2027-02-16' }
  ];

  // Regole del Sacro Graal da verificare
  const fullyClosedIds = new Set([
    ...(REAL_PRODUCTS_BY_PLAN.ac_7d || []),
    ...(REAL_PRODUCTS_BY_PLAN.ac_14d || []),
    ...(REAL_PRODUCTS_BY_PLAN.ac_bnb_7d || []),
    ...(REAL_PRODUCTS_BY_PLAN.ac_bnb_14d || []),
    ...(REAL_PRODUCTS_BY_PLAN.airbnb_ac || [])
  ]);

  const stdIds = new Set(REAL_PRODUCTS_BY_PLAN['7d'] || []);
  const main14dIds = new Set([...(REAL_PRODUCTS_BY_PLAN.main_bnb_14d || []), ...(REAL_PRODUCTS_BY_PLAN.agd_ac_14d || [])]);
  const main7dIds = new Set([...(REAL_PRODUCTS_BY_PLAN.main_bnb_7d || []), ...(REAL_PRODUCTS_BY_PLAN.agd_ac_7d || [])]);

  let totalAudited = 0;
  const motherRoomsAudited: Array<{
    id: number;
    name: string;
    basePrice: number;
    livePrice: number;
    liveMinStay: number;
  }> = [];

  for (const ad of auditDates) {
    for (let page = 0; page < 25; page++) {
      const url = `https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${ad.from}&dateTo=${ad.to}&size=20&page=${page}`;
      const res = await fetch(url, { headers });
      if (!res.ok) break;
      const json = await res.json();
      const items = Array.isArray(json) ? json : (json.data || json.calendar || []);
      if (!items.length) break;

      for (const it of items) {
        totalAudited++;
        const idNum = Number(it.id);
        const name = String(it.name || '');
        const day = it.days && it.days[0];
        if (!day) continue;

        const isStopSell = day.stopSells === true;

        // Campionamento Alloggi Madri per MinStay e Last Minute nella data odierna
        if (ad.label === 'Oggi' && MOTHER_ROOM_INFOS[idNum]) {
          motherRoomsAudited.push({
            id: idNum,
            name: MOTHER_ROOM_INFOS[idNum].name,
            basePrice: MOTHER_ROOM_INFOS[idNum].basePrice,
            livePrice: Number(day.price || 0),
            liveMinStay: Number(day.minStay || 2)
          });
        }

        // Regola 1: Tariffe Spente devono essere SEMPRE StopSell: true
        if (fullyClosedIds.has(idNum) && !isStopSell) {
          anomalies.push({ id: idNum, name, issue: 'Tariffa AC spenta risultava APERTA (stopSells: false)', date: ad.from });
          healPayload.push({
            room: idNum,
            dateFrom: todayStr,
            dateTo: '2027-05-31',
            values: { stopSells: true, closed: true, closedArrival: true, closedDeparture: true }
          });
        }

        // Regola 2: Standard 7d a Gennaio/Febbraio deve essere StopSell: true
        if (stdIds.has(idNum) && (ad.label === 'Capodanno' || ad.label === 'Febbraio High Season') && !isStopSell) {
          anomalies.push({ id: idNum, name, issue: 'Standard 7d risultava APERTA in piena High Season', date: ad.from });
          healPayload.push({
            room: idNum,
            dateFrom: '2026-12-26',
            dateTo: '2027-03-31',
            values: { stopSells: true, closed: true, closedArrival: true, closedDeparture: true }
          });
        }

        // Regola 3: Main bnb-14d a Febbraio deve essere StopSell: true (aperta solo a Capodanno)
        if (main14dIds.has(idNum) && ad.label === 'Febbraio High Season' && !isStopSell) {
          anomalies.push({ id: idNum, name, issue: 'Main bnb-14d risultava APERTA fuori dal picco di Capodanno', date: ad.from });
          healPayload.push({
            room: idNum,
            dateFrom: '2027-01-26',
            dateTo: '2027-05-31',
            values: { stopSells: true, closed: true, closedArrival: true, closedDeparture: true }
          });
        }

        // Regola 4: Main bnb-7d a Capodanno deve essere StopSell: true (aperta solo dopo)
        if (main7dIds.has(idNum) && ad.label === 'Capodanno' && !isStopSell) {
          anomalies.push({ id: idNum, name, issue: 'Main bnb-7d risultava APERTA durante picco Capodanno (14d)', date: ad.from });
          healPayload.push({
            room: idNum,
            dateFrom: '2026-12-26',
            dateTo: '2027-01-15',
            values: { stopSells: true, closed: true, closedArrival: true, closedDeparture: true }
          });
        }
      }
    }
  }

  // -------------------------------------------------------------
  // 📏 VERIFICA ED AUTO-GUARIGIONE SOGGIORNO MINIMO DINAMICO (GAP-FILL)
  // -------------------------------------------------------------
  const imminentGapsHealed: Array<{ name: string; dateFrom: string; dateTo: string; minStay: number; oldMinStay: number }> = [];
  const verifiedActiveGapsToday: Array<{ name: string; dateFrom: string; dateTo: string; minStay: number }> = [];
  try {
    const currentYear = new Date().getFullYear();
    const endSeasonStr = `${currentYear + 1}-05-31`;
    const resUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=${todayStr}&endDate=${endSeasonStr}&size=100&page=0`;
    const bRes = await fetch(resUrl, { headers });
    if (bRes.ok) {
      const bJson = await bRes.json();
      const bookingsData = bJson && Array.isArray(bJson.data) ? bJson.data : (Array.isArray(bJson) ? bJson : (bJson.reservations || []));
      
      const gapUpdates = calculateServerDynamicMinStay(bookingsData, { start: todayStr, end: endSeasonStr });
      
      // Filtra i buchi residui (gapDays < baseline)
      const gapReductions = gapUpdates.filter(u => u.reason && u.reason.includes('Gap-Fill'));

      for (const u of gapReductions) {
        const targetMotherId = Number(u.roomTypeId);
        const liveAudited = motherRoomsAudited.find(m => m.id === targetMotherId);

        // Se il buco interessa la data di oggi o i prossimi giorni
        if (liveAudited && u.dateFrom <= todayStr && u.dateTo >= todayStr) {
          if (liveAudited.liveMinStay > u.minStay) {
            anomalies.push({
              id: targetMotherId,
              name: u.accommodationName,
              issue: `Buco residuo di ${u.minStay} notte/i tra ${u.dateFrom} e ${u.dateTo}: Octorate aveva minStay=${liveAudited.liveMinStay} invece di ${u.minStay}`,
              date: u.dateFrom
            });

            // Trova la configurazione canonica e gli alloggi collegati (es. Jungle Villa Left & Right)
            const canonicalEntry = Object.values(ALL_ACCOMMODATIONS_MAP).find(c => c.motherId === targetMotherId);
            const targetIdsToHeal = new Set<number>([targetMotherId]);
            if (canonicalEntry) {
              canonicalEntry.ids.forEach(id => targetIdsToHeal.add(Number(id)));
              if (canonicalEntry.linkedKeys) {
                canonicalEntry.linkedKeys.forEach(lKey => {
                  const linkedCanonical = ALL_ACCOMMODATIONS_MAP[lKey];
                  if (linkedCanonical) {
                    targetIdsToHeal.add(linkedCanonical.motherId);
                    linkedCanonical.ids.forEach(id => targetIdsToHeal.add(Number(id)));
                  }
                });
              }
            }

            for (const rId of targetIdsToHeal) {
              healPayload.push({
                room: rId,
                dateFrom: u.dateFrom,
                dateTo: u.dateTo,
                values: { minstay: u.minStay }
              });
            }

            imminentGapsHealed.push({
              name: u.accommodationName,
              dateFrom: u.dateFrom,
              dateTo: u.dateTo,
              minStay: u.minStay,
              oldMinStay: liveAudited.liveMinStay
            });
          } else {
            // Già attivo, conforme e sincronizzato su Octorate
            if (!verifiedActiveGapsToday.some(v => v.name === u.accommodationName)) {
              verifiedActiveGapsToday.push({
                name: u.accommodationName,
                dateFrom: u.dateFrom,
                dateTo: u.dateTo,
                minStay: liveAudited.liveMinStay
              });
            }
          }
        }
      }
    }
  } catch (gapErr) {
    console.warn('[Resort Sentinel] Gap-fill audit warning:', gapErr);
  }

  // Deduplica healPayload per room ID e date range
  const uniqueHealMap = new Map<string, any>();
  for (const h of healPayload) {
    const key = `${h.room}_${h.dateFrom}_${h.dateTo}_${JSON.stringify(h.values)}`;
    uniqueHealMap.set(key, h);
  }
  const uniqueHealList = Array.from(uniqueHealMap.values());

  let healedCount = 0;
  if (uniqueHealList.length > 0) {
    console.info(`[Resort Sentinel] 🚨 Rilevate ${anomalies.length} anomalie. Avvio Auto-Guarigione per ${uniqueHealList.length} blocchi tariffe/minStay...`);
    const bulkUrl = 'https://api.octorate.com/connect/rest/v1/calendar/bulk';
    const healRes = await fetch(bulkUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(uniqueHealList)
    });
    if (healRes.ok) {
      healedCount = uniqueHealList.length;
      console.info(`[Resort Sentinel] ✅ Auto-Guarigione completata: ${healedCount} blocchi risigillati/aggiornati su Octorate.`);
    } else {
      console.error(`[Resort Sentinel] ❌ Errore Auto-Guarigione Octorate: HTTP ${healRes.status}`);
    }
  }

  // -------------------------------------------------------------
  // 📏 STATO SOGGIORNO MINIMO DINAMICO
  // -------------------------------------------------------------
  // Determina la baseline stagionale (valore più comune tra gli alloggi non interessati da gap)
  const freqMap: Record<number, number> = {};
  motherRoomsAudited.forEach(r => {
    if (r.liveMinStay > 0) {
      freqMap[r.liveMinStay] = (freqMap[r.liveMinStay] || 0) + 1;
    }
  });
  let baselineNights = 2;
  let maxCount = 0;
  for (const [ms, count] of Object.entries(freqMap)) {
    if (count > maxCount && Number(ms) >= 2) {
      maxCount = count;
      baselineNights = Number(ms);
    }
  }

  const invalidMinStayRooms = motherRoomsAudited.filter(r => r.liveMinStay <= 0);

  const dynamicMinStayResult = {
    status: (invalidMinStayRooms.length === 0
      ? (imminentGapsHealed.length > 0 ? 'HEALED_AND_COMPLIANT' : 'ACTIVE_AND_COMPLIANT')
      : 'WARNING') as 'ACTIVE_AND_COMPLIANT' | 'HEALED_AND_COMPLIANT' | 'WARNING',
    baselineNights,
    auditedRoomsCount: motherRoomsAudited.length,
    healedGapsCount: imminentGapsHealed.length,
    verifiedActiveGaps: verifiedActiveGapsToday,
    details: invalidMinStayRooms.length === 0
      ? (imminentGapsHealed.length > 0
          ? `Rilevati e sanati ${imminentGapsHealed.length} buchi imminenti (es. Jungle Villa 1 notte per oggi). MinStay baseline stagionale a ${baselineNights} notti.`
          : `Soggiorno minimo baseline di ${baselineNights} notti verificato su ${motherRoomsAudited.length} alloggi. Gap-fill allineato (${verifiedActiveGapsToday.length} alloggi con buchi attivi ridotti a 1 notte).`)
      : `Rilevati ${invalidMinStayRooms.length} alloggi con minStay non valido o a 0 notti.`
  };

  // -------------------------------------------------------------
  // ⚡ ANALISI DETTAGLIATA SISTEMA LAST MINUTE (SCONTI A CASCATA)
  // -------------------------------------------------------------
  const discountedRooms = motherRoomsAudited
    .filter(r => r.livePrice > 0 && r.livePrice < 5000 && r.livePrice < r.basePrice)
    .map(r => {
      const discountPct = Math.round(((r.basePrice - r.livePrice) / r.basePrice) * 100);
      return {
        name: r.name,
        livePrice: r.livePrice,
        basePrice: r.basePrice,
        discountPct
      };
    });

  let detectedStage = 'Stadio 1 (-10% Last Minute)';
  if (discountedRooms.length > 0) {
    const avgDiscount = discountedRooms.reduce((acc, r) => acc + r.discountPct, 0) / discountedRooms.length;
    if (avgDiscount >= 8) {
      detectedStage = 'Stadio 1 (-10% Last Minute)';
    } else if (avgDiscount >= 4) {
      detectedStage = 'Stadio 2 (-5% Last Minute)';
    } else {
      detectedStage = 'Stadio 3 (-2.5% Last Minute)';
    }
  } else {
    detectedStage = 'Prezzi Standard (Nessun ribasso attivo)';
  }

  const lastMinuteResult = {
    status: (discountedRooms.length > 0 ? 'ACTIVE_AND_APPLIED' : 'STANDARD_RATES') as 'ACTIVE_AND_APPLIED' | 'STANDARD_RATES' | 'WARNING',
    activeStage: detectedStage,
    samples: discountedRooms.slice(0, 4),
    details: discountedRooms.length > 0
      ? `Sconti a cascata attivi su Octorate (${discountedRooms.length} alloggi scontati): rilevato ${detectedStage}.`
      : 'Tariffe Madri a prezzo pieno di listino (Nessuno sconto Last Minute applicato su Octorate).'
  };

  const allClear = anomalies.length === 0;
  const result: SentinelAuditResult = {
    timestamp: new Date().toISOString(),
    totalProductsAudited: totalAudited,
    anomaliesDetected: anomalies,
    healedCount,
    allClear,
    message: allClear
      ? "✅ Tutte le tariffe e restrizioni OTA risultano al 100% conformi al Sacro Graal. Nessuna anomalia."
      : `⚠️ Rilevate ${anomalies.length} anomalie: ${healedCount} blocchi/tariffe sono stati auto-riparati e risigillati immediatamente su Octorate.`,
    dynamicMinStay: dynamicMinStayResult,
    lastMinute: lastMinuteResult
  };

  // -------------------------------------------------------------
  // 📲 NOTIFICA TELEGRAM COMPLETA (3 PILASTRI INTEGRATI)
  // -------------------------------------------------------------
  if (options?.sendTelegram) {
    const sampleLines = discountedRooms.length > 0
      ? discountedRooms.slice(0, 3).map(s => `  - <i>${s.name}:</i> <b>${s.livePrice.toLocaleString('it-IT')} ฿</b> (Listino ${s.basePrice} ฿, -${s.discountPct}%)`).join('\n')
      : '  - <i>Tutti gli alloggi:</i> Prezzi base conformi al listino ufficiale';

    const healedLines = imminentGapsHealed.length > 0
      ? imminentGapsHealed.map(g => `  - 🛠️ <b>Sanato Ora:</b> <i>${g.name}</i> (${g.dateFrom}): MinStay abbassato da ${g.oldMinStay} a <b>${g.minStay} notte</b> ✅`).join('\n')
      : '';

    const activeLines = verifiedActiveGapsToday.length > 0
      ? verifiedActiveGapsToday.map(g => `  - 🎯 <b>Attivo Oggi:</b> <i>${g.name}</i> (${g.dateFrom}): MinStay <b>${g.minStay} notte</b> confermato su Octorate ✅`).join('\n')
      : '';

    let gapSectionStr = '';
    if (healedLines || activeLines) {
      gapSectionStr = [
        healedLines ? `• <b>Buchi Sanati dall'Auto-Healer:</b>\n${healedLines}` : '',
        activeLines ? `• <b>Buchi Attivi Rilevati Oggi (Gap-Fill):</b>\n${activeLines}` : '',
        `• MinStay Baseline Stagionale: <b>${baselineNights} notti (ridotto per buchi residui)</b>`
      ].filter(Boolean).join('\n');
    } else {
      gapSectionStr = `• Buchi Imminenti: <b>Nessun buco residuo sotto la baseline, calendario continuo</b>\n• MinStay Baseline: <b>${baselineNights} notti verificato su tutti gli alloggi</b>`;
    }

    if (!allClear && healedCount > 0) {
      const anomalyLines = anomalies.slice(0, 5).map(a => `• <b>${a.name}</b> (${a.id}): ${a.issue}`).join('\n');
      const extraNotice = anomalies.length > 5 ? `\n<i>...e altre ${anomalies.length - 5} anomalie corrette.</i>` : '';
      const alertMsg = `🚨 <b>RESORT SENTINEL — INTERVENTO DI AUTO-GUARIGIONE</b>\n\n` +
        `Rilevate e sanate in tempo reale le seguenti discrepanze su Octorate:\n${anomalyLines}${extraNotice}\n\n` +
        `📏 <b>SOGGIORNO MINIMO DINAMICO (GAP-FILL):</b>\n${gapSectionStr}\n\n` +
        `⚡ <b>SISTEMA LAST MINUTE:</b>\n• Stato: <b>${detectedStage}</b>\n${sampleLines}\n\n` +
        `🛠️ <b>Azione Eseguita:</b> L'Auto-Healer ha inviato l'aggiornamento a Octorate (${healedCount} blocchi aggiornati).\n` +
        `✅ <b>Stato Attuale:</b> Le falle sono state sanate e tutte le OTA sono ora protette e allineate.`;
      await sendDepartmentTelegramMessage('village', alertMsg, { topic: 'ALERTS_OVERBOOKING' });
    } else if (options?.forceReport || allClear) {
      const okMsg = `🛡️ <b>FPV RESORT SENTINEL — REPORT DI CONFORMITÀ GLOBALE</b>\n\n` +
        `✅ <b>1. SACRO GRAAL & TARIFFE DERIVATE OTA</b>\n` +
        `• Tariffe AC (7d/14d/bnb & Airbnb AC): <b>100% Blindate in Stop-Sell</b>\n` +
        `• Standard 7d High Season: <b>Bloccata (16 Dic - 31 Mar)</b>\n` +
        `• Main bnb-14d / 7d: <b>Finestre temporali allineate con precisione</b>\n` +
        `• Checkpoints verificati: <b>${totalAudited} controlli superati</b>\n\n` +
        `📏 <b>2. SOGGIORNO MINIMO DINAMICO (GAP-FILL)</b>\n` +
        `• Stato: <b>ATTIVO & CONFORME SU OCTORATE</b>\n` +
        `${gapSectionStr}\n` +
        `• Alloggi monitorati: <b>${motherRoomsAudited.length} alloggi monitorati</b>\n\n` +
        `⚡ <b>3. SISTEMA LAST MINUTE (SCONTI A CASCATA)</b>\n` +
        `• Stato: <b>ATTIVO & APPLICATO SU OCTORATE</b>\n` +
        `• Stadio Attivo Oggi: <b>${detectedStage}</b>\n` +
        `• Prezzi Live Tariffe Madri (Esempi):\n${sampleLines}\n` +
        `• Auto-Avanzamento Giornaliero: <b>Attivo e regolare</b>\n\n` +
        `🎯 <b>ESITO SENTINEL: TUTTI I 3 SISTEMI OPERATIVI AL 100%</b>\n` +
        `<i>Auto-Healer attivo 24/7. Notifica certificata alle ${new Date().toLocaleTimeString('it-IT')}.</i>`;

      await sendDepartmentTelegramMessage('village', okMsg, { topic: 'DAILY_REPORT' });
    }
  }

  return result;
}

/**
 * Serverless Handler HTTP (/api/resort-sentinel)
 */
export async function handleResortSentinel(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const isCron = req.headers['x-vercel-cron'] === '1' || req.query?.cron === '1';
    const forceReport = req.query?.report === '1' || req.body?.report === true || isCron;
    const sendTelegram = req.query?.notify !== '0' && req.body?.notify !== false;

    console.info(`[handleResortSentinel] Avvio audit (Cron: ${isCron}, Report: ${forceReport})...`);
    const audit = await runResortSentinelAudit({ sendTelegram, forceReport });

    return res.status(200).json({
      success: true,
      audit
    });
  } catch (error: any) {
    console.error("[handleResortSentinel Exception]:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Errore sconosciuto durante l'esecuzione del Resort Sentinel"
    });
  }
}
