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
  'jungle villa': { motherId: 529773, name: 'Jungle Villa', ids: ['529773', '529784', '529778', '529792', '529788', '529780', '916817', '529781', '529801', '921868', '921869', '529783', '529813'], keywords: [["jungle", "jv"], ["villa", "ac", "be"]] },
  'jungle villa left': { motherId: 495795, name: 'Jungle Villa Left', ids: ['495795', '495807', '495804', '496009', '496001', '495805', '496022', '495806', '496031', '921870', '921871', '495810', '496057'], keywords: [["jungle", "jv"], ["left", "jvl"]] },
  'villa penthouse': { motherId: 421511, name: 'Villa Penthouse', ids: ['421511', '449348', '421513', '421516', '421520', '421522', '421525', '421527', '421530', '921876', '921877', '421532', '421533'], keywords: [["penthouse", "pent"]] }
};

function toThailandDateStr(raw) {
  if (!raw) return '';
  const s = String(raw).trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d.getTime())) return s.slice(0, 10);
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  } catch (e) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

function getCanonicalAccommodation(booking) {
  if (!booking) return null;
  const bProduct = String(booking.product || booking.pmsProduct || booking.accommodation_id || booking.roomId || '').trim();
  const bName = String(booking.roomName || booking.accommodation_name || booking.room_name || '').toLowerCase().trim();

  if (bProduct) {
    for (const [key, entry] of Object.entries(ALL_ACCOMMODATIONS_MAP)) {
      if (entry.ids.includes(bProduct)) return { key, name: entry.name, motherId: entry.motherId };
    }
  }

  if (bName) {
    if (bName.includes('jvr') || bName.includes('right')) return null;
    if (bName.includes('jvl') || bName.includes('left')) return { key: 'jungle villa left', name: 'Jungle Villa Left', motherId: 495795 };
    if (bName.includes('penthouse') || bName.includes('pent')) return { key: 'villa penthouse', name: 'Villa Penthouse', motherId: 421511 };
    if (bName.includes('jungle') || bName.includes('jv')) return { key: 'jungle villa', name: 'Jungle Villa', motherId: 529773 };
  }
  return null;
}

async function inspectGaps() {
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
      headers: { 'Authorization': `Bearer ${data.access_token}`, 'Accept': 'application/json' }
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

  const activeBookings = bookingsData.filter(b => {
    const st = String(b.status || '').toUpperCase().trim();
    return st !== 'CANCELLED' && st !== 'CANCELED' && st !== 'DELETED' && st !== 'VOID' && st !== 'REJECTED' && !b.cancelled && !b.isCancelled;
  });

  console.log(`Active bookings total: ${activeBookings.length}`);

  ['villa penthouse', 'jungle villa left', 'jungle villa'].forEach(roomKey => {
    const canonical = ALL_ACCOMMODATIONS_MAP[roomKey];
    const roomBookings = [];
    activeBookings.forEach(b => {
      const c = getCanonicalAccommodation(b);
      if (c && c.key === roomKey) {
        const rawIn = b.checkin || b.check_in || b.startDate || b.arrival || b.fromDate;
        const rawOut = b.checkout || b.check_out || b.endDate || b.departure || b.toDate;
        roomBookings.push({ in: toThailandDateStr(rawIn), out: toThailandDateStr(rawOut), id: b.id, name: b.guestName || b.firstName, product: b.product, roomName: b.roomName });
      }
    });

    console.log(`\n================== ${canonical.name} (${canonical.motherId}) ==================`);
    roomBookings.sort((a,b) => a.in.localeCompare(b.in)).forEach(b => {
      console.log(` - ID: ${b.id} | ${b.in} -> ${b.out} | ${b.name} | Prod: ${b.product} | Room: "${b.roomName}"`);
    });
  });
}

inspectGaps();
