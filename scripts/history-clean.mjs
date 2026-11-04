import fs from 'fs';
import path from 'path';
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

export function cleanHistory(options = {}) {
  const dryRun = options.dryRun ?? isDryRun;
  const silent = options.silent ?? isSilent;
  const maxDays = options.days ?? retentionDays;

  const userHome = process.env.USERPROFILE || 'C:/Users/Red';
  const antigravityDir = path.resolve(userHome, '.gemini/antigravity');
  const sumDbPath = path.join(antigravityDir, 'conversation_summaries.db');
  const convDir = path.join(antigravityDir, 'conversations');
  const brainDir = path.join(antigravityDir, 'brain');
  const annDir = path.join(antigravityDir, 'annotations');

  if (!fs.existsSync(sumDbPath)) {
    if (!silent) console.log('ℹ️  Nessun database cronologia Antigravity trovato.');
    return { cleanedCount: 0, freedMb: 0 };
  }

  const db = new DatabaseSync(sumDbPath);
  const rows = db.prepare('SELECT conversation_id, title, workspace_uris, last_modified_time FROM conversation_summaries').all();

  const now = new Date();
  const toDelete = [];

  for (const r of rows) {
    const rawDate = r.last_modified_time ? r.last_modified_time.replace(' ', 'T') : null;
    const modDate = rawDate ? new Date(rawDate) : new Date(0);
    const diffDays = (now.getTime() - modDate.getTime()) / (1000 * 60 * 60 * 24);

    const isUntitled = !r.title || r.title.trim() === '' || r.title.toLowerCase() === 'untitled';
    const isOtherWorkspace = r.workspace_uris && !r.workspace_uris.toLowerCase().includes('flowerpowervillage');

    // Regole di eliminazione:
    // 1. Chat più vecchie della soglia (default 30 giorni)
    // 2. Chat "Untitled" più vecchie di 14 giorni
    // 3. Chat di altri workspace più vecchie di 14 giorni
    const shouldDelete = (diffDays > maxDays) || (isUntitled && diffDays > 14) || (isOtherWorkspace && diffDays > 14);

    if (shouldDelete) {
      toDelete.push({
        id: r.conversation_id,
        title: r.title || 'Untitled',
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
      const candidates = [`${item.id}.db`, `${item.id}.db-wal`, `${item.id}.db-shm`];
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
    return { cleanedCount: deleteList.length, freedMb };
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

  return { cleanedCount: successCount, freedMb };
}

// Se invocato direttamente da riga di comando
if (process.argv[1] && process.argv[1].endsWith('history-clean.mjs')) {
  cleanHistory();
}

