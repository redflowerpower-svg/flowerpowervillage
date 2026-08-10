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

const isClosed = (d) => Boolean(d?.stopSells === true || d?.stopSells === 'true' || d?.stopSell === true || d?.stopSell === 'true' || d?.stop_sell === true || d?.closed === true || d?.closed === 'true');
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

async function testFetch() {
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

  console.log("Total items fetched:", allItems.length);

  const PLAN_CODE_MAPPINGS = {
    be: 'be',
    '7d': '7d',
    'main bnb-7d': 'main_bnb_7d',
    'main-bnb-7d': 'main_bnb_7d',
    'main bnb-14d': 'main_bnb_14d',
    'main-bnb-14d': 'main_bnb_14d',
    'ac7d': 'ac_7d',
    'ac14d': 'ac_14d',
    'ac bnb-7d': 'ac_bnb_7d',
    'ac bnb-14d': 'ac_bnb_14d',
    'agd ac-7d': 'agd_ac_7d',
    'agd ac-14d': 'agd_ac_14d',
    'airbnb': 'airbnb',
    'airbnb ac': 'airbnb_ac'
  };

  const gridMap = {};
  for (const item of allItems) {
    const itemName = String(item.name || item.title || '').toLowerCase();
    const daysArr = item.days || [];
    for (const [codeKey, planKey] of Object.entries(PLAN_CODE_MAPPINGS)) {
      let isMatch = false;
      if (codeKey === 'be') {
        isMatch = !itemName.includes('7d') && !itemName.includes('14d') && !itemName.includes('airbnb') && !itemName.includes('agd');
      } else if (codeKey === 'airbnb') {
        isMatch = itemName.includes('airbnb') && !itemName.includes('ac');
      } else {
        isMatch = itemName.includes(codeKey);
      }
      if (isMatch && daysArr.length > 0) {
        if (!gridMap[planKey] || gridMap[planKey].length === 0) {
          gridMap[planKey] = parsePeriods(daysArr);
        }
      }
    }
  }

  console.log("\nGrid map results summary:");
  for (const [k, v] of Object.entries(gridMap)) {
    console.log(`Plan ${k}: ${v.length} periods`);
    if (v.length > 0) {
      console.log(`  Sample:`, v[0]);
    }
  }
}

testFetch().catch(console.error);
