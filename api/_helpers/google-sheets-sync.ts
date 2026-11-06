import { createClient } from "@supabase/supabase-js";
import { getGoogleDriveAccessToken, getGoogleDriveConfig } from "./google-drive.js";
import { VILLAGE_MASTER_DATA, SheetRow } from "./village-site-data.js";
import * as XLSX from "xlsx";

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

// In-Memory RAM Cache per azzerare la latenza e non stressare il DB (0ms a regime)
let inMemoryKnowledgeCache: string | null = null;
let inMemoryCacheTimestamp = 0;

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
 * Converte le righe di qualsiasi scheda Google Sheet in un testo Markdown semantico e compatto
 */
export function convertSheetRowsToMarkdown(sheetName: string, rows: any[]): string {
  const cleanTitle = sheetName.replace(/^\d+_/, '').replace(/_/g, ' ').toUpperCase();
  if (!rows || rows.length === 0) {
    return `# ${cleanTitle}\n*(Nessuna informazione presente in questa scheda)*`;
  }

  const lines: string[] = [`# ${cleanTitle}`];

  for (const row of rows) {
    const keys = Object.keys(row);
    if (keys.length === 0) continue;

    // Individua la chiave primaria del titolo (es. Alloggio, Ambito, Argomento, Voce, Titolo, Nome)
    const primaryKey = keys.find(k => /alloggio|nome|titolo|voce|ambito|argomento/i.test(k)) || keys[0];
    const primaryVal = row[primaryKey];

    const details = keys
      .filter(k => k !== primaryKey && row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '')
      .map(k => `**${k}**: ${row[k]}`)
      .join(' | ');

    if (details) {
      lines.push(`• **${primaryVal}**: ${details}`);
    } else {
      lines.push(`• **${primaryVal}**`);
    }
  }

  return lines.join('\n');
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

  // 2. Crea un nuovo Google Sheet a 5 schede su Google Drive
  const token = await getGoogleDriveAccessToken();
  const driveConfig = await getGoogleDriveConfig();

  // Genera il workbook con le 5 schede ufficiali
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(VILLAGE_MASTER_DATA.alloggi), '01_Alloggi_e_Capienze');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(VILLAGE_MASTER_DATA.trasporti), '02_Trasporti_e_Arrivi');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(VILLAGE_MASTER_DATA.ristorante), '03_Ristorante_e_Bakery');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(VILLAGE_MASTER_DATA.policy), '04_Policy_e_Villaggio');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
    'Data': new Date().toISOString().slice(0, 10),
    'Titolo Regola': 'Auto-Apprendimento Dinamico',
    'Istruzione Memorizzata': 'Le direttive memorizzate da Marco via Telegram compaiono in questa scheda.',
    'Contesto': 'Aggiornato automaticamente dal ciclo di feedback'
  }]), '05_Regole_e_FAQ_Telegram');

  const xlsxBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  const metadata = {
    name: defaultSheetName,
    mimeType: "application/vnd.google-apps.spreadsheet",
    parents: driveConfig.folderId ? [driveConfig.folderId] : undefined
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartBody = Buffer.concat([
    Buffer.from(
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n'
    ),
    xlsxBuffer,
    Buffer.from(closeDelimiter)
  ]);

  const createRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });

  if (!createRes.ok) {
    throw new Error(`Impossibile creare il Google Sheet su Drive: ${createRes.status}`);
  }

  const fileData = await createRes.json();
  const sheetId = fileData.id;
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

  // Permesso di scrittura per chiunque abbia il link
  await fetch(`https://www.googleapis.com/drive/v3/files/${sheetId}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: 'writer', type: 'anyone' })
  }).catch(() => {});

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
 * Notifica il gruppo Telegram dell'avvenuta sincronizzazione da Google Sheet
 */
async function notifyTelegramSync(info: { sheets: string[]; totalRows: number; timestamp: string }) {
  try {
    const { getTelegramCredentials } = await import('./telegram.js');
    const { botToken, chatId } = await getTelegramCredentials('village');
    if (!botToken || !chatId) return;

    // Check if there is an active thread_id for Concierge Bot
    const sb = getSupabaseAdmin();
    let threadId: number | undefined;
    if (sb) {
      try {
        const { data } = await sb
          .from('telegram_config')
          .select('bot_token')
          .eq('id', 'village_concierge_topic_id')
          .maybeSingle();
        if (data?.bot_token && !isNaN(Number(data.bot_token))) {
          threadId = Number(data.bot_token);
        }
      } catch {}
    }

    const msg = [
      `🌿 <b>[Flower Power AI] Knowledge Base Sincronizzata!</b>`,
      ``,
      `📥 <b>Origine:</b> Google Sheet Master (modifica cellulare/desktop)`,
      `📑 <b>Schede elaborate (${info.sheets.length}):</b>`,
      info.sheets.map(s => `  • <code>${s}</code>`).join('\n'),
      ``,
      `✨ <b>Record totali:</b> ${info.totalRows}`,
      `⚡ <b>Stato:</b> File Markdown (.MD) rigenerati e attivi all'istante sia per Telegram sia per il Chatbot del sito web!`
    ].join('\n');

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: msg,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...(threadId ? { message_thread_id: threadId } : {})
      })
    });
  } catch (err) {
    console.warn('[notifyTelegramSync] Telegram notice warning:', err);
  }
}

