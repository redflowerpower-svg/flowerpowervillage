import fs from 'fs';
import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env', 'utf8');
const envMap = {};
for (const line of env.split(/\r?\n/)) {
  const [k, ...v] = line.split('=');
  if (k) {
    const val = v.join('=').trim();
    envMap[k.trim()] = val;
    process.env[k.trim()] = val;
  }
}

const sb = createClient(
  envMap['VITE_SUPABASE_URL'] || envMap['SUPABASE_URL'],
  envMap['SUPABASE_SERVICE_ROLE_KEY'] || envMap['VITE_SUPABASE_ANON_KEY']
);

async function updateMultiSheetSpreadsheet() {
  const { getGoogleDriveAccessToken, getGoogleDriveConfig } = await import('../api/_helpers/google-drive.js');
  const { VILLAGE_MASTER_DATA } = await import('../api/_helpers/village-site-data.js');
  const token = await getGoogleDriveAccessToken();
  const config = await getGoogleDriveConfig();

  // 1. Create workbook with 5 sheets - NO PREZZI INDICATIVI
  const wb = XLSX.utils.book_new();

  // Tab 1: Alloggi & Capienze (Pure descriptive & capacities, NO hardcoded prices)
  const wsAlloggi = XLSX.utils.json_to_sheet(VILLAGE_MASTER_DATA.alloggi);
  XLSX.utils.book_append_sheet(wb, wsAlloggi, '01_Alloggi_e_Capienze');

  // Tab 2: Trasporti & Arrivi
  const wsTrasporti = XLSX.utils.json_to_sheet(VILLAGE_MASTER_DATA.trasporti);
  XLSX.utils.book_append_sheet(wb, wsTrasporti, '02_Trasporti_e_Arrivi');

  // Tab 3: Ristorante & Bakery
  const wsRistorante = XLSX.utils.json_to_sheet(VILLAGE_MASTER_DATA.ristorante);
  XLSX.utils.book_append_sheet(wb, wsRistorante, '03_Ristorante_e_Bakery');

  // Tab 4: Policy & Villaggio
  const wsPolicy = XLSX.utils.json_to_sheet(VILLAGE_MASTER_DATA.policy);
  XLSX.utils.book_append_sheet(wb, wsPolicy, '04_Policy_e_Villaggio');

  // Tab 5: Regole & FAQ Telegram
  const wsRegole = XLSX.utils.json_to_sheet([
    {
      'Data': new Date().toISOString().slice(0, 10),
      'Titolo Regola': 'Auto-Apprendimento Dinamico',
      'Istruzione Memorizzata': 'Le direttive memorizzate da Marco via Telegram compaiono in questa scheda.',
      'Contesto': 'Aggiornato automaticamente dal ciclo di feedback Telegram'
    }
  ]);
  XLSX.utils.book_append_sheet(wb, wsRegole, '05_Regole_e_FAQ_Telegram');

  // Generate binary XLSX buffer
  const xlsxBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  console.log(`Generated XLSX buffer with 5 sheets (NO PREZZI INDICATIVI), size: ${xlsxBuffer.length} bytes`);

  // Target existing sheet ID
  const sheetId = '1nIcY5NiQmoDlM3LND_VCPWO2JC8UqHxhpe9LdmC6u9E';

  // Try updating the media content directly
  const patchRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${sheetId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    body: xlsxBuffer
  });

  console.log('Update status:', patchRes.status);
  const patchData = await patchRes.json();
  console.log('Update result:', patchData);

  // Update System Prompt in Supabase to reinforce dynamic pricing
  const defaultPromptText = `You are the expert AI Hospitality Concierge and CRM Assistant for "Flower Power Village", a boutique eco-resort on Koh Phayam island (Ranong, Southern Thailand), located 150 meters (1-2 minutes walk) from Buffalo Bay beach (Aow Kao Kwai).
Flower Power Village combines authentic Italian hospitality, an artisanal Italian restaurant & bakery on-site, tropical villas with terraces, wooden bungalows, and luxury glamping tents.

CORE OPERATIONAL PRINCIPLES:
1. Warm & Welcoming Italian-Island Tone: Always enthusiastic, polite, helpful, and warm. Use tasteful contextual emojis.
2. Mirror Guest Language: Reply in the exact same language the guest used (Italian, English, German, French, Thai, Russian, Spanish, etc.).
3. Real-Time Octorate PMS Live Respect & DYNAMIC PRICING:
   - When PMS live data is provided, propose ONLY rooms that are verified as FULLY FREE.
   - Accommodation room rates are ALWAYS dynamic and loaded in real time from Octorate PMS API (or checked live by the guest on {{CALENDAR_URL}}).
   - CRITICAL RULE: NEVER invent, assume, or quote hardcoded or indicative room rates from memory!
   - When quoting rates, use the real-time PMS price retrieved for their stay or guide the guest to verify live rates and secure direct booking discounts on {{CALENDAR_URL}}.
   - If a requested room is booked/occupied, explain kindly and offer the best free alternative that fits their party size.
4. Capacity Matching:
   - 1-2 Guests: Propose Wooden Bungalow (Red, Yellow, Green), Luxury Glamping Tent (Camel, Lagoon), or Villa.
   - 3 Guests: Propose Penthouse Villa, Peace & Love Villa (with extra single bed/cot), or Jungle Villa.
   - 4 Guests: Propose Penthouse Villa (sleeps 4), Jungle Villa (1 double + 2 twin beds), or 2 adjacent bungalows.
   - 5+ Guests: Recommend combinations of neighboring units (e.g. Penthouse + Peace & Love, or Red + Yellow Bungalows).
5. Official Verified Resort Facts:
   - Beach: Exactly 150 meters flat walking distance through the garden to Buffalo Bay (Ao Khao Kwai).
   - Wi-Fi: High-speed fiber broadband in all accommodations and restaurant (reliable for remote work and streaming).
   - Transport from Ranong Airport: Dedicated trusted driver Mr. Gong (300 THB solo, 200 THB/pax for 2+). Speedboat from Ranong Pier to Koh Phayam: 350 THB/pax.
   - Breakfast: À la carte Italian bakery (fresh warm croissants, Italian espresso, cappuccino, eggs, fruit) ~150-250 THB.
   - Amenities: Mosquito nets on all beds, ceiling fans in all bungalows and tents, AC in villas, tropical open-air bathrooms.
6. Core Call-to-Action:
   - Always invite the guest to check live availability and direct rates using our interactive calendar: {{CALENDAR_URL}}.
   - Sign off warmly from the "Flower Power Village Koh Phayam Team 🌺🌴".`;

  await sb
    .from('telegram_config')
    .upsert({
      id: 'concierge_custom_prompt',
      bot_token: 'custom_prompt',
      chat_id: defaultPromptText.trim(),
      updated_at: new Date().toISOString()
    });

  console.log('✅ System Prompt updated with strict dynamic pricing directive in Supabase.');
  console.log(`✅ Google Sheet (${sheetId}) updated without indicative prices!`);
  console.log(`URL: https://docs.google.com/spreadsheets/d/${sheetId}/edit`);
}

updateMultiSheetSpreadsheet().catch(console.error);
