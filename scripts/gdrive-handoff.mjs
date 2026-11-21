import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import { DatabaseSync } from 'node:sqlite';

function run(command) {
  return execSync(command, { encoding: 'utf8', cwd: process.cwd() }).trim();
}

function escapePsSingleQuoted(str) {
  return String(str).replace(/'/g, "''");
}

export function resolveIdeStateVscdb(appDataDir = process.env.APPDATA) {
  if (!appDataDir) return null;
  for (const appName of ['Antigravity IDE', 'Antigravity']) {
    const candidate = path.join(appDataDir, appName, 'User', 'globalStorage', 'state.vscdb');
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export function detectLocalProjectId(userHome, projectCwd) {
  const projectsDir = path.join(userHome, '.gemini', 'config', 'projects');
  if (!fs.existsSync(projectsDir)) return '';

  const repoName = path.basename(path.resolve(projectCwd)).toLowerCase();
  const normCwd = path.resolve(projectCwd).replace(/\\/g, '/').toLowerCase();
  let fallbackByName = '';

  for (const file of fs.readdirSync(projectsDir)) {
    if (!file.endsWith('.json')) continue;
    if (file === 'default-cli-project.json' || file === 'outside-of-project.json') continue;
    try {
      const proj = JSON.parse(fs.readFileSync(path.join(projectsDir, file), 'utf8'));
      if (!proj?.id) continue;
      const resources = proj?.projectResources?.resources || [];
      for (const r of resources) {
        const uri = decodeURIComponent(r?.gitFolder?.folderUri || r?.folderUri || '').replace(/\\/g, '/').toLowerCase();
        if (uri && (uri.includes(normCwd) || uri.endsWith('/' + repoName))) {
          return proj.id;
        }
      }
      if (!fallbackByName && String(proj.name || '').toLowerCase() === repoName) {
        fallbackByName = proj.id;
      }
    } catch (_) {}
  }

  return fallbackByName;
}

export function snapshotSqliteFile(srcPath, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  if (fs.existsSync(destPath)) {
    fs.unlinkSync(destPath);
  }

  const escapedDest = destPath.replace(/\\/g, '/').replace(/'/g, "''");
  let lastErr = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    let db = null;
    try {
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      db = new DatabaseSync(srcPath, { readOnly: true });
      db.exec(`VACUUM INTO '${escapedDest}'`);
      return true;
    } catch (err) {
      lastErr = err;
      if (attempt < 2) {
        try { execSync('powershell -NoProfile -Command "Start-Sleep -Milliseconds 500"'); } catch (_) {}
      }
    } finally {
      if (db) {
        try { db.close(); } catch (_) {}
      }
    }
  }

  console.warn(`⚠️ VACUUM INTO non riuscito per ${path.basename(srcPath)} (${lastErr?.message}), uso fallback copyFileSync.`);
  if (fs.existsSync(destPath)) {
    try { fs.unlinkSync(destPath); } catch (_) {}
  }
  fs.copyFileSync(srcPath, destPath);
  return false;
}

function parsePbtxtTitle(content) {
  const m = content.match(/title\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (!m) return '';
  return m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\').trim();
}

export function exportPinnedAntigravityPackage({
  antigravityDir,
  appDataDir = process.env.APPDATA,
  userHome = process.env.USERPROFILE || 'C:/Users/Red',
  projectCwd = process.cwd(),
  chatsTempDir,
  chatsZipPath
}) {
  if (fs.existsSync(chatsTempDir)) {
    fs.rmSync(chatsTempDir, { recursive: true, force: true });
  }
  fs.mkdirSync(chatsTempDir, { recursive: true });

  if (!fs.existsSync(antigravityDir)) {
    return {
      pinnedCount: 0,
      pinnedChats: [],
      copiedConvFiles: 0,
      copiedBrainDirs: 0,
      copiedChapterTitles: 0,
      zipSizeMb: '0.00',
      zipEntries: 0,
      totalConvBytes: 0
    };
  }

  // A. Snapshot consistente di conversation_summaries.db e copia agyhub_summaries_proto.pb
  const dbPath = path.join(antigravityDir, 'conversation_summaries.db');
  const snappedSumDbPath = path.join(chatsTempDir, 'conversation_summaries.db');
  if (fs.existsSync(dbPath)) {
    snapshotSqliteFile(dbPath, snappedSumDbPath);
  }
  const protoPath = path.join(antigravityDir, 'agyhub_summaries_proto.pb');
  if (fs.existsSync(protoPath)) {
    fs.copyFileSync(protoPath, path.join(chatsTempDir, 'agyhub_summaries_proto.pb'));
  }

  // B. Scansione annotations/*.pbtxt per pin e titoli
  const annSrc = path.join(antigravityDir, 'annotations');
  const annPinnedIds = new Set();
  const annTitles = new Map();
  const annRawById = new Map();

  if (fs.existsSync(annSrc)) {
    for (const af of fs.readdirSync(annSrc)) {
      if (!af.endsWith('.pbtxt')) continue;
      const convId = af.replace(/\.pbtxt$/i, '');
      try {
        const annContent = fs.readFileSync(path.join(annSrc, af), 'utf8');
        annRawById.set(convId, annContent);
        if (/pinned\s*:\s*true/i.test(annContent)) {
          annPinnedIds.add(convId);
        }
        const t = parsePbtxtTitle(annContent);
        if (t) annTitles.set(convId, t);
      } catch (_) {}
    }
  }

  // C. Lettura stato UI Antigravity IDE (pinned_conversations_order, comments, layouts)
  let idePinnedOrder = [];
  let ideComments;
  let ideStorage = {};
  const ideStateVscdb = resolveIdeStateVscdb(appDataDir);
  if (ideStateVscdb) {
    let ideDb = null;
    try {
      ideDb = new DatabaseSync(ideStateVscdb, { readOnly: true });
      const agRow = ideDb.prepare("SELECT value FROM ItemTable WHERE key = 'google.google-antigravity'").get();
      if (agRow && agRow.value) {
        const parsed = JSON.parse(agRow.value);
        ideStorage = parsed?.['antigravity-storage'] || {};
        ideComments = ideStorage.comments;
        const rawOrder = ideStorage.pinned_conversations_order;
        if (rawOrder) {
          const parsedOrder = typeof rawOrder === 'string' ? JSON.parse(rawOrder) : rawOrder;
          if (Array.isArray(parsedOrder)) {
            idePinnedOrder = parsedOrder.filter(id => typeof id === 'string' && id.trim()).map(id => id.trim());
          }
        }
      }
    } catch (ideErr) {
      console.warn('⚠️ Avviso lettura stato UI IDE:', ideErr.message);
    } finally {
      if (ideDb) {
        try { ideDb.close(); } catch (_) {}
      }
    }
  }

  // D. Unione annotations + IDE order filtrando ID fantasma non presenti su disco
  const convSrc = path.join(antigravityDir, 'conversations');
  const brainSrc = path.join(antigravityDir, 'brain');
  const candidateIds = new Set([...annPinnedIds, ...idePinnedOrder]);
  const activeIds = new Set();

  for (const id of candidateIds) {
    const hasDb = fs.existsSync(path.join(convSrc, `${id}.db`));
    const hasPb = fs.existsSync(path.join(convSrc, `${id}.pb`));
    const hasBrain = fs.existsSync(path.join(brainSrc, id)) && fs.statSync(path.join(brainSrc, id)).isDirectory();
    if (hasDb || hasPb || hasBrain) {
      activeIds.add(id);
    }
  }

  const cleanedOrder = [];
  const seenOrder = new Set();
  for (const id of idePinnedOrder) {
    if (activeIds.has(id) && !seenOrder.has(id)) {
      cleanedOrder.push(id);
      seenOrder.add(id);
    }
  }
  for (const id of activeIds) {
    if (!seenOrder.has(id)) {
      cleanedOrder.push(id);
      seenOrder.add(id);
    }
  }

  console.log(`  🎯 Selezionate ESCLUSIVAMENTE le ${activeIds.size} chat pinnate valide (scartati ${candidateIds.size - activeIds.size} ID fantasma).`);

  // E. Esportazione selettiva antigravity_ide_state.json (solo layouts delle chat esportate)
  const filteredLayouts = {};
  for (const id of activeIds) {
    const layoutKey = `antigravity-multi-conversation-layout-v3-${id}`;
    const panelKey = `running-items-panel-expanded-${id}`;
    if (ideStorage[layoutKey] !== undefined) filteredLayouts[layoutKey] = ideStorage[layoutKey];
    if (ideStorage[panelKey] !== undefined) filteredLayouts[panelKey] = ideStorage[panelKey];
  }
  const exportedIdeState = {
    pinned_conversations_order: JSON.stringify(cleanedOrder),
    comments: ideComments,
    layouts: filteredLayouts
  };
  fs.writeFileSync(path.join(chatsTempDir, 'antigravity_ide_state.json'), JSON.stringify(exportedIdeState, null, 2), 'utf8');
  console.log(`  🎨 Stato UI IDE esportato (${cleanedOrder.length} PIN ordinati, ${Object.keys(filteredLayouts).length} layouts).`);

  // F. Copia selettiva annotations/<id>.pbtxt SOLO per le chat pinnate valide
  const annDest = path.join(chatsTempDir, 'annotations');
  fs.mkdirSync(annDest, { recursive: true });
  for (const id of activeIds) {
    const srcAnnPath = path.join(annSrc, `${id}.pbtxt`);
    const dstAnnPath = path.join(annDest, `${id}.pbtxt`);
    let content = annRawById.get(id);
    if (content === undefined && fs.existsSync(srcAnnPath)) {
      content = fs.readFileSync(srcAnnPath, 'utf8');
    }
    if (!content) {
      content = 'pinned:true\n';
    } else if (!/pinned\s*:\s*true/i.test(content)) {
      if (/pinned\s*:\s*false/i.test(content)) {
        content = content.replace(/pinned\s*:\s*false/i, 'pinned:true');
      } else {
        content = `${content.trimEnd()}\npinned:true\n`;
      }
    }
    fs.writeFileSync(dstAnnPath, content, 'utf8');
  }

  // G. Snapshot selettivo conversations/<id>.db (senza .db-wal / .db-shm) e copia eventuale .pb
  const convDest = path.join(chatsTempDir, 'conversations');
  fs.mkdirSync(convDest, { recursive: true });
  let copiedConvFiles = 0;
  let totalConvBytes = 0;

  for (const id of activeIds) {
    const dbSrcFile = path.join(convSrc, `${id}.db`);
    if (fs.existsSync(dbSrcFile)) {
      const dbDstFile = path.join(convDest, `${id}.db`);
      snapshotSqliteFile(dbSrcFile, dbDstFile);
      copiedConvFiles++;
      try { totalConvBytes += fs.statSync(dbDstFile).size; } catch (_) {}
    }
    const pbSrcFile = path.join(convSrc, `${id}.pb`);
    if (fs.existsSync(pbSrcFile)) {
      const pbDstFile = path.join(convDest, `${id}.pb`);
      fs.copyFileSync(pbSrcFile, pbDstFile);
      copiedConvFiles++;
      try { totalConvBytes += fs.statSync(pbDstFile).size; } catch (_) {}
    }
  }

  // H. Copia selettiva brain/<id>
  const brainDest = path.join(chatsTempDir, 'brain');
  fs.mkdirSync(brainDest, { recursive: true });
  let copiedBrainDirs = 0;
  if (fs.existsSync(brainSrc)) {
    for (const id of activeIds) {
      const srcB = path.join(brainSrc, id);
      if (fs.existsSync(srcB) && fs.statSync(srcB).isDirectory()) {
        fs.cpSync(srcB, path.join(brainDest, id), { recursive: true });
        copiedBrainDirs++;
      }
    }
  }

  // I. Copia selettiva chapter_titles/<id>*
  const chapSrc = path.join(antigravityDir, 'chapter_titles');
  let copiedChapterTitles = 0;
  if (fs.existsSync(chapSrc)) {
    const chapDest = path.join(chatsTempDir, 'chapter_titles');
    fs.mkdirSync(chapDest, { recursive: true });
    for (const cf of fs.readdirSync(chapSrc)) {
      if (cleanedOrder.some(id => cf.startsWith(id))) {
        const srcCf = path.join(chapSrc, cf);
        if (fs.statSync(srcCf).isFile()) {
          fs.copyFileSync(srcCf, path.join(chapDest, cf));
          copiedChapterTitles++;
        }
      }
    }
  }

  // J. Generazione pinned_manifest.json leggendo i metadati dallo snapshot
  const dbRowsById = new Map();
  if (fs.existsSync(snappedSumDbPath)) {
    let snapDb = null;
    try {
      snapDb = new DatabaseSync(snappedSumDbPath, { readOnly: true });
      const stmt = snapDb.prepare('SELECT conversation_id, title, workspace_uris, project_id FROM conversation_summaries WHERE conversation_id = ?');
      for (const id of cleanedOrder) {
        const row = stmt.get(id);
        if (row) dbRowsById.set(id, row);
      }
    } catch (_) {
    } finally {
      if (snapDb) {
        try { snapDb.close(); } catch (_) {}
      }
    }
  }

  const pinnedChats = cleanedOrder.map(id => {
    const row = dbRowsById.get(id);
    const title = (row?.title && row.title.trim()) || annTitles.get(id) || '(senza titolo)';
    return {
      id,
      title,
      workspace_uris: row?.workspace_uris || '',
      project_id: row?.project_id || ''
    };
  });

  const manifest = {
    exportedAt: new Date().toISOString(),
    sourceUser: path.basename(userHome),
    sourceProjectDir: projectCwd,
    sourceProjectId: detectLocalProjectId(userHome, projectCwd),
    pinnedIds: cleanedOrder,
    pinnedChats
  };
  fs.writeFileSync(path.join(chatsTempDir, 'pinned_manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`  📦 Cartella locale pronta: ${copiedConvFiles} file conversazione (${(totalConvBytes / (1024 * 1024)).toFixed(2)} MB), ${copiedBrainDirs} contesti brain, ${copiedChapterTitles} chapter_titles.`);

  // K. Compressione ZIP e verifica integrità immediata
  if (fs.existsSync(chatsZipPath)) fs.unlinkSync(chatsZipPath);
  console.log('🤐 Compressione archivio super-leggero in corso...');
  const psSrc = escapePsSingleQuoted(chatsTempDir);
  const psDst = escapePsSingleQuoted(chatsZipPath);
  execSync(`powershell -NoProfile -Command "Compress-Archive -Path '${psSrc}/*' -DestinationPath '${psDst}' -Force"`);

  const entryCountRaw = execSync(
    `powershell -NoProfile -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; $z = [System.IO.Compression.ZipFile]::OpenRead('${psDst}'); $c = $z.Entries.Count; $z.Dispose(); Write-Output $c"`,
    { encoding: 'utf8' }
  ).trim();
  const zipEntries = parseInt(entryCountRaw, 10) || 0;
  if (zipEntries <= 0) {
    throw new Error(`Verifica integrità ZIP fallita: archivio vuoto o illeggibile (${chatsZipPath}).`);
  }

  const zipSizeMb = (fs.statSync(chatsZipPath).size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Archivio chat, brain e PIN verificato: ${path.basename(chatsZipPath)} (${zipSizeMb} MB, ${zipEntries} voci)`);

  return {
    pinnedCount: cleanedOrder.length,
    pinnedChats,
    copiedConvFiles,
    copiedBrainDirs,
    copiedChapterTitles,
    zipSizeMb,
    zipEntries,
    totalConvBytes
  };
}

async function main() {
  console.log('===========================================================');
  console.log('☁️  AVVIO PACCHETTO HANDOFF: UPLOAD SU GOOGLE DRIVE 5TB');
  console.log('===========================================================');

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
      await fetch(`https://www.googleapis.com/drive/v3/files/${folderId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: targetFolderName })
      });

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

    // Scansione Worktrees attivi in tempo reale
    const activeWorktrees = [];
    try {
      const wtRaw = execSync('git worktree list --porcelain', { encoding: 'utf8', cwd: process.cwd() });
      const blocks = wtRaw.trim().split('\n\n');
      const mainDir = process.cwd().replace(/\\/g, '/').toLowerCase();

      for (const block of blocks) {
        const lines = block.split('\n');
        const wtLine = lines.find(l => l.startsWith('worktree '));
        const branchLine = lines.find(l => l.startsWith('branch '));

        if (wtLine && branchLine) {
          const wtPath = wtLine.replace('worktree ', '').trim();
          const branchName = branchLine.replace('branch refs/heads/', '').trim();
          const normPath = wtPath.replace(/\\/g, '/');

          if (normPath.toLowerCase() !== mainDir && !normPath.includes('new_worktree_explanation')) {
            const folderName = path.basename(normPath);
            const isAntigravityInternal = normPath.toLowerCase().includes('.gemini/antigravity/worktrees');
            activeWorktrees.push({
              name: folderName,
              branch: branchName,
              isAntigravityInternal,
              originalPath: wtPath
            });
          }
        }
      }
      fs.mkdirSync('scratch', { recursive: true });
      fs.writeFileSync('scratch/worktrees_info.json', JSON.stringify(activeWorktrees, null, 2), 'utf8');
      console.log(`  🌿 Rilevati e registrati ${activeWorktrees.length} Worktree attivi.`);
    } catch (wtErr) {
      console.warn('⚠️ Avviso scansione worktrees:', wtErr.message);
    }

    console.log('\n📦 Passo 3: Preparazione file di sistema e codice...');
    const copyList = [
      { src: '.agents/AGENTS.md', dest: 'AGENTS.md' },
      { src: 'scripts/project-sync.mjs', dest: 'project-sync.mjs' },
      { src: 'scripts/project-transfer.mjs', dest: 'project-transfer.mjs' },
      { src: 'scripts/history-clean.mjs', dest: 'history-clean.mjs' },
      { src: 'scripts/branch-sync.mjs', dest: 'branch-sync.mjs' },
      { src: 'scripts/branch-merge.mjs', dest: 'branch-merge.mjs' },
      { src: 'scripts/gdrive-handoff.mjs', dest: 'gdrive-handoff.mjs' },
      { src: 'scratch/vault-sync.mjs', dest: 'vault-sync.mjs' },
      { src: 'package.json', dest: 'package.json' },
      { src: '.secret_docs/api_credentials_report.md.enc', dest: 'api_credentials_report.md.enc' },
      { src: 'RIPRISTINA_TUTTO.bat', dest: 'RIPRISTINA_TUTTO.bat' },
      { src: 'scratch/worktrees_info.json', dest: 'worktrees_info.json' },
      { src: 'scripts/gdrive-handoff-pull.mjs', dest: 'gdrive-handoff-pull.mjs' }
    ];

    for (const item of copyList) {
      if (fs.existsSync(item.src)) {
        fs.copyFileSync(item.src, path.join(tempDir, item.dest));
      }
    }

    // 6. Preparazione archivio Chat Antigravity e Pin (Filtro Selettivo Ultra-Leggero)
    console.log('\n💬 Passo 4: Backup selettivo della cronologia Chat, Brain e PIN Antigravity...');
    const userHome = process.env.USERPROFILE || 'C:/Users/Red';
    const antigravityDir = path.resolve(userHome, '.gemini/antigravity');
    const chatsTempDir = path.resolve(process.cwd(), 'scratch/chats_temp');
    const chatsZipPath = path.join(tempDir, 'antigravity_chats_backup.zip');

    let exportStats = { pinnedCount: 0, pinnedChats: [], copiedConvFiles: 0, copiedBrainDirs: 0, copiedChapterTitles: 0, zipSizeMb: '0.00', zipEntries: 0 };
    if (fs.existsSync(antigravityDir)) {
      exportStats = exportPinnedAntigravityPackage({
        antigravityDir,
        appDataDir: process.env.APPDATA,
        userHome,
        projectCwd: process.cwd(),
        chatsTempDir,
        chatsZipPath
      });
    }

    // Genera file di istruzioni testuale 1-click bidirezionale con riepilogo dinamico
    const pinnedLines = exportStats.pinnedChats.length > 0
      ? exportStats.pinnedChats.map((c, i) => `   ${i + 1}. ${c.title}`)
      : ['   (nessuna chat pinnata rilevata)'];
    const wtLines = activeWorktrees.length > 0
      ? activeWorktrees.map((w, i) => `   ${i + 1}. ${w.name} [branch: ${w.branch}]`)
      : ['   (nessun worktree parallelo attivo)'];

    const txtContent = [
      '===========================================================',
      '  ISTRUZIONI DI RIPRISTINO POSTAZIONE (KOH PHAYAM <-> RANONG)',
      '===========================================================',
      '',
      'IMPORTANTE PRIMA DI INIZIARE:',
      '  Chiudi completamente Antigravity IDE sulla postazione di arrivo',
      '  prima di avviare il ripristino (cosi non sovrascrive i PIN!).',
      '',
      '--- METODO 1 (IL PIU VELOCE - 1 CLICK SENZA TERMINALE) ---',
      '1. Scarica da questa cartella di Google Drive il file: RIPRISTINA_TUTTO.bat',
      '   (oppure usa quello gia presente nella cartella del progetto).',
      '2. Fai doppio click su RIPRISTINA_TUTTO.bat.',
      '   (Rileva il progetto su D:, verifica che Antigravity IDE sia chiuso,',
      '    scarica il codice da GitHub, ripristina Worktree, chat pinnate e PIN).',
      '',
      '--- METODO 2 (DA TERMINALE / POWERSHELL) ---',
      '1. Chiudi Antigravity IDE.',
      '2. Nella cartella del progetto incolla:',
      '',
      '   git pull origin staging ; node scripts/gdrive-handoff-pull.mjs',
      '',
      '3. Premi Invio.',
      '',
      '-----------------------------------------------------------',
      `CHAT PINNATE INCLUSE IN QUESTO PACCHETTO (${exportStats.pinnedCount}):`,
      ...pinnedLines,
      '',
      `WORKTREE ATTIVI INCLUSI (${activeWorktrees.length}):`,
      ...wtLines,
      '==========================================================='
    ].join('\r\n');
    fs.writeFileSync(path.join(tempDir, 'COME_RIPRISTINARE.txt'), txtContent, 'utf8');

    // 7. Upload dei file su Google Drive con supporto Resumable per grandi archivi
    console.log('\n🚀 Passo 5: Caricamento su Google Drive 5TB...');

    async function uploadFile(filePath, fileName, mimeType = 'application/octet-stream') {
      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fileBuffer.length;
      const sizeMb = (fileSize / (1024 * 1024)).toFixed(2);

      // 1. File <= 5MB -> Multipart con retry automatico
      if (fileSize <= 5 * 1024 * 1024) {
        let resData;
        let attempt = 0;
        const maxAttempts = 5;
        while (attempt < maxAttempts) {
          attempt++;
          try {
            const boundary = '-------FP_HANDOFF_' + Date.now();
            const delimiter = '\r\n--' + boundary + '\r\n';
            const closeDelim = '\r\n--' + boundary + '--';
            const metadata = { name: fileName, parents: [folderId] };
            const metadataPart = delimiter + 'Content-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata) + '\r\n';
            const fileHeader = '--' + boundary + '\r\nContent-Type: ' + mimeType + '\r\n\r\n';
            const bodyBuffer = Buffer.concat([
              Buffer.from(metadataPart, 'utf8'),
              Buffer.from(fileHeader, 'utf8'),
              fileBuffer,
              Buffer.from(closeDelim, 'utf8')
            ]);
            const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size', {
              method: 'POST',
              headers: {
                Authorization: 'Bearer ' + accessToken,
                'Content-Type': 'multipart/related; boundary=' + boundary,
                'Content-Length': bodyBuffer.length.toString()
              },
              body: bodyBuffer
            });
            resData = await res.json();
            if (!res.ok) {
              throw new Error('HTTP ' + res.status + ': ' + JSON.stringify(resData));
            }
            break;
          } catch (netErr) {
            console.warn('  ⚠️ Tentativo ' + attempt + '/' + maxAttempts + ' multipart per ' + fileName + ': ' + netErr.message);
            if (attempt >= maxAttempts) throw netErr;
            await new Promise(r => setTimeout(r, 2500));
          }
        }
        console.log('  ⬆️ Caricato: ' + fileName + ' (' + sizeMb + ' MB)');
        return resData;
      }

      // 2. File > 5MB -> Resumable upload a chunk da 5MB con retry rigoroso
      console.log('  ⏳ Avvio upload resumable per file: ' + fileName + ' (' + sizeMb + ' MB)...');
      const initRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': mimeType,
          'X-Upload-Content-Length': fileSize.toString()
        },
        body: JSON.stringify({ name: fileName, parents: [folderId] })
      });
      if (!initRes.ok) {
        const initErr = await initRes.text();
        throw new Error('Inizializzazione resumable fallita per ' + fileName + ': ' + initErr);
      }
      const uploadUrl = initRes.headers.get('location');
      if (!uploadUrl) {
        throw new Error('Location header mancante per upload resumable di ' + fileName);
      }

      const CHUNK_SIZE = 5 * 1024 * 1024;
      let start = 0;
      let lastRes;
      while (start < fileSize) {
        const end = Math.min(start + CHUNK_SIZE, fileSize);
        const chunk = fileBuffer.subarray(start, end);
        const rangeHeader = 'bytes ' + start + '-' + (end - 1) + '/' + fileSize;
        const pct = Math.round((end / fileSize) * 100);
        let sent = false;
        let retries = 0;
        while (!sent && retries < 5) {
          try {
            retries++;
            const chunkRes = await fetch(uploadUrl, {
              method: 'PUT',
              headers: {
                'Content-Range': rangeHeader,
                'Content-Length': chunk.length.toString()
              },
              body: chunk
            });
            if (chunkRes.status === 308 || chunkRes.ok) {
              lastRes = chunkRes;
              sent = true;
              console.log('    Progresso ' + fileName + ': ' + pct + '% (' + (end / (1024 * 1024)).toFixed(1) + ' / ' + sizeMb + ' MB)');
            } else {
              const errBody = await chunkRes.text();
              console.warn('    ⚠️ Chunk status ' + chunkRes.status + ' (tentativo ' + retries + '/5): ' + errBody);
              if (retries >= 5) {
                throw new Error('HTTP ' + chunkRes.status + ' su chunk ' + rangeHeader + ': ' + errBody);
              }
              await new Promise(r => setTimeout(r, 2000));
            }
          } catch (netErr) {
            console.warn('    ⚠️ Rete chunk (tentativo ' + retries + '/5): ' + netErr.message);
            if (retries >= 5) throw netErr;
            await new Promise(r => setTimeout(r, 3000));
          }
        }
        if (!sent) {
          throw new Error(`Upload chunk fallito per ${fileName} (bytes ${start}-${end - 1})`);
        }
        start = end;
      }

      if (!lastRes || !lastRes.ok) {
        throw new Error(`Upload resumable non finalizzato correttamente per ${fileName} (HTTP ${lastRes?.status || 'sconosciuto'}).`);
      }

      let resData = {};
      try { resData = await lastRes.json(); } catch (_) {}
      console.log('  ⬆️ Caricato con successo: ' + fileName + ' (' + sizeMb + ' MB)');
      return resData;
    }

    const uploadFiles = fs.readdirSync(tempDir);
    for (const f of uploadFiles) {
      const fullPath = path.join(tempDir, f);
      const isZip = f.endsWith('.zip');
      const isJson = f.endsWith('.json');
      const isMd = f.endsWith('.md');
      const isBat = f.endsWith('.bat');
      const mime = isZip ? 'application/zip' : (isJson ? 'application/json' : (isMd ? 'text/markdown' : (isBat ? 'text/plain' : 'application/octet-stream')));
      console.log('  🚀 Inizio upload:', f);
      await uploadFile(fullPath, f, mime);
    }

    // 9. Pulizia scratch locale temporaneo
    fs.rmSync(tempDir, { recursive: true, force: true });
    if (fs.existsSync(chatsTempDir)) fs.rmSync(chatsTempDir, { recursive: true, force: true });
    const hPath = path.resolve(process.cwd(), 'scratch/handoff_completo.zip');
    if (fs.existsSync(hPath)) fs.unlinkSync(hPath);

    console.log('\n===========================================================');
    console.log('🎉 PACCHETTO HANDOFF CARICATO CON SUCCESSO SU GOOGLE DRIVE!');
    console.log('===========================================================');
    console.log(`📁 Cartella Cloud:   ${targetFolderName}`);
    console.log(`🆔 ID Cartella:       ${folderId}`);
    if (webViewLink) {
      console.log(`🔗 Link Diretto:      ${webViewLink}`);
    }
    console.log(`📌 Chat Pinnate:      ${exportStats.pinnedCount} esportate (${exportStats.zipSizeMb} MB)`);
    console.log(`🌿 Worktree Attivi:   ${activeWorktrees.length} registrati`);
    console.log('-----------------------------------------------------------');
    console.log('💡 Sull\'altra postazione (Koh Phayam <-> Ranong):');
    console.log('   1. Chiudi Antigravity IDE');
    console.log('   2. Doppio click su RIPRISTINA_TUTTO.bat');
    console.log('===========================================================\n');
  } catch (err) {
    console.error('\n❌ ERRORE DURANTE L\'UPLOAD DELL\'HANDOFF:', err.stack || err);
    process.exit(1);
  }
}

const isMain = process.argv[1] &&
  path.resolve(process.argv[1]).toLowerCase() === path.resolve(fileURLToPath(import.meta.url)).toLowerCase();
if (isMain) {
  main();
}
