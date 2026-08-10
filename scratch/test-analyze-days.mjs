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

async function testFetchDays() {
  const { data: tokenData } = await supabaseAdmin.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  const token = tokenData.access_token;
  const structureId = '366879';
  const dateFrom = '2026-10-01';
  const dateTo = '2027-05-31';

  const res = await fetch(`https://api.octorate.com/connect/rest/v1/calendar/${structureId}?dateFrom=${dateFrom}&dateTo=${dateTo}&size=50&page=1`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
  });
  const rawData = await res.json();
  const items = rawData.data || [];

  console.log(`Total rate items in page 1: ${items.length}`);

  for (const item of items) {
    const name = item.name || item.title || '';
    if (name.includes('Main bnb-14d') || name.includes('BE') || name.includes('7d') || name.includes('Jungle')) {
      console.log(`\n========================================`);
      console.log(`Rate Product: "${name}" (ID: ${item.id})`);
      const days = item.days || [];
      console.log(`Total days: ${days.length}`);

      // Count CTA days, stopSell days
      let ctaCount = 0;
      let stopSellCount = 0;
      const ctaDates = [];
      const stopSellDates = [];

      for (const d of days) {
        if (d.closeToArrival || d.closedArrival) {
          ctaCount++;
          ctaDates.push(d.date);
        }
        if (d.stopSells || d.stopSell || d.closed) {
          stopSellCount++;
          stopSellDates.push(d.date);
        }
      }

      console.log(`StopSell days count: ${stopSellCount}`);
      if (stopSellDates.length > 0) {
        console.log(`StopSell dates range: ${stopSellDates[0]} -> ${stopSellDates[stopSellDates.length - 1]} (total ${stopSellDates.length})`);
      }

      console.log(`CloseToArrival (CTA) days count: ${ctaCount}`);
      if (ctaDates.length > 0) {
        console.log(`CTA dates sample:`, ctaDates.slice(0, 15));
        console.log(`CTA dates end sample:`, ctaDates.slice(-15));
      }
    }
  }
}

testFetchDays().catch(console.error);
