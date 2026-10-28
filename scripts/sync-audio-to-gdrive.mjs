import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envContent = fs.readFileSync('.env', 'utf8');
const sbUrl = envContent.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim();
const sbKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim() || envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim();
const sb = createClient(sbUrl, sbKey);

async function main() {
  console.log('🚀 [Google Drive 5TB] Avvio sincronizzazione Audio Master Suite...');
  const { data } = await sb.from('telegram_config').select('chat_id').eq('id', 'google_drive').single();
  if (!data?.chat_id) throw new Error('Configurazione google_drive non trovata in telegram_config');
  const creds = JSON.parse(data.chat_id);

  // Refresh Token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: creds.refresh_token,
      grant_type: "refresh_token"
    })
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error('Refresh token fallito: ' + JSON.stringify(tokenData));
  }
  const accessToken = tokenData.access_token;
  console.log('✅ Access Token ottenuto con successo.');

  // Helper ricerca cartella
  async function findOrCreateFolder(name, parentId = null) {
    let q = `mimeType = 'application/vnd.google-apps.folder' and name = '${name.replace(/'/g, "\\'")}' and trashed = false`;
    if (parentId) q += ` and '${parentId}' in parents`;
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      console.log(`📁 Cartella già esistente: "${name}" (ID: ${searchData.files[0].id})`);
      return searchData.files[0].id;
    }
    // Crea cartella
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : (creds.folder_id ? [creds.folder_id] : [])
      })
    });
    const folderData = await createRes.json();
    console.log(`✨ Creata nuova cartella: "${name}" (ID: ${folderData.id})`);
    return folderData.id;
  }

  // Helper upload file
  async function uploadFile(localPath, folderId) {
    const fileName = path.basename(localPath);
    // Verifica se esiste già
    const checkQ = `name = '${fileName.replace(/'/g, "\\'")}' and '${folderId}' in parents and trashed = false`;
    const checkRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(checkQ)}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const checkData = await checkRes.json();
    if (checkData.files && checkData.files.length > 0) {
      console.log(`  ✓ Già presente: ${fileName}`);
      return checkData.files[0].id;
    }

    const buf = fs.readFileSync(localPath);
    const mime = fileName.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg';

    const boundary = "-------FP_AUDIO_" + Date.now();
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelim = "\r\n--" + boundary + "--";

    const metadataPart = delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify({ name: fileName, parents: [folderId] }) + "\r\n";

    const fileHeader = "--" + boundary + "\r\n" +
      `Content-Type: ${mime}\r\n\r\n`;

    const bodyBuffer = Buffer.concat([
      Buffer.from(metadataPart, "utf8"),
      Buffer.from(fileHeader, "utf8"),
      buf,
      Buffer.from(closeDelim, "utf8")
    ]);

    const upRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": bodyBuffer.length.toString()
      },
      body: bodyBuffer
    });
    const upData = await upRes.json();
    console.log(`  ⬆️ Caricato con successo: ${fileName} (${(buf.length / 1e6).toFixed(2)} MB, ID: ${upData.id})`);
    return upData.id;
  }

  // 1. Cartella Principale Master Suite
  const masterFolderId = await findOrCreateFolder('🎵 FLOWER POWER - AUDIO & JINGLE MASTER SUITE');

  // 2. Sotto-cartella Pizzeria
  const pizzaFolderId = await findOrCreateFolder('🍕 Pizzeria Ranong Jingles & SFX', masterFolderId);
  const pizzaFiles = [
    'public/audio/00-flower-power-jingle-full.mp3',
    'public/audio/01-flower-power-yeah.mp3',
    'public/audio/02-flower-power-so-good.mp3',
    'public/audio/03-flower-power-ranong.mp3',
    'public/audio/04-flower-power-aroi-mak-mak.mp3',
    'public/audio/flower-power-jingle.mp3',
    'public/audio/sfx-outro-pizza.wav'
  ];
  console.log(`\n--- Sincronizzazione Pizzeria (${pizzaFiles.length} file) ---`);
  for (const pf of pizzaFiles) {
    if (fs.existsSync(pf)) await uploadFile(pf, pizzaFolderId);
  }

  // 3. Sotto-cartella Villaggio
  const villageFolderId = await findOrCreateFolder('🌴 Koh Phayam Village Soundtracks & SFX', masterFolderId);
  const villageDir = 'public/audio/village';
  const villageFiles = fs.readdirSync(villageDir).map(f => path.join(villageDir, f));
  villageFiles.push('public/audio/sfx-outro-village.wav');
  console.log(`\n--- Sincronizzazione Villaggio (${villageFiles.length} file) ---`);
  for (const vf of villageFiles) {
    if (fs.existsSync(vf)) await uploadFile(vf, villageFolderId);
  }

  console.log(`\n🎉 Sincronizzazione Master Suite su Google Drive 5TB completata con successo!`);
}

main().catch(err => {
  console.error('❌ Errore sincronizzazione Google Drive:', err);
  process.exit(1);
});

