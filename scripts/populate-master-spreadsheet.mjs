import fs from 'fs';
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

const worktreeRoot = 'C:/Users/Red/.gemini/antigravity/worktrees/flowerpowervillage/Telegram Assistent Worktree';

async function populateFullSheet() {
  const { getGoogleDriveAccessToken } = await import(`file:///${worktreeRoot}/api/_helpers/google-drive.ts`);
  const { VILLAGE_MASTER_DATA } = await import(`file:///${worktreeRoot}/api/_helpers/village-site-data.ts`);
  
  const token = await getGoogleDriveAccessToken();
  const sheetId = '1PHjjmMKYRWFqrL8Wgh6fj34zIj3NtYg6c5zo-r-SEUE';

  // Build CSV with all rows
  const lines = [
    'SEZIONE_DOC,ELEMENTO_TITOLO,VALORE_CAPACITA,DOTAZIONI_DETTAGLI,NOTE_E_COSTI'
  ];

  // 1. Alloggi
  for (const a of VILLAGE_MASTER_DATA.alloggi) {
    const sec = '01_Alloggi_e_Capienze';
    const title = `${a.Alloggio} (${a.Slug})`;
    const val = `Capacità: ${a["Capacità Base"]} pax (max ${a["Capacità Max"]} pax)`;
    const dots = `Letti: ${a["Configurazione Letti"]} | AC: ${a.Climatizzazione} | Bagni: ${a.Bagni} | Zanzariere: ${a.Zanzariere}`;
    const notes = `Prezzo indicativo: ${a["Prezzo Indicativo (THB)"]} THB | ${a["Punti di Forza"]}`;
    lines.push([sec, title, val, dots, notes].map(c => `"${String(c).replace(/"/g, '""')}"`).join(','));
  }

  // 2. Trasporti
  for (const t of VILLAGE_MASTER_DATA.trasporti) {
    const sec = '02_Trasporti_e_Arrivi';
    const title = `${t.Ambito} - ${t["Dettaglio / Tratta"]}`;
    const val = t["Compagnia / Mezzo"];
    const dots = `Durata: ${t.Durata} | Costi: ${t["Costi Indicativi"]}`;
    const notes = t["Note Operative"];
    lines.push([sec, title, val, dots, notes].map(c => `"${String(c).replace(/"/g, '""')}"`).join(','));
  }

  // 3. Ristorante
  for (const r of VILLAGE_MASTER_DATA.ristorante) {
    const sec = '03_Ristorante_e_Bakery';
    const title = r.Argomento;
    const val = r["Descrizione / Valore"];
    const dots = r.Dettaglio;
    const notes = 'Autentica cucina italiana fatta a mano + pizza a legna + specialità Thai';
    lines.push([sec, title, val, dots, notes].map(c => `"${String(c).replace(/"/g, '""')}"`).join(','));
  }

  // 4. Policy
  for (const p of VILLAGE_MASTER_DATA.policy) {
    const sec = '04_Policy_e_Villaggio';
    const title = p.Voce;
    const val = p["Valore Ufficiale"];
    const dots = p.Dettagli;
    const notes = 'Regole resort verificate e confermate dalla direzione';
    lines.push([sec, title, val, dots, notes].map(c => `"${String(c).replace(/"/g, '""')}"`).join(','));
  }

  // 5. Regole & FAQ Telegram
  lines.push([
    '"05_Regole_e_FAQ_Telegram"',
    '"Auto-Apprendimento Dinamico Telegram"',
    '"Memorizzazione istantanea delle direttive di Marco"',
    '"Ogni correzione inviata in Reply su Telegram viene archiviata in questo registro"',
    '"Le future risposte del bot rispetteranno automaticamente queste istruzioni"'
  ].join(','));

  const csvPayload = lines.join('\n');

  console.log(`Uploading ${lines.length - 1} verified resort records to Google Sheet (${sheetId})...`);

  const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${sheetId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'text/csv'
    },
    body: csvPayload
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
  }

  console.log('✅ Google Sheet popolato con successo con tutti i dati ufficiali delle 5 sezioni!');
  console.log(`URL: https://docs.google.com/spreadsheets/d/${sheetId}/edit`);
}

populateFullSheet().catch(console.error);
