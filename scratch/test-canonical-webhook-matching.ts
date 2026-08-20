import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env', 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) envVars[k.trim()] = v.join('=').trim();
  }
}

const supabase = createClient(
  envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY
);

// Map of all 18 accommodations with mother IDs, all derived product IDs, and fuzzy keywords
const ALL_ACCOMMODATIONS_MAP: Record<string, { motherId: number; name: string; ids: string[]; keywords: string[][] }> = {
  'jungle villa': {
    motherId: 529773,
    name: 'Jungle Villa',
    ids: ['529773', '529784', '529778', '529792', '529788', '529780', '916817', '529781', '529801', '921868', '921869', '529783', '529813'],
    keywords: [["jungle", "jv"], ["villa", "ac", "be"]]
  },
  'jungle villa left': {
    motherId: 495795,
    name: 'Jungle Villa Left',
    ids: ['495795', '495807', '495804', '496009', '496001', '495805', '496022', '495806', '496031', '921870', '921871', '495810', '496057'],
    keywords: [["jungle", "jv"], ["left", "jvl"]]
  },
  'jungle villa right': {
    motherId: 495796,
    name: 'Jungle Villa Right',
    ids: ['495796', '495980', '495977', '496010', '496002', '495978', '496021', '495979', '496030', '921872', '921873', '495982', '496056'],
    keywords: [["jungle", "jv"], ["right", "jvr"]]
  },
  'peace & love villa': {
    motherId: 494840,
    name: 'Peace & Love Villa',
    ids: ['494840', '495566', '495580', '495575', '495552', '495587', '495565', '495593', '921874', '921875', '495569', '495609'],
    keywords: [["peace", "love", "p&l"]]
  },
  'villa penthouse': {
    motherId: 421511,
    name: 'Villa Penthouse',
    ids: ['421511', '449348', '421513', '421516', '421520', '421522', '421525', '421527', '421530', '921876', '921877', '421532', '421533'],
    keywords: [["penthouse", "pent"]]
  },
  'yellow bungalow': {
    motherId: 293957,
    name: 'Yellow Bungalow',
    ids: ['293957', '449385', '293958', '332055', '332054', '331921', '332057', '331922', '332060', '921878', '921879', '297022', '340198'],
    keywords: [["yellow"]]
  },
  'red bungalow': {
    motherId: 293954,
    name: 'Red Bungalow',
    ids: ['293954', '449422', '293953', '332030', '332029', '330964', '332035', '330970', '332036', '921880', '921881', '297021', '340196'],
    keywords: [["red"]]
  },
  'green bungalow': {
    motherId: 293962,
    name: 'Green Bungalow',
    ids: ['293962', '449668', '293961', '332070', '332066', '331923', '332072', '331924', '332074', '921882', '921883', '297023', '340200'],
    keywords: [["green"]]
  },
  'camel tent bungalow': {
    motherId: 293965,
    name: 'Camel Tent',
    ids: ['293965', '449675', '422325', '293966', '332089', '332084', '297025'],
    keywords: [["camel"]]
  },
  'lagoon tent bungalow': {
    motherId: 293955,
    name: 'Lagoon Tent',
    ids: ['293955', '449674', '422351', '293956', '332081', '332077', '297024'],
    keywords: [["lagoon"]]
  },
  'internal room': {
    motherId: 293942,
    name: 'Internal Room',
    ids: ['293942', '449742', '293941', '332109', '332105', '340367', '916840', '421998', '916838', '921898', '921899', '297027', '422147'],
    keywords: [["internal", "inter"]]
  },
  'room 1': {
    motherId: 293963,
    name: 'Room 1',
    ids: ['293963', '449678', '422300', '332737', '332735', '331976', '916818', '331977', '916402', '921889', '921890', '297033', '421505'],
    keywords: [["room", "hub", "r1"], ["1", "one"]]
  },
  'room 2': {
    motherId: 293959,
    name: 'Room 2',
    ids: ['293959', '449684', '422296', '332741', '332739', '331966', '332119', '331967', '332134', '921891', '921900', '297032', '421506'],
    keywords: [["room", "hub", "r2"], ["2", "two"]]
  },
  'room 3': {
    motherId: 293948,
    name: 'Room 3',
    ids: ['293948', '449699', '422293', '332743', '332757', '331968', '332121', '331969', '332136', '921892', '921893', '297028', '421507'],
    keywords: [["room", "hub", "r3"], ["3", "three"]]
  },
  'room 4': {
    motherId: 293945,
    name: 'Room 4',
    ids: ['293945', '449724', '422265', '332759', '332746', '331970', '332123', '331971', '332138', '921894', '921895', '297029', '421508'],
    keywords: [["room", "hub", "r4"], ["4", "four"]]
  },
  'room 5': {
    motherId: 293943,
    name: 'Room 5',
    ids: ['293943', '449730', '422213', '332765', '332763', '331972', '332125', '331973', '332140', '921896', '921897', '297031', '421509'],
    keywords: [["room", "hub", "r5"], ["5", "five"]]
  },
  'lodge 1': {
    motherId: 293951,
    name: 'Lodge 1',
    ids: ['293951', '449736', '422149', '332769', '332767', '331974', '332129', '422157', '332142', '921884', '921885', '297030', '421510'],
    keywords: [["lodge"], ["1", "one"]]
  },
  'lodge 2': {
    motherId: 883795,
    name: 'Lodge 2',
    ids: ['883795', '923905', '916108', '916107', '916109', '916114', '916829', '916105', '916830', '921886', '921887', '916103', '916104'],
    keywords: [["lodge"], ["2", "two"]]
  },
  'fake bungalow 1': {
    motherId: 649669,
    name: 'Fake Bungalow 1',
    ids: ['649669', '932243', '932244', '932246', '932247', '932248', '932249', '932250', '932251', '932252', '932253', '932254', '932255'],
    keywords: [["fake"], ["1", "one"]]
  },
  'fake bungalow 2': {
    motherId: 921799,
    name: 'Fake Bungalow 2',
    ids: ['921799', '932256', '932257', '932259', '932260', '932261', '932262', '932263', '932264', '932265', '932266', '932267', '932268'],
    keywords: [["fake"], ["2", "two"]]
  }
};

