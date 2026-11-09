import { createClient } from "@supabase/supabase-js";
import { getActiveRulesPromptContext } from "./concierge-memory.js";
import { checkOctorateLiveAvailability, LiveAvailabilityResult } from "./octorate-live-checker.js";
import { VILLAGE_MASTER_DATA } from "./village-site-data.js";

/**
 * AI Booking Concierge & Smart Calendar Assistant for Flower Power Village (Koh Phayam)
 * 
 * ARCHITETTURA RIGOROSA (DIRETTIVA RED):
 * 1. Logica di Business 100% Deterministica a Codice (0 Token):
 *    - Prezzi, date, calcolo notti, alloggi, link diretti (/52-jungle-villa, /11-yellow-bungalow, ecc.)
 *    - Dotazioni e tariffe A/C (portatili 400฿/u con consumo consigliato vs fissi 500฿/giorno neutro)
 *    - Sconti progressivi sul sito web (-10% diretto, -15% oltre 14 notti, -20% oltre 30 notti)
 *    - Termini di pagamento (30% caparra carta/paypal, 100% rimborso fino a 14 giorni prima)
 *    - Soggiorno minimo stagionale contestualizzato (5 notti alta stagione, 2 notti bassa, eccezione buchi)
 *    - Disponibilità PMS live da Octorate
 * 2. DeepSeek è Esclusivamente un Traduttore Linguistico Multilingua:
 *    - Zero iniezione di database massivo, schede alloggi o listini nel prompt di sintesi
 *    - Riceve solo il messaggio pre-compilato e traduce fedelmente preservando numeri, prezzi e link URL.
 */

export interface BookingInquiryResult {
  detectedLanguage: string; // 'IT' | 'EN' | 'DE' | 'FR' | 'TH' | 'ES' | 'RU' | 'NL' | string;
  guestName: string | null;
  checkInDate: string | null; // 'YYYY-MM-DD'
  checkOutDate: string | null; // 'YYYY-MM-DD'
  targetMonth: string; // 'YYYY-MM'
  numNights: number | null;
  numGuests: number | null;
  numAdults: number | null;
  numChildren: number | null;
  requestedAccommodation: string | null; // 'villa' | 'bungalow' | 'tent' | 'internal' | 'any' | string
  accommodationSlug: string | null; // e.g. 'penthouse-villa', 'red-bungalow', 'camel-tent', etc.
  politeReplyWhatsApp: string; // Testo pronto per WhatsApp / chat, caldo, educato, con link al calendario
  politeReplyEmail: string; // Versione email più formale e dettagliata con oggetto
  emailSubject: string; // Oggetto suggerito per email
  shortSummary: string; // Sintesi in italiano per il gestore
  calendarUrl: string; // Link diretto generato con tutti i parametri
  isTravelLogistics?: boolean;
  livePms?: {
    checked: boolean;
    availableCount: number;
    occupiedCount: number;
    availableNames: string[];
    occupiedNames: string[];
  } | null;
}

export interface ProcessBookingInquiryOptions {
  text: string;
  sourceLangHint?: string;
  currentDate?: Date;
}

export interface RefineReplyOptions {
  originalInquiry: string;
  currentReply: string;
  userFeedback: string;
  guestName?: string | null;
  accommodationSlug?: string | null;
  calendarUrl?: string;
}

export interface RefinedReplyResult {
  refinedWhatsApp: string;
  refinedEmail: string;
  suggestedRuleTitle: string;
  suggestedRuleContent: string;
  summaryOfChanges: string;
  isTravelLogistics?: boolean;
}

export interface DeterministicTemplateParams {
  guestName: string | null;
  detectedLanguage: string;
  checkInDate: string | null;
  checkOutDate: string | null;
  targetMonth: string;
  numNights: number | null;
  numGuests: number | null;
  numAdults: number | null;
  numChildren: number | null;
  requestedAccommodation: string | null;
  accommodationSlug: string | null;
  calendarUrl: string;
  livePms?: LiveAvailabilityResult | null;
  userInquiryText: string;
}

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Normalizza lo slug di un alloggio se menzionato nella richiesta
 */
function normalizeAccommodationSlug(nameOrType?: string | null): string | null {
  if (!nameOrType) return null;
  const s = nameOrType.toLowerCase().trim();
  if (s.includes('penthouse')) return 'penthouse-villa';
  if (s.includes('peace') || s.includes('love')) return 'peace-and-love-villa';
  if (s.includes('jungle') && s.includes('left')) return 'jungle-left-villa';
  if (s.includes('jungle') && s.includes('right')) return 'jungle-right-villa';
  if (s.includes('jungle')) return 'jungle-villa';
  if (s.includes('red')) return 'red-bungalow';
  if (s.includes('yellow')) return 'yellow-bungalow';
  if (s.includes('green')) return 'green-bungalow';
  if (s.includes('camel')) return 'camel-tent';
  if (s.includes('lagoon')) return 'lagoon-tent';
  if (s.includes('internal')) return 'internal-room';
  if (s.includes('fake')) return 'fake-bungalow';
  return null;
}

/**
 * Rileva se il testo verte principalmente o parzialmente su trasporti, motoscafi, barche, taxi o logistica di viaggio
 */
export function isTransportOrTravelInquiry(text?: string | null): boolean {
  if (!text) return false;
  const s = text.toLowerCase();
  const transportKeywords = [
    'come arriv', 'how to get', 'how do i get', 'how to reach', 'how can we reach',
    'traghetto', 'traghetti', 'ferry', 'ferries', 'boat', 'barca', 'barche',
    'motoscafo', 'motoscafi', 'speedboat', 'speedboats',
    'mr gong', 'mr. gong', 'gong', 'taxi', 'transfer', 'transfert', 'navetta',
    'aeroporto', 'airport', 'ranong', 'unx', 'dmk', 'don mueang', 'airasia',
    'bus', 'choke anan', 'minivan', 'stazione bus', 'bus station',
    'molo', 'pier', 'saphan pla', 'pak nam', 'tambon', 'tumbol', 'grab', 'driver',
    'khao lak', 'khoa lak', 'phuket',
    'tuk tuk', 'tuk-tuk', 'scooter', 'motorino',
    'orari barche', 'orario barca', 'boat schedule', 'ferry schedule', 'last boat', 'ultima barca'
  ];
  return transportKeywords.some(kw => s.includes(kw));
}

/**
 * Rileva se il testo richiede o cita esplicitamente la ricerca di alloggi, camere, bungalow o notti
 */
export function isAccommodationInquiry(text?: string | null): boolean {
  if (!text) return false;
  const s = text.toLowerCase();
  const accommKeywords = [
    'notte', 'notti', 'night', 'nights', 'soggiorn', 'camera', 'camere',
    'room', 'rooms', 'bungalow', 'villa', 'tenda', 'tent', 'guesthouse', 'guest house',
    'dormire', 'prenotare', 'booking room', 'disponibil', 'available',
    'posto per dormire', 'alloggio', 'alloggi', 'prezzo a notte', 'price per night', 'penthouse'
  ];
  return accommKeywords.some(kw => s.includes(kw));
}

/**
 * Rileva se il cliente ha già prenotato o sta per effettuare il check-in (ospite confermato in arrivo)
 */
export function isAlreadyBookedOrArriving(text?: string | null): boolean {
  if (!text) return false;
  const s = text.toLowerCase();
  return (
    s.includes('checking in with you') ||
    s.includes('checking in tomorrow') ||
    s.includes('checking in today') ||
    s.includes('check in with you') ||
    s.includes('check-in with you') ||
    s.includes('already booked') ||
    s.includes('have a booking') ||
    s.includes('have a reservation') ||
    s.includes('already have a reservation') ||
    s.includes('booked with you') ||
    s.includes('arriving tomorrow') ||
    s.includes('arriving today') ||
    s.includes('arriviamo domani') ||
    s.includes('arriveremo domani') ||
    s.includes('abbiamo prenotato') ||
    s.includes('nostra prenotazione') ||
    s.includes('il nostro soggiorno') ||
    s.includes('staying with you') ||
    s.includes('coming tomorrow')
  );
}

/**
 * Costruisce l'URL completo del calendario live di Flower Power Village
 */
export function buildVillageCalendarUrl(params: {
  targetMonth?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  roomSlug?: string | null;
  lang?: string | null;
  view?: 'timeline' | 'blocks' | string | null;
}): string {
  const baseUrl = 'https://www.flowerpowervillage.com/calendar';
  const q = new URLSearchParams();

  // Vista timeline panoramica a righe
  q.set('view', params.view || 'timeline');

  if (params.targetMonth && /^\d{4}-\d{2}$/.test(params.targetMonth)) {
    q.set('month', params.targetMonth);
  } else if (params.checkIn && /^\d{4}-\d{2}/.test(params.checkIn)) {
    q.set('month', params.checkIn.slice(0, 7));
  }

  if (params.checkIn && /^\d{4}-\d{2}-\d{2}$/.test(params.checkIn)) {
    q.set('from', params.checkIn);
  }

  if (params.checkOut && /^\d{4}-\d{2}-\d{2}$/.test(params.checkOut)) {
    q.set('to', params.checkOut);
  }

  if (params.roomSlug) {
    q.set('room', params.roomSlug);
  }

  const normalizedLang = (params.lang || 'EN').toUpperCase();
  if (['IT', 'EN', 'TH', 'DE'].includes(normalizedLang)) {
    q.set('lang', normalizedLang);
  } else {
    q.set('lang', 'EN');
  }

  const qs = q.toString();
  return qs ? `${baseUrl}?${qs}` : baseUrl;
}

