import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envVars = {};
  const files = ['.env.local', '.env'];
  for (const file of files) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0 && !envVars[key.trim()]) {
            envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          }
        }
      }
    }
  }
  return envVars;
}

const envVars = loadEnv();
const supabaseUrl = envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;

export const ALL_ACCOMMODATIONS_MAP = {
  'villa penthouse': {
    motherId: 421511,
    name: 'Villa Penthouse',
    ids: ['421511', '449348', '421513', '421516', '421520', '421522', '421525', '421527', '421530', '921876', '921877', '421532', '421533'],
    keywords: [["penthouse", "pent"]]
  },
  'green bungalow': {
    motherId: 293962,
    name: 'Green Bungalow',
    ids: ['293962', '449668', '293961', '332070', '332066', '331923', '332072', '331924', '332074', '921882', '921883', '297023', '340200'],
    keywords: [["green"]]
  }
};

const WEBHOOK_MIN_STAY_TIMELINE = [
  { dateFrom: '2026-08-01', dateTo: '2026-12-15', minStay: 2 },
  { dateFrom: '2026-12-16', dateTo: '2027-01-15', minStay: 5 },
  { dateFrom: '2027-01-16', dateTo: '2027-03-31', minStay: 3 },
  { dateFrom: '2027-04-01', dateTo: '2027-10-31', minStay: 2 }
];

function toThailandDateStr(raw) {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s.slice(0, 10);
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);
  } catch (e) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

function getBaselineMinStay(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return 2;
  const dStr = dateStr.slice(0, 10);
  const matched = WEBHOOK_MIN_STAY_TIMELINE.find(p => dStr >= p.dateFrom && dStr <= p.dateTo);
  return matched?.minStay || 2;
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

function getCanonicalAccommodation(booking) {
  if (!booking) return null;
  const bProduct = String(booking.product || booking.pmsProduct || booking.accommodation_id || booking.roomId || '').trim();
  const bName = String(booking.roomName || booking.accommodation_name || booking.room_name || '').toLowerCase().trim();

  if (bProduct) {
    for (const [key, entry] of Object.entries(ALL_ACCOMMODATIONS_MAP)) {
      if (entry.ids.includes(bProduct)) {
        return { key, name: entry.name, motherId: entry.motherId };
      }
    }
  }

  if (bName) {
    for (const [key, entry] of Object.entries(ALL_ACCOMMODATIONS_MAP)) {
      const matchAllGroups = entry.keywords.every(group => group.some(kw => bName.includes(kw)));
      if (matchAllGroups) {
        return { key, name: entry.name, motherId: entry.motherId };
      }
    }
  }

  return null;
}

async function debugAll() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').maybeSingle();
  
  const todayISO = '2026-08-20';
  const endISO = '2027-10-31';

  let bookingsData = [];
  let page = 0;
  let hasMore = true;
  while (hasMore && page <= 25) {
    const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=${todayISO}&endDate=${endISO}&size=100&page=${page}`;
    const octRes = await fetch(octUrl, {
      headers: {
        'Authorization': `Bearer ${data.access_token}`,
        'Accept': 'application/json'
      }
    });
    if (octRes.ok) {
      const octJson = await octRes.json();
      const pageData = octJson && Array.isArray(octJson.data) ? octJson.data : (Array.isArray(octJson) ? octJson : (octJson.reservations || []));
      if (pageData.length > 0) {
        bookingsData.push(...pageData);
        const totalPages = Number(octJson.page?.totalPages || octJson.totalPages || 1);
        if (page + 1 >= totalPages || pageData.length === 0) hasMore = false;
        else page++;
      } else hasMore = false;
    } else hasMore = false;
  }

  console.log(`Total bookings fetched: ${bookingsData.length}`);

  const activeBookings = bookingsData.filter(b => {
    const st = String(b.status || '').toUpperCase().trim();
    return st !== 'CANCELLED' && st !== 'CANCELED' && st !== 'DELETED' && st !== 'VOID' && st !== 'REJECTED' && !b.cancelled && !b.isCancelled;
  });

  const roomBookingsMap = {};
  Object.entries(ALL_ACCOMMODATIONS_MAP).forEach(([key, canonical]) => {
    roomBookingsMap[key] = {
      roomName: canonical.name,
      motherId: String(canonical.motherId),
      targetProductIds: canonical.ids,
      bookings: []
    };
  });

  activeBookings.forEach(b => {
    const canonical = getCanonicalAccommodation(b);
    if (!canonical) return;

    const rawIn = b.checkin || b.check_in || b.startDate || b.arrival || b.fromDate;
    const rawOut = b.checkout || b.check_out || b.endDate || b.departure || b.toDate;
    if (!rawIn || !rawOut) return;

    const inStr = toThailandDateStr(rawIn);
    const outStr = toThailandDateStr(rawOut);

    if (inStr && outStr && roomBookingsMap[canonical.key]) {
      roomBookingsMap[canonical.key].bookings.push({ in: inStr, out: outStr, id: b.id, name: b.guestName || b.firstName });
    }
  });

  ['villa penthouse', 'green bungalow'].forEach(key => {
    const { roomName, motherId, bookings: bList } = roomBookingsMap[key];
    const sorted = bList.sort((a, b) => a.in.localeCompare(b.in));
    
    console.log(`\n================== ${roomName} (${motherId}) ==================`);
    console.log('Active bookings:');
    sorted.forEach(b => console.log(`   ${b.in} -> ${b.out} (${b.name})`));

    const mergedOccupied = [];
    for (const curr of sorted) {
      if (mergedOccupied.length === 0) mergedOccupied.push({ ...curr });
      else {
        const prev = mergedOccupied[mergedOccupied.length - 1];
        if (curr.in <= prev.out) {
          if (curr.out > prev.out) prev.out = curr.out;
        } else mergedOccupied.push({ ...curr });
      }
    }

    console.log('Merged occupied:');
    mergedOccupied.forEach(m => console.log(`   ${m.in} -> ${m.out}`));

    const gaps = [];
    for (let i = 0; i < mergedOccupied.length - 1; i++) {
      const prevOut = mergedOccupied[i].out;
      const nextIn = mergedOccupied[i + 1].in;
      if (prevOut < nextIn) {
        gaps.push({ start: prevOut, end: nextIn, days: daysDiffISO(prevOut, nextIn) });
      }
    }

    console.log('Gaps:');
    gaps.filter(g => g.start >= '2026-12-01' && g.start <= '2027-01-31').forEach(g => {
      console.log(`   Gap ${g.start} to ${g.end} (${g.days}d) -> minStay: ${Math.min(g.days, getBaselineMinStay(g.start))}`);
    });
  });
}

debugAll();
