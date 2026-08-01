import fetch from 'node-fetch';

async function audit() {
  console.log("🔍 Esecuzione Audit Generale su tutte le prenotazioni Octorate...");
  
  const tokenRes = await fetch('http://localhost:3000/api/resort/octorate-bookings?dateFrom=2026-08-01&dateTo=2027-04-30');
  if (!tokenRes.ok) {
    console.error("❌ Impossibile chiamare l'API octorate-bookings:", tokenRes.statusText);
    return;
  }
  
  const json = await tokenRes.json();
  const bookings = json.data || [];
  console.log(`📊 Totale prenotazioni trovate: ${bookings.length}`);

  const ALL_ACCOMMODATIONS_MAP = {
    'jungle villa': {
      ids: ['529784', '529773', '529783', '529792', '916816'],
      keywords: [['jungle', 'jv'], ['villa', 'ac']]
    },
    'jungle villa left': {
      ids: ['495807', '495795', '496009', '496001', '495810'],
      keywords: [['jungle', 'jv'], ['left', 'jvl']]
    },
    'jungle villa right': {
      ids: ['495980', '495796', '496010', '496002'],
      keywords: [['jungle', 'jv'], ['right', 'jvr']]
    },
    'peace & love villa': {
      ids: ['495566', '494840', '495587', '495580', '921874', '495575', '495549'],
      keywords: [['peace', 'love', 'p&l']]
    },
    'villa penthouse': {
      ids: ['449348', '421511', '421532', '421516', '421520'],
      keywords: [['penthouse', 'pent']]
    },
    'yellow bungalow': {
      ids: ['449385', '293957', '422422', '332055', '332054', '297022'],
      keywords: [['yellow']]
    },
    'red bungalow': {
      ids: ['449422', '293954', '332030', '332029'],
      keywords: [['red']]
    },
    'green bungalow': {
      ids: ['449668', '293962', '422402', '332070', '332066'],
      keywords: [['green']]
    },
    'camel tent bungalow': {
      ids: ['449675', '293965', '297025', '422325', '332089', '332084'],
      keywords: [['camel']]
    },
    'lagoon tent bungalow': {
      ids: ['449674', '293955', '332081', '332077'],
      keywords: [['lagoon']]
    },
    'room 1': {
      ids: ['449678', '293963'],
      keywords: [['room', 'hub'], ['1', 'one']]
    },
    'room 2': {
      ids: ['449684', '293959'],
      keywords: [['room', 'hub'], ['2', 'two']]
    },
    'room 3': {
      ids: ['449699', '293948'],
      keywords: [['room', 'hub'], ['3', 'three']]
    },
    'room 4': {
      ids: ['449724', '293945'],
      keywords: [['room', 'hub'], ['4', 'four']]
    },
    'room 5': {
      ids: ['449730', '293943'],
      keywords: [['room', 'hub'], ['5', 'five']]
    },
    'lodge 1': {
      ids: ['449736', '293951'],
      keywords: [['lodge'], ['1', 'one']]
    },
    'lodge 2': {
      ids: ['923905', '883795'],
      keywords: [['lodge'], ['2', 'two']]
    },
    'internal room': {
      ids: ['449742', '293942', '332105', '332109', '293941'],
      keywords: [['internal', 'inter']]
    }
  };

  const roomNames = Object.keys(ALL_ACCOMMODATIONS_MAP);

  let unassignedCount = 0;
  let multipleMatchesCount = 0;
  let missingNoticeCount = 0;

  for (const b of bookings) {
    if (String(b.status).toLowerCase() === 'cancelled') continue;

    const bProduct = String(b.product || b.pmsProduct || b.accommodation_id || b.roomId || '').trim();
    const bRoomName = String(b.roomName || b.accommodation_name || b.room_name || '').toLowerCase().trim();

    const matchedRooms = [];

    for (const rName of roomNames) {
      const entry = ALL_ACCOMMODATIONS_MAP[rName];
      let isMatch = false;

      if (bProduct && entry.ids.includes(bProduct)) {
        isMatch = true;
      }

      if (!isMatch && bRoomName) {
        if (bRoomName === rName || bRoomName.includes(rName) || rName.includes(bRoomName)) {
          if (rName === 'jungle villa') {
            if (!bRoomName.includes('left') && !bRoomName.includes('right') && !bRoomName.includes('jvl') && !bRoomName.includes('jvr')) {
              isMatch = true;
            }
          } else {
            isMatch = true;
          }
        } else {
          const matchesAll = entry.keywords.every(group => group.some(kw => bRoomName.includes(kw)));
          if (matchesAll) {
            isMatch = true;
          }
        }
      }

      if (isMatch) {
        matchedRooms.push(rName);
      }
    }

    if (matchedRooms.length === 0) {
      unassignedCount++;
      console.warn(`⚠️ PRENOTAZIONE NON ACCOPPIATA! ID: ${b.id} | Ospite: ${b.guest_name} | Product: "${bProduct}" | RoomName: "${bRoomName}" | Date: ${b.check_in} -> ${b.check_out}`);
    } else if (matchedRooms.length > 1) {
      multipleMatchesCount++;
      console.warn(`🚨 PRENOTAZIONE MULTIPLA SU PIÙ ALLOGGI! ID: ${b.id} | Ospite: ${b.guest_name} | Product: "${bProduct}" | RoomName: "${bRoomName}" | Matches: ${matchedRooms.join(', ')}`);
    } else {
      const targetEntry = ALL_ACCOMMODATIONS_MAP[matchedRooms[0]];
      if (bProduct && !targetEntry.ids.includes(bProduct)) {
        missingNoticeCount++;
        console.log(`ℹ️ [Notice ID Mancante] ID: ${b.id} | Ospite: ${b.guest_name} | Alloggio: "${matchedRooms[0]}" | Product "${bProduct}" non era nell'array ids, matchato per keyword "${bRoomName}"`);
      }
    }
  }

  console.log("\n================ RIEPILOGOTO AUDIT ================");
  console.log(`Totale Prenotazioni Confermate Analizzate: ${bookings.filter(b => String(b.status).toLowerCase() !== 'cancelled').length}`);
  console.log(`Prenotazioni Non Accoppiate (0 match): ${unassignedCount}`);
  console.log(`Prenotazioni Multi-Match (ambigue): ${multipleMatchesCount}`);
  console.log(`ID Mancanti da array ids: ${missingNoticeCount}`);
}

audit();
