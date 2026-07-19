import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Dedicated public client to bypass localStorage session pollution from admin login
const publicSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export interface DbAccommodation {
  id: string;
  name: string;
  slug: string;
}

export interface EnrichedAccommodation {
  id: string;
  slug: string;
  name: string;
  title: string;
  category: 'VILLE' | 'BUNGALOW' | 'TENDE GLAMPING' | 'THE HUB GUESTHOUSE';
  description: string;
  capacity: number;
  baseGuests: number;
  maxExtraGuests: number;
  beds: string;
  features: string[];
  base_price_high: number;
  base_price_low: number;
  octorateId?: number;
  images: string[];
  isLive: boolean;
  // Multilingual fields
  title_it?: string;
  title_en?: string;
  title_th?: string;
  title_de?: string;
  description_it?: string;
  description_en?: string;
  description_th?: string;
  description_de?: string;
}

// Local metadata mapping to enrich the db records
const ROOM_METADATA: Record<string, {
  slug: string;
  category: EnrichedAccommodation['category'];
  description: string;
  capacity: number;
  baseGuests: number;
  beds: string;
  features: string[];
  price: number;
  title_it: string;
  title_en: string;
  title_th: string;
  title_de: string;
  description_it: string;
  description_en: string;
  description_th: string;
  description_de: string;
}> = {
  'Jungle Villa': {
    slug: 'jungle-villa',
    category: 'VILLE',
    description: 'La Jungle Villa è la struttura più ampia del villaggio, ideale per grandi gruppi che vogliono condividere l\'esperienza. Doppie cucine, doppi salotti outdoor e due camere con letti King e divani Queen accolgono comodamente fino a otto ospiti. Due bagni privati e una splendida vista sulla piscina rendono questo soggiorno davvero indimenticabile.',
    capacity: 8,
    baseGuests: 8,
    beds: '2 King Size + 2 Sofa Bed Queen',
    features: ['Private Kitchen', 'Pool Access', 'Hot Shower', 'WiFi', 'Double Living Room'],
    price: 4800,
    title_it: 'Jungle Villa',
    title_en: 'Jungle Villa',
    title_th: 'จังเกิล วิลล่า',
    title_de: 'Jungle Villa',
    description_it: 'La Jungle Villa è la struttura più ampia del villaggio, ideale per grandi gruppi che vogliono condividere l\'esperienza. Doppie cucine, doppi salotti outdoor e due camere con letti King e divani Queen accolgono comodamente fino a otto ospiti. Due bagni privati e una splendida vista sulla piscina rendono questo soggiorno davvero indimenticabile.',
    description_en: 'Jungle Villa is the largest accommodation in the village, perfect for large groups wishing to share their holiday experience. Double kitchens, double outdoor living areas, and two spacious bedrooms with King-size beds and Queen-size sofa beds comfortably host up to eight guests. Two private bathrooms and a stunning pool view make this stay truly unforgettable.',
    description_th: 'จังเกิล วิลล่า คือที่พักขนาดใหญ่ที่สุดในวิลเลจ เหมาะสำหรับครอบครัวหรือกลุ่มเพื่อนที่อยากแชร์ช่วงเวลาดีๆ ร่วมกัน ภายในมีครัวและพื้นที่พักผ่อนกลางแจ้งแบบดับเบิ้ล ห้องนอนสองห้องพร้อมเตียงคิงไซส์และโซฟาเบด รองรับผู้เข้าพักได้ถึง 8 ท่าน พร้อมห้องน้ำส่วนตัวสองห้องและวิวสระว่ายน้ำที่สวยงาม',
    description_de: 'Die Jungle Villa ist die größte Unterkunft des Dorfes, ideal für große Gruppen, die ein gemeinsames Erlebnis suchen. Doppelküchen, zwei Outdoor-Wohnbereiche und zwei Schlafzimmer mit King-Size-Betten und Queen-Size-Schlafsofas bieten Platz für bis zu acht Gäste. Zwei private Badezimmer und ein herrlicher Blick auf den Pool machen diesen Aufenthalt unvergesslich.'
  },
  'Jungle Villa Left': {
    slug: 'jungle-villa-left',
    category: 'VILLE',
    description: 'Villa su due piani affacciata direttamente sulla piscina del villaggio, con cucina privata, zona pranzo e bagno al piano terra. Al secondo piano ti attendono un salotto outdoor e una spaziosa camera con letto King e divano letto Queen. Un\'unità semi-indipendente pensata per chi vuole comfort, privacy e un\'immersione autentica nella giungla.',
    capacity: 4,
    baseGuests: 4,
    beds: '1 King Size + 1 Sofa Bed Queen',
    features: ['Private Kitchen', 'Pool Access', 'Hot Shower', 'WiFi', 'Outdoor Living Room'],
    price: 2400,
    title_it: 'Jungle Villa Left',
    title_en: 'Jungle Villa Left',
    title_th: 'จังเกิล วิลล่า ฝั่งซ้าย',
    title_de: 'Jungle Villa Links',
    description_it: 'Villa su due piani affacciata direttamente sulla piscina del villaggio, con cucina privata, zona pranzo e bagno al piano terra. Al secondo piano ti attendono un salotto outdoor e una spaziosa camera con letto King e divano letto Queen. Un\'unità semi-indipendente pensata per chi vuole comfort, privacy e un\'immersione autentica nella giungla.',
    description_en: 'A two-story villa directly overlooking the village pool, with a private kitchen, dining area, and bathroom on the ground floor. The second floor offers an outdoor lounge and a spacious bedroom with a King-size bed and a Queen-size sofa bed. A semi-detached unit designed for those seeking comfort, privacy, and an authentic jungle experience.',
    description_th: 'วิลล่าสองชั้นที่ตั้งอยู่ติดกับสระว่ายน้ำ ชั้นล่างมีครัวส่วนตัว พื้นที่รับประทานอาหาร และห้องน้ำ ชั้นสองเปิดรับลมพร้อมพื้นที่นั่งเล่นกลางแจ้งและห้องนอนพร้อมเตียงคิงไซส์และโซฟาเบด เหมาะสำหรับผู้ที่ต้องการความสะดวกสบายและความเป็นส่วนตัว',
    description_de: 'Eine zweistöckige Villa mit direktem Blick auf den Pool, privater Küche, Essbereich und Badezimmer im Erdgeschoss. Im Obergeschoss erwarten Sie ein Outdoor-Wohnbereich und ein geräumiges Schlafzimmer mit King-Size-Bett und Queen-Size-Schlafsofa. Eine halb-unabhängige Unterkunft für Komfort, Privatsphäre und echtes Dschungelflair.'
  },
  'Jungle Villa Right': {
    slug: 'jungle-villa-right',
    category: 'VILLE',
    description: 'Villa su due piani affacciata direttamente sulla piscina del villaggio, con cucina privata, zona pranzo e bagno al piano terra. Al secondo piano ti attendono un salotto outdoor e una spaziosa camera con letto King e divano letto Queen. Un\'unità semi-indipendente pensata per chi vuole comfort, privacy e un\'immersione autentica nella giungla.',
    capacity: 4,
    baseGuests: 4,
    beds: '1 King Size + 1 Sofa Bed Queen',
    features: ['Private Kitchen', 'Pool Access', 'Hot Shower', 'WiFi', 'Outdoor Living Room'],
    price: 2400,
    title_it: 'Jungle Villa Right',
    title_en: 'Jungle Villa Right',
    title_th: 'จังเกิล วิลล่า ฝั่งขวา',
    title_de: 'Jungle Villa Rechts',
    description_it: 'Villa su due piani affacciata direttamente sulla piscina del villaggio, con cucina privata, zona pranzo e bagno al piano terra. Al secondo piano ti attendono un salotto outdoor e una spaziosa camera con letto King e divano letto Queen. Un\'unità semi-indipendente pensata per chi vuole comfort, privacy e un\'immersione autentica nella giungla.',
    description_en: 'A two-story villa directly overlooking the village pool, with a private kitchen, dining area, and bathroom on the ground floor. The second floor offers an outdoor lounge and a spacious bedroom with a King-size bed and a Queen-size sofa bed. A semi-detached unit designed for those seeking comfort, privacy, and an authentic jungle experience.',
    description_th: 'วิลล่าสองชั้นที่ตั้งอยู่ติดกับสระว่ายน้ำ ชั้นล่างมีครัวส่วนตัว พื้นที่รับประทานอาหาร และห้องน้ำ ชั้นสองเปิดรับลมพร้อมพื้นที่นั่งเล่นกลางแจ้งและห้องนอนพร้อมเตียงคิงไซส์และโซฟาเบด เหมาะสำหรับผู้ที่ต้องการความสะดวกสบายและความเป็นส่วนตัว',
    description_de: 'Eine zweistöckige Villa mit direktem Blick auf den Pool, privater Küche, Essbereich und Badezimmer im Erdgeschoss. Im Obergeschoss erwarten Sie ein Outdoor-Wohnbereich und ein geräumiges Schlafzimmer mit King-Size-Bett und Queen-Size-Schlafsofa. Ideal für Komfort, Privatsphäre und echtes Dschungelflair.'
  },
  'Peace & Love Villa': {
    slug: 'peace-love-villa',
    category: 'VILLE',
    description: 'Situata di fronte alla piscina, questa villa indipendente vanta un\'ampia terrazza privata e una camera principale con letto King size e divano letto Queen adattabile. Cucina interna attrezzata, bagno privato con acqua calda e TV 40" Android TV completano ogni comfort. Perfetta per ospitare fino a quattro persone in un\'atmosfera rilassata e panoramica.',
    capacity: 4,
    baseGuests: 4,
    beds: '1 King Size + 1 Sofa Bed Queen',
    features: ['Equipped Kitchen', 'Pool Access', 'Hot Shower', 'WiFi', 'Android TV'],
    price: 2400,
    title_it: 'Peace & Love Villa',
    title_en: 'Peace & Love Villa',
    title_th: 'พีซ แอนด์ เลิฟ วิลล่า',
    title_de: 'Peace & Love Villa',
    description_it: 'Situata di fronte alla piscina, questa villa indipendente vanta un\'ampia terrazza privata e una camera principale con letto King size e divano letto Queen adattabile. Cucina interna attrezzata, bagno privato con acqua calda e TV 40" Android TV completano ogni comfort. Perfetta per ospitare fino a quattro persone in un\'atmosfera rilassata e panoramica.',
    description_en: 'Located directly facing the pool, this detached villa boasts a large private terrace and a master bedroom with a King-size bed and an adaptable Queen-size sofa bed. A fully equipped indoor kitchen, private bathroom with hot water, and a 40" Android TV complete every comfort. Perfect for up to four guests in a relaxed, scenic atmosphere.',
    description_th: 'วิลล่าส่วนตัวตั้งอยู่ตรงข้ามสระว่ายน้ำ โดดเด่นด้วยระเบียงส่วนตัวขนาดใหญ่ ห้องนอนหลักพร้อมเตียงคิงไซส์และโซฟาเบด ครัวในร่มพร้อมอุปกรณ์ครบ ห้องน้ำส่วนตัวน้ำอุ่น และทีวีแอนดรอยด์ 40 นิ้ว รองรับ 4 ท่านในบรรยากาศผ่อนคลาย',
    description_de: 'Diese freistehende Villa liegt direkt am Pool und bietet eine große private Terrasse sowie ein Hauptschlafzimmer mit King-Size-Bett und anpassbarem Queen-Size-Schlafsofa. Eine voll ausgestattete Innenküche, ein privates Badezimmer mit Warmwasser und ein 40"-Android-TV sorgen für allen Komfort. Ideal für bis zu vier Personen.'
  },
  'Villa Penthouse': {
    slug: 'villa-penthouse',
    category: 'VILLE',
    description: 'La Penthouse Villa è la sistemazione più esclusiva del villaggio, con camera padronale King size, bagno privato e salotto separato con secondo bagno e divano letto King. Una cucina outdoor, TV 40" Android TV e un giardino privato completano lo spazio per la massima privacy. La scelta ideale per chi cerca il lusso assoluto immerso nella natura tropicale.',
    capacity: 4,
    baseGuests: 4,
    beds: '1 King Size + 1 Sofa Bed King',
    features: ['Outdoor Kitchen', 'Pool Access', 'Private Garden', '2 Bathrooms', 'Android TV'],
    price: 2400,
    title_it: 'Villa Penthouse',
    title_en: 'Villa Penthouse',
    title_th: 'เพนท์เฮาส์ วิลล่า',
    title_de: 'Villa Penthouse',
    description_it: 'La Penthouse Villa è la sistemazione più esclusiva del villaggio, con camera padronale King size, bagno privato e salotto separato con secondo bagno e divano letto King. Una cucina outdoor, TV 40" Android TV e un giardino privato completano lo spazio per la massima privacy. La scelta ideale per chi cerca il lusso assoluto immerso nella natura tropicale.',
    description_en: 'The Penthouse Villa is the most exclusive accommodation in the village, featuring a master bedroom with a King-size bed, private bathroom, and a separate living room with a second bathroom and a King-size sofa bed. An outdoor kitchen, 40" Android TV, and a private garden ensure ultimate privacy in tropical nature.',
    description_th: 'เพนท์เฮาส์ วิลล่า คือที่พักสุดหรูและเป็นส่วนตัวที่สุดในวิลเลจ มีห้องนอนหลักพร้อมเตียงคิงไซส์ ห้องน้ำในตัว ห้องนั่งเล่นแยกส่วนพร้อมห้องน้ำที่สอง โซฟาเบดคิงไซส์ ครัวกลางแจ้ง ทีวีแอนดรอยด์ 40 นิ้ว และสวนส่วนตัว เหมาะสำหรับผู้ที่มองหาความหรูหราท่ามกลางธรรมชาติ',
    description_de: 'Die Penthouse Villa ist die exklusivste Unterkunft des Dorfes. Sie verfügt über ein Hauptschlafzimmer mit King-Size-Bett, privates Badezimmer und ein separates Wohnzimmer mit zweitem Bad und King-Size-Schlafsofa. Eine Outdoor-Küche, ein 40"-Android-TV und ein privater Garten bieten maximale Privatsphäre inmitten tropischer Natur.'
  },
  'Yellow Bungalow': {
    slug: 'yellow-bungalow',
    category: 'BUNGALOW',
    description: 'Il Yellow Bungalow è la cupola più spaziosa del villaggio, immersa in un giardino con fiori vibranti, alberi da frutto, buceri e sunbirds. Cucina privata, soggiorno, sala pranzo, letto King, bagno caldo, frigo e ventilatore garantiscono il massimo del comfort. Un angolo dall\'anima sognante, perfetto per vivere la giungla con assoluta comodità.',
    capacity: 3,
    baseGuests: 2,
    beds: '1 King Size + 1 Extra Single',
    features: ['Private Kitchen', 'Hot Shower', 'Fridge', 'Fan', 'Private Dining'],
    price: 1800,
    title_it: 'Yellow Bungalow',
    title_en: 'Yellow Bungalow',
    title_th: 'เยลโลว์ บังกะโล',
    title_de: 'Gelber Bungalow',
    description_it: 'Il Yellow Bungalow è la cupola più spaziosa del villaggio, immersa in un giardino con fiori vibranti, alberi da frutto, buceri e sunbirds. Cucina privata, soggiorno, sala pranzo, letto King, bagno caldo, frigo e ventilatore garantiscono il massimo del comfort. Un angolo dall\'anima sognante, perfetto per vivere la giungla con assoluta comodità.',
    description_en: 'The Yellow Bungalow is the most spacious dome in the village, nestled in a garden of vibrant flowers, fruit trees, hornbills, and sunbirds. A private kitchen, living area, dining space, King-size bed, hot shower, fridge, and fan deliver absolute comfort. A dreamy retreat perfect for experiencing the jungle in full style.',
    description_th: 'เยลโลว์ บังกะโล คือบังกะโลทรงโดมที่กว้างขวางที่สุดในวิลเลจ โอบล้อมด้วยสวนดอกไม้สวยงามและไม้ผล ที่คุณสามารถชมนกเงือกและนกกินปลีได้ทุกวัน ภายในมีครัวส่วนตัว ห้องนั่งเล่น พื้นที่ทานข้าว เตียงคิงไซส์ น้ำอุ่น ตู้เย็น และพัดลม สมบูรณ์แบบสำหรับการพักผ่อนท่ามกลางธรรมชาติ',
    description_de: 'Der Yellow Bungalow ist der geräumigste Kuppelbungalow des Dorfes, eingebettet in einen Garten mit bunten Blumen, Obstbäumen, Nashornvögeln und Nektarvögeln. Eigene Küche, Wohn- und Essbereich, King-Size-Bett, Warmwasserdusche, Kühlschrank und Ventilator bieten erstklassigen Komfort inmitten der tropischen Natur.'
  },
  'Red Bungalow': {
    slug: 'red-bungalow',
    category: 'BUNGALOW',
    description: 'Il Red Bungalow a cupola è avvolto da un giardino lussureggiante con fauna tropicale da scoprire direttamente dal tuo tavolo esterno privato. Letto King, bagno caldo, frigo/bar e ventilatore offrono tutto il necessario per un soggiorno rilassante. Un\'ambientazione fiabesca sospesa nella natura, capace di combinare intimità e totale riservatezza.',
    capacity: 3,
    baseGuests: 2,
    beds: '1 King Size + 1 Extra Single',
    features: ['Private Garden Table', 'Hot Shower', 'Fridge/Bar', 'Fan', 'Romantic Vibe'],
    price: 1800,
    title_it: 'Red Bungalow',
    title_en: 'Red Bungalow',
    title_th: 'เรด บังกะโล',
    title_de: 'Roter Bungalow',
    description_it: 'Il Red Bungalow a cupola è avvolto da un giardino lussureggiante con fauna tropicale da scoprire direttamente dal tuo tavolo esterno privato. Letto King, bagno caldo, frigo/bar e ventilatore offrono tutto il necessario per un soggiorno rilassante. Un\'ambientazione fiabesca sospesa nella natura, capace di combinare intimità e totale riservatezza.',
    description_en: 'The Red Bungalow is surrounded by a lush garden where you can spot tropical wildlife from your private outdoor table. Featuring a King-size bed, hot shower, mini-fridge/bar, and fan, it provides everything for a relaxing stay. A fairytale sanctuary that combines romance and absolute privacy.',
    description_th: 'เรด บังกะโล บังกะโลทรงโดมน่ารัก ล้อมรอบด้วยสวนเขียวขจี ให้คุณได้สังเกตสัตว์เขตร้อนจากโต๊ะกลางแจ้งส่วนตัว ภายในมีเตียงคิงไซส์ น้ำอุ่น ตู้เย็นมินิบาร์ และพัดลม บรรยากาศโรแมนติกและเป็นส่วนตัวอย่างแท้จริง',
    description_de: 'Der rote Kuppelbungalow ist von einem üppigen Garten umgeben, dessen tropische Tierwelt Sie direkt von Ihrem privaten Außentisch beobachten können. King-Size-Bett, Warmwasserdusche, Minibar und Ventilator bieten alles für einen erholsamen Aufenthalt in märchenhafter Kulisse.'
  },
  'Green Bungalow': {
    slug: 'green-bungalow',
    category: 'BUNGALOW',
    description: 'Il Green Bungalow a cupola è immerso in un giardino di fiori e alberi da frutto, dove avvistare buceri, scoiattoli e sunbirds dal tavolo esterno è la norma. Offre letto King, bagno caldo, frigo/bar e ventilatore in un ambiente intimo e riservato. Un rifugio d\'incanto che unisce atmosfera fiabesca e massimo comfort nella natura tropicale.',
    capacity: 3,
    baseGuests: 2,
    beds: '1 King Size + 1 Extra Single',
    features: ['Garden Views', 'Hot Shower', 'Fridge/Bar', 'Fan', 'Fauna Watching'],
    price: 1800,
    title_it: 'Green Bungalow',
    title_en: 'Green Bungalow',
    title_th: 'กรีน บังกะโล',
    title_de: 'Grüner Bungalow',
    description_it: 'Il Green Bungalow a cupola è immerso in un giardino di fiori e alberi da frutto, dove avvistare buceri, scoiattoli e sunbirds dal tavolo esterno è la norma. Offre letto King, bagno caldo, frigo/bar e ventilatore in un ambiente intimo e riservato. Un rifugio d\'incanto che unisce atmosfera fiabesca e massimo comfort nella natura tropicale.',
    description_en: 'The dome-shaped Green Bungalow is nestled in a garden of flowers and fruit trees, where spotting hornbills, squirrels, and sunbirds from your outdoor table is a daily pleasure. A King-size bed, hot shower, mini-fridge/bar, and fan in an intimate and reserved atmosphere. A charming retreat blending fairytale vibes with essential comfort.',
    description_th: 'กรีน บังกะโล บังกะโลทรงโดมในสวนไม้ผลและดอกไม้หลากสี ผ่อนคลายกับการชมนกเงือก กระรอก และนกกินปลีจากระเบียงส่วนตัว มีเตียงคิงไซส์ น้ำอุ่น ตู้เย็นมินิบาร์ และพัดลม บรรยากาศสงบและเป็นส่วนตัวท่ามกลางธรรมชาติ',
    description_de: 'Der grüne Kuppelbungalow liegt in einem Garten voller Blumen und Obstbäume, wo Sie Nashornvögel, Eichhörnchen und Nektarvögel direkt von Ihrem Außentisch beobachten können. King-Size-Bett, Warmwasserdusche, Minibar und Ventilator in privater, romantischer Atmosphäre.'
  },
  'Camel Tent Bungalow': {
    slug: 'camel-tent-bungalow',
    category: 'TENDE GLAMPING',
    description: 'Il Camel Glamping è una tenda esclusiva su piattaforma rialzata in legno, riparata da un tetto in foglie naturali per vivere la giungla in totale comfort. Offre un comodo letto, bagno privato con acqua calda e un patio con amache per il relax. L\'ambiente ideale per ascoltare i suoni della foresta e disconnettersi dalla quotidianità.',
    capacity: 2,
    baseGuests: 2,
    beds: '1 King Size',
    features: ['Raised Wooden Platform', 'Private Bathroom', 'Hot Shower', 'Hammocks', 'Forest Sounds'],
    price: 1400,
    title_it: 'Camel Tent Bungalow',
    title_en: 'Camel Tent Bungalow',
    title_th: 'คาเมล เท็นท์ บังกะโล',
    title_de: 'Camel Zelt Bungalow',
    description_it: 'Il Camel Glamping è una tenda esclusiva su piattaforma rialzata in legno, riparata da un tetto in foglie naturali per vivere la giungla in totale comfort. Offre un comodo letto, bagno privato con acqua calda e un patio con amache per il relax. L\'ambiente ideale per ascoltare i suoni della foresta e disconnettersi dalla quotidianità.',
    description_en: 'Camel Glamping features an exclusive safari-style tent on a raised wooden platform, sheltered by a natural thatch roof for a full jungle experience in comfort. A cozy bed, private bathroom with hot water, and a hammock patio await. The perfect setting to listen to the forest and truly disconnect.',
    description_th: 'คาเมล แกลมปิ้ง ประสบการณ์พักแรมสไตล์ซาฟารีบนยกพื้นไม้ มุงหลังคาด้วยใบจาก ให้คุณสัมผัสบรรยากาศป่าอย่างสะดวกสบาย มีเตียงนุ่มสบาย ห้องน้ำส่วนตัวน้ำอุ่น และระเบียงพร้อมเปลญวน ฟังเสียงธรรมชาติและพักผ่อนอย่างแท้จริง',
    description_de: 'Das Camel Glamping bietet ein exklusives Safari-Zelt auf erhöhter Holzplattform, geschützt durch ein traditionelles Blätterdach. Bequemes Bett, privates Bad mit Warmwasser und eine Terrasse mit Hängematten laden zum Entspannen ein – der perfekte Ort, um den Klängen des Waldes zu lauschen.'
  },
  'Lagoon Tent Bungalow': {
    slug: 'lagoon-tent-bungalow',
    category: 'TENDE GLAMPING',
    description: 'Il Laguna Glamping è un\'esclusiva tenda sollevata su pedana di legno, protetta da un tetto in foglie naturali per un\'immersione autentica nella giungla. Offre un comodo letto e un bagno privato con acqua calda, avvolti dai suoni della foresta in totale protezione. La scelta perfetta per chi vuole vivere la natura senza rinunciare al comfort essenziale.',
    capacity: 2,
    baseGuests: 2,
    beds: '1 King Size',
    features: ['Raised Wooden Platform', 'Private Bathroom', 'Hot Shower', 'Nature View', 'Thatch Roof'],
    price: 1400,
    title_it: 'Lagoon Tent Bungalow',
    title_en: 'Lagoon Tent Bungalow',
    title_th: 'ลากูน เท็นท์ บังกะโล',
    title_de: 'Lagoon Zelt Bungalow',
    description_it: 'Il Laguna Glamping è un\'esclusiva tenda sollevata su pedana di legno, protetta da un tetto in foglie naturali per un\'immersione autentica nella giungla. Offre un comodo letto e un bagno privato con acqua calda, avvolti dai suoni della foresta in totale protezione. La scelta perfetta per chi vuole vivere la natura senza rinunciare al comfort essenziale.',
    description_en: 'Lagoon Glamping offers a premium tent elevated on a wooden deck, sheltered by a natural thatch roof for a seamless connection with the jungle. A comfortable bed and private bathroom with hot water keep you cozy while surrounded by peaceful forest sounds. Ideal for travelers seeking nature with essential comfort.',
    description_th: 'ลากูน แกลมปิ้ง เต็นท์พิเศษบนยกพื้นไม้ มุงหลังคาใบจาก ให้คุณสัมผัสการแคมปิ้งในป่าอย่างแท้จริง มีเตียงสบาย ห้องน้ำส่วนตัวน้ำอุ่น ท่ามกลางเสียงธรรมชาติ เหมาะสำหรับผู้ที่ต้องการผจญภัยโดยไม่ละทิ้งความสะดวกสบาย',
    description_de: 'Das Lagoon Glamping bietet ein Premium-Zelt auf Holzdeck, geschützt durch ein Blätterdach für ein naturverbundenes Erlebnis. Bequemes Bett und eigenes Bad mit Warmwasser, umgeben von beruhigenden Dschungelklängen. Die ideale Wahl für alle, die Natur pur mit grundlegendem Komfort genießen möchten.'
  },
  'Internal Room': {
    slug: 'internal-room',
    category: 'THE HUB GUESTHOUSE',
    description: 'Camera interna del Guesthouse HUBit@, ideale per chi cerca privacy e concentrazione. Dotata di letto, bagno privato con acqua calda e accesso agli spazi comuni del co-living.',
    capacity: 2,
    baseGuests: 2,
    beds: '1 King Size',
    features: ['Private Bathroom', 'Hot Shower', 'WiFi 100 Mbps', 'Coworking Access', 'Shared Kitchen'],
    price: 800,
    title_it: 'Camera Interna',
    title_en: 'Internal Room',
    title_th: 'ห้องพักภายใน',
    title_de: 'Innenzimmer',
    description_it: 'Camera interna del Guesthouse HUBit@, ideale per chi cerca privacy e concentrazione. Dotata di letto, bagno privato con acqua calda e accesso agli spazi comuni del co-living.',
    description_en: 'Internal room at HUBit@ Guesthouse, ideal for guests seeking privacy and focus. Features a bed, private bathroom with hot water, and access to all co-living shared spaces.',
    description_th: 'ห้องพักภายในของ HUBit@ Guesthouse เหมาะสำหรับผู้ที่ต้องการความเป็นส่วนตัวและสมาธิ มีเตียง ห้องน้ำส่วนตัวน้ำอุ่น และสิทธิ์ใช้งานพื้นที่ส่วนกลางทั้งหมด',
    description_de: 'Innenzimmer im HUBit@ Guesthouse, ideal für Gäste, die Privatsphäre und Konzentration suchen. Mit Bett, privatem Bad mit Warmwasser und Zugang zu allen gemeinsamen Bereichen des Co-Livings.'
  },
  'Room 1': {
    slug: 'room-1',
    category: 'THE HUB GUESTHOUSE',
    description: 'La Room #1 di HUBit@ è pensata per nomadi digitali e famiglie che cercano comfort e connettività a Koh Phayam. Include letto King size, scrivania dedicata, bagno privato con acqua calda e balcone, con accesso a cucina comune e WiFi a 100 Mbps.',
    capacity: 3,
    baseGuests: 2,
    beds: '1 King Size + 1 Extra Single',
    features: ['Dedicated Desk', 'Private Balcony', 'Hot Shower', '100 Mbps WiFi', 'Shared Kitchen'],
    price: 1000,
    title_it: 'Camera 1',
    title_en: 'Room 1',
    title_th: 'ห้องพัก 1',
    title_de: 'Zimmer 1',
    description_it: 'La Room #1 di HUBit@ è pensata per nomadi digitali e famiglie che cercano comfort e connettività a Koh Phayam. Include letto King size, scrivania dedicata, bagno privato con acqua calda e balcone, con accesso a cucina comune e WiFi a 100 Mbps.',
    description_en: 'Room #1 at HUBit@ is designed for digital nomads and travelers seeking comfort and connectivity on Koh Phayam. Featuring a King-size bed, dedicated desk, private bathroom with hot water, and a balcony. Access to shared kitchen and 100 Mbps fiber WiFi included.',
    description_th: 'ห้องพัก 1 ที่ HUBit@ ออกแบบสำหรับดิจิทัลโนแมดและนักเดินทางที่ต้องการความสะดวกสบายและอินเทอร์เน็ตที่เสถียร มีเตียงคิงไซส์ โต๊ะทำงาน ห้องน้ำส่วนตัวน้ำอุ่น ระเบียง และสิทธิ์ใช้ครัวส่วนกลางและ WiFi 100 Mbps',
    description_de: 'Zimmer #1 im HUBit@ ist für digitale Nomaden und Reisende konzipiert, die Komfort und Konnektivität auf Koh Phayam suchen. King-Size-Bett, eigener Schreibtisch, Privatbad mit Warmwasser, Balkon sowie Gemeinschaftsküche und 100 Mbps Glasfaser-WLAN.'
  },
  'Room 2': {
    slug: 'room-2',
    category: 'THE HUB GUESTHOUSE',
    description: 'La Room #2 di HUBit@ unisce comfort moderno e produttività con letto King size, postazione di lavoro dedicata, bagno privato e balcone privato. Cucina comune attrezzata e connessione WiFi ultra-rapida a 100 Mbps.',
    capacity: 4,
    baseGuests: 2,
    beds: '1 King Size + 1 Sofa Bed King',
    features: ['Workstation', 'Private Balcony', 'Hot Shower', '100 Mbps WiFi', 'Shared Kitchen'],
    price: 1000,
    title_it: 'Camera 2',
    title_en: 'Room 2',
    title_th: 'ห้องพัก 2',
    title_de: 'Zimmer 2',
    description_it: 'La Room #2 di HUBit@ unisce comfort moderno e produttività con letto King size, postazione di lavoro dedicata, bagno privato e balcone privato. Cucina comune attrezzata e connessione WiFi ultra-rapida a 100 Mbps.',
    description_en: 'Room #2 at HUBit@ combines modern comfort and productivity with a King-size bed, dedicated workspace, private bathroom, and private balcony. Shared kitchen and 100 Mbps WiFi for optimal remote work.',
    description_th: 'ห้องพัก 2 ที่ HUBit@ ผสมผสานความสะดวกสบายและการทำงาน มีเตียงคิงไซส์ โต๊ะทำงาน ห้องน้ำส่วนตัว ระเบียงส่วนตัว ครัวส่วนกลาง และ WiFi 100 Mbps เหมาะสำหรับนักทำงานทางไกล',
    description_de: 'Zimmer #2 im HUBit@ verbindet modernen Komfort und Produktivität. King-Size-Bett, eigener Arbeitsplatz, Privatbad, Balkon, Gemeinschaftsküche und 100 Mbps WLAN – perfekt für Remote Work.'
  },
  'Room 3': {
    slug: 'room-3',
    category: 'THE HUB GUESTHOUSE',
    description: 'La Room #3 di HUBit@ offre un ambiente sereno con letto King size, scrivania ergonomica e balcone privato. Accesso a cucina comune e area coworking con WiFi a 100 Mbps inclusi.',
    capacity: 4,
    baseGuests: 2,
    beds: '1 King Size + 1 Sofa Bed Queen',
    features: ['Ergonomic Desk', 'Private Balcony', 'Hot Shower', '100 Mbps WiFi', 'Shared Kitchen'],
    price: 1000,
    title_it: 'Camera 3',
    title_en: 'Room 3',
    title_th: 'ห้องพัก 3',
    title_de: 'Zimmer 3',
    description_it: 'La Room #3 di HUBit@ offre un ambiente sereno con letto King size, scrivania ergonomica e balcone privato. Accesso a cucina comune e area coworking con WiFi a 100 Mbps inclusi.',
    description_en: 'Room #3 at HUBit@ offers a serene atmosphere with a King-size bed, ergonomic desk, and private balcony. Shared kitchen and coworking space with 100 Mbps WiFi included. Ideal for remote workers and families.',
    description_th: 'ห้องพัก 3 ที่ HUBit@ บรรยากาศสงบ มีเตียงคิงไซส์ โต๊ะทำงาน ระเบียง ครัวส่วนกลาง และพื้นที่โคเวิร์กกิ้งพร้อม WiFi 100 Mbps เหมาะสำหรับดิจิทัลโนแมดและครอบครัว',
    description_de: 'Zimmer #3 im HUBit@ bietet eine ruhige Atmosphäre mit King-Size-Bett, ergonomischem Schreibtisch und privatem Balkon. Gemeinschaftsküche und Coworking-Bereich mit 100 Mbps WLAN inklusive.'
  },
  'Room 4': {
    slug: 'room-4',
    category: 'THE HUB GUESTHOUSE',
    description: 'La Room #4 di HUBit@ è la scelta ideale per chi lavora da remoto. Letto King size, scrivania privata, bagno con acqua calda e balcone si uniscono all\'accesso a cucina comune e WiFi a 100 Mbps.',
    capacity: 4,
    baseGuests: 2,
    beds: '1 King Size + 1 Sofa Bed King',
    features: ['Private Desk', 'Private Balcony', 'Hot Shower', '100 Mbps WiFi', 'Shared Kitchen'],
    price: 1000,
    title_it: 'Camera 4',
    title_en: 'Room 4',
    title_th: 'ห้องพัก 4',
    title_de: 'Zimmer 4',
    description_it: 'La Room #4 di HUBit@ è la scelta ideale per chi lavora da remoto. Letto King size, scrivania privata, bagno con acqua calda e balcone si uniscono all\'accesso a cucina comune e WiFi a 100 Mbps.',
    description_en: 'Room #4 at HUBit@ is the ideal choice for remote workers. King-size bed, private desk, hot shower, and balcony combined with shared kitchen access and 100 Mbps WiFi.',
    description_th: 'ห้องพัก 4 ที่ HUBit@ เหมาะสำหรับผู้ทำงานทางไกล มีเตียงคิงไซส์ โต๊ะทำงาน น้ำอุ่น ระเบียง ครัวส่วนกลาง และ WiFi 100 Mbps',
    description_de: 'Zimmer #4 im HUBit@ ist die ideale Wahl für Remote Worker. King-Size-Bett, eigener Schreibtisch, Warmwasserdusche, Balkon, Gemeinschaftsküche und 100 Mbps WLAN.'
  },
  'Room 5': {
    slug: 'room-5',
    category: 'THE HUB GUESTHOUSE',
    description: 'La Room #5 di HUBit@ è il rifugio più intimo e silenzioso, ideale per coppie o nomadi solitari. Dispone di letto Queen size, scrivania, bagno con acqua calda e accesso all\'area coworking con WiFi a 100 Mbps. Senza balcone, compatta ed elegante.',
    capacity: 2,
    baseGuests: 2,
    beds: '1 Queen Size',
    features: ['Desk', 'Hot Shower', '100 Mbps WiFi', 'Coworking Access', 'Compact Design'],
    price: 1000,
    title_it: 'Camera 5',
    title_en: 'Room 5',
    title_th: 'ห้องพัก 5',
    title_de: 'Zimmer 5',
    description_it: 'La Room #5 di HUBit@ è il rifugio più intimo e silenzioso, ideale per coppie o nomadi solitari. Dispone di letto Queen size, scrivania, bagno con acqua calda e accesso all\'area coworking con WiFi a 100 Mbps. Senza balcone, compatta ed elegante.',
    description_en: 'Room #5 at HUBit@ is our most intimate and quiet retreat, perfect for couples or solo nomads seeking total focus. Queen-size bed, workspace, hot shower, and full coworking access with 100 Mbps WiFi. Compact and sleek, no balcony.',
    description_th: 'ห้องพัก 5 ที่ HUBit@ คือมุมพักผ่อนที่เงียบสงบที่สุด เหมาะสำหรับคู่รักหรือนักเดินทางเดี่ยวที่ต้องการสมาธิ มีเตียงควีนไซส์ โต๊ะทำงาน น้ำอุ่น และพื้นที่โคเวิร์กกิ้ง WiFi 100 Mbps (ไม่มีระเบียง)',
    description_de: 'Zimmer #5 im HUBit@ ist unser ruhigster Rückzugsort, ideal für Paare oder Solo-Nomaden. Queen-Size-Bett, Schreibtisch, Warmwasserdusche und Coworking-Zugang mit 100 Mbps WLAN. Kompakt und elegant, kein Balkon.'
  },
  'Lodge 1': {
    slug: 'lodge-1',
    category: 'THE HUB GUESTHOUSE',
    description: 'Il Lodge #1 è un appartamento premium a livelli per famiglie e digital nomad, con cucina e salotto privati. Il soggiorno con divano letto si trasforma all\'occorrenza in una seconda camera per 4 ospiti. Scendendo 5 gradini si scopre la camera principale con letto King, scrivania, bagno caldo e balcone.',
    capacity: 4,
    baseGuests: 4,
    beds: '1 King Size + 1 Sofa Bed King',
    features: ['Split-Level Layout', 'Private Kitchen & Living', 'Private Balcony', 'Desk', 'Coworking Access'],
    price: 1600,
    title_it: 'Lodge 1',
    title_en: 'Lodge 1',
    title_th: 'ลอดจ์ 1',
    title_de: 'Lodge 1',
    description_it: 'Il Lodge #1 è un appartamento premium a livelli per famiglie e digital nomad, con cucina e salotto privati. Il soggiorno con divano letto si trasforma all\'occorrenza in una seconda camera per 4 ospiti. Scendendo 5 gradini si scopre la camera principale con letto King, scrivania, bagno caldo e balcone.',
    description_en: 'Lodge #1 is a premium split-level apartment for families and digital nomads, featuring a private kitchen and living room. The upper lounge with sofa bed can become a second bedroom for up to 4 guests. Five steps down leads to the master bedroom with King-size bed, workspace, private bathroom, and balcony.',
    description_th: 'ลอดจ์ 1 อพาร์ตเมนต์สไตล์ลอฟท์พรีเมียม สำหรับครอบครัวและดิจิทัลโนแมด มีครัวและห้องนั่งเล่นส่วนตัว โซฟาเบดที่ปรับเป็นห้องนอนที่สองได้ รองรับถึง 4 ท่าน เดินลง 5 ขั้นจะพบห้องนอนหลักพร้อมเตียงคิงไซส์ โต๊ะทำงาน ห้องน้ำส่วนตัว และระเบียง',
    description_de: 'Lodge #1 ist ein erstklassiges Split-Level-Apartment für Familien und digitale Nomaden, mit privater Küche und Wohnbereich. Der Sofabereich kann als zweites Schlafzimmer für 4 Gäste genutzt werden. Fünf Stufen hinunter führen zum Hauptschlafzimmer mit King-Size-Bett, Schreibtisch, Privatbad und Balkon.'
  },
  'Lodge 2': {
    slug: 'lodge-2',
    category: 'THE HUB GUESTHOUSE',
    description: 'Il Lodge #2 è un appartamento premium a livelli per famiglie e digital nomad, con cucina e salotto privati. Il soggiorno con divano letto si trasforma all\'occorrenza in una seconda camera per 4 ospiti. Scendendo 5 gradini si scopre la camera principale con letto King, scrivania, bagno caldo e balcone.',
    capacity: 4,
    baseGuests: 4,
    beds: '1 King Size + 1 Sofa Bed King',
    features: ['Split-Level Layout', 'Private Kitchen & Living', 'Private Balcony', 'Desk', 'Coworking Access'],
    price: 1600,
    title_it: 'Lodge 2',
    title_en: 'Lodge 2',
    title_th: 'ลอดจ์ 2',
    title_de: 'Lodge 2',
    description_it: 'Il Lodge #2 è un appartamento premium a livelli per famiglie e digital nomad, con cucina e salotto privati. Il soggiorno con divano letto si trasforma all\'occorrenza in una seconda camera per 4 ospiti. Scendendo 5 gradini si scopre la camera principale con letto King, scrivania, bagno caldo e balcone.',
    description_en: 'Lodge #2 is a premium split-level apartment for families and digital nomads, featuring a private kitchen and living room. The upper lounge with sofa bed can become a second bedroom for up to 4 guests. Five steps down leads to the master bedroom with King-size bed, workspace, private bathroom, and balcony.',
    description_th: 'ลอดจ์ 2 อพาร์ตเมนต์สไตล์ลอฟท์พรีเมียม สำหรับครอบครัวและดิจิทัลโนแมด มีครัวและห้องนั่งเล่นส่วนตัว โซฟาเบดที่ปรับเป็นห้องนอนที่สองได้ รองรับถึง 4 ท่าน เดินลง 5 ขั้นจะพบห้องนอนหลักพร้อมเตียงคิงไซส์ โต๊ะทำงาน ห้องน้ำส่วนตัว และระเบียง',
    description_de: 'Lodge #2 ist ein erstklassiges Split-Level-Apartment für Familien und digitale Nomaden, mit privater Küche und Wohnbereich. Der Sofabereich kann als zweites Schlafzimmer für 4 Gäste genutzt werden. Fünf Stufen hinunter führen zum Hauptschlafzimmer mit King-Size-Bett, Schreibtisch, Privatbad und Balkon.'
  }
};