function getCanonicalAccommodation(booking: any): { key: string; name: string; motherId: number } | null {
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
    if (bName.includes('jvr') || bName.includes('right')) {
      return { key: 'jungle villa right', name: 'Jungle Villa Right', motherId: 495796 };
    }
    if (bName.includes('jvl') || bName.includes('left')) {
      return { key: 'jungle villa left', name: 'Jungle Villa Left', motherId: 495795 };
    }

    for (const [key, entry] of Object.entries(ALL_ACCOMMODATIONS_MAP)) {
      const matchAllGroups = entry.keywords.every(group => group.some(kw => bName.includes(kw)));
      if (matchAllGroups) {
        return { key, name: entry.name, motherId: entry.motherId };
      }
    }
  }

  return null;
}

async function run() {
  const { data } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  const token = data.access_token;
  const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

  const octUrl = `https://api.octorate.com/connect/rest/v1/reservation/366879?type=STAY&startDate=2026-08-18&endDate=2027-10-31&size=200&page=0`;
  const octRes = await fetch(octUrl, { headers });
  const octJson = await octRes.json();
  const pageData = octJson.data || [];

  let matched = 0;
  let unmatched = 0;
  for (const b of pageData) {
    const c = getCanonicalAccommodation(b);
    if (c) {
      matched++;
    } else {
      unmatched++;
      console.log('UNMATCHED:', b.id, b.roomName, b.product);
    }
  }

  console.log(`Matched: ${matched} / ${pageData.length} (${unmatched} unmatched)`);
}

run().catch(console.error);