/**
 * Recupera la chiave API di DeepSeek dall'environment o con fallback su Supabase
 */
async function getDeepSeekApiKey(): Promise<string | null> {
  const direct = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
  if (direct && direct.trim()) return direct.trim();

  try {
    const client = getSupabaseClient();
    if (client) {
      const { data } = await client
        .from('telegram_config')
        .select('bot_token, chat_id')
        .eq('id', 'deepseek_api_key')
        .maybeSingle();
      if (data?.bot_token && data.bot_token.trim()) return data.bot_token.trim();
      if (data?.chat_id && data.chat_id.trim()) return data.chat_id.trim();
    }
  } catch (e) {
    console.warn('[getDeepSeekApiKey] Error fetching from Supabase fallback:', e);
  }

  return null;
}

/**
 * Recupera il prompt personalizzato salvato dal manager nella Dashboard
 */
export async function getCustomSystemPrompt(): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  try {
    const { data } = await client
      .from('telegram_config')
      .select('chat_id')
      .eq('id', 'concierge_custom_prompt')
      .maybeSingle();
    if (data?.chat_id && data.chat_id.trim()) {
      return data.chat_id.trim();
    }
  } catch (e) {
    console.warn('[getCustomSystemPrompt] Fallback warning:', e);
  }
  return null;
}

/**
 * Salva o aggiorna il prompt personalizzato del Concierge da Dashboard
 */
export async function saveCustomSystemPrompt(promptText: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;
  try {
    const { error } = await client
      .from('telegram_config')
      .upsert({
        id: 'concierge_custom_prompt',
        bot_token: 'custom_prompt',
        chat_id: promptText.trim(),
        updated_at: new Date().toISOString()
      });
    return !error;
  } catch (e) {
    console.error('[saveCustomSystemPrompt] Error saving:', e);
    return false;
  }
}

/**
 * =========================================================================
 * COMPILATORE DETERMINISTICO DI RISPOSTE CONCIERGE (0 TOKEN - ZERO NOISE)
 * =========================================================================
 * Compila il messaggio ufficiale del resort con accuratezza matematica,
 * integrando disponibilità PMS live, soggiorno minimo contestuale, alloggi idonei,
 * regole A/C ed extra opzionali, senza inserire rumore non richiesto (culle, sconti 30gg, menù pizze).
 */
