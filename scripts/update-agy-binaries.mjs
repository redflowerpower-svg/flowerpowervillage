import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

/**
 * Aggiorna in modo sicuro e non-bloccante entrambi i binari di Antigravity (CLI + motore interno IDE).
 * Utilizza esclusivamente percorsi dinamici per funzionare su qualsiasi postazione (Ranong <-> Koh Phayam).
 * @returns {Array<{label: string, bin: string, before: string|null, after: string|null, status: string, error?: string}>}
 */
export function updateAllAgyBinaries() {
  const userHome = process.env.USERPROFILE || os.homedir();
  const localAppData = process.env.LOCALAPPDATA || path.join(userHome, 'AppData', 'Local');

  const candidates = [];
  const cliLocalPath = path.join(localAppData, 'agy', 'bin', 'agy.exe');
  if (fs.existsSync(cliLocalPath)) {
    candidates.push({
      label: 'CLI Terminale (AppData\\Local\\agy\\bin)',
      bin: cliLocalPath,
      isPathFallback: false
    });
  } else {
    candidates.push({
      label: 'CLI Terminale (PATH)',
      bin: 'agy',
      isPathFallback: true
    });
  }

  const ideEnginePath = path.join(userHome, '.gemini', 'bin', 'agy.exe');
  if (fs.existsSync(ideEnginePath)) {
    candidates.push({
      label: 'Motore Interno IDE (.gemini\\bin)',
      bin: ideEnginePath,
      isPathFallback: false
    });
  } else {
    console.log(`  ℹ️ ${ideEnginePath} non presente su questa postazione (saltato).`);
  }

  // Deduplica per percorso risolto in lowercase
  const targets = [];
  const seen = new Set();
  for (const c of candidates) {
    const key = c.isPathFallback ? 'path:agy' : path.resolve(c.bin).toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      targets.push(c);
    }
  }

  const results = [];

  for (const target of targets) {
    let before = null;
    try {
      before = execFileSync(target.bin, ['--version'], {
        encoding: 'utf8',
        timeout: 15000,
        windowsHide: true
      }).trim();
    } catch (verErr) {
      if (target.isPathFallback && verErr.code === 'ENOENT') {
        console.log(`  ℹ️ ${target.label} non trovato nel PATH (saltato).`);
        results.push({ label: target.label, bin: target.bin, before: null, after: null, status: 'skipped' });
        continue;
      }
    }

    console.log(`  🔍 Controllo aggiornamenti: ${target.label}${before ? ` (attuale: v${before})` : ''}...`);
    try {
      execFileSync(target.bin, ['update'], {
        stdio: 'inherit',
        timeout: 120000,
        windowsHide: true
      });

      let after = before;
      try {
        after = execFileSync(target.bin, ['--version'], {
          encoding: 'utf8',
          timeout: 15000,
          windowsHide: true
        }).trim();
      } catch (_) {}

      if (before && after && before !== after) {
        console.log(`  🎉 ${target.label} aggiornato: v${before} -> v${after}`);
        results.push({ label: target.label, bin: target.bin, before, after, status: 'updated' });
      } else {
        console.log(`  ✅ ${target.label} già aggiornato${after ? ` (v${after})` : ''}.`);
        results.push({ label: target.label, bin: target.bin, before, after, status: 'up-to-date' });
      }
    } catch (updErr) {
      console.warn(`  ⚠️ Avviso aggiornamento ${target.label} (non bloccante): ${updErr.message}`);
      results.push({
        label: target.label,
        bin: target.bin,
        before,
        after: before,
        status: 'warning',
        error: updErr.message
      });
    }
  }

  return results;
}

const isMain = process.argv[1] &&
  path.resolve(process.argv[1]).toLowerCase() === path.resolve(fileURLToPath(import.meta.url)).toLowerCase();
if (isMain) {
  console.log('===========================================================');
  console.log('🔄 AGGIORNAMENTO BINARI ANTIGRAVITY (CLI + IDE INTERNO)');
  console.log('===========================================================');
  updateAllAgyBinaries();
  console.log('===========================================================\n');
}
