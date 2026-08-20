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
  'fake bungalow 2': {
    motherId: 921799,
    name: 'Fake Bungalow 2',
    ids: ['921799', '932256', '932257', '932259', '932260', '932261', '932262', '932263', '932264', '932265', '932266', '932267', '932268'],
    keywords: [["fake"], ["2", "two"]]
  }
};

const WEBHOOK_MIN_STAY_TIMELINE = [
  { dateFrom: '2026-08-01', dateTo: '2026-12-15', minStay: 2 },
  { dateFrom: '2026-12-16', dateTo: '2027-01-15', minStay: 5 },
  { dateFrom: '2027-01-16', dateTo: '2027-03-31', minStay: 3 },
  { dateFrom: '2027-04-01', dateTo: '2027-10-31', minStay: 2 }
];

function getBaselineMinStay(dateStr) {
  const dStr = dateStr.slice(0, 10);
  const matched = WEBHOOK_MIN_STAY_TIMELINE.find(p => dStr >= p.dateFrom && dStr <= p.dateTo);
  return matched?.minStay || 2;
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

async function testCalc() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').maybeSingle();
  
  const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=2026-12-01&endDate=2027-01-31&size=200&page=0`;
  const res = await fetch(octUrl, {
    headers: {
      'Authorization': `Bearer ${data.access_token}`,
      'Accept': 'application/json'
    }
  });
  const json = await res.json();
  const items = Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : (json.reservations || []));
  
  const pentBookings = items.filter(b => {
    const c = getCanonicalAccommodation(b);
    return c && c.key === 'villa penthouse';
  });
  
  console.log(`Matched ${pentBookings.length} bookings for Villa Penthouse:`);
  pentBookings.forEach(b => {
    console.log(` - ID: ${b.id} | ${b.checkin} -> ${b.checkout} | status: ${b.status} | product: ${b.product} | roomName: ${b.roomName}`);
  });
}

testCalc();