export function compileDeterministicConciergeReply(params: DeterministicTemplateParams): {
  emailText: string;
  whatsAppText: string;
  subject: string;
  summary: string;
} {
  const {
    guestName,
    checkInDate,
    checkOutDate,
    targetMonth,
    numNights,
    numGuests,
    numChildren,
    requestedAccommodation,
    calendarUrl,
    livePms,
    userInquiryText
  } = params;

  const inquiryLower = (userInquiryText || '').toLowerCase();

  // Se la richiesta è esclusivamente incentrata sui trasporti / come arrivare (senza richiesta camere)
  if (isTransportOrTravelInquiry(inquiryLower) && !isAccommodationInquiry(inquiryLower) && !checkInDate) {
    const travelGuideUrl = 'https://www.flowerpowervillage.com/village/how-to-get-here';
    const whatsAppText = [
      `Ciao ${guestName || ''}! 🌸🌴 Grazie per aver contattato Flower Power Village!`,
      '',
      '🧭 *Come Raggiungerci a Koh Phayam — Info Trasporti Ufficiali:*',
      '',
      '✈️ *1) Voli & Bus per Ranong:*',
      '• Voli diretti Thai AirAsia da Bangkok Don Mueang (DMK) a Ranong Airport (UNX) (~1h 15m).',
      '• Bus notturni Choke Anan Tour da Bangkok Sai Tai Mai a Ranong (~8-9h, 600–900 THB).',
      '',
      '🚖 *2) Trasferimento al Molo di Ranong (Saphan Pla Pier):*',
      '• *Dall\'Aeroporto di Ranong:* servizio taxi convenzionato con il nostro autista di fiducia **Mr. Gong** (200 THB/persona se in 2 o più, 300 THB per viaggiatori singoli). Ti attende all\'uscita con cartello nominativo ed emette i biglietti del motoscafo senza fare code.',
      '• *Dalla Stazione Bus:* songthaew rossi locali (20–30 THB) o taxi (150–200 THB) sempre disponibili sul piazzale.',
      '',
      '🚤 *3) Motoscafo Veloce (Speedboat) Ranong ➔ Koh Phayam:*',
      '• Traversata di circa 35–40 minuti, costo 350 THB a persona a tratta.',
      '• Corse frequenti dalle 08:00 alle 17:00 / 17:30 da Ranong.',
      '',
      '🛺 *4) Dal Molo di Koh Phayam al Resort (Buffalo Bay):*',
      '• Al molo dell\'isola troverai sempre tuk-tuk locali (200–250 THB a veicolo, 10 min) o noleggio scooter (150–250 THB/giorno).',
      '',
      '📖 *Abbiamo raccolto tutte le informazioni necessarie e sempre aggiornate (orari, consigli e mappe GPS) sulla nostra guida dedicata per viaggiare nel miglior modo possibile:*',
      travelGuideUrl,
      '',
      'Facci sapere quando atterri a Ranong o per qualsiasi altra domanda sul viaggio! 🌴✨'
    ].join('\n');

    const emailText = [
      guestName ? `Gentile ${guestName},` : 'Gentile Ospite,',
      '',
      'Grazie per averci contattato! Di seguito trovi tutte le informazioni ufficiali per raggiungere Flower Power Village a Koh Phayam in totale tranquillità 🌸🌴',
      '',
      '1) Arrivo a Ranong (Voli e Bus):',
      '• Voli diretti giornalieri Thai AirAsia da Bangkok Don Mueang (DMK) all\'aeroporto di Ranong (UNX) (circa 1h 15m).',
      '• Bus di linea e notturni Choke Anan Tour da Bangkok Southern Bus Terminal (Sai Tai Mai) alla stazione di Ranong (8-9h).',
      '',
      '2) Trasferimento al Molo di Ranong (Saphan Pla Pier):',
      '• Dall\'Aeroporto di Ranong (UNX): convenzione con il nostro fidato autista Mr. Gong (200 THB a persona se 2 o più, 300 THB per viaggiatori singoli). Mr. Gong ti attenderà all\'uscita del gate con un cartello nominativo ed emetterà in anticipo i biglietti della speedboat.',
      '• Dalla Stazione Bus: songthaew rossi (20-30 THB) o taxi (150-200 THB) pronti sul piazzale.',
      '',
      '3) Motoscafo Veloce (Speedboat Ranong ➔ Koh Phayam):',
      '• Traversata di circa 35-40 minuti. Costo fisso 350 THB a persona a tratta.',
      '• Partenze frequenti ogni ora/ora e mezza dalle 08:00 alle 17:00 / 17:30 da Ranong.',
      '',
      '4) Dal Molo di Koh Phayam al Resort (Buffalo Bay):',
      '• Al molo troverai sempre tuk-tuk locali (200-250 THB per veicolo, 10 minuti di tragitto) o noleggio scooter (150-250 THB/giorno).',
      '',
      'Tutti i contatti utili, consigli e mappe GPS sono consultabili sulla nostra pagina dedicata:',
      travelGuideUrl,
      '',
      'Restiamo a tua completa disposizione,',
      'Flower Power Village Team 🌸'
    ].join('\n');

    return {
      emailText,
      whatsAppText,
      subject: `How to reach Flower Power Village – Travel & Ferry Guide${guestName ? ` for ${guestName}` : ''}`,
      summary: `Informazioni ufficiali di viaggio, motoscafi e taxi Mr. Gong per ${guestName || 'ospite'}`
    };
  }

  const hasBaby = inquiryLower.includes('neonat') || inquiryLower.includes('bambin') || inquiryLower.includes('cull') || inquiryLower.includes('baby') || inquiryLower.includes('infant') || inquiryLower.includes('crib') || inquiryLower.includes('cot') || (numChildren && numChildren > 0);
  const wantsFood = inquiryLower.includes('pizza') || inquiryLower.includes('ristorant') || inquiryLower.includes('cibo') || inquiryLower.includes('mangiar') || inquiryLower.includes('restaurant') || inquiryLower.includes('food') || inquiryLower.includes('dinner') || inquiryLower.includes('lunch') || inquiryLower.includes('cena') || inquiryLower.includes('pranzo');
  const wantsBalcony = inquiryLower.includes('balcon') || inquiryLower.includes('terrazz') || inquiryLower.includes('guesthouse') || inquiryLower.includes('camera') || inquiryLower.includes('room');

  // 1. Verifica Soggiorno Minimo Stagionale Contestuale (Alta Stagione: 15 Dic - 31 Mar | Bassa/Media: 1 Apr - 14 Dic)
  const isHighSeason = (() => {
    if (!checkInDate && !targetMonth) return false;
    const dateStr = checkInDate || `${targetMonth}-01`;
    const md = dateStr.slice(5, 10); // 'MM-DD'
    return (md >= '12-15' && md <= '12-31') || (md >= '01-01' && md <= '03-31');
  })();

  const monthNamesIt: Record<string, string> = {
    '01': 'gennaio', '02': 'febbraio', '03': 'marzo', '04': 'aprile',
    '05': 'maggio', '06': 'giugno', '07': 'luglio', '08': 'agosto',
    '09': 'settembre', '10': 'ottobre', '11': 'novembre', '12': 'dicembre'
  };
  const monthStr = targetMonth ? targetMonth.slice(5, 7) : (checkInDate ? checkInDate.slice(5, 7) : '');
  const currentMonthLabel = monthNamesIt[monthStr] ? `nel mese di ${monthNamesIt[monthStr]}` : 'per il periodo indicato';

  let minStayText = '';
  if (isHighSeason) {
    minStayText = `Il nostro soggiorno minimo in Alta Stagione (15 Dic – 31 Mar) è di 5 notti consecutive (date singole/buchi tra prenotazioni prenotabili liberamente).`;
  } else if (checkInDate || targetMonth) {
    minStayText = `Il nostro soggiorno minimo in Bassa/Media Stagione (1 Apr – 14 Dic) è di 2 notti consecutive (date singole/buchi tra prenotazioni prenotabili liberamente).`;
  } else {
    minStayText = `Il nostro soggiorno minimo è di 5 notti consecutive in Alta Stagione (15 Dic – 31 Mar) e di 2 notti in Bassa/Media Stagione (1 Apr – 14 Dic), con eccezione per i buchi isolati prenotabili singolarmente.`;
  }

  // 2. Saluto
  const greeting = guestName ? `Gentile ${guestName},` : 'Gentile Ospite,';

  // 3. Narrazione Disponibilità da PMS Live Octorate (Verità Assoluta)
  let availabilityNarrative = '';
  if (livePms && livePms.hasLivePmsData && livePms.availableRooms.length > 0) {
    const names = livePms.availableRooms.map(r => r.name).join(', ');
    availabilityNarrative = `Verificando in tempo reale la nostra disponibilità su Octorate PMS, abbiamo alloggi liberi per le date richieste: ${names}.`;
  } else if (checkInDate && checkOutDate) {
    availabilityNarrative = `Per un soggiorno continuativo di ${numNights || ''} notti (${checkInDate} ➔ ${checkOutDate}), desideriamo essere trasparenti: al momento non abbiamo disponibilità consecutiva per l'intero periodo nella stessa unità. Tuttavia ci sono diverse date e buchi liberi tra le prenotazioni esistenti.`;
  } else {
    availabilityNarrative = `Siamo a disposizione per verificare la disponibilità: puoi consultare il calendario interattivo in tempo reale con tutte le caselle aggiornate.`;
  }

  // 4. Selezione Alloggi Idonei (Senza rumore!)
  let accommText = '';
  const reqLower = (requestedAccommodation || '').toLowerCase();
  const isVilla = reqLower.includes('villa');

  if (wantsBalcony || reqLower.includes('guesthouse') || reqLower.includes('camera') || reqLower.includes('room')) {
    accommText = `Alloggi consigliati (Camere Guesthouse con spazio esterno):
• Guesthouse Room 1: Letto King Size (+ eventuale letto singolo extra), spazioso terrazzo privato con tavolo e sedie.
• Guesthouse Room 2: Letto King Size, terrazzino piccolo privato.
• Guesthouse Room 3: Letto King Size, spazioso terrazzo privato con tavolo e sedie.
• Guesthouse Room 4: Letto King Size, spazioso terrazzo privato con tavolo e sedie affacciato sul giardino.
(Nota informativa: Guesthouse Room 5 non dispone di terrazzo. I mini appartamenti Lodge 1 e Lodge 2 sono attualmente in allestimento/costruzione e non disponibili).`;
  } else if (numGuests && numGuests >= 5) {
    // Grandi gruppi o 2 famiglie (5-8 pax): Jungle Villa Intera (Left + Right)
    accommText = `Alloggio ideale per 2 famiglie / grandi gruppi (fino a 8 persone):
• Jungle Villa Intera (4+4 pax, composta dall'unione delle 2 ali gemelle Jungle Left + Jungle Right con 2 ingressi, 2 camere su 2 piani, 2 bagni, 2 cucine e 2 salotti)
  https://www.flowerpowervillage.com/52-jungle-villa`;
  } else if (isVilla || (numGuests && numGuests >= 4)) {
    accommText = `Alloggi consigliati per famiglie (fino a 4 persone):
• Villa Penthouse (4 pax, 2 camere, 2 bagni completi, giardino privato)
  https://www.flowerpowervillage.com/22-villa-penthouse
• Jungle Villa Left (2+2 pax, 1 King + 1 Divano Letto Queen, cucina e salotto)
  https://www.flowerpowervillage.com/53-jungle-villa-left
• Jungle Villa Right (2+2 pax, 1 King + 1 Divano Letto Queen, cucina e salotto)
  https://www.flowerpowervillage.com/54-jungle-villa-right
• Peace & Love Villa (2+2 pax, terrazza sulla piscina con amaca)
  https://www.flowerpowervillage.com/51-villa-peace-love`;
  } else {
    accommText = `Alloggi consigliati:
• Yellow Bungalow (cucina privata e lounge tropicale)
  https://www.flowerpowervillage.com/11-yellow-bungalow
• Red Bungalow
  https://www.flowerpowervillage.com/12-red-bungalow
• Green Bungalow
  https://www.flowerpowervillage.com/13-green-bungalow`;
  }

  // Culla inclusa SOLO se richiesta o con neonati
  const babyText = hasBaby
    ? '\n👶 Per i più piccoli, su richiesta è disponibile una culla per neonati (100–200 THB/notte) oppure possono dormire nel lettone con i genitori.'
    : '';

  // 5. Aria Condizionata & Colazione (Inclusi SOLO se chiesti esplicitamente dal cliente!)
  const wantsAc = inquiryLower.includes('aria') || inquiryLower.includes('condizionat') || inquiryLower.includes('a/c') || inquiryLower.includes('ac ') || inquiryLower.includes('climatizz');
  const wantsBreakfast = inquiryLower.includes('colazion') || inquiryLower.includes('breakfast') || inquiryLower.includes('bakery') || inquiryLower.includes('caffè') || inquiryLower.includes('caffe');

  const acText = wantsAc
    ? `\n❄️ Aria Condizionata:\nPresente in tutte le sistemazioni. Al momento della prenotazione sul sito web potrai scegliere liberamente l'opzione preferita (inclusa forfettaria o a consumo con contatore).\n`
    : '';

  const breakfastText = wantsBreakfast
    ? `\n☕ Colazione & Bakery:\nServita alla carta ogni mattina presso la nostra Bakery (caffè espresso, cappuccino e cornetti caldi). Sul sito potrai anche selezionarla come extra durante la prenotazione.\n`
    : '';

  // 6. Sconti Prenotazione Diretta (Zero Noise: niente sconti 30gg per soggiorni brevi!)
  let discountsText = `💰 Tariffe & Sconto Diretto Garantito:
Prenotando direttamente tramite il nostro sito web si applica automaticamente lo sconto esclusivo del 10% (15% pre-booking per la Guesthouse) senza bisogno di coupon.`;
  if (numNights && numNights >= 30) {
    discountsText += '\n• Sconto Long Stay applicato oltre 30 notti: -20% al checkout.';
  } else if (numNights && numNights >= 14) {
    discountsText += '\n• Sconto Long Stay applicato oltre 14 notti: -15% al checkout.';
  }

  // 7. Ristorante / Cibo (Incluso SOLO se richiesto)
  const foodSection = wantsFood
    ? `\n🍕 Ristorante & Pizzeria Italiana in loco:
La nostra autentica Pizza cotta su pietra con ingredienti 100% italiani, pasta fresca fatta in casa e piatti Thai. Menù consultabile qui: https://www.flowerpowervillage.com/village/restaurant-pizzeria\n`
    : '';

  // 8. Chiusura e CTA Calendario
  const cta = `📅 Calendario Live Interattivo: ${calendarUrl}

Puoi verificare le date in tempo reale e prenotare direttamente dal link sul sito web o confermare direttamente qui in chat con noi! 🌴✨

Un caloroso saluto,
Flower Power Village Team 🌸
Koh Phayam, Thailand`;

  // Assemblaggio Email Formattata
  const fullEmail = [
    greeting,
    '',
    'Grazie per averci contattato e per aver pensato a Flower Power Village per il vostro soggiorno a Koh Phayam! 🌸🌴',
    '',
    '1) Disponibilità e Date',
    availabilityNarrative,
    '',
    minStayText,
    '',
    '📅 Per verificare la disponibilità in tempo reale ti invitiamo a consultare la nostra griglia interattiva live:',
    calendarUrl,
    '',
    `2) ${accommText}`,
    babyText,
    '',
    discountsText,
    acText ? acText.trim() : null,
    breakfastText ? breakfastText.trim() : null,
    foodSection ? foodSection.trim() : null,
    '',
    '3) Posizione & Comfort:',
    '• A soli 150 metri (1–2 minuti a piedi pianeggianti) dalla spiaggia di Buffalo Bay (Ao Khao Kwai).',
    '• Bagno privato con acqua calda (tranne Camera Interna), Wi-Fi fibra ottica e zanzariere a tutte le finestre.',
    '',
    '4) Termini di Prenotazione:',
    '• Acconto del 30% per confermare (Carta o PayPal sul sito web) e saldo 70% in contanti all\'arrivo.',
    '• Cancellazione gratuita con rimborso 100% dell\'acconto fino a 14 giorni prima del check-in.',
    '',
    cta
  ].filter(line => line !== null && line !== undefined && line !== '').join('\n');

  // Assemblaggio Versione WhatsApp (chirurgica, zero rumore, con sconto 10% sito web obbligatorio)
  const whatsAppLines = [
    `Ciao ${guestName || ''}! 🌸🌴 Grazie per aver contattato Flower Power Village!`,
    '',
    accommText,
    '',
    `📅 *Soggiorno Minimo:* ${minStayText}`,
    '',
    '💰 *Sconto Esclusivo Sito Web:*',
    'Prenotando direttamente dal nostro sito web otterrai automaticamente il **10% di sconto diretto** applicato al checkout!',
    '',
    '🔗 *Verifica Disponibilità e Prenota:*',
    calendarUrl,
    '',
    'Quante notti avevi in programma? Se mi indichi le date esatte ti controllo subito la disponibilità! 🌴✨'
  ].filter(line => line !== null && line !== '');

  const fullWhatsApp = whatsAppLines.join('\n');

  const subject = guestName 
    ? `Your Stay at Flower Power Village – Availability & Direct Booking Details for ${guestName}`
    : 'Your Stay at Flower Power Village – Availability & Direct Booking Details';

  const summary = `Richiesta: ${checkInDate || targetMonth || 'Date flessibili'}, ${numGuests || '?'} ospiti, alloggio: ${requestedAccommodation || 'guesthouse/bungalow'}`;

  return {
    emailText: fullEmail,
    whatsAppText: fullWhatsApp,
    subject,
    summary
  };
}

