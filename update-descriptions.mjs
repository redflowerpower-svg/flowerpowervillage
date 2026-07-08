// seed-accommodations.mjs
// Popola (o aggiorna) la tabella accommodations in Supabase
// Run: node seed-accommodations.mjs

const SUPABASE_URL = 'https://htmnjjzxpybpbumtbqic.supabase.co';
const SUPABASE_KEY = 'sb_publishable_li3CQ1bbmjZDJ2ygbE70Vg_W7XSsc8w';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Prefer': 'resolution=merge-duplicates,return=representation',
};

const accommodations = [
  // ── VILLE ────────────────────────────────────────────────────────────────
  {
    slug: 'villa-penthouse',
    name: 'Penthouse Villa',
    type: 'villa',
    description: "La Penthouse Villa rappresenta la sistemazione più esclusiva del nostro villaggio. Offre una camera padronale con letto King size, un salotto separato con divano letto e due bagni privati per garantire totale privacy. All'esterno troverai una cucina dedicata, TV Android da 40 pollici e un giardino riservato per momenti di puro relax.",
    capacity: 4,
    rooms: 2,
    bathrooms: 2,
    beds: '1 King Size + 1 Sofa Bed King',
    features: ['Camera padronale con bagno privato', 'Salotto separato', 'Cucina outdoor', 'TV 40" Android TV', 'Giardino privato', 'Acqua calda'],
    price_per_night: 2400,
    images: [],
    is_available: true,
  },
  {
    slug: 'peace-and-love-villa',
    name: 'Peace & Love Villa',
    type: 'villa',
    description: "Situata proprio di fronte alla piscina, questa villa indipendente vanta un'ampia terrazza privata per godersi il clima tropicale. La camera principale è dotata di un letto King size e un divano letto Queen, ideali per ospitare fino a quattro persone con stile. Avrai a disposizione una cucina interna ben attrezzata, un bagno privato e una TV Android da 40 pollici.",
    capacity: 4,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size + 1 Sofa Bed Queen',
    features: ['Vista piscina', 'Terrazza privata', 'Cucina interna attrezzata', 'TV 40" Android TV', 'Bagno privato con acqua calda'],
    price_per_night: 2400,
    images: [],
    is_available: true,
  },
  {
    slug: 'jungle-villa-left',
    name: 'Jungle Villa Left',
    type: 'villa',
    description: "Questa spaziosa villa su due piani offre una vista privilegiata sulla piscina del villaggio. Al piano terra troverai una cucina privata e un bagno con acqua calda, mentre il piano superiore ospita una zona living outdoor e una camera da letto confortevole. È la scelta perfetta per chi cerca indipendenza, design moderno e un'autentica immersione nella giungla.",
    capacity: 4,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size + 1 Sofa Bed Queen',
    features: ['Vista piscina', 'Cucina privata', 'Zona pranzo', 'Salotto outdoor', 'Bagno con acqua calda'],
    price_per_night: 2400,
    images: [],
    is_available: true,
  },
  {
    slug: 'jungle-villa-right',
    name: 'Jungle Villa Right',
    type: 'villa',
    description: "Jungle Villa Right è un'elegante porzione di villa su due piani situata proprio di fronte alla piscina principale. Il piano terra accoglie gli ospiti con una cucina privata e una zona pranzo, mentre il secondo piano offre un salotto outdoor e una camera con letto King e divano Queen. È l'alloggio ideale per chi desidera comfort elevato e vicinanza alla natura.",
    capacity: 4,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size + 1 Sofa Bed Queen',
    features: ['Vista piscina', 'Cucina privata', 'Zona pranzo', 'Salotto outdoor', 'Bagno con acqua calda'],
    price_per_night: 2400,
    images: [],
    is_available: true,
  },
  {
    slug: 'jungle-villa',
    name: 'Jungle Villa',
    type: 'villa',
    description: "La Jungle Villa è la nostra soluzione più ampia, pensata appositamente per gruppi o famiglie che desiderano condividere l'esperienza. Include due cucine complete, due salotti outdoor e due camere con letti King e divani Queen per ospitare fino a otto persone. Grazie alla splendida vista piscina, potrai vivere una vacanza indimenticabile immerso in un contesto naturale.",
    capacity: 8,
    rooms: 2,
    bathrooms: 2,
    beds: '2 King Size + 2 Sofa Bed Queen',
    features: ['Vista piscina', 'Doppia cucina privata', 'Doppio salotto outdoor', '2 bagni con acqua calda', 'Ideale per gruppi'],
    price_per_night: 4800,
    images: [],
    is_available: true,
  },

  // ── BUNGALOW ─────────────────────────────────────────────────────────────
  {
    slug: 'yellow-bungalow',
    name: 'Yellow Bungalow',
    type: 'bungalow',
    description: "Immerso in un rigoglioso giardino tropicale, il Yellow Bungalow è la nostra cupola più spaziosa e affascinante. Troverai una cucina privata, un accogliente soggiorno, un letto King size e un bagno con acqua calda per il massimo del comfort. Goditi la vista su alberi da frutto e fauna locale direttamente dal tuo tavolo in muratura, vivendo un'esperienza unica.",
    capacity: 3,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size + 1 Extra Single',
    features: ['Cucina privata', 'Soggiorno e sala pranzo', 'Bagno caldo', 'Frigo', 'Ventilatore', 'Giardino tropicale privato'],
    price_per_night: 1800,
    images: [],
    is_available: true,
  },
  {
    slug: 'green-bungalow',
    name: 'Green Bungalow',
    type: 'bungalow',
    description: "Il Green Bungalow è un rifugio a forma di cupola circondato da fiori vibranti e piante tropicali. All'interno ti attende un comodo letto King size, un bagno privato con acqua calda e tutto l'essenziale per un soggiorno rilassante. Dalla tua area esterna potrai ammirare la fauna locale, sentendoti parte integrante della natura che circonda il villaggio.",
    capacity: 3,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size + 1 Extra Single',
    features: ['Letto King', 'Bagno caldo', 'Frigo/bar', 'Ventilatore', 'Giardino tropicale', 'Tavolo esterno'],
    price_per_night: 1800,
    images: [],
    is_available: true,
  },
  {
    slug: 'red-bungalow',
    name: 'Red Bungalow',
    type: 'bungalow',
    description: "Scopri l'incanto del Red Bungalow, una struttura a cupola perfetta per chi cerca intimità e una connessione profonda con la giungla. La sistemazione offre un letto King size, un bagno caldo e un'area esterna privata immersa in un giardino lussureggiante. È la scelta ideale per godersi il silenzio, il profumo dei fiori tropicali e il canto degli uccelli esotici.",
    capacity: 3,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size + 1 Extra Single',
    features: ['Letto King', 'Bagno caldo', 'Frigo/bar', 'Ventilatore', 'Giardino tropicale', 'Tavolo esterno'],
    price_per_night: 1800,
    images: [],
    is_available: true,
  },

  // ── TENDE GLAMPING ────────────────────────────────────────────────────────
  {
    slug: 'laguna-glamping',
    name: 'Laguna Glamping',
    type: 'tent',
    description: "Vivi una vera avventura con il Laguna Glamping, una tenda esclusiva sollevata su una pedana in legno e protetta da un tetto naturale. L'alloggio offre un'immersione totale nei suoni della giungla senza rinunciare al comfort di un letto comodo. Sarai avvolto dalla vegetazione in uno spazio privato che include anche un bagno personale con acqua calda.",
    capacity: 2,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size',
    features: ['Tetto in foglie naturali', 'Pedana in legno rialzata', 'Letto comodo', 'Bagno privato con acqua calda', 'Immersione nella giungla'],
    price_per_night: 1400,
    images: [],
    is_available: true,
  },
  {
    slug: 'camel-glamping',
    name: 'Camel Glamping',
    type: 'tent',
    description: "Il Camel Glamping offre un'esperienza unica in una tenda costruita su una piattaforma rialzata in legno. Goditi il massimo relax nel tuo patio privato attrezzato con amache, perfetto per riposarsi tra un'escursione e l'altra. Questa sistemazione combina il fascino dell'avventura con la comodità di un bagno privato e un letto King size estremamente accogliente.",
    capacity: 2,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size',
    features: ['Tetto in foglie naturali', 'Piattaforma rialzata in legno', 'Patio privato con amache', 'Bagno privato con acqua calda', 'Immersione nella giungla'],
    price_per_night: 1400,
    images: [],
    is_available: true,
  },

  // ── HUBit@ GUESTHOUSE ────────────────────────────────────────────────────
  {
    slug: 'room-1',
    name: 'Room #1',
    type: 'room',
    description: "La Room #1 di HUBit@ è la sistemazione perfetta per nomadi digitali e famiglie che cercano comfort e connettività. Include un ampio letto King size, scrivania dedicata e accesso alla cucina e area coworking comune con WiFi a 100 Mbps. Il balcone privato offre un angolo tranquillo per godersi l'atmosfera dell'isola dopo una giornata di lavoro o di esplorazione.",
    capacity: 3,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size + 1 Extra Single',
    features: ['Letto King size', 'Scrivania dedicata', 'Bagno privato con acqua calda', 'Balcone', 'WiFi 100 Mbps dedicato', 'Cucina comune', 'Area coworking'],
    price_per_night: 1000,
    images: [],
    is_available: true,
  },
  {
    slug: 'room-2',
    name: 'Room #2',
    type: 'room',
    description: "Soggiorna nella Room #2 di HUBit@, un rifugio moderno dotato di letto King size e postazione di lavoro dedicata per uno smart working senza interruzioni. Gli ospiti hanno accesso a una cucina comune attrezzata e una connessione WiFi ultra-rapida a 100 Mbps. Il balcone privato è il luogo ideale dove rilassarsi guardando il panorama tropicale dell'isola.",
    capacity: 4,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size + 1 Sofa Bed King',
    features: ['Letto King size', 'Postazione lavoro dedicata', 'Bagno privato con acqua calda', 'Balcone privato', 'WiFi 100 Mbps dedicato', 'Cucina comune', 'Area coworking'],
    price_per_night: 1000,
    images: [],
    is_available: true,
  },
  {
    slug: 'room-3',
    name: 'Room #3',
    type: 'room',
    description: "La Room #3 presso HUBit@ unisce design funzionale e comfort in un ambiente sereno perfetto per remote worker e viaggiatori. Dispone di un comodo letto King size, scrivania ergonomica e accesso a tutte le aree comuni della guesthouse. Rimarrai connesso grazie al WiFi a 100 Mbps e potrai goderti il tuo balcone privato per momenti di riflessione e relax.",
    capacity: 4,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size + 1 Sofa Bed Queen',
    features: ['Letto King size', 'Postazione lavoro dedicata', 'Bagno privato con acqua calda', 'Balcone privato', 'WiFi 100 Mbps dedicato', 'Cucina comune', 'Area coworking'],
    price_per_night: 1000,
    images: [],
    is_available: true,
  },
  {
    slug: 'room-4',
    name: 'Room #4',
    type: 'room',
    description: "La Room #4 di HUBit@ offre uno spazio ideale per chi lavora da remoto e vuole vivere l'isola in totale comodità. Con un letto King size, scrivania privata e accesso alle strutture comuni, ti sentirai subito a casa. La connettività 100 Mbps garantisce la massima produttività, mentre il balcone privato regala piacevoli momenti di pausa all'aria aperta.",
    capacity: 4,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size + 1 Sofa Bed King',
    features: ['Letto King size', 'Postazione lavoro dedicata', 'Bagno privato con acqua calda', 'Balcone privato', 'WiFi 100 Mbps dedicato', 'Cucina comune', 'Area coworking'],
    price_per_night: 1000,
    images: [],
    is_available: true,
  },
  {
    slug: 'room-5',
    name: 'Room #5',
    type: 'room',
    description: "Cerchi la massima concentrazione? La Room #5 di HUBit@ è l'alloggio più intimo e silenzioso, ideale per coppie o nomadi digitali in cerca di focus. Dispone di un letto Queen size, scrivania privata e bagno con acqua calda, oltre all'accesso completo all'area coworking. È un rifugio compatto ed elegante, perfetto per dedicarsi interamente ai propri progetti.",
    capacity: 2,
    rooms: 1,
    bathrooms: 1,
    beds: '1 Queen Size',
    features: ['Letto Queen size', 'Scrivania', 'Bagno privato con acqua calda', 'WiFi 100 Mbps dedicato', 'Cucina comune', 'Area coworking'],
    price_per_night: 1000,
    images: [],
    is_available: true,
  },
  {
    slug: 'internal-room',
    name: 'Internal Room',
    type: 'room',
    description: "Situata in un'area riservata sotto la struttura principale, questa camera offre privacy e standard occidentali per un soggiorno eccellente. Include letto King, scrivania e balcone, con libero accesso alla cucina e alla zona coworking con WiFi a 100 Mbps. È la soluzione ideale se cerchi una sistemazione curata, confortevole e dotata di ogni servizio necessario.",
    capacity: 2,
    rooms: 1,
    bathrooms: 1,
    beds: '1 King Size',
    features: ['Letto King size', 'Postazione lavoro dedicata', 'Bagno privato con acqua calda', 'Balcone', 'WiFi 100 Mbps dedicato', 'Cucina comune', 'Area coworking'],
    price_per_night: 1000,
    images: [],
    is_available: true,
  },
  {
    slug: 'lodge-1',
    name: 'Lodge #1',
    type: 'lodge',
    description: "Lodge #1 è un appartamento premium su più livelli, perfetto per famiglie o nomadi digitali che desiderano autonomia. Offre una cucina privata, salotto esclusivo e una zona rialzata con divano letto, garantendo flessibilità per quattro ospiti. Scendendo 5 gradini nel terrapieno posteriore si scopre la camera principale con letto King, scrivania, bagno privato caldo e balcone.",
    capacity: 4,
    rooms: 2,
    bathrooms: 1,
    beds: '1 King Size + 1 Sofa Bed King',
    features: ['Cucina privata attrezzata', 'Salotto privato', 'Design a livelli', 'Camera principale con letto King', 'Bagno privato caldo', 'Balcone', 'WiFi 100 Mbps', 'Accesso cucina comune'],
    price_per_night: 1600,
    images: [],
    is_available: true,
  },
  {
    slug: 'lodge-2',
    name: 'Lodge #2',
    type: 'lodge',
    description: "Lodge #2 è un'elegante sistemazione su due livelli pensata per chi cerca il massimo della comodità durante un soggiorno a lungo termine. Lo spazio include una cucina privata, un'area soggiorno modulabile e una camera matrimoniale raffinata con ogni comfort. Goditi l'autonomia di questo appartamento premium, beneficiando contemporaneamente dell'accesso ai servizi comuni di HUBit@.",
    capacity: 4,
    rooms: 2,
    bathrooms: 1,
    beds: '1 King Size + 1 Sofa Bed King',
    features: ['Cucina privata attrezzata', 'Salotto privato', 'Design a livelli', 'Camera principale con letto King', 'Bagno privato caldo', 'Balcone', 'WiFi 100 Mbps', 'Accesso cucina comune'],
    price_per_night: 1600,
    images: [],
    is_available: true,
  },
];

async function main() {
  console.log(`🌿 Seeding ${accommodations.length} accommodations into Supabase...\n`);

  const res = await fetch(`${SUPABASE_URL}/rest/v1/accommodations`, {
    method: 'POST',
    headers,
    body: JSON.stringify(accommodations),
  });

  const body = await res.text();

  if (!res.ok) {
    console.error(`❌ Error (HTTP ${res.status}):\n${body}`);
    process.exit(1);
  }

  let parsed;
  try { parsed = JSON.parse(body); } catch { parsed = body; }

  if (Array.isArray(parsed)) {
    console.log(`✅ ${parsed.length} records upserted successfully!\n`);
    parsed.forEach(r => console.log(`  ✔  ${r.slug}  →  ${r.name}`));
  } else {
    console.log('✅ Upsert complete. Response:', parsed);
  }

  console.log('\n🎉 Done.');
}

main().catch(err => { console.error('❌ Fatal:', err); process.exit(1); });
