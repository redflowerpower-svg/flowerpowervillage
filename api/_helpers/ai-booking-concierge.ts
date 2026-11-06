import { createClient } from "@supabase/supabase-js";
import { VILLAGE_KNOWLEDGE_SUMMARY } from "./village-knowledge-base.js";
import { getActiveRulesPromptContext } from "./concierge-memory.js";
import { checkOctorateLiveAvailability, LiveAvailabilityResult } from "./octorate-live-checker.js";
import { getCompleteKnowledgePromptContext } from "./google-sheets-sync.js";

/**
 * AI Booking Concierge & Smart Calendar Assistant for Flower Power Village (Koh Phayam)
 * 
 * Interpreta le richieste di prenotazione dei clienti (email, whatsapp, social)
 * tramite l'API di DeepSeek, estrae periodo/date/ospiti/alloggio, verifica la disponibilità
 * in tempo reale su Octorate PMS, risponde alle domande attingendo dalla Knowledge Base
 * ufficiale e dalle regole memorizzate, genera risposte pronte e crea il link diretto
 * al calendario live di Flower Power Village con visualizzazione timeline e date evidenziate.
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

  // Vista panoramica a righe/in fila (timeline) per avere tutto il quadro completo
  q.set('view', params.view || 'timeline');

  if (params.targetMonth && /^\d{4}-\d{2}$/.test(params.targetMonth)) {
    q.set('month', params.targetMonth);
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
  // STEP 1: Fast Temporal & Entity Extraction Pass
  // -------------------------------------------------------------
  let extractedCheckIn: string | null = null;
  let extractedCheckOut: string | null = null;
  let extractedGuests: number | null = null;
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
        temperature: 0.1,
        max_tokens: 250,
        messages: [
          {
            role: 'system',
            content: `You are a temporal and entity extractor for Flower Power Village (Koh Phayam, Thailand).
TODAY'S REFERENCE DATE: ${todayIso} (Year ${nowYear}, Month ${nowMonth}).
Analyze the guest inquiry and extract structured parameters.
CRITICAL RULES:
- checkInDate / checkOutDate: Format "YYYY-MM-DD". If guest mentions dates, calculate exact ISO dates.
- TEMPORAL ANCHOR: If guest mentions a month that has already passed in ${nowYear} (or today is Nov/Dec ${nowYear} and guest asks for Jan/Feb/Mar), the intended year MUST be ${nowYear + 1}! If no exact day is given, leave null.
- targetMonth: Format "YYYY-MM". If checkInDate is known, use its YYYY-MM. If only a month is mentioned (e.g. "sometime in March"), set to that month (e.g. "${nowYear + 1}-03").
- numGuests: Total number of guests (adults + children), or null if not mentioned.
- guestName: Name of guest if present, or null.
- requestedAccommodation: Type or name of accommodation requested, or null.
Return STRICT JSON ONLY:
{"checkInDate": null, "checkOutDate": null, "targetMonth": null, "numGuests": null, "guestName": null, "requestedAccommodation": null}`
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
      const parsedExt = JSON.parse(rawExt.trim().replace(/^```json/i, '').replace(/```$/i, '').trim());
      extractedCheckIn = parsedExt.checkInDate || null;
      extractedCheckOut = parsedExt.checkOutDate || null;
      extractedGuests = typeof parsedExt.numGuests === 'number' ? parsedExt.numGuests : null;
      extractedTargetMonth = parsedExt.targetMonth || null;
      extractedName = parsedExt.guestName || null;
      extractedRoom = parsedExt.requestedAccommodation || null;
    }
  } catch (err) {
    console.warn('[processBookingInquiry] Fast extraction pass warning:', err);
  }

  // -------------------------------------------------------------
  // STEP 2: Live Octorate PMS Check (Real-time Availability)
  // -------------------------------------------------------------
  let livePmsContext = '';
  let livePmsResult: LiveAvailabilityResult | null = null;

  if (extractedCheckIn && extractedCheckOut) {
    try {
      livePmsResult = await checkOctorateLiveAvailability({
        checkIn: extractedCheckIn,
        checkOut: extractedCheckOut,
        numGuests: extractedGuests
      });

      if (livePmsResult && livePmsResult.hasLivePmsData) {
        const availList = livePmsResult.availableRooms.length > 0
          ? livePmsResult.availableRooms.map(r => `  • 🟢 ${r.name} (Max ${r.capacity} pax - ${r.minPrice} THB/notte)`).join('\n')
          : '  • NESSUN ALLOGGIO COMPLETAMENTE LIBERO PER L\'INTERO PERIODO.';

        const occList = livePmsResult.occupiedRooms.length > 0
          ? livePmsResult.occupiedRooms.map(r => `  • 🔴 ${r.name} (OCCUPATO nelle date: ${r.unavailableDates.join(', ')})`).join('\n')
          : '  • Nessun alloggio occupato (tutti disponibili).';

        livePmsContext = `
=== LIVE OCTORATE PMS REAL-TIME AVAILABILITY (${extractedCheckIn} to ${extractedCheckOut} - ${livePmsResult.totalNights} nights) ===
🟢 CAMERE REALMENTE LIBERE (PROPORRE SOLO QUESTE!):
${availList}

🔴 CAMERE OCCUPATE O IN STOP-SELL (NON PROPORRE!):
${occList}

CRITICAL PMS DIRECTIVE & AVAILABILITY TRUTH:
1. STRICT AVAILABILITY TRUTH (NEVER GIVE FALSE HOPES): If there are NO rooms listed as 🟢 CAMERE REALMENTE LIBERE for the full requested stay (e.g. 7 or 14 nights, or multiple adjacent units), YOU MUST STATE TRANSPARENTLY that we do NOT have consecutive availability for the entire duration!
2. Explain that we DO have scattered open dates and gap nights between other bookings (i "buchi" nel calendario).
3. Invite them to check our live interactive calendar ({{CALENDAR_URL}}) where they can inspect the exact open days.
4. Explain the seasonal minimum stay rule: 5 nights in high season (1 Dec - 31 Mar), 2 nights in low season (1 Apr - 30 Nov), and that gap nights ("buchi") can be booked for fewer nights!
5. ONLY recommend and quote rooms as fully available if they are verified in 🟢 CAMERE REALMENTE LIBERE for all nights requested!
======================================================================
`;
      } else {
        livePmsContext = `
=== LIVE OCTORATE PMS STATUS FOR (${extractedCheckIn} to ${extractedCheckOut}) ===
⚠️ ATTENZIONE: I dati live di Octorate mostrano che NON ci sono camere libere in modo consecutivo per tutte le notti richieste (${extractedNights || 7} notti consecutive per 2 alloggi).
DIRETTIVA TASSATIVA SULLE DISPONIBILITÀ:
1. NON dichiarare che le camere sono disponibili per l'intero soggiorno (es. 7 o 14 notti)!
2. Dichiara con trasparenza ed educazione che purtroppo al momento non abbiamo disponibilità consecutiva per l'intero periodo richiesto per due alloggi.
3. Spiega che ci sono però date singole o intervalli liberi (i "buchi" nel calendario tra le altre prenotazioni).
4. Invita l'ospite a consultare la nostra griglia interattiva live ({{CALENDAR_URL}}) dove potrà verificare le singole notti disponibili.
5. Ricorda la regola del soggiorno minimo stagionale: in alta stagione (1 Dicembre – 31 Marzo) il minimo è di 5 notti consecutive, MA i buchi rimasti liberi nel calendario possono essere prenotati anche per meno notti (il minimo notti specifico è visibile all'interno di ciascuna casella del calendario). In bassa/media stagione (1 Aprile – 30 Novembre) il minimo è di 2 notti.
======================================================================
`;
      }
    } catch (pmsErr) {
      console.warn('[processBookingInquiry] Octorate live check warning:', pmsErr);
    }
  }

  // -------------------------------------------------------------
  // STEP 3: Complete Knowledge Base & Learned Rules Context
  // -------------------------------------------------------------
  const completeKnowledge = await getCompleteKnowledgePromptContext();
  const learnedRulesContext = await getActiveRulesPromptContext();
  const customPrompt = await getCustomSystemPrompt();

  const systemPrompt = `You are the expert AI Hospitality Concierge and CRM Assistant for "Flower Power Village", a boutique eco-resort on Koh Phayam island (Ranong, Southern Thailand), just 150 meters (1-2 minutes walk) from Buffalo Bay beach (Aow Kao Kwai).
Flower Power Village combines authentic Italian hospitality, an artisanal Italian restaurant & bakery on-site, tropical villas with terraces, wooden bungalows, and luxury glamping tents.

TODAY'S REFERENCE DATE: ${todayIso} (Current Year: ${nowYear}, Month: ${nowMonth}).

${completeKnowledge}

${livePmsContext}

${learnedRulesContext ? `\n=== LEARNED MANAGEMENT RULES (FROM TELEGRAM FEEDBACK) ===\n${learnedRulesContext}\n` : ''}

${customPrompt ? `\n=== MANAGEMENT CUSTOM SYSTEM PROMPT OVERRIDES ===\n${customPrompt}\n` : ''}

TASK:
Analyze the guest inquiry (email, WhatsApp message, Instagram/Facebook DM, etc., in ANY language: English, Italian, German, French, Thai, Russian, Spanish, Dutch, etc.).

EXTRACTION RULES:
1. Detect language (IT, EN, DE, FR, TH, ES, RU, etc.).
2. Extract Guest Name if present in greeting or signature.
3. Extract Dates (Check-In & Check-Out):
   - Resolve relative dates or month names intelligently.
   - TEMPORAL ANCHOR RULE: If the guest mentions a month that has already passed in ${nowYear} (e.g. today is November ${nowYear} and guest asks for "January" or "February"), the intended year MUST be next year (${nowYear + 1})!
   - Format: "YYYY-MM-DD". If only a month is mentioned without exact days (e.g. "sometime in March"), set targetMonth to "YYYY-MM" (e.g. "${nowYear + 1}-03") and checkIn/checkOut to null.
4. Extract Target Month: "YYYY-MM". If check-in is known, targetMonth is checkIn's YYYY-MM. If no date is mentioned at all, use current or upcoming peak season month (e.g. "${nowYear}-${String(nowMonth).padStart(2, '0')}").
5. Count Nights: difference between checkIn and checkOut.
6. Guests: count adults and children if specified.
7. Accommodation: identify if they asked for a Villa (Penthouse, Peace & Love, Jungle), Bungalow (Red, Yellow, Green), Glamping Tent (Camel, Lagoon), Room, or any accommodation.

REPLY GENERATION RULES (FOLLOWING MARCO'S OFFICIAL GOLDEN TEMPLATE):
1. Tone: Warm, polite, hospitable, transparent, enthusiastic, and welcoming ("Hello [Name], thank you for contacting us and for considering your vacation at Flower Power Village! 🌸🌴").
2. Language: Write the replies in the EXACT SAME LANGUAGE the guest used! (e.g., German if German, Italian if Italian, Thai if Thai, etc.).
3. Real-Time Availability & Smart Accommodation Recommendation:
   - When PMS live data is provided above, PROPOSE ONLY VERIFIED FREE ACCOMMODATIONS!
   - Direct Booking Discount: The prices displayed in the online calendar are our official standard rates (the 10% discount is NOT yet visible in the calendar). Clearly inform the guest that once they proceed with the reservation directly on our website (or directly via chat), an ADDITIONAL 10% DIRECT BOOKING DISCOUNT will be automatically applied at checkout (or 15% pre-booking discount on Guesthouse rooms)!
   - Match party capacity and specify the exact bed layout and direct link for each proposed room:
     • Jungle Villa (4+4 pax, 2 rooms, 2 baths, 2 King + 2 Sofa Bed Queen): https://www.flowerpowervillage.com/52-jungle-villa
     • Jungle Villa Left (2+2 pax, 1 King + 1 Sofa Bed Queen): https://www.flowerpowervillage.com/53-jungle-villa-left
     • Jungle Villa Right (2+2 pax, 1 King + 1 Sofa Bed Queen): https://www.flowerpowervillage.com/54-jungle-villa-right
     • Peace & Love Villa (2+2 pax, 1 King + 1 Sofa Bed Queen, terrace & hammock): https://www.flowerpowervillage.com/51-villa-peace-love
     • Villa Penthouse (4 pax, 2 rooms, 2 baths, 1 King + 1 Sofa Bed King): https://www.flowerpowervillage.com/22-villa-penthouse
     • Yellow Bungalow (2+1 pax, 1 King + extra single bed, kitchen & lounge): https://www.flowerpowervillage.com/11-yellow-bungalow
     • Red Bungalow (2+1 pax, 1 King + extra single bed): https://www.flowerpowervillage.com/12-red-bungalow
     • Green Bungalow (2+1 pax, 1 King + extra single bed): https://www.flowerpowervillage.com/13-green-bungalow
     • Lagoon Glamping Tent (2 pax, extra single bed): https://www.flowerpowervillage.com/21-lagoon-tent
     • Camel Glamping Tent (2 pax, extra single bed): https://www.flowerpowervillage.com/23-camel-tent
     • Internal Budget Room (2 pax, no hot water): https://www.flowerpowervillage.com/41-room-internal
4. Air Conditioning & Energy Options:
   - Always include the clear A/C options:
     ❄️ Air Conditioning:
     Rooms have portable units; bungalows and villas have fixed traditional AC.
     • Pay-per-use (Recommended): 40฿ per unit (~20฿/hour | ~0.5€), paid at checkout based on actual meter consumption.
     • All-Inclusive (Prepaid): 400฿/day for Bungalows & Rooms | 800฿/day for Villas.
     (Electricity on Koh Phayam is generated locally on the island).
5. Important Reminders & Policies:
   - Deposit & Online Payment:
     * 30% deposit to secure the direct booking directly on our website via Credit Card or PayPal.
     * The remaining 70% balance can be paid directly online on our website or upon arrival at check-in (Credit Card, PayPal, or Cash in THB).
     * DO NOT mention Wise or Revolut! All bookings and payments are handled autonomously by the guest directly on our website.
     * Free cancellation with 100% full deposit refund up to 14 days prior to check-in. Within 14 days of arrival, the deposit is non-refundable.
   - Seasonal Minimum Stay (CONTEXTUAL TO THE GUEST'S REQUESTED DATES!):
     * If the guest specifies dates or a month, STATE ONLY the minimum stay for that specific period! DO NOT recite both seasons!
     * For dates falling in High Season (1 Dec – 31 Mar, e.g. January): "Our minimum stay for your requested period in January is 5 consecutive nights."
     * For dates falling in Low/Mid Season (1 Apr – 30 Nov): "Our minimum stay for your requested period is 2 consecutive nights."
     * Gap Nights ("Buchi"): "However, isolated open dates ('gaps') between existing bookings in the calendar can be booked individually for fewer nights – the exact minimum is shown in each calendar box."
     * If and ONLY IF the guest provided no dates or month at all, briefly mention the general seasonal rule.
   - Amenities & Village highlights:
     * Mosquito protection: Clean mosquito nets fully enclosing every bed in all accommodations.
     * Electricity: Continuous 24/7 power.
     * Natural shade & setting: Peaceful tropical garden with lush trees, 150m flat walk (1-2 min) to Buffalo Bay (Ao Khao Kwai) beach.
     * Breakfast & Bakery: On-site Italian bakery (fresh warm croissants, Italian espresso, pizza, healthy breakfast à la carte).
   - Strictly forbidden: lighting fires and camping with tents in the garden.
6. Core Calendar Call to Action:
   - MANDATORY: Always include the live interactive calendar link pointing directly to the guest's timeframe:
     📅 Live Interactive Calendar: {{CALENDAR_URL}}
   - Close with: "You can book directly through the link or directly with me here via chat! 🌴✨"
   - Invite the guest to view the live availability grid and dynamic rates directly:
     📅 Live Interactive Calendar: {{CALENDAR_URL}}
   - Close with: "You can book directly through the link or directly with me here via chat! 🌴✨"
6. Provide TWO versions:
   - politeReplyWhatsApp: conversational, warm, nicely formatted with tasteful contextual emojis.
   - politeReplyEmail: structured email format with polite greeting, paragraphs, clear bullet points and signature.
   - emailSubject: attractive subject line in the guest language.
7. Provide shortSummary: 1-2 lines in Italian summarizing the request for the resort manager.

Return STRICTLY valid JSON with this exact schema:
{
  "detectedLanguage": "EN",
  "guestName": "Sarah" or null,
  "checkInDate": "2027-02-15" or null,
  "checkOutDate": "2027-02-22" or null,
  "targetMonth": "2027-02",
  "numNights": 7 or null,
  "numGuests": 2 or null,
  "numAdults": 2 or null,
  "numChildren": 0 or null,
  "requestedAccommodation": "bungalow" or null,
  "accommodationSlug": "red-bungalow" or null,
  "shortSummary": "...",
  "emailSubject": "...",
  "politeReplyWhatsApp": "...",
  "politeReplyEmail": "..."
}`;

  const userPrompt = `GUEST INQUIRY TEXT:\n"""\n${text}\n"""`;

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
    throw new Error(`Errore risposta DeepSeek API (${deepSeekRes.status}): ${errText}`);
  }

  const aiData = await deepSeekRes.json();
  const rawContent = aiData.choices?.[0]?.message?.content || '{}';
  const cleanJson = rawContent.trim().replace(/^```json/i, '').replace(/```$/i, '').trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (err: any) {
    throw new Error(`Impossibile decodificare il JSON da DeepSeek: ${err.message}. Raw: ${rawContent}`);
  }

  const detectedLanguage = (parsed.detectedLanguage || 'EN').toUpperCase();
  const targetMonth = parsed.targetMonth || extractedTargetMonth || `${nowYear}-${String(nowMonth).padStart(2, '0')}`;
  const checkInDate = parsed.checkInDate || extractedCheckIn || null;
  const checkOutDate = parsed.checkOutDate || extractedCheckOut || null;
  const accommodationSlug = normalizeAccommodationSlug(parsed.accommodationSlug || parsed.requestedAccommodation || extractedRoom);

  // Genera l'URL definitivo del calendario live con vista timeline e date evidenziate
  const calendarUrl = buildVillageCalendarUrl({
    targetMonth,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    roomSlug: accommodationSlug,
    lang: detectedLanguage
  });

  // Sostituisci il placeholder {{CALENDAR_URL}} e QUALSIASI URL nudo del calendario con l'URL parametrizzato
  const formatCalendarLinks = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\{\{CALENDAR_URL\}\}/g, calendarUrl)
      .replace(/https?:\/\/(?:www\.)?flowerpowervillage\.com\/calendar(?!\?)[^\s<"'\)]*/g, calendarUrl)
      .trim();
  };

  const replyWhatsApp = formatCalendarLinks(parsed.politeReplyWhatsApp || '');
  const replyEmail = formatCalendarLinks(parsed.politeReplyEmail || '');

  const livePmsSummary = (livePmsResult && livePmsResult.hasLivePmsData)
    ? {
      checked: true,
      availableCount: livePmsResult.availableRooms.length,
      occupiedCount: livePmsResult.occupiedRooms.length,
      availableNames: livePmsResult.availableRooms.map(r => r.name),
      occupiedNames: livePmsResult.occupiedRooms.map(r => r.name)
    }
    : null;

  return {
    detectedLanguage,
    guestName: parsed.guestName || extractedName || null,
    checkInDate,
    checkOutDate,
    targetMonth,
    numNights: parsed.numNights || (checkInDate && checkOutDate ? Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 3600 * 24)) : null),
    numGuests: parsed.numGuests || extractedGuests || null,
    numAdults: parsed.numAdults || null,
    numChildren: parsed.numChildren || null,
    requestedAccommodation: parsed.requestedAccommodation || extractedRoom || null,
    accommodationSlug,
    shortSummary: parsed.shortSummary || `Richiesta rilevata (${detectedLanguage}): ${targetMonth}`,
    emailSubject: parsed.emailSubject || `Availability & Booking - Flower Power Village Koh Phayam`,
    politeReplyWhatsApp: replyWhatsApp || `Hello! Check our availability here: ${calendarUrl}`,
    politeReplyEmail: replyEmail || `Hello! You can check availability here: ${calendarUrl}`,
    calendarUrl,
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
    calendarUrl = 'https://flowerpowervillage.com/calendar'
  } = options;

  const apiKey = await getDeepSeekApiKey();
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY non configurata nel server');
  }

  const completeKnowledge = await getCompleteKnowledgePromptContext();

  const systemPrompt = `You are the AI Hospitality Concierge for Flower Power Village (Koh Phayam, Thailand).
The resort general manager (Marco) is reviewing a proposed response to a guest and has given specific criticism, corrections, or instructions.

${completeKnowledge}

YOUR TASK:
1. Re-write the proposed response for the guest (both WhatsApp and Email) exactly following Marco's critique and instructions while keeping the tone warm, welcoming, and hospitable.
2. Ensure the link to the live calendar (${calendarUrl}) remains present.
3. Formulate an abstract, general MANAGEMENT RULE that captures Marco's directive so that ALL future inquiries handled by the bot will follow this rule automatically without needing to be corrected again!
4. Provide a 1-sentence summary of what changed.

Return STRICTLY valid JSON with this schema:
{
  "refinedWhatsApp": "Full refined WhatsApp message text...",
  "refinedEmail": "Full refined Email message text...",
  "suggestedRuleTitle": "Concise title for the rule (e.g. 'Tariffe Taxi Mr. Gong', 'Distanza Spiaggia Buffalo Bay', 'Colazione Bakery e Orari')",
  "suggestedRuleContent": "Clear directive instruction for future AI prompts (e.g. 'La spiaggia dista 150 metri a piedi. Mr. Gong è il nostro autista fidato per transfer da Ranong aeroporto a 300 THB.')",
  "summaryOfChanges": "Breve sintesi in italiano delle modifiche applicate"
}`;

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
"""`;

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
  const cleanJson = rawContent.trim().replace(/^```json/i, '').replace(/```$/i, '').trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (err: any) {
    throw new Error(`Impossibile decodificare il JSON da DeepSeek durante il feedback: ${err.message}`);
  }

  return {
    refinedWhatsApp: (parsed.refinedWhatsApp || '').trim(),
    refinedEmail: (parsed.refinedEmail || '').trim(),
    suggestedRuleTitle: parsed.suggestedRuleTitle || 'Direttiva Gestione',
    suggestedRuleContent: parsed.suggestedRuleContent || userFeedback,
    summaryOfChanges: parsed.summaryOfChanges || 'Risposta corretta in base al feedback'
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
    'template:', 'modello:', 'regola:', 'regole:', 'info:', 'direttiva:', 
    'aggiorna:', 'nozione:', 'database:', 'nota:', 'memorizza:', 'salva regola:'
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

  // Registrazione e invalidazione cache in google-sheets-sync
  let savedToSheet = false;
  try {
    const { recordTelegramUpdateToKnowledge } = await import('./google-sheets-sync.js');
    await recordTelegramUpdateToKnowledge({
      rawFeedback: text,
      extractedTitle: title,
      extractedContent: content
    });
    savedToSheet = true;
  } catch (sheetErr) {
    console.warn('[processKnowledgeUpdate] Google Sheet sync warning:', sheetErr);
  }

  const CATEGORY_TITLES: Record<string, string> = {
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
    categoryTitle: CATEGORY_TITLES[category] || category,
    isTemplate,
    savedToDb,
    savedToSheet,
    summary
  };
}
