import { createClient } from "@supabase/supabase-js";
import { getGoogleDriveAccessToken, getGoogleDriveConfig } from "./google-drive.js";
import { VILLAGE_MASTER_DATA, SheetRow } from "./village-site-data.js";

export interface KnowledgeTabInfo {
  name: string;
  rows: SheetRow[];
}

export type KnowledgeTabKey = 
  | '01_Alloggi_e_Capienze'
  | '02_Trasporti_e_Arrivi'
  | '03_Ristorante_e_Bakery'
  | '04_Policy_e_Villaggio'
  | '05_Regole_e_FAQ_Telegram';

const SPREADSHEET_CONFIG_KEY = 'knowledge_base_sheet';

function getSupabaseAdmin() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Converte un array di oggetti in formato CSV semplice per fogli di calcolo
 */
function rowsToCsv(rows: SheetRow[]): string {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];

  for (const row of rows) {
    const values = headers.map(h => {
      const val = row[h] ?? '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    });
    lines.push(values.join(','));
  }

  return lines.join('\n');
}

/**
 * Riconosce la scheda corretta ("Doc") di Google Sheet in base al testo della correzione
 */
export function identifyTargetTab(text: string): {
  tabKey: KnowledgeTabKey;
  tabTitle: string;
  category: 'alloggi' | 'trasporti' | 'ristorante' | 'policy' | 'regole';
} {
  const s = text.toLowerCase();

  // 1. Trasporti
  if (
    s.includes('molo') || s.includes('pier') || s.includes('speedboat') || s.includes('motoscafo') ||
    s.includes('barca') || s.includes('taxi') || s.includes('mr. gong') || s.includes('mr gong') ||
    s.includes('gong') || s.includes('ranong') || s.includes('volo') || s.includes('voli') ||
    s.includes('aereo') || s.includes('aeroporto') || s.includes('airasia') || s.includes('scooter') ||
    s.includes('motorino') || s.includes('bus') || s.includes('choke anan') || s.includes('minivan') ||
    s.includes('phuket') || s.includes('khao lak') || s.includes('traghetto') || s.includes('traghetti')
  ) {
    return {
      tabKey: '02_Trasporti_e_Arrivi',
      tabTitle: 'Trasporti & Arrivi',
      category: 'trasporti'
    };
  }

  // 2. Ristorante & Bakery
  if (
    s.includes('ristorante') || s.includes('restaurant') || s.includes('bakery') || s.includes('colazione') ||
    s.includes('breakfast') || s.includes('cornetto') || s.includes('cornetti') || s.includes('espresso') ||
    s.includes('cappuccino') || s.includes('brioche') || s.includes('pizza') || s.includes('pasta') ||
    s.includes('focaccia') || s.includes('cena') || s.includes('pranzo') || s.includes('cucina') ||
    s.includes('orari') || s.includes('menu') || s.includes('thai') || s.includes('burmese') ||
    s.includes('vegan') || s.includes('vegano') || s.includes('snack')
  ) {
    return {
      tabKey: '03_Ristorante_e_Bakery',
      tabTitle: 'Ristorante & Bakery',
      category: 'ristorante'
    };
  }

  // 3. Policy, Servizi e Spiaggia
  if (
    s.includes('spiaggia') || s.includes('beach') || s.includes('150') || s.includes('buffalo bay') ||
    s.includes('ao khao kwai') || s.includes('wifi') || s.includes('wi-fi') || s.includes('internet') ||
    s.includes('elettricità') || s.includes('corrente') || s.includes('luce') || s.includes('culla') ||
    s.includes('culle') || s.includes('bambini') || s.includes('bambino') || s.includes('letto extra') ||
    s.includes('cane') || s.includes('cani') || s.includes('animali') || s.includes('pet') ||
    s.includes('cancellazione') || s.includes('rimborso') || s.includes('caparra') || s.includes('sconto') ||
    s.includes('sconti') || s.includes('lungo soggiorno') || s.includes('pagamento') || s.includes('stripe')
  ) {
    return {
      tabKey: '04_Policy_e_Villaggio',
      tabTitle: 'Policy & Villaggio',
      category: 'policy'
    };
  }

  // 4. Alloggi & Bungalow
  if (
    s.includes('penthouse') || s.includes('jungle') || s.includes('peace') || /\blove\b/.test(s) ||
    s.includes('bungalow') || s.includes('yellow') || /\bred\b/.test(s) || s.includes('green') ||
    s.includes('tenda') || s.includes('glamping') || s.includes('camel') || s.includes('lagoon') ||
    s.includes('aria condizionata') || s.includes('ventilatore') || s.includes('bagno') ||
    s.includes('letti') || /\bking\b/.test(s) || /\bqueen\b/.test(s) || s.includes('alloggi') ||
    s.includes('camere') || /\broom\b/.test(s)
  ) {
    return {
      tabKey: '01_Alloggi_e_Capienze',
      tabTitle: 'Alloggi & Capienze',
      category: 'alloggi'
    };
  }

  // Default: Regole & FAQ
  return {
    tabKey: '05_Regole_e_FAQ_Telegram',
    tabTitle: 'Regole & FAQ Telegram',
    category: 'regole'
  };
}

/**
 * Ottiene o crea il foglio Google Sheet Master
 */
export async function getOrCreateMasterSpreadsheet(): Promise<{
  id: string;
  name: string;
  url: string;
  createdNow: boolean;
}> {
  const sb = getSupabaseAdmin();
  const defaultSheetName = "Flower Power Village - Master Knowledge Base";

  // 1. Controlla se abbiamo già l'ID salvato in Supabase
  if (sb) {
    try {
      const { data } = await sb
        .from('telegram_config')
        .select('bot_token, chat_id')
        .eq('id', SPREADSHEET_CONFIG_KEY)
        .maybeSingle();

      if (data?.bot_token) {
        return {
          id: data.bot_token,
          name: defaultSheetName,
          url: data.chat_id || `https://docs.google.com/spreadsheets/d/${data.bot_token}/edit`,
          createdNow: false
        };
      }
    } catch (e) {
      console.warn('[getOrCreateMasterSpreadsheet] Errore lettura config:', e);
    }
  }

  // 2. Crea un nuovo Google Sheet su Google Drive
  const token = await getGoogleDriveAccessToken();
  const driveConfig = await getGoogleDriveConfig();

  const createRes = await fetch("https://www.googleapis.com/drive/v3/files?supportsAllDrives=true", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: defaultSheetName,
      mimeType: "application/vnd.google-apps.spreadsheet",
      parents: driveConfig.folderId ? [driveConfig.folderId] : undefined
    })
  });

  if (!createRes.ok) {
    throw new Error(`Impossibile creare il Google Sheet su Drive: ${createRes.status}`);
  }

  const fileData = await createRes.json();
  const sheetId = fileData.id;
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

  // Salva l'ID su Supabase
  if (sb) {
    await sb
      .from('telegram_config')
      .upsert({
        id: SPREADSHEET_CONFIG_KEY,
        bot_token: sheetId,
        chat_id: sheetUrl,
        updated_at: new Date().toISOString()
      });
  }

  return {
    id: sheetId,
    name: defaultSheetName,
    url: sheetUrl,
    createdNow: true
  };
}

