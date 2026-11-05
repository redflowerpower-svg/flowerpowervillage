import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function run(cmd, silent = false) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: silent ? 'pipe' : 'pipe' }).trim();
  } catch (err) {
    if (!silent) {
      console.error(`⚠️ Errore esecuzione comando: ${cmd}\n`, err.message);
    }
    return null;
  }
}

function parseWorktrees() {
  const raw = run('git worktree list --porcelain', true);
  if (!raw) return [];

  const worktrees = [];
  const entries = raw.split('\n\n').filter(Boolean);

  for (const entry of entries) {
    const lines = entry.split('\n');
    let wtPath = '';
    let branch = '';
    let head = '';

    for (const line of lines) {
      if (line.startsWith('worktree ')) {
        wtPath = line.replace('worktree ', '').trim();
      } else if (line.startsWith('branch ')) {
        branch = line.replace('branch refs/heads/', '').trim();
      } else if (line.startsWith('HEAD ')) {
        head = line.replace('HEAD ', '').trim();
      } else if (line === 'detached') {
        branch = '(detached HEAD)';
      }
    }

    if (wtPath) {
      const isRoot = path.resolve(wtPath).toLowerCase() === path.resolve(process.cwd()).toLowerCase();
      let isMerged = false;
      if (branch && branch !== '(detached HEAD)') {
        try {
          execSync(`git merge-base --is-ancestor "${branch}" staging`, { stdio: 'ignore' });
          isMerged = true;
        } catch (_) {
          isMerged = false;
        }
      }

      worktrees.push({
        path: wtPath,
        name: path.basename(wtPath),
        branch: branch || '(nessun branch)',
        head: head.slice(0, 7),
        isRoot,
        isMerged
      });
    }
  }

  return worktrees;
}

const command = process.argv[2] || 'list';
const targetArg = process.argv[3];

if (command === 'list') {
  console.log('\n======================================================');
  console.log('🌿 GOVERNANCE WORKTREE: Monitor Cantieri Attivi');
  console.log('======================================================\n');

  const wts = parseWorktrees();
  if (wts.length === 0) {
    console.log('Nessun worktree rilevato.');
  } else {
    wts.forEach((wt, idx) => {
      const statusIcon = wt.isRoot ? '🏠 [ROOT/PRINCIPALE]' : '📁 [WORKTREE ISOLATO]';
      const mergeIcon = wt.isRoot ? '' : (wt.isMerged ? ' ✅ (Fuso in staging)' : ' ⚠️ (NON fuso in staging)');
      console.log(`${idx + 1}. ${statusIcon} ${wt.name}`);
      console.log(`   Percorso: ${wt.path}`);
      console.log(`   Branch  : ${wt.branch} [${wt.head}]${mergeIcon}`);
      console.log('------------------------------------------------------');
    });
  }
  console.log('\n💡 Comandi rapidi:');
  console.log('   npm run worktree:clean <nome_o_indice> : Rimuove un worktree completato');
  console.log('   npm run worktree:prune                : Pulisce riferimenti orfani\n');

} else if (command === 'clean') {
  if (!targetArg) {
    console.error('❌ Specificare il nome o l\'indice del worktree da rimuovere.');
    console.error('Esempio: npm run worktree:clean "flower_power_down"');
    process.exit(1);
  }

  const wts = parseWorktrees();
  let target = null;

  const num = parseInt(targetArg, 10);
  if (!isNaN(num) && num >= 1 && num <= wts.length) {
    target = wts[num - 1];
  } else {
    target = wts.find(w => w.name.toLowerCase() === targetArg.toLowerCase() || w.path.toLowerCase() === targetArg.toLowerCase());
  }

  if (!target) {
    console.error(`❌ Worktree "${targetArg}" non trovato. Esegui "npm run worktree:list" per vedere i nomi.`);
    process.exit(1);
  }

  if (target.isRoot) {
    console.error('⛔ Impossibile rimuovere il workspace principale di Flower Power Village!');
    process.exit(1);
  }

  console.log(`\n🗑️ Rimozione Worktree: ${target.name} (${target.path})...`);
  try {
    execSync(`git worktree remove "${target.path}" --force`, { stdio: 'inherit' });
    console.log(`✅ Worktree ${target.name} rimosso da disco.`);

    if (target.branch && target.branch !== '(nessun branch)' && target.branch !== '(detached HEAD)') {
      if (target.isMerged) {
        execSync(`git branch -d "${target.branch}"`, { stdio: 'inherit' });
        console.log(`✅ Branch ${target.branch} eliminato perché già fuso in staging.`);
      } else {
        console.log(`ℹ️ Il branch ${target.branch} NON è stato eliminato perché ha commit non fusi in staging.`);
        console.log(`   Se desideri forzarne l'eliminazione: git branch -D "${target.branch}"`);
      }
    }

    execSync('git worktree prune', { stdio: 'inherit' });
    console.log('✨ Pulizia completata con successo!\n');
  } catch (err) {
    console.error('❌ Errore durante la rimozione:', err.message);
  }

} else if (command === 'prune') {
  console.log('\n🧹 Pulizia riferimenti worktree orfani...');
  try {
    execSync('git worktree prune', { stdio: 'inherit' });
    console.log('✅ Git worktree prune eseguito con successo!\n');
  } catch (err) {
    console.error('❌ Errore durante git worktree prune:', err.message);
  }
} else {
  console.log(`Comando non riconosciuto: ${command}. Usa: list, clean, prune.`);
}
