import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';
import { DatabaseSync } from 'node:sqlite';

function escapePsSingleQuoted(str) {
  return String(str).replace(/'/g, "''");
}

function parsePbtxtTitle(content) {
  const m = content.match(/title\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (!m) return '';
  return m[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\').trim();
}

function parseViewSeconds(content) {
  const m = content.match(/last_user_view_time\s*:\s*\{[^}]*seconds\s*:\s*(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function parseTimestampMs(raw) {
  if (!raw) return 0;
  const iso = String(raw).trim().replace(' ', 'T');
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : 0;
}

export function toAntigravityFileUri(fsPath) {
  const resolved = path.resolve(fsPath);
  const parts = resolved.split(/[\\/]+/).filter(Boolean);
  if (parts.length === 0) return 'file:///';
  const encoded = parts.map((seg, idx) => {
    if (idx === 0 && /^[a-zA-Z]:$/.test(seg)) {
      return `${seg[0].toLowerCase()}%3A`;
    }
    return encodeURIComponent(seg);
  });
  return `file:///${encoded.join('/')}`;
}

export function resolveIdeStateVscdb(appDataDir = process.env.APPDATA) {
  if (!appDataDir) return null;
  for (const appName of ['Antigravity IDE', 'Antigravity']) {
    const candidate = path.join(appDataDir, appName, 'User', 'globalStorage', 'state.vscdb');
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export function isAntigravityIdeRunning() {
  for (const exeName of ['Antigravity IDE.exe', 'Antigravity.exe']) {
    try {
      const out = execSync(`tasklist /FI "IMAGENAME eq ${exeName}" /FO CSV /NH`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      });
      if (out.toLowerCase().includes(`"${exeName.toLowerCase()}"`)) {
        return true;
      }
    } catch (_) {}
  }
  return false;
}

export function detectLocalProjectId(userHome, projectCwd, localSumDb = null) {
  const projectsDir = path.join(userHome, '.gemini', 'config', 'projects');
  const normCwd = path.resolve(projectCwd).replace(/\\/g, '/').toLowerCase();
  const repoName = path.basename(path.resolve(projectCwd)).toLowerCase();

  if (fs.existsSync(projectsDir)) {
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
    if (fallbackByName) return fallbackByName;
  }

  if (localSumDb) {
    try {
      const rows = localSumDb.prepare(`
        SELECT project_id, workspace_uris, COUNT(*) as cnt
        FROM conversation_summaries
        WHERE project_id != ''
          AND project_id NOT IN ('default-cli-project', 'outside-of-project')
          AND LOWER(workspace_uris) LIKE ?
        GROUP BY project_id, workspace_uris
        ORDER BY cnt DESC
      `).all(`%${repoName}%`);

      for (const r of rows) {
        let decoded = '';
        try { decoded = decodeURIComponent(r.workspace_uris || '').toLowerCase(); } catch (_) { decoded = String(r.workspace_uris || '').toLowerCase(); }
        if (decoded.includes(normCwd)) {
          return r.project_id;
        }
      }
      if (rows.length > 0 && rows[0].project_id) {
        return rows[0].project_id;
      }
    } catch (_) {}
  }

  return '';
}

function mergeDirIncremental(srcDir, dstDir, forceNewer = false) {
  if (!fs.existsSync(srcDir)) return { added: 0, updated: 0 };
  if (!fs.existsSync(dstDir)) {
    fs.cpSync(srcDir, dstDir, { recursive: true });
    return { added: 1, updated: 0 };
  }

  let added = 0;
  let updated = 0;
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcEntry = path.join(srcDir, entry.name);
    const dstEntry = path.join(dstDir, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(dstEntry, { recursive: true });
      const sub = mergeDirIncremental(srcEntry, dstEntry, forceNewer);
      added += sub.added;
      updated += sub.updated;
    } else if (entry.isFile()) {
      if (!fs.existsSync(dstEntry)) {
        fs.copyFileSync(srcEntry, dstEntry);
        added++;
      } else {
        const srcStat = fs.statSync(srcEntry);
        const dstStat = fs.statSync(dstEntry);
        if (srcStat.mtimeMs > dstStat.mtimeMs || (forceNewer && srcStat.size !== dstStat.size)) {
          fs.copyFileSync(srcEntry, dstEntry);
          updated++;
        }
      }
    }
  }
  return { added, updated };
}

function readSummariesMeta(dbPath) {
  const map = new Map();
  if (!fs.existsSync(dbPath)) return map;
  let db = null;
  try {
    db = new DatabaseSync(dbPath, { readOnly: true });
    const rows = db.prepare('SELECT conversation_id, step_count, last_modified_time FROM conversation_summaries').all();
    for (const r of rows) {
      map.set(r.conversation_id, {
        step_count: Number(r.step_count || 0),
        last_modified_time: r.last_modified_time || '',
        modifiedMs: parseTimestampMs(r.last_modified_time)
      });
    }
  } catch (_) {
  } finally {
    if (db) {
      try { db.close(); } catch (_) {}
    }
  }
  return map;
}

function extractWorktreeBasename(rawUri) {
  let decoded = rawUri;
  try { decoded = decodeURIComponent(rawUri); } catch (_) {}
  const cleaned = decoded.replace(/\\/g, '/').replace(/\/+$/, '');
  const parts = cleaned.split('/').filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : '';
}

export function importPinnedAntigravityPackage({
  incomingStagingDir,
  antigravityDir,
  appDataDir = process.env.APPDATA,
  userHome = process.env.USERPROFILE || 'C:/Users/Red',
  projectCwd = process.cwd(),
  backupRootDir = path.resolve(antigravityDir, '../antigravity_backups')
}) {
  fs.mkdirSync(antigravityDir, { recursive: true });

  // A. Snapshot di Backup Preventivo Locale
  const backupTime = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(backupRootDir, `backup_${backupTime}`);
  const ideStateVscdb = resolveIdeStateVscdb(appDataDir);
  try {
    fs.mkdirSync(backupDir, { recursive: true });
    const localSumDb = path.join(antigravityDir, 'conversation_summaries.db');
    if (fs.existsSync(localSumDb)) {
      fs.copyFileSync(localSumDb, path.join(backupDir, 'conversation_summaries.db'));
    }
    const localProtoBak = path.join(antigravityDir, 'agyhub_summaries_proto.pb');
    if (fs.existsSync(localProtoBak)) {
      fs.copyFileSync(localProtoBak, path.join(backupDir, 'agyhub_summaries_proto.pb'));
    }
    if (ideStateVscdb && fs.existsSync(ideStateVscdb)) {
      fs.copyFileSync(ideStateVscdb, path.join(backupDir, 'state.vscdb'));
    }
    console.log(`🛡️  Snapshot di sicurezza locale creato in: ${backupDir}`);
  } catch (bkErr) {
    console.warn('⚠️ Impossibile creare snapshot di backup preventivo:', bkErr.message);
  }

  // B. Lettura manifest e titoli incoming da annotations
  const manifestPath = path.join(incomingStagingDir, 'pinned_manifest.json');
  const manifestTitles = new Map();
  let manifestPinnedIds = [];
  if (fs.existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (Array.isArray(manifest.pinnedIds)) {
        manifestPinnedIds = manifest.pinnedIds.filter(Boolean);
      }
      if (Array.isArray(manifest.pinnedChats)) {
        for (const item of manifest.pinnedChats) {
          if (item?.id && item?.title && item.title !== '(senza titolo)') {
            manifestTitles.set(item.id, item.title);
          }
        }
      }
    } catch (_) {}
  }

  const incomingAnnDir = path.join(incomingStagingDir, 'annotations');
  const incomingAnnTitles = new Map();
  const incomingAnnPinnedIds = [];
  if (fs.existsSync(incomingAnnDir)) {
    for (const f of fs.readdirSync(incomingAnnDir)) {
      if (!f.endsWith('.pbtxt')) continue;
      const convId = f.replace(/\.pbtxt$/i, '');
      try {
        const content = fs.readFileSync(path.join(incomingAnnDir, f), 'utf8');
        const t = parsePbtxtTitle(content);
        if (t) incomingAnnTitles.set(convId, t);
        if (/pinned\s*:\s*true/i.test(content)) incomingAnnPinnedIds.push(convId);
      } catch (_) {}
    }
  }

  const importedPinnedIds = Array.from(new Set([...manifestPinnedIds, ...incomingAnnPinnedIds]));

  // C. Lettura metadati conversation_summaries prima del merge file
  const incomingDb = path.join(incomingStagingDir, 'conversation_summaries.db');
  const localDb = path.join(antigravityDir, 'conversation_summaries.db');
  const incomingMeta = readSummariesMeta(incomingDb);
  const localMeta = readSummariesMeta(localDb);

  // D. Fusione Incrementale delle conversazioni (conversations/*.db e *.pb)
  const incomingConvDir = path.join(incomingStagingDir, 'conversations');
  const localConvDir = path.join(antigravityDir, 'conversations');
  fs.mkdirSync(localConvDir, { recursive: true });
  let newConvs = 0;
  let updatedConvs = 0;
  const updatedConvIds = new Set();

  if (fs.existsSync(incomingConvDir)) {
    const convFiles = fs.readdirSync(incomingConvDir);
    for (const f of convFiles) {
      if (!f.endsWith('.db') && !f.endsWith('.pb')) continue;
      const convId = f.replace(/\.(db|pb)$/i, '');
      const srcFile = path.join(incomingConvDir, f);
      const dstFile = path.join(localConvDir, f);

      let shouldCopy = false;
      if (!fs.existsSync(dstFile)) {
        shouldCopy = true;
        newConvs++;
      } else {
        const inc = incomingMeta.get(convId);
        const loc = localMeta.get(convId);
        if (inc && loc) {
          if (inc.step_count > loc.step_count || inc.modifiedMs > loc.modifiedMs) {
            shouldCopy = true;
          }
        } else {
          const srcStat = fs.statSync(srcFile);
          const dstStat = fs.statSync(dstFile);
          if (srcStat.size > dstStat.size || srcStat.mtimeMs > dstStat.mtimeMs) {
            shouldCopy = true;
          }
        }
        if (shouldCopy) updatedConvs++;
      }

      if (shouldCopy) {
        if (f.endsWith('.db')) {
          for (const side of ['-wal', '-shm']) {
            const sidePath = dstFile + side;
            if (fs.existsSync(sidePath)) {
              try { fs.unlinkSync(sidePath); } catch (_) {}
            }
          }
        }
        fs.copyFileSync(srcFile, dstFile);
        updatedConvIds.add(convId);
      }
    }
  }
  console.log(`  ✅ Database conversazioni: ${newConvs} nuove aggiunte, ${updatedConvs} aggiornate.`);

  // E. Fusione Incrementale delle directory brain (brain/<UUID>)
  const incomingBrainDir = path.join(incomingStagingDir, 'brain');
  const localBrainDir = path.join(antigravityDir, 'brain');
  fs.mkdirSync(localBrainDir, { recursive: true });
  let newBrains = 0;
  let updatedBrains = 0;

  if (fs.existsSync(incomingBrainDir)) {
    const brainDirs = fs.readdirSync(incomingBrainDir);
    for (const b of brainDirs) {
      const srcB = path.join(incomingBrainDir, b);
      const dstB = path.join(localBrainDir, b);
      if (!fs.statSync(srcB).isDirectory()) continue;
      const existed = fs.existsSync(dstB);
      const res = mergeDirIncremental(srcB, dstB, updatedConvIds.has(b));
      if (!existed) newBrains++;
      else if (res.added > 0 || res.updated > 0) updatedBrains++;
    }
  }
  console.log(`  ✅ Contesti Brain: ${newBrains} nuovi aggiunti, ${updatedBrains} aggiornati incrementalmente.`);

  // F. Fusione chapter_titles
  const incomingChapDir = path.join(incomingStagingDir, 'chapter_titles');
  const localChapDir = path.join(antigravityDir, 'chapter_titles');
  let syncedChapters = 0;
  if (fs.existsSync(incomingChapDir)) {
    fs.mkdirSync(localChapDir, { recursive: true });
    for (const cf of fs.readdirSync(incomingChapDir)) {
      const srcCf = path.join(incomingChapDir, cf);
      const dstCf = path.join(localChapDir, cf);
      if (!fs.statSync(srcCf).isFile()) continue;
      if (!fs.existsSync(dstCf) || fs.statSync(srcCf).mtimeMs > fs.statSync(dstCf).mtimeMs) {
        fs.copyFileSync(srcCf, dstCf);
        syncedChapters++;
      }
    }
  }
  if (syncedChapters > 0) {
    console.log(`  ✅ Chapter titles sincronizzati: ${syncedChapters}`);
  }

  // G. Fusione non distruttiva delle Annotazioni (protegge i PIN solo locali)
  const localAnnDir = path.join(antigravityDir, 'annotations');
  fs.mkdirSync(localAnnDir, { recursive: true });
  let annCopied = 0;
  if (fs.existsSync(incomingAnnDir)) {
    for (const af of fs.readdirSync(incomingAnnDir)) {
      if (!af.endsWith('.pbtxt')) continue;
      const srcAnn = path.join(incomingAnnDir, af);
      const dstAnn = path.join(localAnnDir, af);
      if (!fs.existsSync(dstAnn)) {
        fs.copyFileSync(srcAnn, dstAnn);
        annCopied++;
        continue;
      }
      const incContent = fs.readFileSync(srcAnn, 'utf8');
      const locContent = fs.readFileSync(dstAnn, 'utf8');
      const incPinned = /pinned\s*:\s*true/i.test(incContent);
      const locPinned = /pinned\s*:\s*true/i.test(locContent);

      if (locPinned && !incPinned) {
        continue;
      }
      if (incPinned && !locPinned) {
        fs.copyFileSync(srcAnn, dstAnn);
        annCopied++;
        continue;
      }
      if (incPinned && locPinned) {
        if (parseViewSeconds(incContent) >= parseViewSeconds(locContent)) {
          fs.copyFileSync(srcAnn, dstAnn);
          annCopied++;
        }
      }
    }
  }
  console.log(`  ✅ Annotazioni unite non distruttivamente: ${annCopied} applicate.`);

  // H. Fusione Relazionale Atomica + Normalizzazione URI & project_id su conversation_summaries.db
  let localProjectId = '';
  if (fs.existsSync(incomingDb)) {
    const existedLocally = fs.existsSync(localDb);
    if (!existedLocally) {
      fs.copyFileSync(incomingDb, localDb);
      console.log('  ✅ Database indice creato da pacchetto cloud.');
    }

    for (let attempt = 1; attempt <= 5; attempt++) {
      let db = null;
      try {
        db = new DatabaseSync(localDb);

        if (existedLocally) {
          const normalizedIncomingDb = incomingDb.replace(/\\/g, '/').replace(/'/g, "''");
          db.exec(`ATTACH DATABASE '${normalizedIncomingDb}' AS incoming`);

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
              title = CASE
                WHEN excluded.title != '' AND (excluded.last_modified_time >= conversation_summaries.last_modified_time OR excluded.step_count > conversation_summaries.step_count OR conversation_summaries.title = '')
                THEN excluded.title
                ELSE conversation_summaries.title
              END,
              preview = CASE
                WHEN excluded.last_modified_time > conversation_summaries.last_modified_time OR excluded.step_count > conversation_summaries.step_count
                THEN excluded.preview
                ELSE conversation_summaries.preview
              END,
              raw_summary = CASE
                WHEN excluded.last_modified_time > conversation_summaries.last_modified_time OR excluded.step_count > conversation_summaries.step_count OR conversation_summaries.raw_summary IS NULL
                THEN excluded.raw_summary
                ELSE conversation_summaries.raw_summary
              END,
              status = CASE
                WHEN excluded.last_modified_time > conversation_summaries.last_modified_time OR excluded.step_count > conversation_summaries.step_count
                THEN excluded.status
                ELSE conversation_summaries.status
              END,
              step_count = MAX(conversation_summaries.step_count, excluded.step_count),
              last_modified_time = MAX(conversation_summaries.last_modified_time, excluded.last_modified_time),
              last_user_input_time = MAX(conversation_summaries.last_user_input_time, excluded.last_user_input_time),
              last_user_input_step_index = MAX(conversation_summaries.last_user_input_step_index, excluded.last_user_input_step_index),
              group_id = CASE WHEN excluded.group_id != '' THEN excluded.group_id ELSE conversation_summaries.group_id END
          `);
          try { db.exec('DETACH DATABASE incoming'); } catch (_) {}
        }

        // Backfill titoli vuoti dai file annotations/*.pbtxt o manifest
        const fillTitleStmt = db.prepare("UPDATE conversation_summaries SET title = ? WHERE conversation_id = ? AND (title IS NULL OR TRIM(title) = '')");
        for (const id of importedPinnedIds) {
          const fallbackTitle = incomingAnnTitles.get(id) || manifestTitles.get(id) || '';
          if (fallbackTitle) {
            fillTitleStmt.run(fallbackTitle, id);
          }
        }

        // Normalizzazione workspace_uris (con %20 e worktree locali) e riallineamento project_id locale
        const currentWsUri = toAntigravityFileUri(projectCwd);
        localProjectId = detectLocalProjectId(userHome, projectCwd, db);

        let rowsToNormalize = [];
        if (importedPinnedIds.length > 0) {
          const placeholders = importedPinnedIds.map(() => '?').join(',');
          rowsToNormalize = db.prepare(`
            SELECT conversation_id, workspace_uris, project_id
            FROM conversation_summaries
            WHERE LOWER(workspace_uris) LIKE '%flowerpowervillage%'
               OR conversation_id IN (${placeholders})
          `).all(...importedPinnedIds);
        } else {
          rowsToNormalize = db.prepare(`
            SELECT conversation_id, workspace_uris, project_id
            FROM conversation_summaries
            WHERE LOWER(workspace_uris) LIKE '%flowerpowervillage%'
          `).all();
        }

        const updateWsStmt = db.prepare(
          "UPDATE conversation_summaries SET workspace_uris = ?, project_id = COALESCE(NULLIF(?, ''), project_id) WHERE conversation_id = ?"
        );

        for (const row of rowsToNormalize) {
          let uris = [];
          try {
            const parsed = JSON.parse(row.workspace_uris || '[]');
            uris = Array.isArray(parsed) ? parsed : (parsed ? [String(parsed)] : []);
          } catch (_) {
            uris = row.workspace_uris ? [String(row.workspace_uris)] : [];
          }

          const wtUriRaw = uris.find(u => String(u).toLowerCase().includes('worktrees'));
          let normalizedUrisJson;

          if (wtUriRaw) {
            const wtName = extractWorktreeBasename(wtUriRaw);
            const wtDPath = path.resolve(projectCwd, '../WorkTrees', wtName);
            const wtAgyPath = path.join(userHome, '.gemini/antigravity/worktrees/flowerpowervillage', wtName);
            if (wtName && fs.existsSync(wtDPath)) {
              normalizedUrisJson = JSON.stringify([toAntigravityFileUri(wtDPath)]);
            } else if (wtName && fs.existsSync(wtAgyPath)) {
              normalizedUrisJson = JSON.stringify([toAntigravityFileUri(wtAgyPath)]);
            } else {
              normalizedUrisJson = JSON.stringify([currentWsUri]);
            }
          } else {
            normalizedUrisJson = JSON.stringify([currentWsUri]);
          }

          updateWsStmt.run(normalizedUrisJson, localProjectId, row.conversation_id);
        }

        try {
          db.exec("INSERT INTO conversations_fts(conversations_fts) VALUES('rebuild')");
        } catch (_) {}

        console.log(`  ✅ Database indice SQLite fuso e riallineato (${rowsToNormalize.length} chat normalizzate, project_id=${localProjectId || 'invariato'})!`);
        break;
      } catch (mergeErr) {
        if (mergeErr.message.includes('locked') && attempt < 5) {
          console.log(`  ⏳ Database bloccato da Antigravity, ritento tra 1s (${attempt}/5)...`);
          execSync('powershell -NoProfile -Command "Start-Sleep -Milliseconds 1000"');
        } else {
          console.warn('⚠️ Avviso durante fusione SQLite conversation_summaries:', mergeErr.message);
          break;
        }
      } finally {
        if (db) {
          try { db.close(); } catch (_) {}
        }
      }
    }
  }

  // I. Sincronizzazione intelligente agyhub_summaries_proto.pb (verifica dinamica su tutte le chat pinnate)
  const incomingProto = path.join(incomingStagingDir, 'agyhub_summaries_proto.pb');
  const localProto = path.join(antigravityDir, 'agyhub_summaries_proto.pb');
  if (fs.existsSync(incomingProto)) {
    try {
      if (!fs.existsSync(localProto)) {
        fs.copyFileSync(incomingProto, localProto);
        console.log('  ✅ File agyhub_summaries_proto.pb copiato da pacchetto cloud.');
      } else if (importedPinnedIds.length > 0) {
        const localLat = fs.readFileSync(localProto).toString('latin1');
        const incLat = fs.readFileSync(incomingProto).toString('latin1');
        const missingButInIncoming = importedPinnedIds.some(id => !localLat.includes(id) && incLat.includes(id));
        if (missingButInIncoming) {
          fs.copyFileSync(incomingProto, localProto);
          console.log('  ✅ File agyhub_summaries_proto.pb aggiornato con i nuovi indici pinnati!');
        }
      }
    } catch (protoErr) {
      console.warn('⚠️ Avviso allineamento agyhub proto:', protoErr.message);
    }
  }

  // J. Ripristino e Fusione Stato UI Antigravity IDE (Pinned Order senza fantasmi & Layouts)
  const ideStateIncoming = path.join(incomingStagingDir, 'antigravity_ide_state.json');
  let mergedPinned = [];
  if (fs.existsSync(ideStateIncoming)) {
    try {
      console.log('\n📌 Passo 4b: Fusione Ordine PIN e Layouts Antigravity IDE...');
      const incomingState = JSON.parse(fs.readFileSync(ideStateIncoming, 'utf8'));

      if (ideStateVscdb && fs.existsSync(ideStateVscdb)) {
        for (let attempt = 1; attempt <= 5; attempt++) {
          let ideDb = null;
          try {
            ideDb = new DatabaseSync(ideStateVscdb);
            const agRow = ideDb.prepare("SELECT value FROM ItemTable WHERE key = 'google.google-antigravity'").get();
            if (agRow && agRow.value) {
              const parsed = JSON.parse(agRow.value);
              const st = parsed['antigravity-storage'] || {};

              let currentPinned = [];
              try {
                const rawCur = st.pinned_conversations_order || '[]';
                currentPinned = typeof rawCur === 'string' ? JSON.parse(rawCur) : rawCur;
              } catch (_) {}
              let incomingPinned = [];
              try {
                const rawInc = incomingState.pinned_conversations_order || '[]';
                incomingPinned = typeof rawInc === 'string' ? JSON.parse(rawInc) : rawInc;
              } catch (_) {}

              const combinedPinned = Array.from(new Set([
                ...(Array.isArray(incomingPinned) ? incomingPinned : []),
                ...(Array.isArray(currentPinned) ? currentPinned : [])
              ]));

              // Filtra eventuali ID fantasma che non esistono su disco
              mergedPinned = combinedPinned.filter(id => {
                if (!id) return false;
                const hasDb = fs.existsSync(path.join(localConvDir, `${id}.db`));
                const hasPb = fs.existsSync(path.join(localConvDir, `${id}.pb`));
                const annPath = path.join(localAnnDir, `${id}.pbtxt`);
                let hasPinnedAnn = false;
                if (fs.existsSync(annPath)) {
                  try { hasPinnedAnn = /pinned\s*:\s*true/i.test(fs.readFileSync(annPath, 'utf8')); } catch (_) {}
                }
                return hasDb || hasPb || hasPinnedAnn;
              });

              st.pinned_conversations_order = JSON.stringify(mergedPinned);

              if (incomingState.layouts) {
                for (const [lk, lv] of Object.entries(incomingState.layouts)) {
                  st[lk] = lv;
                }
              }

              parsed['antigravity-storage'] = st;
              ideDb.prepare("UPDATE ItemTable SET value = ? WHERE key = 'google.google-antigravity'").run(JSON.stringify(parsed));
              console.log(`  ✅ Ordine PIN ripristinato: ${mergedPinned.length} chat pinnate valide registrate nella UI!`);
            }
            break;
          } catch (ideErr) {
            if (ideErr.message.includes('locked') && attempt < 5) {
              console.log(`  ⏳ state.vscdb bloccato, ritento tra 1s (${attempt}/5)...`);
              execSync('powershell -NoProfile -Command "Start-Sleep -Milliseconds 1000"');
            } else {
              console.warn('⚠️ Avviso durante aggiornamento state.vscdb:', ideErr.message);
              break;
            }
          } finally {
            if (ideDb) {
              try { ideDb.close(); } catch (_) {}
            }
          }
        }
      }
    } catch (stErr) {
      console.warn('⚠️ Avviso ripristino stato UI IDE:', stErr.message);
    }
  }

  return {
    newConvs,
    updatedConvs,
    newBrains,
    updatedBrains,
    syncedChapters,
    annCopied,
    localProjectId,
    mergedPinned
  };
}

async function main() {
  console.log('===========================================================');
  console.log('📥 AVVIO RIPRISTINO POSTAZIONE DA GOOGLE DRIVE 5TB');
  console.log('===========================================================');

  try {
    // 0. Guard Antigravity IDE aperto (evita sovrascrittura di state.vscdb alla chiusura)
    const forceMode = process.argv.includes('--force');
    if (!forceMode && isAntigravityIdeRunning()) {
      console.error('\n===========================================================');
      console.error('⚠️  ANTIGRAVITY IDE È ATTUALMENTE APERTO!');
      console.error('===========================================================');
      console.error('Chiudi completamente Antigravity IDE prima di lanciare il ripristino:');
      console.error('altrimenti alla chiusura l\'IDE sovrascriverà state.vscdb cancellando i PIN!');
      console.error('===========================================================\n');
      process.exit(2);
    }

    // 1. Lettura configurazione Supabase da .env o fallback progetto corrente
    let supabaseUrl = 'https://gjqevgkbjkharczhikcl.supabase.co';
    let supabaseKey = '';

    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf8');
      supabaseUrl = envContent.match(/SUPABASE_URL=([^\s\r\n]+)/)?.[1] || supabaseUrl;
      supabaseKey = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=([^\s\r\n]+)/)?.[1] ||
                    envContent.match(/VITE_SUPABASE_ANON_KEY=([^\s\r\n]+)/)?.[1] || '';
    }

    if (!supabaseKey) {
      const altPaths = [
        '../.env',
        '../../.env',
        'D:/01 ANTIGRAVITY/flower-power-village-com/flowerpowervillage/.env',
        'D:/WEB SITE Antigravity/flowerpowervillage/.env'
      ];
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
      try { fs.rmSync(tempDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 }); } catch (_) {}
    }
    fs.mkdirSync(tempDir, { recursive: true });

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
      'gdrive-handoff.mjs': 'scripts/gdrive-handoff.mjs',
      'vault-sync.mjs': 'scratch/vault-sync.mjs',
      'package.json': 'package.json',
      'api_credentials_report.md.enc': '.secret_docs/api_credentials_report.md.enc',
      'RIPRISTINA_TUTTO.bat': 'RIPRISTINA_TUTTO.bat',
      'gdrive-handoff-pull.mjs': 'scripts/gdrive-handoff-pull.mjs',
      'worktrees_info.json': 'scratch/worktrees_info.json'
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

    // 6b. Ripristino e allineamento automatico dei Worktrees (sempre eseguito, indipendente dallo ZIP chat)
    const wtMetaPath = fs.existsSync(path.join(tempDir, 'worktrees_info.json'))
      ? path.join(tempDir, 'worktrees_info.json')
      : path.resolve(process.cwd(), 'scratch/worktrees_info.json');

    if (fs.existsSync(wtMetaPath)) {
      try {
        console.log('\n🌿 Passo 3b: Ripristino e Sincronizzazione Worktrees...');
        const wtList = JSON.parse(fs.readFileSync(wtMetaPath, 'utf8'));
        const parentDir = path.dirname(process.cwd());
        const dWorktreesDir = path.join(parentDir, 'WorkTrees');
        if (!fs.existsSync(dWorktreesDir)) {
          fs.mkdirSync(dWorktreesDir, { recursive: true });
        }
        const userHome = process.env.USERPROFILE || 'C:/Users/Red';
        const agyWorktreesDir = path.join(userHome, '.gemini/antigravity/worktrees/flowerpowervillage');
        if (!fs.existsSync(agyWorktreesDir)) {
          fs.mkdirSync(agyWorktreesDir, { recursive: true });
        }

        for (const wt of wtList) {
          const targetWtPath = wt.isAntigravityInternal
            ? path.join(agyWorktreesDir, wt.name)
            : path.join(dWorktreesDir, wt.name);
          console.log(`  👉 Controllo Worktree [${wt.name}] sul branch [${wt.branch}]...`);

          try {
            execSync(`git fetch origin ${wt.branch}`, { stdio: 'inherit', cwd: process.cwd() });
          } catch (_) {}

          if (!fs.existsSync(targetWtPath)) {
            console.log(`  ✨ Creazione automatica Worktree in [${targetWtPath}]...`);
            try {
              let hasLocalBranch = false;
              try {
                execSync(`git show-ref --verify --quiet "refs/heads/${wt.branch}"`, { cwd: process.cwd() });
                hasLocalBranch = true;
              } catch (_) {}

              if (hasLocalBranch) {
                execSync(`git worktree add "${targetWtPath}" "${wt.branch}"`, { stdio: 'inherit', cwd: process.cwd() });
              } else {
                execSync(`git worktree add -b "${wt.branch}" "${targetWtPath}" "origin/${wt.branch}"`, { stdio: 'inherit', cwd: process.cwd() });
              }
              console.log(`  ✅ Worktree [${wt.name}] creato con successo!`);
            } catch (addErr) {
              console.warn('  ⚠️ Avviso creazione worktree:', addErr.message);
            }
          } else {
            console.log(`  🔄 Worktree già presente. Aggiornamento codice da GitHub...`);
            try {
              execSync(`git -C "${targetWtPath}" pull origin ${wt.branch}`, { stdio: 'inherit' });
              console.log(`  ✅ Worktree [${wt.name}] allineato con successo!`);
            } catch (pullErr) {
              console.warn('  ⚠️ Avviso pull worktree:', pullErr.message);
            }
          }

          if (fs.existsSync('.env') && fs.existsSync(targetWtPath)) {
            try {
              fs.copyFileSync('.env', path.join(targetWtPath, '.env'));
              console.log('  🔑 File .env sincronizzato nel Worktree.');
            } catch (_) {}
          }
        }
      } catch (wtErr) {
        console.warn('⚠️ Avviso durante ripristino worktrees:', wtErr.message);
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
        const incomingStagingDir = path.join(tempDir, 'incoming_antigravity');
        if (fs.existsSync(incomingStagingDir)) {
          try {
            fs.rmSync(incomingStagingDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 500 });
          } catch (_) {}
        }
        fs.mkdirSync(incomingStagingDir, { recursive: true });
        console.log('📂 Estrazione pacchetto cloud in area temporanea...');
        const psZip = escapePsSingleQuoted(localZipPath);
        const psStage = escapePsSingleQuoted(incomingStagingDir);
        execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${psZip}' -DestinationPath '${psStage}' -Force"`);

        importPinnedAntigravityPackage({
          incomingStagingDir,
          antigravityDir,
          appDataDir: process.env.APPDATA,
          userHome,
          projectCwd: process.cwd()
        });

        try {
          fs.rmSync(incomingStagingDir, { recursive: true, force: true });
        } catch (_) {}
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
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (_) {}

    console.log('\n===========================================================');
    console.log('🎉 POSTAZIONE RIPRISTINATA E ALLINEATA CON SUCCESSO!');
    console.log('===========================================================');
    console.log(`- Pacchetto Cloud:   [${targetFolder.name}]`);
    console.log(`- Codice Progetto:   Aggiornato al 100%`);
    console.log(`- Password & Vault:  Decifrati e attivi (.env pronto)`);
    console.log(`- Antigravity IDE:   Cronologia Chat e PIN ripristinati!`);
    console.log('-----------------------------------------------------------');
    console.log('🚀 ORA PUOI APRIRE TRANQUILLAMENTE ANTIGRAVITY IDE E LAVORARE.');
    console.log('===========================================================\n');
  } catch (err) {
    console.error('\n❌ ERRORE DURANTE IL RIPRISTINO DELLA POSTAZIONE:', err.message);
    process.exit(1);
  }
}

const isMain = process.argv[1] &&
  path.resolve(process.argv[1]).toLowerCase() === path.resolve(fileURLToPath(import.meta.url)).toLowerCase();
if (isMain) {
  main();
}