/**
 * Salva un aggiornamento inviato da Telegram registrandolo nella scheda corretta
 */
export async function recordTelegramUpdateToKnowledge(params: {
  rawFeedback: string;
  extractedTitle: string;
  extractedContent: string;
}): Promise<{
  targetTab: KnowledgeTabKey;
  tabTitle: string;
  success: boolean;
}> {
  const { rawFeedback, extractedTitle, extractedContent } = params;
  const { tabKey, tabTitle } = identifyTargetTab(rawFeedback);
  const sb = getSupabaseAdmin();

  // Registra la riga in Supabase con categoria associata alla tab
  if (sb) {
    try {
      await sb
        .from('concierge_memory')
        .insert({
          category: tabKey,
          title: extractedTitle,
          content: extractedContent,
          active: true
        });
    } catch (dbErr) {
      // Fallback
      console.warn('[recordTelegramUpdateToKnowledge] Fallback store:', dbErr);
    }
  }

  return {
    targetTab: tabKey,
    tabTitle,
    success: true
  };
}

/**
 * Genera il blocco di testo completo per il Prompt di DeepSeek formattando tutti i dati ufficiali
 */
export async function getCompleteKnowledgePromptContext(): Promise<string> {
  const blocks: string[] = [
    "=== FLOWER POWER VILLAGE OFFICIAL KNOWLEDGE BASE ===",
    "The following is the authoritative, verified resort data extracted directly from the official website and resort management records.",
    "You MUST adhere strictly to these real parameters without inventing or guessing any values:\n"
  ];

  // 1. Alloggi
  blocks.push("--- 01. ACCOMMODATIONS & CAPACITY (ALLOGGI & CAPIENZE) ---");
  for (const a of VILLAGE_MASTER_DATA.alloggi) {
    blocks.push(
      `• [${a.Alloggio} (${a.Slug})]: Capienza: ${a["Capacità Base"]} ospiti (max ${a["Capacità Max"]}). Letti: ${a["Configurazione Letti"]}. Climatizzazione: ${a.Climatizzazione}. Bagni: ${a.Bagni}. Zanzariere: ${a.Zanzariere}. Prezzo indicativo: ${a["Prezzo Indicativo (THB)"]} THB/notte. Dettagli: ${a["Punti di Forza"]}`
    );
  }

  // 2. Trasporti
  blocks.push("\n--- 02. HOW TO GET HERE & TRANSPORT (TRASPORTI E ARRIVI DA RANONG) ---");
  for (const t of VILLAGE_MASTER_DATA.trasporti) {
    blocks.push(
      `• [${t.Ambito} - ${t["Dettaglio / Tratta"]}]: ${t["Compagnia / Mezzo"]}. Durata: ${t.Durata}. Costi: ${t["Costi Indicativi"]}. Note: ${t["Note Operative"]}`
    );
  }

  // 3. Ristorante & Bakery
  blocks.push("\n--- 03. RESTAURANT & BAKERY (RISTORANTE E COLAZIONI) ---");
  for (const r of VILLAGE_MASTER_DATA.ristorante) {
    blocks.push(
      `• [${r.Argomento}]: ${r["Descrizione / Valore"]}. Dettagli: ${r.Dettaglio}`
    );
  }

  // 4. Policy, Spiaggia e Servizi
  blocks.push("\n--- 04. POLICIES & VILLAGE AMENITIES (POLICY, SPIAGGIA E SERVIZI) ---");
  for (const p of VILLAGE_MASTER_DATA.policy) {
    blocks.push(
      `• [${p.Voce}]: ${p["Valore Ufficiale"]}. Dettagli: ${p.Dettagli}`
    );
  }

  return blocks.join('\n');
}