// Octorate IDs for live availability checking
const octorateIds: Record<string, number> = {
  'Jungle Villa': 529784,
  'Jungle Villa Left': 495807,
  'Jungle Villa Right': 495980,
  'Peace & Love Villa': 495566,
  'Villa Penthouse': 449348,
  'Yellow Bungalow': 449385,
  'Red Bungalow': 449422,
  'Green Bungalow': 449668,
  'Camel Tent Bungalow': 449675,
  'Lagoon Tent Bungalow': 449674,
  'Room 1': 449678,
  'Room 2': 449684,
  'Room 3': 449699,
  'Room 4': 449724,
  'Room 5': 449730,
  'Internal Room': 449742,
  'Lodge 1': 449736,
  'Lodge 2': 923905
};

// Preferred display order
const PREFERRED_ORDER = [
  'Jungle Villa',
  'Peace & Love Villa',
  'Villa Penthouse',
  'Jungle Villa Left',
  'Jungle Villa Right',
  'Yellow Bungalow',
  'Red Bungalow',
  'Green Bungalow',
  'Camel Tent Bungalow',
  'Lagoon Tent Bungalow',
  'Room 1',
  'Room 2',
  'Room 3',
  'Room 4',
  'Room 5',
  'Internal Room',
  'Lodge 1',
  'Lodge 2'
];

