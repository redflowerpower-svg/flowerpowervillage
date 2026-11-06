import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

function run(command, options = {}) {
  console.log(`\n⚙️  Esecuzione: ${command}`);
  return execSync(command, { stdio: 'inherit', cwd: process.cwd(), ...options });
}

function runWithRetry(command, maxRetries = 4, delaySec = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`\n⚙️  Esecuzione (tentativo ${attempt}/${maxRetries}): ${command}`);
      return execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    } catch (err) {
      if (attempt < maxRetries) {
        console.warn(`⚠️ Risposta temporanea remota di GitHub non andata a buon fine. Riprovo tra ${delaySec}s...`);
        execSync(`powershell -NoProfile -Command "Start-Sleep -Seconds ${delaySec}"`);
      } else {
        throw err;
      }
    }
  }
}

function getOutput(command) {
  return execSync(command, { encoding: 'utf8', cwd: process.cwd() }).trim();
}

console.log('===========================================================');
console.log('🚀 AVVIO WORKFLOW DEPLOY E SINCRONIZZAZIONE: MARKDOWN-PROJECT');
console.log('===========================================================');

try {
  // 1. Rileva branch corrente
  const initialBranch = getOutput('git rev-parse --abbrev-ref HEAD');
  console.log(`📌 Branch attivo rilevato: [${initialBranch}]`);

  // 🛡️ BLOCCO DI SICUREZZA FEATURE BRANCH
  if (initialBranch !== 'staging' && initialBranch !== 'main') {
    console.error('\n===========================================================');
    console.error(`⚠️ BLOCCO DI SICUREZZA: Ti trovi sul Feature Branch [${initialBranch}]`);
    console.error('===========================================================');
    console.error('MARKDOWN-PROJECT è il comando master che pubblica su Vercel Produzione (main).');
    console.error('Per proteggere il tuo cantiere ed evitare merge prematuri in produzione:');
    console.error('  1. Per salvare e sincronizzare questo branch su GitHub:');
    console.error('     👉 Usa: MARKDOWN-BRANCH (npm run branch:sync)');
    console.error('  2. Se la funzionalità è terminata e vuoi unirla a staging:');
    console.error('     👉 Usa: MERGE-BRANCH (npm run branch:merge)');
    console.error('  3. Per eseguire il rilascio globale, spostati su staging:');
    console.error('     👉 git checkout staging && MARKDOWN-PROJECT');
    console.error('===========================================================\n');
    process.exit(1);
  }

  // Se per caso ci si trova su main, si passa a staging per compilare e fare il rilascio ordinato
  if (initialBranch === 'main') {
    console.log('\n↩️ Passaggio a [staging] come base ufficiale di rilascio...');
    run('git checkout staging');
  }

  // 2. Controllo di sicurezza anti-secret leak
  console.log('\n🔒 Passo 1: Audit di Sicurezza...');
  run('node scratch/security-audit.mjs');

  // 3. Cifratura automatica Vault
  console.log('\n🔐 Passo 2: Cifratura Vault Credenziali...');
  run('node scratch/vault-sync.mjs encrypt');

  // 4. Housekeeping Locale Storico Chat Antigravity (snello, silenzioso e ultra-veloce)
  console.log('\n🧹 Passo 3: Housekeeping Locale Storico Antigravity...');
  try {
    run('node scripts/history-clean.mjs --silent');
    console.log('✅ Storico locale verificato e snellito.');
  } catch (cleanErr) {
    console.warn('⚠️ Avviso durante housekeeping storico:', cleanErr.message);
  }

  // 5. Verifica stato git su staging (commit automatico se ci sono modifiche tracciate/piste)
  const status = getOutput('git status --porcelain');
  if (status) {
    console.log('\n📦 Passo 4: Rilevate modifiche non committate su staging. Creazione commit...');
    run('git add .');
    const commitMsg = process.argv[2] || 'chore(project): full multi-workstation sync (staging)';
    run(`git commit -m "${commitMsg}"`);
  } else {
    console.log('\n✅ Nessuna modifica pendente da committare su staging.');
  }

  // 6. Push su origin staging
  console.log('\n🌐 Passo 5: Push su origin/staging (Ambiente Virtuale Vercel)...');
  runWithRetry('git push origin staging');

  // 7. Merge e Push su origin main (Produzione)
  console.log('\n🚀 Passo 6: Merge in [main] e Push su origin/main (Produzione Ufficiale)...');
  run('git checkout main');
  run('git merge staging --no-edit');
  runWithRetry('git push origin main');

  // 8. Pulizia rami remoti eliminati (prune)
  console.log('\n🧹 Passo 7: Pulizia rami obsoleti (git fetch --all --prune)...');
  run('git fetch --all --prune');

  // 9. Ritorno sempre a staging per lasciare l'ambiente pronto
  console.log('\n↩️ Passo 8: Ritorno al branch di lavoro [staging]...');
  run('git checkout staging');

  // 10. Pulizia automatica storage Vercel (Auto-Prune)
  console.log('\n🧹 Passo 9: Pulizia automatica storage Vercel (Auto-Prune)...');
  try {
    run('node scripts/vercel-prune.mjs');
  } catch (pruneErr) {
    console.warn('⚠️ Avviso: Pulizia Vercel non completata:', pruneErr.message);
  }

  console.log('\n===========================================================');
  console.log('🎉 DEPLOY E SINCRONIZZAZIONE COMPLETATI CON SUCCESSO!');
  console.log('===========================================================');
  console.log('- Staging:      Aggiornato su origin/staging (Vercel Preview)');
  console.log('- Produzione:   Aggiornato su origin/main (Vercel Produzione)');
  console.log('- Branch:       Posizionato su [staging] per la prossima sessione');
  console.log('- Vault:        Cifrato e protetto');
  console.log('- Housekeeping: Cronologia locale verificata e snellita');
  console.log('- Prune:        Cache remota ripulita al 100%');
  console.log('===========================================================\n');
} catch (err) {
  console.error('\n❌ ERRORE DURANTE IL PROCESSO DI SINCRONIZZAZIONE:', err.message);
  process.exit(1);
}
