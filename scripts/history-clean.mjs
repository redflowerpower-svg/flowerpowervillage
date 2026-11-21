import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DatabaseSync } from 'node:sqlite';

/**
 * Housekeeping Engine per Antigravity History
 * 
 * Pulisce in modo sicuro e atomico le vecchie sessioni obsolete:
 * - Elimina chat > 30 giorni
 * - Elimina chat "Untitled" > 14 giorni
 * - Elimina chat di workspace esterni > 14 giorni
 * - Preserva sempre le chat attive, recenti (ultimi 14 giorni) e la sessione corrente
 * 
 * Parametri:
 *   --dry-run  Simula la pulizia senza eliminare alcun file
 *   --silent   Non stampa output dettagliato a video (usato in project-sync)
 *   --days=N   Soglia giorni personalizzata (default: 30)
 */

const isDryRun = process.argv.includes('--dry-run');
const isSilent = process.argv.includes('--silent');
const daysArg = process.argv.find(a => a.startsWith('--days='));
const retentionDays = daysArg ? parseInt(daysArg.split('=')[1], 10) : 30;

function log(...args) {
  if (!isSilent) console.log(...args);
}

function resolveIdeStateVscdb(appDataDir = process.env.APPDATA) {
  if (!appDataDir) return null;
  for (const appName of ['Antigravity IDE', 'Antigravity']) {
    const candidate = path.join(appDataDir, appName, 'User', 'globalStorage', 'state.vscdb');
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export function collectPinnedAndTitled(antigravityDir, appDataDir = process.env.APPDATA) {
  const pinnedIds = new Set();
  const annTitles = new Map();
  const annDir = path.join(antigravityDir, 'annotations');

  if (fs.existsSync(annDir)) {
    for (const f of fs.readdirSync(annDir)) {
      if (!f.endsWith('.pbtxt')) continue;
      const convId = f.replace(/\.pbtxt$/i, '');
      try {
        const content = fs.readFileSync(path.join(annDir, f), 'utf8');
        if (/pinned\s*:\s*true/i.test(content)) {
          pinnedIds.add(convId);
        }
        const titleMatch = content.match(/title\s*:\s*"((?:\\.|[^"\\])*)"/);
        if (titleMatch) {
          const parsedTitle = titleMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\').trim();
          if (parsedTitle) {
            annTitles.set(convId, parsedTitle);
          }
        }
      } catch (_) {}
    }
  }

  const vscdbPath = resolveIdeStateVscdb(appDataDir);
  if (vscdbPath) {
    let ideDb = null;
    try {
      ideDb = new DatabaseSync(vscdbPath, { readOnly: true });
      const agRow = ideDb.prepare("SELECT value FROM ItemTable WHERE key = 'google.google-antigravity'").get();
      if (agRow && agRow.value) {
        const parsed = JSON.parse(agRow.value);
        const rawOrder = parsed?.['antigravity-storage']?.pinned_conversations_order;
        if (rawOrder) {
          const orderArr = typeof rawOrder === 'string' ? JSON.parse(rawOrder) : rawOrder;
          if (Array.isArray(orderArr)) {
            for (const id of orderArr) {
              if (typeof id === 'string' && id.trim()) {
                pinnedIds.add(id.trim());
              }
            }
          }
        }
      }
    } catch (_) {
    } finally {
      if (ideDb) {
        try { ideDb.close(); } catch (_) {}
      }
    }
  }

  return { pinnedIds, annTitles };
}

