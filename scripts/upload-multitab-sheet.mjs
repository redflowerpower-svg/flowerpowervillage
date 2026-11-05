import fs from 'fs';
import * as XLSX from 'xlsx';

const env = fs.readFileSync('.env', 'utf8');
for (const line of env.split(/\r?\n/)) {
  const [k, ...v] = line.split('=');
  if (k) process.env[k.trim()] = v.join('=').trim();
}

async function testMultiSheetUpload() {
  const { getGoogleDriveAccessToken, getGoogleDriveConfig } = await import('../api/_helpers/google-drive.js');
  const { VILLAGE_MASTER_DATA } = await import('../api/_helpers/village-site-data.js');
  const token = await getGoogleDriveAccessToken();
  const config = await getGoogleDriveConfig();

  // 1. Create workbook with 5 sheets
  const wb = XLSX.utils.book_new();

  // Tab 1: Alloggi & Capienze
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
  console.log(`Generated XLSX buffer with 5 sheets, size: ${xlsxBuffer.length} bytes`);

  // To convert into a Google Sheet with 5 tabs, Google Drive creates or imports from multipart/related
  const metadata = {
    name: 'Flower Power Village - Master Knowledge Base',
    mimeType: 'application/vnd.google-apps.spreadsheet',
    parents: config.folderId ? [config.folderId] : undefined
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

  console.log('Uploading multipart/related to Google Drive to create 5-tab Google Sheet...');

  const createRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });

  const createData = await createRes.json();
  console.log('Create result:', createData);

  if (createData.id) {
    // Set permission anyoneWithLink can edit
    await fetch(`https://www.googleapis.com/drive/v3/files/${createData.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'writer',
        type: 'anyone'
      })
    });

    console.log(`✅ Nuovo Google Sheet a 5 SCHEDE creato con successo!`);
    console.log(`URL: https://docs.google.com/spreadsheets/d/${createData.id}/edit`);
    return createData.id;
  }
}

testMultiSheetUpload().catch(console.error);
