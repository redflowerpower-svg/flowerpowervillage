import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
}

async function testWebhookEngine() {
  const url = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL;
  const key = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(url, key);

  const { data: tokenData } = await supabase
    .from('octorate_tokens')
    .select('access_token')
    .eq('id', 'singleton')
    .maybeSingle();

  const dateFrom = new Date().toISOString().substring(0, 10);
  const dateToObj = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const dateTo = dateToObj.toISOString().substring(0, 10);
  const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=${dateFrom}&endDate=${dateTo}&size=100`;

  const octRes = await fetch(octUrl, {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Accept': 'application/json'
    }
  });

  const octJson = await octRes.json();
  const bookingsData = octJson && Array.isArray(octJson.data) ? octJson.data : (Array.isArray(octJson) ? octJson : (octJson.reservations || []));

  console.log(`Scaricati ${bookingsData.length} booking live da Octorate.`);

  // Test parse
  const MOTHER_RATE_PLANS = {
    "Peace & Love Villa": 494840,
    "Penthouse Villa": 421511,
    "Villa Penthouse": 421511,
    "Jungle Villa": 529773,
    "Jungle Villa Left": 495795,
    "Jungle Villa Right": 495796,
    "Lodge 1": 293951,
    "Lodge 2": 883795,
    "Red Bungalow": 293954,
    "Green Bungalow": 293962,
    "Yellow Bungalow": 293957,
    "Lagoon Tent": 293955,
    "Lagoon Tent Bungalow": 293955,
    "Camel Tent": 293965,
    "Camel Tent Bungalow": 293965,
    "Room 1": 293963,
    "Room 2": 293959,
    "Room 3": 293948,
    "Room 4": 293945,
    "Room 5": 293943,
    "Internal Room": 293942,
    "Fake Bungalow 1": 649669,
    "Fake Bungalow 2": 921799
  };

  const roomBookingsMap = {};

  bookingsData.forEach((b) => {
    const rawIn = b.checkin || b.check_in || b.startDate || b.arrival || b.fromDate;
    const rawOut = b.checkout || b.check_out || b.endDate || b.departure || b.toDate;
    if (!rawIn || !rawOut) return;

    const inStr = String(rawIn).slice(0, 10);
    const outStr = String(rawOut).slice(0, 10);

    const rawName = String(b.roomName || b.accommodation_name || b.accommodationName || b.room || '').replace(/\s+/g, ' ').trim();
    const rawProd = b.product || b.pmsProduct || b.accommodation_id || b.roomId;

    let motherId = String(rawProd || '');
    let roomName = rawName || `Room ${motherId}`;

    if (MOTHER_RATE_PLANS[rawName]) {
      motherId = String(MOTHER_RATE_PLANS[rawName]);
    } else if (rawName.toLowerCase().includes('fake') || rawName.toLowerCase().includes('test')) {
      if (rawName.includes('2')) motherId = '921799';
      else motherId = '649669';
    }

    const key = motherId || roomName || 'unknown';
    if (!roomBookingsMap[key]) {
      roomBookingsMap[key] = { roomName, motherId: key, bookings: [] };
    }
    roomBookingsMap[key].bookings.push({ in: inStr, out: outStr });
  });

  console.log('Stanze mappate con prenotazioni:', Object.keys(roomBookingsMap).map(k => `${roomBookingsMap[k].roomName} (#${k}): ${roomBookingsMap[k].bookings.length} pren`));

  // Gaps calculation
  const todayISO = new Date().toISOString().substring(0, 10);
  const endISO = dateTo;
  const updates = [];

  Object.values(roomBookingsMap).forEach(({ roomName, motherId, bookings: bList }) => {
    const sorted = bList.sort((a, b) => a.in.localeCompare(b.in));
    const octRoomId = motherId;
    const gaps = [];

    if (sorted.length > 0) {
      if (sorted[0].in > todayISO) {
        gaps.push({ start: todayISO, end: sorted[0].in });
      }

      for (let i = 0; i < sorted.length - 1; i++) {
        const prevOut = sorted[i].out;
        const nextIn = sorted[i + 1].in;
        if (prevOut < nextIn && prevOut <= endISO && nextIn >= todayISO) {
          const effectiveStart = prevOut < todayISO ? todayISO : prevOut;
          if (effectiveStart < nextIn) {
            gaps.push({ start: effectiveStart, end: nextIn });
          }
        }
      }
    }

    gaps.forEach(({ start: gapStart, end: gapEnd }) => {
      const prevOutTime = new Date(gapStart).getTime();
      const nextInTime = new Date(gapEnd).getTime();
      const gapDays = Math.round((nextInTime - prevOutTime) / (1000 * 60 * 60 * 24));

      if (gapDays > 0) {
        let maxBaselineInGap = 2;
        if (gapDays < maxBaselineInGap) {
          const dateToInclusive = new Date(nextInTime - 86400000).toISOString().slice(0, 10);
          updates.push({
            roomTypeId: octRoomId,
            accommodationName: roomName,
            dateFrom: gapStart,
            dateTo: dateToInclusive,
            minStay: gapDays,
            reason: `Gap-Fill Dinamico (${gapDays}d gap < baseline ${maxBaselineInGap}d): M=${gapDays}`
          });
        }
      }
    });
  });

  console.log('\n--- BUCATURE CALCOLATE CON IL NUOVO PARSER ---');
  console.log(JSON.stringify(updates, null, 2));
}

testWebhookEngine();
