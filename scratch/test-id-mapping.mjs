import { createClient } from "@supabase/supabase-js";
import fs from "fs";

function loadEnv() {
  try {
    const envStr = fs.readFileSync(".env.local", "utf8");
    for (const line of envStr.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        process.env[key] = value;
      }
    }
  } catch (e) {}
}
loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

const SENTINEL_RATE_ID_MAP = {
  be: [529784],
  '7d': [529778],
  main_bnb_7d: [529788],
  main_bnb_14d: [529792],
  ac_7d: [529780],
  ac_14d: [529781],
  ac_bnb_7d: [916817, 916816],
  ac_bnb_14d: [529801],
  agd_ac_7d: [921868],
  agd_ac_14d: [921869],
  airbnb: [529783],
  airbnb_ac: [529813]
};

const isClosed = (d) => Boolean(d?.stopSells === true || d?.stopSells === 'true' || d?.stopSell === true || d?.stopSell === 'true' || d?.closed === true || d?.closed === 'true');
const isCA = (d) => Boolean(d?.closeToArrival === true || d?.closeToArrival === 'true' || d?.closeToArrival === 1 || d?.closedArrival === true || d?.closedArrival === 'true' || d?.cta === true);

function parsePeriods(days) {
  if (!Array.isArray(days) || days.length === 0) return [];
  const periods = [];
  let i = 0;
  const n = days.length;
  while (i < n) {
    const closedState = isClosed(days[i]);
    const startIdx = i;
    while (i < n && isClosed(days[i]) === closedState) {
      i++;
    }
    const endIdx = i - 1;
    let onlyCheckOutDays = 0;
    if (!closedState) {
      let k = endIdx;
      while (k >= startIdx && isCA(days[k])) {
        onlyCheckOutDays++;
        k--;
      }
    }
    const dFrom = String(days[startIdx]?.date || '').substring(0, 10);
    const dTo = String(days[endIdx]?.date || '').substring(0, 10);
    periods.push({
      id: `p_live_${startIdx}`,
      name: closedState ? `Periodo Bloccato` : `Periodo ${periods.length + 1}`,
      dateFrom: dFrom,
      dateTo: dTo,
      stopSell: closedState,
      onlyCheckOutDays: onlyCheckOutDays > 0 ? onlyCheckOutDays : 10
    });
  }
  return periods;
}

async function testIdMapping() {
  const { data: tokenData } = await supabaseAdmin.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  const token = tokenData.access_token;
  const structureId = '366879';
  const today = '2026-10-01';

  let allItems = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${today}&dateTo=2027-05-31&size=50&page=${page}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
    });
    const rawData = await res.json();
    const pageItems = Array.isArray(rawData) ? rawData : (rawData.data || rawData.items || rawData.roomRates || []);
    if (!Array.isArray(pageItems) || pageItems.length === 0) break;
    allItems.push(...pageItems);
    const totalPages = Number(rawData.page?.totalPages || rawData.totalPages || 1);
    if (page >= totalPages) break;
  }

  console.log(`Total calendar items fetched: ${allItems.length}`);

  const itemMapById = new Map();
  for (const item of allItems) {
    if (item.id) {
      itemMapById.set(Number(item.id), item);
    }
  }

  console.log(`Unique product IDs mapped: ${itemMapById.size}`);

  const gridResults = {};

  for (const [planKey, ids] of Object.entries(SENTINEL_RATE_ID_MAP)) {
    let matchedItem = null;
    for (const id of ids) {
      if (itemMapById.has(id)) {
        matchedItem = itemMapById.get(id);
        break;
      }
    }

    if (matchedItem) {
      const days = matchedItem.days || [];
      const filteredDays = days.filter(d => d.date >= '2026-10-01' && d.date <= '2027-05-31');
      gridResults[planKey] = {
        found: true,
        matchedId: matchedItem.id,
        matchedName: matchedItem.name,
        periods: parsePeriods(filteredDays)
      };
    } else {
      gridResults[planKey] = { found: false };
    }
  }

  console.log("\n================ EXACT ID MATCHING RESULTS ================");
  for (const [planKey, res] of Object.entries(gridResults)) {
    if (res.found) {
      console.log(`\nPlan [${planKey}] ➔ Match ID ${res.matchedId} ("${res.matchedName}"): ${res.periods.length} periods`);
      for (const p of res.periods) {
        console.log(`    ${p.name}: ${p.dateFrom} ➔ ${p.dateTo} | StopSell: ${p.stopSell} | OnlyCheckOut: ${p.onlyCheckOutDays}gg`);
      }
    } else {
      console.log(`\nPlan [${planKey}] ➔ ❌ NOT FOUND BY ID`);
    }
  }
}

testIdMapping().catch(console.error);