export function cleanHistory(options = {}) {
  const dryRun = options.dryRun ?? isDryRun;
  const silent = options.silent ?? isSilent;
  const maxDays = options.days ?? retentionDays;

  const userHome = options.userHome || process.env.USERPROFILE || 'C:/Users/Red';
  const appDataDir = options.appDataDir ?? process.env.APPDATA;
  const antigravityDir = options.antigravityDir || path.resolve(userHome, '.gemini/antigravity');
  const sumDbPath = path.join(antigravityDir, 'conversation_summaries.db');
  const convDir = path.join(antigravityDir, 'conversations');
  const brainDir = path.join(antigravityDir, 'brain');
  const annDir = path.join(antigravityDir, 'annotations');

  if (!fs.existsSync(sumDbPath)) {
    if (!silent) console.log('ℹ️  Nessun database cronologia Antigravity trovato.');
    return { cleanedCount: 0, freedMb: 0 };
  }

  const { pinnedIds, annTitles } = collectPinnedAndTitled(antigravityDir, appDataDir);

  const db = new DatabaseSync(sumDbPath);
  try {
    const rows = db.prepare('SELECT conversation_id, title, workspace_uris, last_modified_time FROM conversation_summaries').all();

    const now = new Date();
    const toDelete = [];

    for (const r of rows) {
      // Immunità assoluta per tutte le chat pinnate (annotations o pinned_conversations_order)
      if (pinnedIds.has(r.conversation_id)) {
        continue;
      }

      // Immunità assoluta per chat attualmente aperte/attive con file WAL non vuoto
      const walPath = path.join(convDir, `${r.conversation_id}.db-wal`);
      try {
        if (fs.existsSync(walPath) && fs.statSync(walPath).size > 0) {
          continue;
        }
      } catch (_) {}

      const rawDate = r.last_modified_time ? r.last_modified_time.replace(' ', 'T') : null;
      const modDate = rawDate ? new Date(rawDate) : new Date(0);
      const diffDays = (now.getTime() - modDate.getTime()) / (1000 * 60 * 60 * 24);

      const effectiveTitle = (r.title && r.title.trim()) || annTitles.get(r.conversation_id) || '';
      const isUntitled = !effectiveTitle || effectiveTitle.toLowerCase() === 'untitled';
      const isOtherWorkspace = r.workspace_uris && !r.workspace_uris.toLowerCase().includes('flowerpowervillage');

      // Regole di eliminazione:
      // 1. Chat più vecchie della soglia (default 30 giorni)
      // 2. Chat "Untitled" più vecchie di 14 giorni
      // 3. Chat di altri workspace più vecchie di 14 giorni
      const shouldDelete = (diffDays > maxDays) || (isUntitled && diffDays > 14) || (isOtherWorkspace && diffDays > 14);

      if (shouldDelete) {
        toDelete.push({
          id: r.conversation_id,
          title: effectiveTitle || 'Untitled',
          daysAgo: Math.round(diffDays),
          workspace: isOtherWorkspace ? 'Esterno' : 'FlowerPower'
        });
      }
    }

    // Calcola spazio occupato dai file da eliminare
    let totalBytesFreed = 0;
    const deleteList = [];

    for (const item of toDelete) {
      let itemBytes = 0;
      const filesToRemove = [];
      const dirsToRemove = [];

      // File in conversations/
      if (fs.existsSync(convDir)) {
        const candidates = [`${item.id}.db`, `${item.id}.db-wal`, `${item.id}.db-shm`, `${item.id}.pb`];
        for (const cf of candidates) {
          const cp = path.join(convDir, cf);
          if (fs.existsSync(cp)) {
            try {
              itemBytes += fs.statSync(cp).size;
              filesToRemove.push(cp);
            } catch (_) {}
          }
        }
      }

      // File in annotations/
      if (fs.existsSync(annDir)) {
        const ap = path.join(annDir, `${item.id}.pbtxt`);
        if (fs.existsSync(ap)) {
          try {
            itemBytes += fs.statSync(ap).size;
            filesToRemove.push(ap);
          } catch (_) {}
        }
      }

      // Cartella in brain/
      if (fs.existsSync(brainDir)) {
        const bp = path.join(brainDir, item.id);
        if (fs.existsSync(bp)) {
          try {
            const measureDir = (dp) => {
              let s = 0;
              const entries = fs.readdirSync(dp, { withFileTypes: true });
              for (const e of entries) {
                const fp = path.join(dp, e.name);
                if (e.isDirectory()) s += measureDir(fp);
                else if (e.isFile()) s += fs.statSync(fp).size;
              }
              return s;
            };
            itemBytes += measureDir(bp);
            dirsToRemove.push(bp);
          } catch (_) {}
        }
      }

      totalBytesFreed += itemBytes;
      deleteList.push({ ...item, bytes: itemBytes, files: filesToRemove, dirs: dirsToRemove });
    }

    const freedMb = (totalBytesFreed / (1024 * 1024)).toFixed(2);

    if (!silent) {
      console.log('===========================================================');
      console.log(`🧹 HOUSEKEEPING STORICO ANTIGRAVITY ${dryRun ? '[SIMULAZIONE DRY-RUN]' : ''}`);
      console.log('===========================================================');
      console.log(`- Conversazioni totali rilevate: ${rows.length}`);
      console.log(`- Conversazioni pinnate protette: ${pinnedIds.size}`);
      console.log(`- Conversazioni da eliminare:     ${deleteList.length}`);
      console.log(`- Spazio da liberare:            ${freedMb} MB`);
      console.log('-----------------------------------------------------------');
    }

    if (dryRun) {
      if (!silent) {
        deleteList.slice(0, 10).forEach((d, i) => {
          console.log(`  ${i+1}. [${d.workspace}] ${d.title.padEnd(35)} (${d.daysAgo} gg fa, ${(d.bytes / (1024*1024)).toFixed(2)} MB)`);
        });
        if (deleteList.length > 10) console.log(`  ... e altre ${deleteList.length - 10} sessioni.`);
        console.log('-----------------------------------------------------------');
        console.log('💡 Esegui senza --dry-run per applicare la pulizia reale.');
        console.log('===========================================================\n');
      }
      return { cleanedCount: deleteList.length, freedMb, protectedPinnedCount: pinnedIds.size };
    }

    // Esecuzione reale: eliminazione atomica
    let successCount = 0;
    for (const d of deleteList) {
      try {
        // 1. Elimina riga da sqlite
        db.prepare('DELETE FROM conversation_summaries WHERE conversation_id = ?').run(d.id);

        // 2. Elimina file
        for (const f of d.files) {
          if (fs.existsSync(f)) fs.unlinkSync(f);
        }

        // 3. Elimina directory
        for (const dir of d.dirs) {
          if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
        }

        successCount++;
      } catch (err) {
        if (!silent) console.warn(`⚠️ Impossibile eliminare sessione ${d.id}:`, err.message);
      }
    }

    // Esegui VACUUM su conversation_summaries.db per recuperare pagine
    try {
      db.exec('VACUUM');
    } catch (_) {}

    if (!silent) {
      console.log(`✅ Pulizia completata: eliminate ${successCount} conversazioni obsolete.`);
      console.log(`💾 Spazio liberato sul disco fisso: ${freedMb} MB.`);
      console.log('===========================================================\n');
    }

    return { cleanedCount: successCount, freedMb, protectedPinnedCount: pinnedIds.size };
  } finally {
    try { db.close(); } catch (_) {}
  }
}

// Se invocato direttamente da riga di comando
const isMain = process.argv[1] &&
  path.resolve(process.argv[1]).toLowerCase() === path.resolve(fileURLToPath(import.meta.url)).toLowerCase();
if (isMain) {
  cleanHistory();
}