/**
 * Sincronizza tutti i fogli di Google Sheet convertendoli in Markdown puro (.MD).
 * Supporta l'aggiunta dinamica di qualsiasi nuova scheda creata da Marco!
 */
export async function syncAllSheetsToMarkdown(options: { notifyTelegram?: boolean } = {}): Promise<{
  success: boolean;
  sheetsProcessed: string[];
  sheets: string[];
  totalRows: number;
  lastSyncedAt: string;
}> {
  const token = await getGoogleDriveAccessToken();
  const sheetConfig = await getOrCreateMasterSpreadsheet();
  const sheetId = sheetConfig.id;

  const exportUrl = `https://www.googleapis.com/drive/v3/files/${sheetId}/export?mimeType=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;
  const res = await fetch(exportUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error(`Google Drive export failed: ${res.status} ${await res.text()}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const wb = XLSX.read(buffer, { type: 'buffer' });

  const sheetNames = wb.SheetNames;
  const mdSections: { name: string; markdown: string; rowsCount: number }[] = [];
  let totalRows = 0;

  for (const name of sheetNames) {
    const rawRows = XLSX.utils.sheet_to_json(wb.Sheets[name]);
    const md = convertSheetRowsToMarkdown(name, rawRows);
    totalRows += rawRows.length;
    mdSections.push({ name, markdown: md, rowsCount: rawRows.length });
  }

  // Master Markdown unificato
  const masterMarkdown = [
    `=== FLOWER POWER VILLAGE OFFICIAL KNOWLEDGE BASE (DYNAMIC MARKDOWN) ===`,
    `Authoritative resort dataset synchronized directly from Google Sheet Knowledge Base.`,
    `Last synchronized: ${new Date().toISOString()}`,
    `Total active sheets: ${sheetNames.length}\n`,
    ...mdSections.map(s => s.markdown)
  ].join('\n\n');

  // Aggiorna la cache RAM locale
  inMemoryKnowledgeCache = masterMarkdown;
  inMemoryCacheTimestamp = Date.now();

  // Salva in Supabase telegram_config per persistenza
  const sb = getSupabaseAdmin();
  if (sb) {
    await sb
      .from('telegram_config')
      .upsert({
        id: 'kb_master_markdown',
        bot_token: String(sheetNames.length),
        chat_id: masterMarkdown,
        updated_at: new Date().toISOString()
      });

    // Salva metadati sync
    await sb
      .from('telegram_config')
      .upsert({
        id: 'kb_sync_metadata',
        bot_token: sheetId,
        chat_id: JSON.stringify({
          lastSyncedAt: new Date().toISOString(),
          sheets: sheetNames,
          totalRows
        }),
        updated_at: new Date().toISOString()
      });
  }

  if (options.notifyTelegram) {
    await notifyTelegramSync({
      sheets: sheetNames,
      totalRows,
      timestamp: new Date().toLocaleTimeString('it-IT')
    });
  }

  return {
    success: true,
    sheetsProcessed: sheetNames,
    sheets: sheetNames,
    totalRows,
    lastSyncedAt: new Date().toISOString()
  };
}

