import { createClient } from "@supabase/supabase-js";
/**
 * AI Booking Concierge & Smart Calendar Assistant for Flower Power Village (Koh Phayam)
 * 
 * Interpreta le richieste di prenotazione dei clienti (email, whatsapp, social)
 * tramite l'API di DeepSeek, estrae periodo/date/ospiti/alloggio, genera una risposta
 * educata, simpatica ed empatica e genera il link diretto al calendario live di Flower Power Village.
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
}

export interface ProcessBookingInquiryOptions {
  text: string;
  sourceLangHint?: string;
  currentDate?: Date;
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
}): string {
  const baseUrl = 'https://flowerpowervillage.com/calendar';
  const q = new URLSearchParams();

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
 * Invia il messaggio a DeepSeek AI per interpretarlo ed estrarre tutti i parametri di prenotazione
 */

/**
 * Recupera la chiave API di DeepSeek dall'environment o con fallback su Supabase
 */
async function getDeepSeekApiKey(): Promise<string | null> {
  const direct = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
  if (direct && direct.trim()) return direct.trim();

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
    if (supabaseUrl && supabaseKey) {
      const client = createClient(supabaseUrl, supabaseKey);
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

  const systemPrompt = `You are the AI Booking Concierge & Reservations Assistant for "Flower Power Village", a boutique eco-resort nestled in tropical nature on Koh Phayam island (Ranong, Thailand), just a short stroll from Buffalo Bay (Aow Kao Kwai).
Flower Power Village features authentic Italian hospitality, an Italian restaurant & bakery on-site, tropical villas with terraces, wooden bungalows, and luxury glamping tents.

TODAY'S REFERENCE DATE: ${todayIso} (Current Year: ${nowYear}, Month: ${nowMonth}).

TASK:
Analyze the guest inquiry (which could be an email, WhatsApp message, Instagram DM, etc., in ANY language: English, Italian, German, French, Thai, Russian, Spanish, etc.).

EXTRACTION RULES:
1. Detect language (IT, EN, DE, FR, TH, ES, RU, etc.).
2. Extract Guest Name if present in greeting or signature.
3. Extract Dates (Check-In & Check-Out):
   - Resolve relative dates or month names intelligently.
   - TEMPORAL ANCHOR RULE: If the guest mentions a month that has already passed in the current year (e.g. today is November ${nowYear} and guest asks for "January" or "February"), the intended year MUST be next year (${nowYear + 1})!
   - Format: "YYYY-MM-DD". If only a month is mentioned without exact days (e.g. "sometime in March"), set targetMonth to "YYYY-MM" (e.g. "${nowYear + 1}-03") and checkIn/checkOut to null.
4. Extract Target Month: "YYYY-MM". If check-in is known, targetMonth is checkIn's YYYY-MM. If no date is mentioned at all, use current or upcoming peak season month (e.g. "${nowYear}-${String(nowMonth).padStart(2, '0')}").
5. Count Nights: difference between checkIn and checkOut.
6. Guests: count adults and children if specified.
7. Accommodation: identify if they asked for a Villa (Penthouse, Peace & Love, Jungle), Bungalow (Red, Yellow, Green), Glamping Tent (Camel, Lagoon), Room, or any accommodation.

REPLY GENERATION RULES:
1. Tone: Warm, polite, hospitable, enthusiastic, and welcoming ("educata e simpatica", island vibe, tropical Italian hospitality).
2. Language: Write the replies in the EXACT SAME LANGUAGE the guest used! (e.g., German if inquiry is German, Italian if Italian, Thai if Thai, etc.).
3. Core Message:
   - Thank them warmly for their interest in Flower Power Village on Koh Phayam.
   - Mention the requested period and accommodation nicely.
   - Explain that to give them the absolute fastest and most up-to-date information, they can view our live interactive availability calendar and real-time best rates directly on our website, where they can choose their favorite room and confirm instantly.
   - INCLUDE THE CALENDAR URL PLACEHOLDER: {{CALENDAR_URL}} right in the body of the message.
   - Close with warm regards from "Flower Power Village Koh Phayam Team 🌺🌴".
4. Provide TWO versions:
   - politeReplyWhatsApp: conversational, warm, concise, nicely formatted with tasteful contextual emojis.
   - politeReplyEmail: structured email format with polite greeting, paragraphs, clear bullet points and signature.
   - emailSubject: attractive subject line in the guest language.
5. Provide shortSummary: 1-2 lines in Italian summarizing the request for the resort manager (e.g. "Richiesta per 2 adulti, Bungalow, 10-15 Febbraio 2027 (5 notti)").

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
  const targetMonth = parsed.targetMonth || `${nowYear}-${String(nowMonth).padStart(2, '0')}`;
  const checkInDate = parsed.checkInDate || null;
  const checkOutDate = parsed.checkOutDate || null;
  const accommodationSlug = normalizeAccommodationSlug(parsed.accommodationSlug || parsed.requestedAccommodation);

  // Genera l'URL definitivo del calendario live
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

  return {
    detectedLanguage,
    guestName: parsed.guestName || null,
    checkInDate,
    checkOutDate,
    targetMonth,
    numNights: parsed.numNights || (checkInDate && checkOutDate ? Math.round((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 3600 * 24)) : null),
    numGuests: parsed.numGuests || null,
    numAdults: parsed.numAdults || null,
    numChildren: parsed.numChildren || null,
    requestedAccommodation: parsed.requestedAccommodation || null,
    accommodationSlug,
    shortSummary: parsed.shortSummary || `Richiesta rilevata (${detectedLanguage}): ${targetMonth}`,
    emailSubject: parsed.emailSubject || `Availability & Booking - Flower Power Village Koh Phayam`,
    politeReplyWhatsApp: replyWhatsApp || `Hello! Check our availability here: ${calendarUrl}`,
    politeReplyEmail: replyEmail || `Hello! You can check availability here: ${calendarUrl}`,
    calendarUrl
  };
}

