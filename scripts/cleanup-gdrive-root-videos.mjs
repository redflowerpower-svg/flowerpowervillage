/**
 * 🧹 SCRIPT DI PULIZIA E RIORDINO: VIDEO CHROMIUM SU GOOGLE DRIVE 5TB
 * Reparto Stagno: Social Media Studio (/social)
 *
 * Sposta in modo pulito e immediato (Zero-Download / Zero-Egress) tutti i video
 * MP4 generati da Chromium o con prefisso 'dispatch_' che si trovano nella root
 * principale ("Il mio Drive") all'interno della cartella dedicata:
 * "Flower Power Social Videos".
 *
 * Utilizzo:
 *   node scripts/cleanup-gdrive-root-videos.mjs --dry-run   (Mostra i file trovati senza spostarli)
 *   node scripts/cleanup-gdrive-root-videos.mjs --move      (Sposta effettivamente i file nella cartella)
 */

import fs from 'fs';
import path from 'path';

// Carica variabili d'ambiente da .env
function loadEnv() {
  const env = { ...process.env };
  const possiblePaths = [
    path.resolve('.env'),
    path.resolve('../.env'),
    path.resolve('d:/WEB SITE Antigravity/flowerpowervillage/.env')
  ];
  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
          const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match) {
            let value = (match[2] || '').trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            if (!env[match[1]]) env[match[1]] = value;
          }
        });
      } catch {}
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || 'https://gjqevgkbjkharczhikcl.supabase.co';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';

const args = process.argv.slice(2);
const shouldMove = args.includes('--move');
const isDryRun = args.includes('--dry-run') || !shouldMove;

const FOLDER_NAME = 'Flower Power Social Videos';

async function getGoogleDriveCredentials() {
  if (env.GOOGLE_DRIVE_CLIENT_ID && env.GOOGLE_DRIVE_REFRESH_TOKEN) {
    return {
      client_id: env.GOOGLE_DRIVE_CLIENT_ID,
      client_secret: env.GOOGLE_DRIVE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_DRIVE_REFRESH_TOKEN,
      folder_id: env.GOOGLE_DRIVE_FOLDER_ID
    };
  }

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/telegram_config?id=eq.google_drive&select=chat_id`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`
        }
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows?.[0]?.chat_id) {
          return JSON.parse(rows[0].chat_id);
        }
      }
    } catch (err) {
      console.warn('⚠️ Errore lettura credenziali da Supabase:', err.message);
    }
  }
  return null;
}

async function getAccessToken(creds) {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: creds.refresh_token,
      grant_type: 'refresh_token'
    })
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    throw new Error('Refresh token fallito: ' + JSON.stringify(tokenData));
  }
  return tokenData.access_token;
}

async function getOrCreateTargetFolder(accessToken, parentFolderId = null) {
  let q = `mimeType = 'application/vnd.google-apps.folder' and name = '${FOLDER_NAME}' and trashed = false`;
  if (parentFolderId) q += ` and '${parentFolderId}' in parents`;

  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,webViewLink)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    console.log(`📁 Cartella di destinazione trovata: "${searchData.files[0].name}" (ID: ${searchData.files[0].id})`);
    return searchData.files[0];
  }

  // Creazione cartella
  console.log(`✨ Creazione nuova cartella dedicata: "${FOLDER_NAME}"...`);
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentFolderId ? [parentFolderId] : []
    })
  });
  const createData = await createRes.json();
  if (!createRes.ok || !createData.id) {
    throw new Error('Creazione cartella fallita: ' + JSON.stringify(createData));
  }
  console.log(`✅ Nuova cartella creata con successo! (ID: ${createData.id})`);
  return createData;
}

async function listVideosToOrganize(accessToken, targetFolderId) {
  // Cerca tutti i video generati da dispatch che non sono ancora nella cartella dedicata con paginazione completa
  const q = `mimeType = 'video/mp4' and name contains 'dispatch_' and trashed = false and not '${targetFolderId}' in parents`;
  console.log(`🔍 Scansione completa dei video dispatch MP4 fuori dalla cartella dedicata...`);

  let allFiles = [];
  let pageToken = null;

  do {
    let url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=nextPageToken,files(id,name,size,createdTime,parents)&pageSize=100`;
    if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;

    const listRes = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const listData = await listRes.json();
    if (listData.files && listData.files.length > 0) {
      allFiles.push(...listData.files);
    }
    pageToken = listData.nextPageToken || null;
  } while (pageToken);

  return allFiles;
}

async function moveFileToFolder(accessToken, fileId, targetFolderId, currentParentId) {
  let removeParam = currentParentId ? `&removeParents=${currentParentId}` : '';
  const patchRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${targetFolderId}${removeParam}&fields=id,name,parents`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  return await patchRes.json();
}

async function main() {
  console.log('=====================================================');
  console.log('🗂️  GOOGLE DRIVE VIDEO REORGANIZER & CLEANUP TOOL');
  console.log(`Modalità: ${isDryRun ? 'SIMULAZIONE (--dry-run)' : 'SPOSTAMENTO EFFETTIVO (--move)'}`);
  console.log('=====================================================\n');

  const creds = await getGoogleDriveCredentials();
  if (!creds?.client_id || !creds?.refresh_token) {
    console.error('❌ Errore: credenziali Google Drive non trovate in Supabase o .env');
    process.exit(1);
  }

  console.log('🔑 Autenticazione con Google Drive API v3...');
  const accessToken = await getAccessToken(creds);
  console.log('✅ Access Token ottenuto.\n');

  const targetFolder = await getOrCreateTargetFolder(accessToken, creds.folder_id || null);

  const filesToMove = await listVideosToOrganize(accessToken, targetFolder.id);
  console.log(`📊 Trovati ${filesToMove.length} video dispatch MP4 pronti per essere archiviati nella cartella "${FOLDER_NAME}".\n`);

  if (filesToMove.length === 0) {
    console.log('🎉 Nessun video sparso da spostare: la cartella principale è già perfettamente in ordine!');
    return;
  }

  // Spostamento dei file
  let countMoved = 0;
  for (const file of filesToMove) {
    const sizeMb = file.size ? (parseInt(file.size, 10) / (1024 * 1024)).toFixed(1) : '?';
    const currentParent = file.parents?.[0] || 'root';

    if (isDryRun) {
      console.log(` [SIMULAZIONE] ➡️  Da spostare: "${file.name}" (${sizeMb} MB) -> "${FOLDER_NAME}"`);
      countMoved++;
    } else {
      try {
        console.log(` 🚚 Spostamento: "${file.name}" (${sizeMb} MB)...`);
        await moveFileToFolder(accessToken, file.id, targetFolder.id, currentParent);
        console.log(`    ✅ Spostato con successo!`);
        countMoved++;
      } catch (err) {
        console.warn(`    ⚠️ Errore durante lo spostamento di ${file.name}:`, err.message);
      }
    }
  }

  console.log('\n=====================================================');
  if (isDryRun) {
    console.log(`📋 RIEPILOGO SIMULAZIONE: ${countMoved} file pronti per essere spostati.`);
    console.log(`👉 Per procedere allo spostamento reale, esegui:`);
    console.log(`   node scripts/cleanup-gdrive-root-videos.mjs --move`);
  } else {
    console.log(`🎉 OPERAZIONE COMPLETATA: ${countMoved} video spostati con successo nella cartella "${FOLDER_NAME}"!`);
    console.log(`🔗 Link cartella: https://drive.google.com/drive/folders/${targetFolder.id}`);
  }
  console.log('=====================================================');
}

main().catch(err => {
  console.error('❌ Errore imprevisto:', err);
  process.exit(1);
});