export interface DynamicConciergeReplyParams {
  guestInquiryText: string;
  guestName: string | null;
  detectedLanguage: string;
  checkInDate: string | null;
  checkOutDate: string | null;
  targetMonth: string;
  numNights: number | null;
  numGuests: number | null;
  numAdults: number | null;
  numChildren: number | null;
  requestedAccommodation: string | null;
  accommodationSlug: string | null;
  calendarUrl: string;
  livePms?: LiveAvailabilityResult | null;
  apiKey: string;
}

export interface DynamicConciergeReplyResult {
  whatsAppText: string;
  emailText: string;
  emailSubject: string;
  summary: string;
  isTravelLogistics?: boolean;
}

/**
 * =========================================================================
 * GENERATORE DINAMICO "ZERO NOISE" CON DEEPSEEK V3 (PASSAGGIO SINGOLO)
 * =========================================================================
 * Genera risposte sartoriali pulite, calde e prive di rumore (niente culle non richieste,
 * sconti 30gg per soggiorni brevi o spam menù pizze), rispettando le caratteristiche
 * delle stanze (terrazzi, Lodge 1-2 in costruzione, AC e colazione a pagamento).
 */
export async function generateDynamicConciergeReply(
  params: DynamicConciergeReplyParams
): Promise<DynamicConciergeReplyResult | null> {
  const {
    guestInquiryText,
    guestName,
    detectedLanguage,
    checkInDate,
    checkOutDate,
    targetMonth,
    numNights,
    numGuests,
    numChildren,
    requestedAccommodation,
    calendarUrl,
    livePms,
    apiKey
  } = params;

  if (!apiKey) return null;

  // Carica regole attive apprese dalla tabella Supabase concierge_memory
  let activeRulesPrompt = '';
  try {
    activeRulesPrompt = await getActiveRulesPromptContext();
  } catch (memErr) {
    console.warn('[generateDynamicConciergeReply] Warning loading memory rules:', memErr);
  }

  // Costruzione contesto PMS live
  let pmsContext = 'Nessuna data di check-in/out specificata: invitare a consultare il calendario interattivo.';
  if (livePms && livePms.hasLivePmsData) {
    const availList = livePms.availableRooms.map(r => `• ${r.name} (${r.pricePerNight ? `${r.pricePerNight} THB/notte` : 'disponibile'})`).join('\n');
    const occList = livePms.occupiedRooms.map(r => r.name).join(', ');
    pmsContext = `DISPONIBILITÀ PMS LIVE OCTORATE PER LE DATE ${checkInDate} ➔ ${checkOutDate} (${numNights || '?'} notti):
Camere effettivamente libere:
${availList || 'Nessun alloggio libero per l\'intero soggiorno consecutivo'}
Alloggi occupati: ${occList || 'Nessuno'}`;
  }

  const langMap: Record<string, string> = {
    'IT': 'Italian',
    'EN': 'English',
    'DE': 'German',
    'FR': 'French',
    'TH': 'Thai',
    'ES': 'Spanish',
    'RU': 'Russian',
    'NL': 'Dutch'
  };
  const targetLanguageName = langMap[detectedLanguage.toUpperCase()] || detectedLanguage;

  const systemPrompt = `You are the elite AI Hospitality Concierge for Flower Power Village (Koh Phayam, Thailand).
Your task is to generate a polite, welcoming, warm, and zero-noise reply for a guest inquiry (both WhatsApp ready-to-send and Email versions).

GROUND TRUTH HOTEL KNOWLEDGE:
1. GUESTHOUSE ROOMS (TERRACE / BALCONY DETAILS):
   • Guesthouse Room 1: King bed (+ 1 single extra bed), spacious private terrace with table & chairs.
   • Guesthouse Room 2: King bed, small private balcony/terrace.
   • Guesthouse Room 3: King bed, spacious private terrace with table & chairs.
   • Guesthouse Room 4: King bed, spacious private terrace with table & chairs facing garden.
   • Guesthouse Room 5: King bed, WITHOUT balcony or terrace.
   • Lodge 1 & Lodge 2: Currently under construction, strictly NOT available.
2. BUNGALOWS & VILLAS:
   • Jungle Villa (Entire): The largest property for 2 families or groups (up to 8 pax: 4 adults + 4 children). It is physically formed by the union of the two twin wings: Jungle Villa Left + Jungle Villa Right (2 entrances, 2 floors, 2 private bathrooms, 2 kitchens, 2 living rooms). NEVER present Jungle Left & Right as alternative accommodations to Jungle Villa, because they are its two halves! For 5-8 pax, propose Jungle Villa Entire.
   • Jungle Villa Left & Jungle Villa Right: Individual twin wings (each 2+2 pax) for smaller families (2-4 pax).
   • Bungalows (Red, Yellow, Green): for 2 adults (+ 1 child), private garden, AC + fan.
   • Villa Penthouse: for 4 adults (2 bedrooms, 2 bathrooms, private garden).
   • Peace & Love Villa: for 2+2 pax facing the pool with private hammock and terrace.
   • Glamping Tents (Camel, Lagoon): safari tents with fan, no AC.
3. AIR CONDITIONING & BREAKFAST:
   • On the website booking engine, guests can freely choose whether to add air conditioning (included daily or pay-per-use) and breakfast during checkout.
   • ZERO NOISE RULE: Do NOT explain, list rates for, or dump lengthy paragraphs about A/C or breakfast unless the guest explicitly asks about them! Keep the response focused strictly on what the guest requested.
4. MINIMUM STAY RULES:
   • Low/Mid Season (1 Apr – 14 Dec, includes all of November): 2 consecutive nights.
   • High Season (15 Dec – 31 Mar, includes Christmas, New Year, January, February, March): 5 consecutive nights.
   • Single gap nights ("buchi") between bookings are bookable individually.
   • State ONLY the minimum stay rule for the season of the requested dates.
5. BEACH & LOCATION:
   • Buffalo Bay (Ao Khao Kwai) is 150m away (1-2 minutes flat walk).
6. DIRECT BOOKING LINK (FOR ACCOMMODATIONS ONLY):
   • Include the direct calendar link (${calendarUrl}) ONLY when quoting or discussing room bookings. For pure travel or transport questions, NEVER include the calendar link: include instead the official travel guide link: https://www.flowerpowervillage.com/village/how-to-get-here .
7. TRANSPORT & TRAVEL CANONICAL KNOWLEDGE (4 PHASES):
   • Phase 1 (Arriving in Ranong): Flights with Thai AirAsia (DMK ➔ UNX 1h15m), overnight bus Choke Anan from Bangkok Sai Tai Mai (8-9h, ~600-900 THB). We do NOT organize transfers from outside Ranong; direct guests to the official guide: https://www.flowerpowervillage.com/village/how-to-get-here .
   • Phase 2 (Ranong Airport/Bus to Pier): From Ranong Airport (UNX), Mr. Gong dedicated taxi (200 THB/pax for 2+, 300 THB solo traveler; Mr. Gong meets guests at gate with name sign and pre-issues speedboat tickets without queues; book 3-7 days in advance). From bus station: red songthaew (20-30 THB) or taxi (150-200 THB). Saphan Pla Pier GPS: https://maps.app.goo.gl/ef3wv84NXeNE3GvSA .
   • Phase 3 (Speedboat to Koh Phayam): Saphan Pla Pier ➔ Koh Phayam pier (~35-40 min, 350 THB/pax, departures from 08:00 to 17:00 / 17:30).
   • Phase 4 (Koh Phayam Pier to Resort): Tuk-tuk (200-250 THB per vehicle, 10 min), motorbike taxi (~80 THB), scooter rental (150-250 THB/day), or 50-60 min walk. Resort GPS: https://maps.app.goo.gl/mugY88Wpuzjeebf56 .

ZERO NOISE FILTER (STRICT):
- SURGICAL CONCISENESS DIRECTIVE: Answer ONLY and EXCLUSIVELY what was asked! Keep the WhatsApp reply short, crisp, and direct.
- DO NOT add unprompted details like distance from the beach, Wi-Fi, electricity, payment terms, deposit policies, air conditioning, breakfast, baby cribs, or restaurant menus unless explicitly asked!
- PURE TRAVEL / TRANSPORT INQUIRY DIRECTIVE:
  If the inquiry is about travel, how to get here, ferry, speedboat, airport taxi, or bus (and no room dates were asked):
  1) Provide accurate, warm travel details using the 4 phases (Mr. Gong taxi 200/300 THB, Speedboat 350 THB, Tuk-tuk 200-250 THB).
  2) Include the official travel guide link (https://www.flowerpowervillage.com/village/how-to-get-here) by warmly explaining: "we have gathered all the necessary, up-to-date travel info, tips, and GPS maps on our dedicated page if you'd like more details to travel in the best way possible".
  3) STRICTLY FORBIDDEN: DO NOT dump room options (Yellow Bungalow, Guesthouse, etc.)! DO NOT mention room minimum stays (5/2 nights)! DO NOT mention room 10% discounts! DO NOT force the room calendar link unless the guest explicitly asked about room availability and dates!
- If the guest only asks about accommodation for certain dates/people:
  1) Recommend the exact accommodation that fits them.
  2) State the minimum stay for that specific period.
  3) MANDATORY WEBSITE DISCOUNT NOTE: ALWAYS explicitly mention that booking directly on our website gives an automatic 10% direct booking discount (no coupon code needed, applied automatically at checkout)!
  4) Provide the direct calendar link (${calendarUrl}).
  5) Ask for the exact number of nights / check-in check-out dates to confirm. That's it!
- MIXED INQUIRY (ACCOMMODATION + TRAVEL):
  Answer the room inquiry concisely with the calendar link (${calendarUrl}) AND provide the requested travel information without noise.
  5) Ask for the exact number of nights / check-in check-out dates to confirm. That's it!
- Match the accommodation strictly: if 2 families or 6-8 pax, suggest Jungle Villa (Entire) with its link. If terrace asked, Rooms 1, 2, 3, 4.
- If there are follow-up questions later, we will answer them then!

${activeRulesPrompt ? `\n${activeRulesPrompt}\n` : ''}

REPLY GUIDELINES:
- Respond directly in ${targetLanguageName} (${detectedLanguage}).
- WhatsApp version: Warm, friendly, well-structured with paragraph spacing, tasteful emojis, ready to copy and send.
- Email version: Courteous and complete.
- JSON output schema:
{
  "whatsAppText": "Full formatted WhatsApp reply...",
  "emailSubject": "Clear polite email subject...",
  "emailText": "Full formatted Email reply...",
  "summary": "1-sentence summary in Italian for Marco"
}`;

  const isConfirmedGuestArriving = isAlreadyBookedOrArriving(guestInquiryText);
  const isPureTravelInquiry = (isTransportOrTravelInquiry(guestInquiryText) && !isAccommodationInquiry(guestInquiryText)) ||
                              isConfirmedGuestArriving;

  const userPrompt = isConfirmedGuestArriving
    ? `GUEST INQUIRY TEXT (CONFIRMED GUEST CHECKING IN / TRAVEL & ARRIVAL LOGISTICS):
"""
${guestInquiryText}
"""

EXTRACTED PARAMETERS:
• Guest Name: ${guestName || 'Guest'}
• Language: ${detectedLanguage} (${targetLanguageName})
• Status: CONFIRMED GUEST CHECKING IN TOMORROW / ALREADY BOOKED
• Inquiry: ARRIVAL LOGISTICS & TRANSPORT
• CRITICAL INSTRUCTIONS:
  1) Warmly greet the guests (e.g. Amanda and Ian) and tell them we look forward to welcoming them!
  2) Direct Answers to Guest Questions:
     - Taxi / Grab from Khao Lak: ~3,200 THB is fair and standard for a 3-hour private ride for 3 passengers.
     - Pier Name: Saphan Pla Pier (located in Tambon Pak Nam, Ranong). Google Maps: https://maps.app.goo.gl/ef3wv84NXeNE3GvSA .
     - Speedboat to Koh Phayam: 350 THB/passenger, ~35-40 min, departures frequently from 08:00 to 17:00 / 17:30. Tickets can be bought at the pier upon arrival.
     - From Koh Phayam Pier to Flower Power: Local open-air tuk-tuks are right at the pier (200-250 THB total for 3 pax, 10 min to Buffalo Bay / Ao Khao Kwai).
     - Guide link: https://www.flowerpowervillage.com/village/how-to-get-here
  3) STRICTLY FORBIDDEN: DO NOT dump room availability, room rates, room minimum stay (5/2 nights), 10% direct website booking discounts, or calendar links! They have ALREADY booked!`
    : isPureTravelInquiry
    ? `GUEST INQUIRY TEXT (TRAVEL & HOW TO GET HERE ONLY):
"""
${guestInquiryText}
"""

EXTRACTED PARAMETERS:
• Guest Name: ${guestName || 'Guest'}
• Language: ${detectedLanguage} (${targetLanguageName})
• Inquiry Category: PURE TRAVEL / HOW TO GET HERE
• Requested Accommodation: NONE (Guest did NOT ask about rooms or dates)
• CRITICAL DIRECTIVE: Answer ONLY the travel and arrival question using the 4 canonical phases. DO NOT mention room options, bungalows, minimum stays (5/2 nights), 10% room discounts, or room calendar links! Use link https://www.flowerpowervillage.com/village/how-to-get-here .`
    : `GUEST INQUIRY TEXT:
"""
${guestInquiryText}
"""

EXTRACTED PARAMETERS:
• Guest Name: ${guestName || 'Guest'}
• Language: ${detectedLanguage} (${targetLanguageName})
• Dates: ${checkInDate || targetMonth || 'Flexible'} ➔ ${checkOutDate || ''} (${numNights || '?'} nights)
• Guests: ${numGuests || 'Not specified'} (Children: ${numChildren || 0})
• Requested Accommodation: ${requestedAccommodation || 'Room / General'}

PMS LIVE DATA:
${pmsContext}`;

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!res.ok) {
      console.warn(`[generateDynamicConciergeReply] DeepSeek error (${res.status}): ${await res.text()}`);
      return null;
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || '{}';
    const cleanJson = rawContent.trim().replace(/^```json/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (parsed.whatsAppText && parsed.whatsAppText.trim()) {
      return {
        whatsAppText: parsed.whatsAppText.trim(),
        emailText: parsed.emailText ? parsed.emailText.trim() : parsed.whatsAppText.trim(),
        emailSubject: parsed.emailSubject ? parsed.emailSubject.trim() : 'Your Stay at Flower Power Village',
        summary: parsed.summary ? parsed.summary.trim() : 'Risposta dinamica generata con successo.',
        isTravelLogistics: isPureTravelInquiry
      };
    }
  } catch (err) {
    console.warn('[generateDynamicConciergeReply] Exception calling DeepSeek:', err);
  }

  return null;
}

export async function translateConciergeReply(params: {
  text: string;
  targetLang: string;
  apiKey?: string | null;
}): Promise<string> {
  const { text, targetLang, apiKey: providedKey } = params;
  if (!text || !text.trim()) return '';

  const cleanLang = (targetLang || 'EN').toUpperCase().trim();
  // Se la lingua è già l'italiano, non serve alcuna traduzione (0 token, 0ms)
  if (cleanLang === 'IT') {
    return text;
  }

  const apiKey = providedKey || await getDeepSeekApiKey();
  if (!apiKey) {
    return text;
  }

  const langMap: Record<string, string> = {
    'EN': 'English',
    'DE': 'German',
    'FR': 'French',
    'TH': 'Thai',
    'ES': 'Spanish',
    'RU': 'Russian',
    'NL': 'Dutch'
  };
  const targetLanguageName = langMap[cleanLang] || cleanLang;

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: `You are a professional multilingual hospitality translator for Flower Power Village (Koh Phayam, Thailand).
Translate the provided resort concierge message into ${targetLanguageName} (${cleanLang}).
Maintain a warm, welcoming, polite and professional tropical resort concierge tone.
CRITICAL INSTRUCTIONS:
- DO NOT alter, remove, or hallucinate any numbers, prices, currencies (฿, €, THB), dates, or percentages (10%, 15%, 20%, 30%, 70%, 100%).
- Keep all URL links (e.g. https://www.flowerpowervillage.com/...) EXACTLY as written.
- Output ONLY the translated message text without meta-commentary.`
          },
          {
            role: 'user',
            content: text
          }
        ]
      })
    });

    if (!res.ok) {
      console.warn(`[translateConciergeReply] DeepSeek translation error (${res.status}): ${await res.text()}`);
      return text;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || text;
  } catch (err) {
    console.error('[translateConciergeReply] Network or JSON error:', err);
    return text;
  }
}

/**
 * =========================================================================
 * ELABORAZIONE PRINCIPALE RICHIESTA OSPITE (ENTRYPOINT CONCIERGE)
 * =========================================================================
 */
export async function processBookingInquiry(options: ProcessBookingInquiryOptions): Promise<BookingInquiryResult> {
  const { text, currentDate = new Date() } = options;

  if (!text || !text.trim()) {
    throw new Error('Nessun testo fornito per l\'interpretazione');
  }

  const apiKey = await getDeepSeekApiKey();
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY non configurata nel server');
  }

  const nowYear = currentDate.getFullYear();
  const nowMonth = currentDate.getMonth() + 1; // 1-12
  const nowDay = currentDate.getDate();
  const todayIso = `${nowYear}-${String(nowMonth).padStart(2, '0')}-${String(nowDay).padStart(2, '0')}`;

  // -------------------------------------------------------------
  // STEP 1: Estrazione Parametri e Lingua (Fast pass ~150 token)
  // -------------------------------------------------------------
  let detectedLanguage = 'EN';
  let extractedCheckIn: string | null = null;
  let extractedCheckOut: string | null = null;
  let extractedGuests: number | null = null;
  let extractedAdults: number | null = null;
  let extractedChildren: number | null = null;
  let extractedTargetMonth: string | null = null;
  let extractedName: string | null = null;
  let extractedRoom: string | null = null;

  try {
    const extractRes = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.0,
        max_tokens: 250,
        messages: [
          {
            role: 'system',
            content: `You are a fast parameter extractor for Flower Power Village (Koh Phayam, Thailand).
TODAY: ${todayIso}.
Extract parameters from the guest inquiry.
RULES:
- detectedLanguage: 'IT' | 'EN' | 'DE' | 'FR' | 'TH' | 'ES' | 'RU' | 'NL' etc.
- checkInDate / checkOutDate: 'YYYY-MM-DD' or null.
- TEMPORAL ANCHOR: If a month already passed in ${nowYear} is mentioned, year must be ${nowYear + 1}!
- targetMonth: 'YYYY-MM'.
- numGuests, numAdults, numChildren: integer or null.
- guestName: string or null.
- requestedAccommodation: 'villa' | 'bungalow' | 'tent' | 'room' | null.
STRICT JSON ONLY:
{"detectedLanguage": "EN", "guestName": null, "checkInDate": null, "checkOutDate": null, "targetMonth": null, "numGuests": null, "numAdults": null, "numChildren": null, "requestedAccommodation": null}`
          },
          {
            role: 'user',
            content: text
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (extractRes.ok) {
      const extJson = await extractRes.json();
      const rawExt = extJson.choices?.[0]?.message?.content || '{}';
      const parsedExt = JSON.parse(rawExt.trim().replace(/^\`\`\`json/i, '').replace(/\`\`\`$/i, '').trim());
      detectedLanguage = (parsedExt.detectedLanguage || 'EN').toUpperCase();
      extractedCheckIn = parsedExt.checkInDate || null;
      extractedCheckOut = parsedExt.checkOutDate || null;
      extractedGuests = typeof parsedExt.numGuests === 'number' ? parsedExt.numGuests : null;
      extractedAdults = typeof parsedExt.numAdults === 'number' ? parsedExt.numAdults : null;
      extractedChildren = typeof parsedExt.numChildren === 'number' ? parsedExt.numChildren : null;
      extractedTargetMonth = parsedExt.targetMonth || null;
      extractedName = parsedExt.guestName || null;
      extractedRoom = parsedExt.requestedAccommodation || null;
    }
  } catch (err) {
    console.warn('[processBookingInquiry] Fast extraction pass warning:', err);
  }

  const isExistingGuestArrival = isAlreadyBookedOrArriving(text);
  const isTransportTopic = isTransportOrTravelInquiry(text);

  if (isExistingGuestArrival || (isTransportTopic && !isAccommodationInquiry(text))) {
    // Se l'ospite ha già prenotato o chiede info di trasporto senza richiedere prenotazione alloggi,
    // azzeriamo le date per la disponibilità PMS: non si tratta di un preventivo camera!
    extractedCheckIn = null;
    extractedCheckOut = null;
    extractedRoom = null;
  }

  // -------------------------------------------------------------
  // STEP 2: Controllo Disponibilità Live su Octorate PMS
  // -------------------------------------------------------------
  let livePmsResult: LiveAvailabilityResult | null = null;
  if (extractedCheckIn && extractedCheckOut) {
    try {
      livePmsResult = await checkOctorateLiveAvailability({
        checkIn: extractedCheckIn,
        checkOut: extractedCheckOut,
        numGuests: extractedGuests
      });
    } catch (pmsErr) {
      console.warn('[processBookingInquiry] Octorate live check warning:', pmsErr);
    }
  }

  const targetMonth = extractedTargetMonth || (extractedCheckIn ? extractedCheckIn.slice(0, 7) : `${nowYear}-${String(nowMonth).padStart(2, '0')}`);
  const accommodationSlug = normalizeAccommodationSlug(extractedRoom);

  // -------------------------------------------------------------
  // STEP 3: Generazione Link Calendario Live Interattivo
  // -------------------------------------------------------------
  const calendarUrl = buildVillageCalendarUrl({
    targetMonth,
    checkIn: extractedCheckIn,
    checkOut: extractedCheckOut,
    roomSlug: accommodationSlug,
    lang: detectedLanguage,
    view: 'timeline'
  });

  const numNights = (extractedCheckIn && extractedCheckOut)
    ? Math.round((new Date(extractedCheckOut).getTime() - new Date(extractedCheckIn).getTime()) / (1000 * 3600 * 24))
    : null;

  // -------------------------------------------------------------
  // STEP 4: Generazione Dinamica "Zero Noise" con DeepSeek V3
  // -------------------------------------------------------------
  let dynamicReply = await generateDynamicConciergeReply({
    guestInquiryText: text,
    guestName: extractedName,
    detectedLanguage,
    checkInDate: extractedCheckIn,
    checkOutDate: extractedCheckOut,
    targetMonth,
    numNights,
    numGuests: extractedGuests,
    numAdults: extractedAdults,
    numChildren: extractedChildren,
    requestedAccommodation: extractedRoom,
    accommodationSlug,
    calendarUrl,
    livePms: livePmsResult,
    apiKey
  });

  let finalWhatsApp = '';
  let finalEmail = '';
  let finalSubject = '';
  let shortSummary = '';

  if (dynamicReply && dynamicReply.whatsAppText) {
    finalWhatsApp = dynamicReply.whatsAppText;
    finalEmail = dynamicReply.emailText || dynamicReply.whatsAppText;
    finalSubject = dynamicReply.emailSubject || `Your Stay at Flower Power Village`;
    shortSummary = dynamicReply.summary || `Richiesta: ${extractedCheckIn || targetMonth || 'date flessibili'}, alloggio: ${extractedRoom || 'guesthouse/bungalow'}`;
  } else {
    // Fallback Deterministico Pulito (Zero Noise) se DeepSeek non risponde
    const compiled = compileDeterministicConciergeReply({
      guestName: extractedName,
      detectedLanguage,
      checkInDate: extractedCheckIn,
      checkOutDate: extractedCheckOut,
      targetMonth,
      numNights,
      numGuests: extractedGuests,
      numAdults: extractedAdults,
      numChildren: extractedChildren,
      requestedAccommodation: extractedRoom,
      accommodationSlug,
      calendarUrl,
      livePms: livePmsResult,
      userInquiryText: text
    });

    finalEmail = compiled.emailText;
    finalWhatsApp = compiled.whatsAppText;
    finalSubject = compiled.subject;
    shortSummary = compiled.summary;

    if (detectedLanguage !== 'IT') {
      const [transEmail, transWhatsApp] = await Promise.all([
        translateConciergeReply({ text: compiled.emailText, targetLang: detectedLanguage, apiKey }),
        translateConciergeReply({ text: compiled.whatsAppText, targetLang: detectedLanguage, apiKey })
      ]);
      finalEmail = transEmail;
      finalWhatsApp = transWhatsApp;
    }
  }

  const livePmsSummary = (livePmsResult && livePmsResult.hasLivePmsData)
    ? {
      checked: true,
      availableCount: livePmsResult.availableRooms.length,
      occupiedCount: livePmsResult.occupiedRooms.length,
      availableNames: livePmsResult.availableRooms.map(r => r.name),
      occupiedNames: livePmsResult.occupiedRooms.map(r => r.name)
    }
    : null;

  const isPureTravel = Boolean(dynamicReply?.isTravelLogistics) ||
                       isAlreadyBookedOrArriving(text) ||
                       (isTransportOrTravelInquiry(text) && !isAccommodationInquiry(text));

  return {
    detectedLanguage,
    guestName: extractedName,
    checkInDate: extractedCheckIn,
    checkOutDate: extractedCheckOut,
    targetMonth,
    numNights,
    numGuests: extractedGuests,
    numAdults: extractedAdults,
    numChildren: extractedChildren,
    requestedAccommodation: extractedRoom,
    accommodationSlug,
    shortSummary,
    emailSubject: finalSubject,
    politeReplyWhatsApp: finalWhatsApp,
    politeReplyEmail: finalEmail,
    calendarUrl,
    isTravelLogistics: isPureTravel,
    livePms: livePmsSummary
  };
}

/**
 * Rielabora una risposta esistente applicando il feedback e le critiche del gestore Marco.
 * Estrae inoltre una nuova regola generale aziendale per auto-apprendimento futuro.
 */
export async function refineReplyWithFeedback(options: RefineReplyOptions): Promise<RefinedReplyResult> {
  const {
    originalInquiry,
    currentReply,
    userFeedback,
    calendarUrl = 'https://www.flowerpowervillage.com/calendar'
  } = options;

  const apiKey = await getDeepSeekApiKey();
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY non configurata nel server');
  }

  // Carica regole attive apprese dalla tabella Supabase concierge_memory
  let activeRulesPrompt = '';
  try {
    activeRulesPrompt = await getActiveRulesPromptContext();
  } catch (memErr) {
    console.warn('[refineReplyWithFeedback] Warning loading memory rules:', memErr);
  }

  const fullText = `${originalInquiry} ${currentReply} ${userFeedback}`;
  const isTravelTopic = isTransportOrTravelInquiry(fullText);
  const feedbackLower = (userFeedback || '').toLowerCase();
  const feedbackWantsTravel = isTransportOrTravelInquiry(userFeedback) ||
    feedbackLower.includes('viaggi') || feedbackLower.includes('arriv') || feedbackLower.includes('orari') ||
    feedbackLower.includes('motoscafo') || feedbackLower.includes('barc') || feedbackLower.includes('taxi') ||
    feedbackLower.includes('gong') || feedbackLower.includes('traghetto') || feedbackLower.includes('ferry') ||
    feedbackLower.includes('non parlare di allogg') || feedbackLower.includes('non parlare di camer') ||
    feedbackLower.includes('togli allogg') || feedbackLower.includes('togli camer') ||
    feedbackLower.includes('elimina allogg') || feedbackLower.includes('elimina camer');

  // Determina se l'intento finale è puramente di viaggio
  // IMPORTANTE: non controlliamo currentReply perché currentReply potrebbe essere la risposta errata che Marco sta correggendo!
  const hasExplicitRoomRequest = (isAccommodationInquiry(originalInquiry) || Boolean(originalInquiry.match(/\d{4}-\d{2}-\d{2}/))) && !feedbackWantsTravel;
  const isPureTravel = (isTravelTopic || feedbackWantsTravel) && !hasExplicitRoomRequest;

  const calendarDirective = isPureTravel
    ? `- PURE TRAVEL / LOGISTICS DIRECTIVE:
- This inquiry/feedback is about travel, transport, ferries, speedboats, or how to get here.
- DO NOT force the calendar URL (${calendarUrl}). Instead, include the official travel guide link: https://www.flowerpowervillage.com/village/how-to-get-here (or specific details requested by Marco).
- STRICTLY FORBIDDEN: DO NOT dump room options (Yellow Bungalow, Guesthouse, etc.)! DO NOT mention room minimum stays (5/2 nights)! DO NOT mention room 10% discounts!`
    : `- MANDATORY EXACT CALENDAR URL: You must include the EXACT live calendar link: ${calendarUrl} . DO NOT truncate or shorten this link! Do NOT replace it with a bare URL if it contains query parameters like ?from=...&to=... Keep the full query string intact!
- Maintain the exact WhatsApp formatting, friendly warm tone, mandatory 10% direct website discount note, and live calendar link (${calendarUrl}).`;

  const systemPrompt = `You are the AI Hospitality Concierge for Flower Power Village (Koh Phayam, Thailand).
The resort general manager (Marco) is reviewing a proposed response to a guest and has given specific criticism, corrections, or instructions.

CRITICAL INSTRUCTION FOR MODIFICATIONS:
- You must carefully read Marco's instructions.
- If Marco says "elimina X", "togli X", "rimuovi X" (e.g. "elimina la guest house", "togli bungalow"), you must REMOVE ONLY X from the proposed options, and PRESERVE all other accommodations and options intact! Do NOT invert the command! Do NOT remove everything else while keeping X!
- If Marco says "lascia solo X", then you keep only X. But "elimina X" means drop X and keep the rest.
${calendarDirective}

GROUND TRUTH RESORT STRUCTURE & FACTS:
- ACCOMMODATIONS:
  • Bungalow Deluxe / Comfort (indipendenti, nel giardino tropicale)
  • Guesthouse / Camere (Camere 1, 3, 4 con terrazza privata; Camera 2 balcone; Camera 5 senza balcone; Lodge 1-2 in costruzione, NON disponibili)
  • Jungle Villa (Villa intera = Jungle Left + Jungle Right, 2 camere separate con bagno privato)
- MINIMUM STAY:
  • High Season (15 Dec – 31 Mar): strictly 5 nights minimum.
  • Low/Mid Season (1 Apr – 14 Dec, including November): 2 nights minimum.
- 10% DIRECT DISCOUNT: Mention that booking on https://www.flowerpowervillage.com/calendar grants an automatic 10% discount at checkout (ONLY for accommodation quotes, NEVER for pure transport/ferry queries).
- CANONICAL TRANSPORT & TRAVEL (4 PHASES):
  • Phase 1 (Arriving in Ranong): Flights with Thai AirAsia (DMK ➔ UNX 1h15m), overnight bus Choke Anan from Bangkok Sai Tai Mai (8-9h, ~600-900 THB). We do NOT organize transfers from outside Ranong; direct guests to the official guide: https://www.flowerpowervillage.com/village/how-to-get-here .
  • Phase 2 (Ranong Airport/Bus to Pier): From Ranong Airport (UNX), Mr. Gong dedicated taxi (200 THB/pax for 2+, 300 THB solo traveler; Mr. Gong meets guests at gate with name sign and pre-issues speedboat tickets without queues; book 3-7 days in advance). From bus station: red songthaew (20-30 THB) or taxi (150-200 THB). Saphan Pla Pier GPS: https://maps.app.goo.gl/ef3wv84NXeNE3GvSA .
  • Phase 3 (Speedboat to Koh Phayam): Saphan Pla Pier ➔ Koh Phayam pier (~35-40 min, 350 THB/pax, departures from 08:00 to 17:00 / 17:30).
  • Phase 4 (Koh Phayam Pier to Resort): Tuk-tuk (200-250 THB per vehicle, 10 min), motorbike taxi (~80 THB), scooter rental (150-250 THB/day), or 50-60 min walk. Resort GPS: https://maps.app.goo.gl/mugY88Wpuzjeebf56 .
- ZERO NOISE: Never mention baby cribs, A/C costs, breakfast costs, or pizza menus unless explicitly asked by the guest or manager.

${activeRulesPrompt ? `\n${activeRulesPrompt}\n` : ''}

YOUR TASK:
1. Re-write the proposed response for the guest (both WhatsApp and Email) applying Marco's corrections faithfully and accurately.
2. ${isPureTravel ? 'Ensure official travel directions/links are accurate and crisp.' : `Ensure the link to the live calendar (${calendarUrl}) remains present.`}
3. Formulate an abstract, general MANAGEMENT RULE that captures Marco's directive so that ALL future inquiries handled by the bot will follow this rule automatically without needing to be corrected again!
4. Provide a 1-sentence summary of what changed in Italian.

Return STRICTLY valid JSON with this schema:
{
  "refinedWhatsApp": "Full refined WhatsApp message text...",
  "refinedEmail": "Full refined Email message text...",
  "suggestedRuleTitle": "Concise title for the rule (e.g. 'Esclusione Guesthouse per soggiorni brevi', 'Tariffe Taxi Mr. Gong', ecc.)",
  "suggestedRuleContent": "Clear directive instruction for future AI prompts",
  "summaryOfChanges": "Breve sintesi in italiano delle modifiche applicate"
}

${isPureTravel ? `CRITICAL REFINEMENT INSTRUCTION:
This response is EXCLUSIVELY about travel, transport, and arrival logistics (Mr. Gong, speedboats, tuk-tuks, schedules).
DO NOT mention accommodation rooms, bungalows, minimum stays (5/2 nights), 10% room discounts, or room calendar links.
Include the official travel guide link: https://www.flowerpowervillage.com/village/how-to-get-here .` : ''}`;

  const userPrompt = `ORIGINAL GUEST INQUIRY:
"""
${originalInquiry}
"""

PREVIOUS PROPOSED DRAFT REPLY:
"""
${currentReply}
"""

MARCO'S FEEDBACK & INSTRUCTIONS:
"""
${userFeedback}
"""

${isPureTravel ? `SPECIAL DIRECTIVE FOR THIS MODIFICATION:
Marco explicitly wants this message to focus on TRAVEL / HOW TO GET HERE (ferries, speedboats, taxi, Mr. Gong, directions).
DO NOT dump accommodation options (bungalows, rooms), DO NOT mention seasonal minimum stays, DO NOT mention room 10% direct discounts, and DO NOT force calendar links. Use the official travel guide link: https://www.flowerpowervillage.com/village/how-to-get-here .` : ''}`;

  const deepSeekRes = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!deepSeekRes.ok) {
    const errText = await deepSeekRes.text();
    throw new Error(`Errore DeepSeek API durante il feedback (${deepSeekRes.status}): ${errText}`);
  }

  const aiData = await deepSeekRes.json();
  const rawContent = aiData.choices?.[0]?.message?.content || '{}';
  const cleanJson = rawContent.trim().replace(/^\`\`\`json/i, '').replace(/\`\`\`$/i, '').trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (err: any) {
    throw new Error(`Impossibile decodificare il JSON da DeepSeek durante il feedback: ${err.message}`);
  }

  let finalWhatsApp = (parsed.refinedWhatsApp || '').trim();
  let finalEmail = (parsed.refinedEmail || '').trim();

  // Assicura l'URL esatto del calendario SOLO se non è una richiesta puramente di trasporti/viaggio
  if (!isPureTravel && calendarUrl && !finalWhatsApp.includes(calendarUrl)) {
    // Sostituisce eventuali link generici o lo appende
    if (finalWhatsApp.includes('https://flowerpowervillage.com/calendar')) {
      finalWhatsApp = finalWhatsApp.replace(/https:\/\/flowerpowervillage\.com\/calendar[^\s<"]*/gi, calendarUrl);
    } else if (finalWhatsApp.includes('https://www.flowerpowervillage.com/calendar')) {
      finalWhatsApp = finalWhatsApp.replace(/https:\/\/www\.flowerpowervillage\.com\/calendar[^\s<"]*/gi, calendarUrl);
    }
  }

  if (!isPureTravel && calendarUrl && !finalEmail.includes(calendarUrl)) {
    if (finalEmail.includes('https://flowerpowervillage.com/calendar')) {
      finalEmail = finalEmail.replace(/https:\/\/flowerpowervillage\.com\/calendar[^\s<"]*/gi, calendarUrl);
    } else if (finalEmail.includes('https://www.flowerpowervillage.com/calendar')) {
      finalEmail = finalEmail.replace(/https:\/\/www\.flowerpowervillage\.com\/calendar[^\s<"]*/gi, calendarUrl);
    }
  }

  return {
    refinedWhatsApp: finalWhatsApp,
    refinedEmail: finalEmail,
    suggestedRuleTitle: parsed.suggestedRuleTitle || (isPureTravel ? 'Direttiva Trasporti & Viaggi' : 'Direttiva Gestione'),
    suggestedRuleContent: parsed.suggestedRuleContent || userFeedback,
    summaryOfChanges: parsed.summaryOfChanges || 'Risposta corretta in base al feedback',
    isTravelLogistics: isPureTravel
  };
}

export type ConciergeIntent = 'GUEST_INQUIRY' | 'KNOWLEDGE_UPDATE';

/**
 * Classifica in automatico l'intento del messaggio Telegram senza prefissi obbligatori.
 * Distingue se si tratta di una richiesta ospite/prenotazione o di un aggiornamento del database/template.
 */
export async function classifyTelegramIntent(text: string): Promise<ConciergeIntent> {
  const clean = text.trim().toLowerCase();

  // 1. Prefissi espliciti (fast-path)
  const updatePrefixes = [
    'dati:', 'nuovi dati:', 'info:', 'aggiorna:', 'memorizza:', 'memorizza dati:',
    'regola:', 'regole:', 'nozione:', 'scheda:', 'database:', 'direttiva:', 
    'template:', 'modello:', 'nota:', 'salva regola:'
  ];
  if (updatePrefixes.some(p => clean.startsWith(p))) {
    return 'KNOWLEDGE_UPDATE';
  }

  // 2. Pattern forti per richiesta ospite (booking inquiry)
  const hasGreeting = /^(hi|hello|ciao|salve|buongiorno|buonasera|dear|bonjour|hola|hallo)\b/i.test(clean);
  const hasStayWords = /(night|notte|notti|stay|soggiorn|check-in|checkout|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|genn|febbr|marz|magg|giugn|lugl|agost|sett|ott|nov|dic)/i.test(clean);
  const hasPaxWords = /\b(\d+)\s*(adult|child|kid|pers|pax|ospit|people|guests)/i.test(clean);
  const hasInquiryKeywords = /(how much|quanto costa|prezzo|price|available|disponibil|is there|do you have|avete una|vorrei prenotare|booking|bungalow|villa|tenda|tent)/i.test(clean);

  if ((hasGreeting && (hasStayWords || hasPaxWords || hasInquiryKeywords)) || (hasStayWords && hasPaxWords)) {
    return 'GUEST_INQUIRY';
  }

  // 3. Pattern forti per nozione / regola operativa (knowledge update)
  const knowledgeMarkers = [
    'da oggi', 'da domani', 'da dicembre', 'da gennaio', 'da febbraio', 'dal 1',
    'ricordati che', 'tieni presente che', 'nota bene', 'nuova regola', 'nuovo orario',
    'abbiamo introdotto', 'i prezzi del noleggio', 'i massaggi costano', 'il taxi costa',
    'il motoscafo costa', 'la cucina chiude', 'la bakery apre', 'accettiamo carte',
    'la colazione costa', 'la spiaggia dista', 'la commissione è', 'la commissione e'
  ];
  if (knowledgeMarkers.some(m => clean.includes(m))) {
    return 'KNOWLEDGE_UPDATE';
  }

  // 4. Se ambiguo, consultiamo DeepSeek in modalità ultra-rapida (temperatura 0.0)
  try {
    const apiKey = await getDeepSeekApiKey();
    if (!apiKey) return 'GUEST_INQUIRY';

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        temperature: 0.0,
        messages: [
          {
            role: 'system',
            content: `You are an intent classifier for a hotel messaging bot (Flower Power Village, Thailand).
Classify whether the text is:
- "GUEST_INQUIRY": A message from a traveler or potential guest inquiring about room availability, prices, booking, dates, or amenities.
- "KNOWLEDGE_UPDATE": A message from the hotel owner/manager providing a response template, an operational directive, an updated policy, transport prices, restaurant hours, or hotel information to store in the knowledge base.

Respond STRICTLY in JSON: {"intent": "GUEST_INQUIRY" | "KNOWLEDGE_UPDATE"}`
          },
          { role: 'user', content: text }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(content);
      if (parsed.intent === 'KNOWLEDGE_UPDATE' || parsed.intent === 'GUEST_INQUIRY') {
        return parsed.intent;
      }
    }
  } catch (err) {
    console.warn('[classifyTelegramIntent] DeepSeek classifier error:', err);
  }

  return 'GUEST_INQUIRY';
}

export interface KnowledgeUpdateResult {
  title: string;
  content: string;
  category: '01_Alloggi_e_Capienze' | '02_Trasporti_e_Arrivi' | '03_Ristorante_e_Bakery' | '04_Policy_e_Villaggio' | '05_Regole_e_FAQ_Telegram';
  categoryTitle: string;
  isTemplate: boolean;
  savedToDb: boolean;
  savedToSheet: boolean;
  summary: string;
}

/**
 * Elabora una nozione o un template inviato dal manager su Telegram,
 * estrae titolo e contenuto, individua la scheda corretta e aggiorna DB, RAM e Google Sheets.
 */
export async function processKnowledgeUpdate(text: string): Promise<KnowledgeUpdateResult> {
  const apiKey = await getDeepSeekApiKey();
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY non configurata nel server');
  }

  const systemPrompt = `You are the knowledge base architect for Flower Power Village (Koh Phayam, Thailand).
The hotel manager (Marco) sent an operational update, a response template, or a new piece of information for the resort database.

YOUR TASK:
1. Extract a concise, elegant TITLE in Italian (max 5-7 words, e.g. "Serata Barbecue di Pesce Fresco", "Nuovo Van 9 Posti Mr. Gong", "Template Risposta Standard Famiglie").
2. Extract the CONTENT: Clean, well-formulated Italian text with essential details, prices in THB, hours, and conditions.
3. Categorize into EXACTLY one of these 5 sheets:
   - "01_Alloggi_e_Capienze" (Room amenities, capacity, bungalows, beds, AC, mosquito nets)
   - "02_Trasporti_e_Arrivi" (Speedboats, ferries, Mr. Gong driver, taxi, flights, scooters, bus)
   - "03_Ristorante_e_Bakery" (Breakfast, bakery hours, pizza, dinner, special dishes, prices)
   - "04_Policy_e_Villaggio" (Buffalo Bay 150m, Wi-Fi fiber, cribs, pets, card payments, cancellations)
   - "05_Regole_e_FAQ_Telegram" (Response templates, tone of voice, discount rules, recurring guest questions)
4. Determine if it is a template (isTemplate: true if it is a pre-written draft message for guests).
5. Provide a 1-sentence summary of what was learned.

Return STRICTLY valid JSON:
{
  "title": "...",
  "content": "...",
  "category": "01_Alloggi_e_Capienze" | "02_Trasporti_e_Arrivi" | "03_Ristorante_e_Bakery" | "04_Policy_e_Villaggio" | "05_Regole_e_FAQ_Telegram",
  "isTemplate": false,
  "summary": "..."
}`;

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!res.ok) {
    throw new Error(`Errore DeepSeek API (${res.status}): ${await res.text()}`);
  }

  const aiData = await res.json();
  const rawContent = aiData.choices?.[0]?.message?.content || '{}';
  const cleanJson = rawContent.trim().replace(/^\`\`\`json/i, '').replace(/\`\`\`$/i, '').trim();
  const parsed = JSON.parse(cleanJson);

  const title = (parsed.title || 'Nuova Regola / Direttiva').trim();
  const content = (parsed.content || text).trim();
  const category = parsed.category || '05_Regole_e_FAQ_Telegram';
  const isTemplate = Boolean(parsed.isTemplate);
  const summary = parsed.summary || 'Informazione acquisita e memorizzata.';

  // Salvataggio su Supabase concierge_memory
  const client = getSupabaseClient();
  let savedToDb = false;
  if (client) {
    try {
      const { error } = await client
        .from('concierge_memory')
        .insert({
          category,
          title,
          content,
          active: true
        });
      savedToDb = !error;
    } catch (dbErr) {
      console.warn('[processKnowledgeUpdate] Supabase insert warning:', dbErr);
    }
  }

  // Mappatura titoli per estetica Telegram
  const categoryTitles: Record<string, string> = {
    '01_Alloggi_e_Capienze': '01. Alloggi & Capienze',
    '02_Trasporti_e_Arrivi': '02. Trasporti & Arrivi',
    '03_Ristorante_e_Bakery': '03. Ristorante & Bakery',
    '04_Policy_e_Villaggio': '04. Policy & Villaggio',
    '05_Regole_e_FAQ_Telegram': '05. Regole & FAQ Telegram'
  };

  return {
    title,
    content,
    category,
    categoryTitle: categoryTitles[category] || category,
    isTemplate,
    savedToDb,
    savedToSheet: false,
    summary
  };
}
