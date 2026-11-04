import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

function run(command) {
  return execSync(command, { encoding: 'utf8', cwd: process.cwd() }).trim();
}

console.log('===========================================================');
console.log('☁️  AVVIO PACCHETTO HANDOFF: UPLOAD SU GOOGLE DRIVE 5TB');
console.log('===========================================================');

async function main() {
  try {
    // 1. Lettura configurazione Supabase da .env
    const envContent = fs.readFileSync('.env', 'utf8');
    const supabaseUrl = envContent.match(/SUPABASE_URL=([^\s\r\n]+)/)?.[1];
    const supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=([^\s\r\n]+)/)?.[1] || 
                        envContent.match(/VITE_SUPABASE_ANON_KEY=([^\s\r\n]+)/)?.[1];

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL o Key mancanti nel file .env locale.');
    }

    const sb = createClient(supabaseUrl, supabaseKey);

    // 2. Lettura credenziali Google Drive 5TB
    console.log('\n🔑 Passo 1: Autenticazione Google Drive...');
    const { data: driveRow, error: driveErr } = await sb.from('telegram_config').select('chat_id').eq('id', 'google_drive').maybeSingle();
    if (driveErr || !driveRow?.chat_id) {
      throw new Error(`Credenziali Google Drive non trovate in Supabase: ${driveErr?.message || 'record vuoto'}`);
    }

    const creds = JSON.parse(driveRow.chat_id);
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
      throw new Error(`Refresh token Google Drive fallito: ${JSON.stringify(tokenData)}`);
    }
    const accessToken = tokenData.access_token;
    console.log('✅ Access Token Google Drive ottenuto con successo.');

    // 3. Creazione data/ora Bangkok per il nome della cartella
    const now = new Date();
    // Offset Bangkok UTC+7
    const bangkokTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${pad(bangkokTime.getUTCDate())}-${pad(bangkokTime.getUTCMonth() + 1)}-${bangkokTime.getUTCFullYear()} ${pad(bangkokTime.getUTCHours())}:${pad(bangkokTime.getUTCMinutes())}`;
    const targetFolderName = `HANDOFF_POSTAZIONI_FP [${dateStr}]`;

    // 4. Ricerca o creazione della cartella dedicata su Google Drive
    console.log(`\n📁 Passo 2: Gestione Cartella Cloud [${targetFolderName}]...`);
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name+contains+'HANDOFF_POSTAZIONI_FP'+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=files(id,name,webViewLink)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();
    let folderId = searchData.files?.[0]?.id;
    let webViewLink = searchData.files?.[0]?.webViewLink;

    if (folderId) {
      console.log(`🔄 Rilevata cartella precedente esistente (ID: ${folderId}). Rinomina e pulizia vecchi file...`);
      // Rinomina cartella
      await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: targetFolderName })
      });

      // Svuota i vecchi file presenti nella cartella
      const oldFilesRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+trashed=false&fields=files(id,name)`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const oldFilesData = await oldFilesRes.json();
      if (oldFilesData.files?.length > 0) {
        console.log(`🧹 Eliminazione di ${oldFilesData.files.length} vecchi file obsoleti dalla cartella...`);
        for (const file of oldFilesData.files) {
          await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${accessToken}` }
          });
        }
      }
    } else {
      console.log(`✨ Creazione nuova cartella dedicata su Google Drive...`);
      const createFolderRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: targetFolderName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: creds.folder_id ? [creds.folder_id] : []
        })
      });
      const createData = await createFolderRes.json();
      folderId = createData.id;
      webViewLink = createData.webViewLink;
    }

    // 5. Preparazione della cartella temporanea locale scratch/handoff_temp
    const tempDir = path.resolve(process.cwd(), 'scratch/handoff_temp');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    console.log('\n📦 Passo 3: Preparazione file di sistema e codice...');
    // Copia file essenziali
    const copyList = [
      { src: '.agents/AGENTS.md', dest: 'AGENTS.md' },
      { src: 'scripts/project-sync.mjs', dest: 'project-sync.mjs' },
      { src: 'scripts/branch-sync.mjs', dest: 'branch-sync.mjs' },
      { src: 'scripts/branch-merge.mjs', dest: 'branch-merge.mjs' },
      { src: 'scratch/vault-sync.mjs', dest: 'vault-sync.mjs' },
      { src: 'package.json', dest: 'package.json' },
      { src: '.secret_docs/api_credentials_report.md.enc', dest: 'api_credentials_report.md.enc' },
      { src: 'RIPRISTINA_TUTTO.bat', dest: 'RIPRISTINA_TUTTO.bat' },
      { src: 'scripts/gdrive-handoff-pull.mjs', dest: 'gdrive-handoff-pull.mjs' }
    ];

    for (const item of copyList) {
      if (fs.existsSync(item.src)) {
        fs.copyFileSync(item.src, path.join(tempDir, item.dest));
      }
    }

    // 6. Preparazione archivio Chat Antigravity e Pin
    console.log('\n💬 Passo 4: Backup della cronologia Chat, Brain e PIN Antigravity...');
    const userHome = process.env.USERPROFILE || 'C:/Users/Red';
    const antigravityDir = path.resolve(userHome, '.gemini/antigravity');
    const chatsTempDir = path.resolve(process.cwd(), 'scratch/chats_temp');
    if (fs.existsSync(chatsTempDir)) {
      fs.rmSync(chatsTempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(chatsTempDir, { recursive: true });

    if (fs.existsSync(antigravityDir)) {
      // Copia conversation_summaries.db
      const dbPath = path.join(antigravityDir, 'conversation_summaries.db');
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, path.join(chatsTempDir, 'conversation_summaries.db'));
      }

      // Copia annotations
      const annSrc = path.join(antigravityDir, 'annotations');
      if (fs.existsSync(annSrc)) {
        const annDest = path.join(chatsTempDir, 'annotations');
        fs.cpSync(annSrc, annDest, { recursive: true });
      }

      // Copia conversations
      const convSrc = path.join(antigravityDir, 'conversations');
      if (fs.existsSync(convSrc)) {
        const convDest = path.join(chatsTempDir, 'conversations');
        fs.cpSync(convSrc, convDest, { recursive: true });
      }

      // Copia brain (artefatti, transcript e scratch)
      const brainSrc = path.join(antigravityDir, 'brain');
      if (fs.existsSync(brainSrc)) {
        const brainDest = path.join(chatsTempDir, 'brain');
        fs.cpSync(brainSrc, brainDest, { recursive: true });
      }

      // Comprimi in ZIP usando powershell native Compress-Archive
      const chatsZipPath = path.join(tempDir, 'antigravity_chats_backup.zip');
      console.log('🤐 Compressione archivio chat, brain e PIN in corso...');
      execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${chatsTempDir}/*' -DestinationPath '${chatsZipPath}' -Force"`);
      console.log('✅ Archivio chat, brain e PIN creato: antigravity_chats_backup.zip');
    }

    // 7. Upload dei file su Google Drive con supporto Resumable per grandi archivi
    console.log('\n🚀 Passo 5: Caricamento su Google Drive 5TB...');

    async function uploadFile(filePath, fileName, mimeType = 'application/octet-stream') {
      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fileBuffer.length;
      const sizeMb = (fileSize / (1024 * 1024)).toFixed(2);

      // Per file piccoli (<= 5MB), usiamo il multipart rapido
      if (fileSize <= 5 * 1024 * 1024) {
        const boundary = "-------FP_HANDOFF_" + Date.now();
        const delimiter = "\r\n--" + boundary + "\r\n";
        const closeDelim = "\r\n--" + boundary + "--";

        const metadata = {
          name: fileName,
          parents: [folderId]
        };

        const metadataPart = delimiter +
          "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
          JSON.stringify(metadata) + "\r\n";

        const fileHeader = "--" + boundary + "\r\n" +
          `Content-Type: ${mimeType}\r\n\r\n`;

        const bodyBuffer = Buffer.concat([
          Buffer.from(metadataPart, "utf8"),
          Buffer.from(fileHeader, "utf8"),
          fileBuffer,
          Buffer.from(closeDelim, "utf8")
        ]);

        const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
            "Content-Length": bodyBuffer.length.toString()
          },
          body: bodyBuffer
        });

        const resData = await res.json();
        if (!res.ok) {
          throw new Error(`Upload fallito per ${fileName}: ${JSON.stringify(resData)}`);
        }
        console.log(`  ⬆️ Caricato: ${fileName} (${sizeMb} MB)`);
        return resData;
      }

      // Per file grandi (> 5MB, es. archivio chat zip), usiamo il protocollo ufficiale Resumable Upload di Google Drive
      console.log(`  ⏳ Avvio upload resumable per file grande: ${fileName} (${sizeMb} MB)...`);
      const initRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
          "X-Upload-Content-Type": mimeType,
          "X-Upload-Content-Length": fileSize.toString()
        },
        body: JSON.stringify({ name: fileName, parents: [folderId] })
      });

      if (!initRes.ok) {
        const initErr = await initRes.text();
        throw new Error(`Inizializzazione resumable upload fallita per ${fileName}: ${initErr}`);
      }

      const uploadUrl = initRes.headers.get("location");
      if (!uploadUrl) {
        throw new Error(`Location header mancante per upload resumable di ${fileName}`);
      }

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": mimeType,
          "Content-Length": fileSize.toString()
        },
        body: fileBuffer
      });

      const resData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(`Upload resumable fallito per ${fileName}: ${JSON.stringify(resData)}`);
      }
      console.log(`  ⬆️ Caricato con successo (resumable): ${fileName} (${sizeMb} MB)`);
      return resData;
    }

    // Carica tutti i file del pacchetto per la postazione
    const uploadFiles = fs.readdirSync(tempDir);
    for (const f of uploadFiles) {
      const fullPath = path.join(tempDir, f);
      const isZip = f.endsWith('.zip');
      const isJson = f.endsWith('.json');
      const isMd = f.endsWith('.md');
      const isBat = f.endsWith('.bat');
      const mime = isZip ? 'application/zip' : (isJson ? 'application/json' : (isMd ? 'text/markdown' : (isBat ? 'text/plain' : 'application/octet-stream')));
      await uploadFile(fullPath, f, mime);
    }

    // 9. Pulizia scratch locale temporaneo
    fs.rmSync(tempDir, { recursive: true, force: true });
    if (fs.existsSync(chatsTempDir)) fs.rmSync(chatsTempDir, { recursive: true, force: true });
    const hPath = path.resolve(process.cwd(), 'scratch/handoff_completo.zip'); if (fs.existsSync(hPath)) fs.unlinkSync(hPath);

    console.log('\n===========================================================');
    console.log('🎉 PACCHETTO HANDOFF CARICATO CON SUCCESSO SU GOOGLE DRIVE!');
    console.log('===========================================================');
    console.log(`📁 Cartella Cloud:   ${targetFolderName}`);
    console.log(`🆔 ID Cartella:       ${folderId}`);
    if (webViewLink) {
      console.log(`🔗 Link Diretto:      ${webViewLink}`);
    }
    console.log('-----------------------------------------------------------');
    console.log('💡 A Koh Phayam basterà fare doppio click su RIPRISTINA_TUTTO.bat');
    console.log('   per riavere allineati codice, password, chat e PIN in alto!');
    console.log('===========================================================\n');
  } catch (err) {
    console.error('\n❌ ERRORE DURANTE L\'UPLOAD DELL\'HANDOFF:', err.message);
    process.exit(1);
  }
}

main();