let cachedAccommodations: EnrichedAccommodation[] | null = null;

export async function fetchAccommodations(bypassCache = false): Promise<EnrichedAccommodation[]> {
  if (cachedAccommodations && !bypassCache) {
    return cachedAccommodations;
  }

  // Query Supabase selecting 'id', 'name', and 'slug'
  const { data: dbItems, error: dbError } = await publicSupabase
    .from('accommodations')
    .select('id, name, slug')
    .order('name');

  if (dbError) {
    console.error('Error fetching accommodations from Supabase:', dbError);
    throw dbError;
  }

  if (!dbItems) {
    return [];
  }

  // Map each DB item to a promise so we fetch storage images concurrently
  const promises = (dbItems as DbAccommodation[]).map(async (item) => {
    const metadata = ROOM_METADATA[item.name];
    if (!metadata) {
      console.warn(`No metadata found for accommodation name: ${item.name}`);
      return null;
    }

    const folder = item.slug;
    let images: string[] = [];

    try {
      const { data: files, error: storageError } = await publicSupabase.storage
        .from('accommodations')
        .list(folder, { sortBy: { column: 'name', order: 'asc' } });

      if (!storageError && files) {
        images = files
          .filter(file => file.id !== null) // only files
          .map(file => {
            const { data } = publicSupabase.storage
              .from('accommodations')
              .getPublicUrl(`${folder}/${file.name}`);

            const publicUrl = data.publicUrl;
            // Optimize image size and format dynamically using wsrv.nl proxy
            return `https://wsrv.nl/?url=${encodeURIComponent(publicUrl)}&w=800&output=webp&q=80`;
          });
      }
    } catch (err) {
      console.error(`Error listing storage images for folder ${folder}:`, err);
    }

    return {
      id: item.id,
      slug: metadata.slug,
      name: item.name,
      title: item.name,
      category: metadata.category,
      description: metadata.description,
      capacity: metadata.capacity,
      baseGuests: metadata.baseGuests,
      maxExtraGuests: metadata.capacity - metadata.baseGuests,
      beds: metadata.beds,
      features: metadata.features,
      base_price_high: metadata.price,
      base_price_low: Math.round(metadata.price * 0.25),
      octorateId: octorateIds[item.name],
      images,
      isLive: false, // Will be set in RoomGrid.tsx
      // Multilingual fields from ROOM_METADATA
      title_it: metadata.title_it,
      title_en: metadata.title_en,
      title_th: metadata.title_th,
      title_de: metadata.title_de,
      description_it: metadata.description_it,
      description_en: metadata.description_en,
      description_th: metadata.description_th,
      description_de: metadata.description_de,
    } as EnrichedAccommodation;
  });

  const results = await Promise.all(promises);
  const enrichedList = results.filter((item): item is EnrichedAccommodation => item !== null);

  // Sort the enrichedList by their position in PREFERRED_ORDER
  enrichedList.sort((a, b) => {
    const indexA = PREFERRED_ORDER.indexOf(a.name);
    const indexB = PREFERRED_ORDER.indexOf(b.name);

    const valA = indexA !== -1 ? indexA : 999;
    const valB = indexB !== -1 ? indexB : 999;

    if (valA !== valB) {
      return valA - valB;
    }
    return a.name.localeCompare(b.name);
  });

  cachedAccommodations = enrichedList;
  return enrichedList;
}
