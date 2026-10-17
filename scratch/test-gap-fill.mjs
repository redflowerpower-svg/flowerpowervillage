import fs from 'fs';
const envText = fs.readFileSync('.env.local', 'utf8');
const matchUrl = envText.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
const matchKey = envText.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/) || envText.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(matchUrl[1].trim(), matchKey[1].trim());

async function run() {
  const { data } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  const token = data.access_token;
  const todayStr = '2026-10-17';
  const endSeasonStr = '2027-05-31';
  const resUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=${todayStr}&endDate=${endSeasonStr}&size=100&page=0`;
  const bRes = await fetch(resUrl, { headers: { Authorization: 'Bearer ' + token } });
  const bJson = await bRes.json();
  const bookingsData = bJson.data || [];

  // Re-run calculateServerDynamicMinStay inline
  const activeBookings = bookingsData.filter(b => {
    const st = String(b.status || '').toUpperCase().trim();
    return st !== 'CANCELLED' && st !== 'CANCELED' && st !== 'DELETED' && st !== 'VOID' && st !== 'REJECTED';
  });

  console.log('Active bookings:', activeBookings.length);
  const jvBooking = activeBookings.find(b => String(b.id) === '126908333');
  console.log('jvBooking:', jvBooking?.id, jvBooking?.roomName, jvBooking?.checkin, jvBooking?.checkout);

  function toThailandDateStr(raw) {
    if (!raw) return '';
    return String(raw).slice(0, 10);
  }
  function addDaysISO(isoStr, n) {
    const parts = isoStr.split('-').map(Number);
    const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2] + n));
    return d.toISOString().slice(0, 10);
  }
  function daysDiffISO(startISO, endISO) {
    const s = new Date(startISO + 'T00:00:00Z').getTime();
    const e = new Date(endISO + 'T00:00:00Z').getTime();
    return Math.round((e - s) / 86400000);
  }

  const jvList = [];
  activeBookings.forEach(b => {
    const p = String(b.product || b.pmsProduct || '');
    const n = String(b.roomName || '').toLowerCase();
    if (n.includes('jungle') || n.includes('jv') || ['529773', '529784', '529778', '529792', '529788', '529780', '916817', '529781', '529801', '921868', '921869', '529783', '529813'].includes(p)) {
      jvList.push({ in: toThailandDateStr(b.checkin), out: toThailandDateStr(b.checkout) });
    }
  });

  const sorted = jvList.sort((a, b) => a.in.localeCompare(b.in));
  console.log('Sorted Jungle Villa bookings near Oct:', sorted.slice(0, 5));

  const gaps = [];
  if (sorted[0].in > todayStr) {
    gaps.push({ start: todayStr, end: sorted[0].in });
  }
  console.log('Gaps found near Oct:', gaps);
  const gapDays = daysDiffISO(gaps[0].start, gaps[0].end);
  console.log('Gap days:', gapDays);
}
run();
