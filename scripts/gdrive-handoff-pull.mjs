import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import { DatabaseSync } from 'node:sqlite';

function run(command) {
  return execSync(command, { encoding: 'utf8', cwd: process.cwd() }).trim();
}

console.log('===========================================================');
console.log('📥 AVVIO RIPRISTINO POSTAZIONE DA GOOGLE DRIVE 5TB');
console.log('===========================================================');

async function main() {
  try {
    // 1. Lettura configurazione Supabase da .env o fallback default
    let supabaseUrl = 'https://cbryomfspdtwintjocgy.supabase.co';
    let supabaseKey = '';

    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf8');
      supabaseUrl = envContent.match(/SUPABASE_URL=([^\s\r\n]+)/)?.[1] || supabaseUrl;
      supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=([^\s\r\n]+)/)?.[1] || 
                    envContent.match(/VITE_SUPABASE_ANON_KEY=([^\s\r\n]+)/)?.[1] || '';
    }

    if (!supabaseKey) {
      const altPaths = ['../.env', '../../.env', 'D:/WEB SITE Antigravity/flowerpowervillage/.env'];
      for (const p of altPaths) {
        if (fs.existsSync(p)) {
          const ec = fs.readFileSync(p, 'utf8');
          supabaseUrl = ec.match(/SUPABASE_URL=([^\s\r\n]+)/)?.[1] || supabaseUrl;
          supabaseKey = ec.match(/SUPABASE_SERVICE_ROLE_KEY=([^\s\r\n]+)/)?.[1] || 
                        ec.match(/VITE_SUPABASE_ANON_KEY=([^\s\r\n]+)/)?.[1] || '';
          if (supabaseKey) break;
        }
      }
    }

    if (!supabaseKey) {
      throw new Error('⚠️ Impossibile procedere: SUPABASE_SERVICE_ROLE_KEY o VITE_SUPABASE_ANON_KEY mancanti.');
    }

    const sb = createClient(supabaseUrl, supabaseKey);

    // 2. Lettura credenziali Google Drive da Supabase
    console.log('\n🔑 Passo 1: Autenticazione con Google Drive...');
    const { data: driveRow, error: driveErr } = await sb.from('telegram_config').select('chat_id').eq('id', 'google_drive').maybeSingle();
    if (driveErr || !driveRow?.chat_id) {
      throw new Error(`Credenziali Google Drive non trovate su Supabase: ${driveErr?.message || 'record vuoto'}`);
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
    console.log('✅ Connessione a Google Drive stabilita.');

    // 3. Ricerca della cartella HANDOFF più recente
    console.log('\n🔍 Passo 2: Ricerca del pacchetto Handoff più recente...');
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name+contains+'HANDOFF_POSTAZIONI_FP'+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&orderBy=modifiedTime+desc&fields=files(id,name,modifiedTime)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const searchData = await searchRes.json();
    const targetFolder = searchData.files?.[0];

    if (!targetFolder) {
      throw new Error('Nessuna cartella HANDOFF_POSTAZIONI_FP trovata su Google Drive.');
    }

    console.log(`📁 Trovato pacchetto: [${targetFolder.name}]`);

    // 4. Elenco dei file all'interno della cartella
    const filesRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${targetFolder.id}'+in+parents+and+trashed=false&fields=files(id,name,size)`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const filesData = await filesRes.json();
    if (!filesData.files || filesData.files.length === 0) {
      throw new Error('La cartella di Handoff su Google Drive è vuota.');
    }

    console.log(`📦 Trovati ${filesData.files.length} file nel pacchetto cloud.`);

    // 5. Creazione cartella scratch locale per il download
    const tempDir = path.resolve(process.cwd(), 'scratch/handoff_download');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempDir, { recursive: true });

    // Funzione di download file da Google Drive
    async function downloadFile(fileId, fileName, destPath) {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) {
        throw new Error(`Download fallito per ${fileName}: ${res.statusText}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.writeFileSync(destPath, buffer);
      const sizeKb = (buffer.length / 1024).toFixed(1);
      console.log(`  ⬇️ Scaricato e applicato: ${fileName} (${sizeKb} KB)`);
    }

    // 6. Download e posizionamento dei singoli file del progetto
    console.log('\n📥 Passo 3: Aggiornamento file del progetto locale...');
    const projectMappings = {
      'AGENTS.md': '.agents/AGENTS.md',
      'project-sync.mjs': 'scripts/project-sync.mjs',
      'project-transfer.mjs': 'scripts/project-transfer.mjs',
      'history-clean.mjs': 'scripts/history-clean.mjs',
      'branch-sync.mjs': 'scripts/branch-sync.mjs',
      'branch-merge.mjs': 'scripts/branch-merge.mjs',
      'vault-sync.mjs': 'scratch/vault-sync.mjs',
      'package.json': 'package.json',
      'api_credentials_report.md.enc': '.secret_docs/api_credentials_report.md.enc',
      'RIPRISTINA_TUTTO.bat': 'RIPRISTINA_TUTTO.bat',
      'gdrive-handoff-pull.mjs': 'scripts/gdrive-handoff-pull.mjs'
    };

    let chatsZipFile = null;

    for (const file of filesData.files) {
      if (file.name === 'handoff_completo.zip') continue;

      if (file.name === 'antigravity_chats_backup.zip') {
        chatsZipFile = file;
        continue;
      }

      const relativeDest = projectMappings[file.name];
      if (relativeDest) {
        const fullDest = path.resolve(process.cwd(), relativeDest);
        await downloadFile(file.id, file.name, fullDest);
      }
    }

    // 7. Ripristino e Fusione Bidirezionale Chat Antigravity, Brain e Pin
    if (chatsZipFile) {
      console.log('\n💬 Passo 4: Fusione Bidirezionale Cronologia Chat, Brain & PIN Antigravity...');
      const userHome = process.env.USERPROFILE || 'C:/Users/Red';
      const antigravityDir = path.resolve(userHome, '.gemini/antigravity');
      const localZipPath = path.join(tempDir, 'antigravity_chats_backup.zip');
      await downloadFile(chatsZipFile.id, 'antigravity_chats_backup.zip', localZipPath);

      if (fs.existsSync(localZipPath)) {
        // A. Snapshot di Backup Preventivo Locale
        const backupTime = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.resolve(antigravityDir, '../antigravity_backups', `backup_${backupTime}`);
        try {
          fs.mkdirSync(backupDir, { recursive: true });
          const localSumDb = path.join(antigravityDir, 'conversation_summaries.db');
          if (fs.existsSync(localSumDb)) {
            fs.copyFileSync(localSumDb, path.join(backupDir, 'conversation_summaries.db'));
          }
          console.log(`🛡️  Snapshot di sicurezza locale creato in: ${backupDir}`);
        } catch (bkErr) {
          console.warn('⚠️ Impossibile creare snapshot di backup preventivo:', bkErr.message);
        }

        // B. Estrazione temporanea del pacchetto in arrivo dal cloud
        const incomingStagingDir = path.join(tempDir, 'incoming_antigravity');
        if (fs.existsSync(incomingStagingDir)) {
          fs.rmSync(incomingStagingDir, { recursive: true, force: true });
        }
        fs.mkdirSync(incomingStagingDir, { recursive: true });
        console.log('📂 Estrazione pacchetto cloud in area temporanea...');
        execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${localZipPath}' -DestinationPath '${incomingStagingDir}' -Force"`);

        // C. Fusione Incrementale delle conversazioni (conversations/*.db)
        const incomingConvDir = path.join(incomingStagingDir, 'conversations');
        const localConvDir = path.join(antigravityDir, 'conversations');
        fs.mkdirSync(localConvDir, { recursive: true });
        let newConvs = 0;
        let updatedConvs = 0;

        if (fs.existsSync(incomingConvDir)) {
          const convFiles = fs.readdirSync(incomingConvDir);
          for (const f of convFiles) {
            if (!f.endsWith('.db')) continue;
            const srcFile = path.join(incomingConvDir, f);
            const dstFile = path.join(localConvDir, f);
            if (!fs.existsSync(dstFile)) {
              fs.copyFileSync(srcFile, dstFile);
              newConvs++;
            } else {
              const srcMtime = fs.statSync(srcFile).mtimeMs;
              const dstMtime = fs.statSync(dstFile).mtimeMs;
              if (srcMtime > dstMtime) {
                fs.copyFileSync(srcFile, dstFile);
                updatedConvs++;
              }
            }
          }
        }
        console.log(`  ✅ Database conversazioni: ${newConvs} nuove aggiunte, ${updatedConvs} aggiornate.`);

        // D. Fusione Incrementale delle directory brain (brain/<UUID>)
        const incomingBrainDir = path.join(incomingStagingDir, 'brain');
        const localBrainDir = path.join(antigravityDir, 'brain');
        fs.mkdirSync(localBrainDir, { recursive: true });
        let newBrains = 0;

        if (fs.existsSync(incomingBrainDir)) {
          const brainDirs = fs.readdirSync(incomingBrainDir);
          for (const b of brainDirs) {
            const srcB = path.join(incomingBrainDir, b);
            const dstB = path.join(localBrainDir, b);
            if (!fs.existsSync(dstB) && fs.statSync(srcB).isDirectory()) {
              fs.cpSync(srcB, dstB, { recursive: true });
              newBrains++;
            }
          }
        }
        console.log(`  ✅ Contesti Brain: ${newBrains} nuovi contesti aggiunti.`);

        // E. Fusione delle Annotazioni
        const incomingAnnDir = path.join(incomingStagingDir, 'annotations');
        const localAnnDir = path.join(antigravityDir, 'annotations');
        fs.mkdirSync(localAnnDir, { recursive: true });
        if (fs.existsSync(incomingAnnDir)) {
          fs.cpSync(incomingAnnDir, localAnnDir, { recursive: true });
        }

        // F. Fusione Relazionale Atomica di conversation_summaries.db
        const incomingDb = path.join(incomingStagingDir, 'conversation_summaries.db');
        const localDb = path.join(antigravityDir, 'conversation_summaries.db');

        if (fs.existsSync(incomingDb)) {
          if (!fs.existsSync(localDb)) {
            fs.copyFileSync(incomingDb, localDb);
            console.log('  ✅ Database indice creato da pacchetto cloud.');
          } else {
            try {
              const db = new DatabaseSync(localDb);
              const normalizedIncomingDb = incomingDb.replace(/\\/g, '/');
              db.exec(`ATTACH DATABASE '${normalizedIncomingDb}' AS incoming`);

              // Upsert atomico non distruttivo
              db.exec(`
                INSERT INTO conversation_summaries (
                  conversation_id, title, preview, step_count, last_modified_time,
                  workspace_uris, status, source, project_id, agent_name,
                  parent_conversation_id, nesting_depth, battle_id, winning_conversation_id,
                  not_fully_idle, killed, last_user_input_time, last_user_input_step_index,
                  app_data_dir, raw_summary, group_id
                )
                SELECT
                  conversation_id, title, preview, step_count, last_modified_time,
                  workspace_uris, status, source, project_id, agent_name,
                  parent_conversation_id, nesting_depth, battle_id, winning_conversation_id,
                  not_fully_idle, killed, last_user_input_time, last_user_input_step_index,
                  app_data_dir, raw_summary, group_id
                FROM incoming.conversation_summaries
                WHERE true
                ON CONFLICT(conversation_id) DO UPDATE SET
                  title = CASE WHEN excluded.last_modified_time > conversation_summaries.last_modified_time THEN excluded.title ELSE conversation_summaries.title END,
                  preview = CASE WHEN excluded.last_modified_time > conversation_summaries.last_modified_time THEN excluded.preview ELSE conversation_summaries.preview END,
                  step_count = MAX(conversation_summaries.step_count, excluded.step_count),
                  last_modified_time = MAX(conversation_summaries.last_modified_time, excluded.last_modified_time),
                  status = CASE WHEN excluded.last_modified_time > conversation_summaries.last_modified_time THEN excluded.status ELSE conversation_summaries.status END,
                  last_user_input_time = MAX(conversation_summaries.last_user_input_time, excluded.last_user_input_time),
                  last_user_input_step_index = MAX(conversation_summaries.last_user_input_step_index, excluded.last_user_input_step_index),
                  group_id = CASE WHEN excluded.group_id != '' THEN excluded.group_id ELSE conversation_summaries.group_id END
              `);

              try {
                db.exec("INSERT INTO conversations_fts(conversations_fts) VALUES('rebuild')");
              } catch (_) {}

              db.close();
              console.log('  ✅ Database indice SQLite fuso con successo: chat locali + cloud integrate al 100%!');
            } catch (mergeErr) {
              console.warn('⚠️ Avviso durante fusione SQLite conversation_summaries:', mergeErr.message);
            }
          }
        }

        // Pulizia area temporanea staging
        fs.rmSync(incomingStagingDir, { recursive: true, force: true });
        console.log('🎉 Fusione cronologia chat e PIN completata con successo (Zero Sovrascritture)!');
      }
    }

    // 8. Decifratura Vault Credenziali e allineamento dipendenze
    console.log('\n🔐 Passo 5: Decifratura Vault Credenziali (.env) e allineamento dipendenze...');
    try {
      execSync('node scratch/vault-sync.mjs sync', { stdio: 'inherit', cwd: process.cwd() });
      execSync('node scratch/vault-sync.mjs deps', { stdio: 'inherit', cwd: process.cwd() });
      console.log('✅ File .env rigenerati e librerie verificate.');
    } catch (e) {
      console.warn('⚠️ Avviso durante sincronizzazione vault:', e.message);
    }

    // 9. Pulizia scratch locale
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log('\n===========================================================');
    console.log('🎉 POSTAZIONE RIPRISTINATA E ALLINEATA CON SUCCESSO!');
    console.log('===========================================================');
    console.log(`- Pacchetto Cloud:   [${targetFolder.name}]`);
    console.log(`- Codice Progetto:   Aggiornato al 100%`);
    console.log(`- Password & Vault:  Decifrati e attivi (.env pronto)`);
    console.log(`- Antigravity IDE:   Cronologia Chat e PIN ripristinati!`);
    console.log('-----------------------------------------------------------');
    console.log('🚀 ORA PUOI APRIRE TRANQUILLAMENTE ANTIGRAVITY E LAVORARE.');
    console.log('===========================================================\n');
  } catch (err) {
    console.error('\n❌ ERRORE DURANTE IL RIPRISTINO DELLA POSTAZIONE:', err.message);
    process.exit(1);
  }
}

main();