/**
 * Restituisce i metadati dell'ultima sincronizzazione da Google Sheet
 */
export async function getLastSyncMetadata(): Promise<{
  lastSyncedAt?: string;
  sheets?: string[];
  totalRows?: number;
} | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  try {
    const { data } = await sb
      .from('telegram_config')
      .select('chat_id')
      .eq('id', 'kb_sync_metadata')
      .maybeSingle();

    if (data?.chat_id) {
      return JSON.parse(data.chat_id);
    }
  } catch {}
  return null;
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

  // Registra la riga in Supabase
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
      console.warn('[recordTelegramUpdateToKnowledge] Fallback store:', dbErr);
    }
  }

  // Invalida la cache per forzare la rilettura
  inMemoryKnowledgeCache = null;

  return {
    targetTab: tabKey,
    tabTitle,
    success: true
  };
}

/**
 * Genera il blocco di testo completo per il Prompt di DeepSeek / Chatbot.
 * Ordine di priorità:
 * 1. Cache in RAM (0 millisecondi)
 * 2. Supabase DB Markdown (< 15 millisecondi)
 * 3. Fallback locale compilato
 */
export async function getCompleteKnowledgePromptContext(): Promise<string> {
  // 1. Cache RAM (fresca entro 1 ora)
  if (inMemoryKnowledgeCache && (Date.now() - inMemoryCacheTimestamp < 3600000)) {
    return inMemoryKnowledgeCache;
  }

  // 2. Lettura da Supabase
  const sb = getSupabaseAdmin();
  if (sb) {
    try {
      const { data } = await sb
        .from('telegram_config')
        .select('chat_id')
        .eq('id', 'kb_master_markdown')
        .maybeSingle();

      if (data?.chat_id && data.chat_id.trim().length > 100) {
        inMemoryKnowledgeCache = data.chat_id.trim();
        inMemoryCacheTimestamp = Date.now();
        return inMemoryKnowledgeCache;
      }
    } catch (err) {
      console.warn('[getCompleteKnowledgePromptContext] DB read warning:', err);
    }
  }

  // 3. Fallback strutturato
  const blocks: string[] = [
    "=== FLOWER POWER VILLAGE OFFICIAL KNOWLEDGE BASE ===",
    "The following is the authoritative, verified resort data extracted directly from the official website and resort management records.",
    "You MUST adhere strictly to these real parameters without inventing or guessing any values:\n"
  ];

  // 1. Alloggi
  blocks.push("--- 01. ACCOMMODATIONS & CAPACITY (ALLOGGI & CAPIENZE) ---");
  for (const a of VILLAGE_MASTER_DATA.alloggi) {
    blocks.push(
      `• [${a.Alloggio} (${a.Slug})]: Capienza: ${a["Capacità Base"]} ospiti (max ${a["Capacità Max"]}). Letti: ${a["Configurazione Letti"]}. Climatizzazione: ${a.Climatizzazione}. Bagni: ${a.Bagni}. Zanzariere: ${a.Zanzariere}. Tariffe: Caricate dinamicamente in tempo reale da Octorate PMS. Dettagli: ${a["Punti di Forza"]}`
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
