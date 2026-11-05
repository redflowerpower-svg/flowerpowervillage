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
  const baseUrl = 'https://flowerpowervillage.com/calendar';
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

CRITICAL PMS DIRECTIVE:
1. ONLY recommend and quote rooms that are listed as 🟢 CAMERE REALMENTE LIBERE!
2. NEVER offer or suggest any room listed under 🔴 CAMERE OCCUPATE as available.
3. If the guest specifically asked for an occupied room (e.g. "${extractedRoom || 'un alloggio specifico'}"), politely and gently explain that it is already booked for their requested dates, and enthusiastically suggest the best available alternative from the 🟢 free list that accommodates their group size!
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

REPLY GENERATION RULES:
1. Tone: Warm, polite, hospitable, enthusiastic, and welcoming ("educata e simpatica", island vibe, tropical Italian hospitality).
2. Language: Write the replies in the EXACT SAME LANGUAGE the guest used! (e.g., German if inquiry is German, Italian if Italian, Thai if Thai, etc.).
3. Real-Time Availability & Smart Accommodation Recommendation:
   - When PMS live data is provided above, PROPOSE ONLY FREE ROOMS!
   - If requested room is booked, explain kindly and offer the best free alternative.
   - Always match capacity:
     * 1-2 Guests: Propose a Wooden Bungalow (Red, Yellow, or Green), a Luxury Glamping Tent (Camel or Lagoon), or a Villa for extra comfort (Peace & Love or Penthouse).
     * 3 Guests (e.g. 2 adults + 1 child): Recommend Penthouse Villa, Peace & Love Villa (with extra bed or baby cot), or Jungle Villa.
     * 4 Guests (family or group of 4):
       - Option A: Penthouse Villa (sleeps up to 4) or Jungle Villa (1 double bed + 2 twin beds).
       - Option B: Two side-by-side Wooden Bungalows (e.g. Red + Yellow Bungalow, 2 guests each).
     * 5+ Guests or 2 Families: Propose smart combinations of neighboring units (e.g. Penthouse + Peace & Love, or Red + Yellow Bungalows).
4. Comprehensive Answer to Specific Questions:
   - If the guest asks about mosquito nets, baby cots, air conditioning/fans, restaurant, breakfast, getting to the island from Ranong, or cancellation terms, ANSWER THEM DIRECTLY and accurately using the Village Knowledge Base and Learned Rules above!
   - Official verified facts: Beach is 150 METERS away. Wi-Fi is high-speed fiber broadband. Dedicated taxi driver from Ranong airport/town is Mr. Gong (300 THB solo, 200 THB/pax for 2+). Speedboat to island is 350 THB. Breakfast is à la carte at our Italian bakery (150-250 THB, fresh croissants & espresso).
5. Core Calendar Call to Action:
   - Explain that to check real-time availability for their dates and secure direct booking rates, they can access our live interactive calendar.
   - MUST INCLUDE THE CALENDAR URL PLACEHOLDER: {{CALENDAR_URL}} right in the body of the message.
   - Close with warm regards from "Flower Power Village Koh Phayam Team 🌺🌴".
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

  // Sostituisci il placeholder {{CALENDAR_URL}} nei testi generati
  const replyWhatsApp = (parsed.politeReplyWhatsApp || '')
    .replace(/\{\{CALENDAR_URL\}\}/g, calendarUrl)
    .trim();

  const replyEmail = (parsed.politeReplyEmail || '')
    .replace(/\{\{CALENDAR_URL\}\}/g, calendarUrl)
    .trim();

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
