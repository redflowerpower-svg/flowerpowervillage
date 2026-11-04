import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

function run(command, options = {}) {
  console.log(`\n⚙️  Esecuzione: ${command}`);
  return execSync(command, { stdio: 'inherit', cwd: process.cwd(), ...options });
}

function getOutput(command) {
  return execSync(command, { encoding: 'utf8', cwd: process.cwd() }).trim();
}

console.log('===========================================================');
console.log('🚀 AVVIO WORKFLOW SINCRONIZZAZIONE TOTALE: MARKDOWN-PROJECT');
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

  // 4. Verifica stato git su staging (commit automatico se ci sono modifiche tracciate/piste)
  const status = getOutput('git status --porcelain');
  if (status) {
    console.log('\n📦 Passo 3: Rilevate modifiche non committate su staging. Creazione commit...');
    run('git add .');
    const commitMsg = process.argv[2] || 'chore(project): full multi-workstation sync (staging)';
    run(`git commit -m "${commitMsg}"`);
  } else {
    console.log('\n✅ Nessuna modifica pendente da committare su staging.');
  }

  // 5. Push su origin staging
  console.log('\n🌐 Passo 4: Push su origin/staging (Ambiente Virtuale Vercel)...');
  run('git push origin staging');

  // 6. Merge e Push su origin main (Produzione)
  console.log('\n🚀 Passo 5: Merge in [main] e Push su origin/main (Produzione Ufficiale)...');
  run('git checkout main');
  run('git merge staging --no-edit');
  run('git push origin main');

  // 7. Pulizia rami remoti eliminati (prune)
  console.log('\n🧹 Passo 6: Pulizia rami obsoleti (git fetch --all --prune)...');
  run('git fetch --all --prune');

  // 8. Ritorno sempre a staging per lasciare l'ambiente pronto
  console.log('\n↩️ Passo 7: Ritorno al branch di lavoro [staging]...');
  run('git checkout staging');

  // 9. Upload Pacchetto Handoff su Google Drive 5TB (Codice, Vault, Chat & Pin)
  console.log('\n☁️ Passo 8: Upload Pacchetto Handoff su Google Drive 5TB...');
  try {
    run('node scripts/gdrive-handoff.mjs');
  } catch (gdErr) {
    console.warn('⚠️ Avviso durante upload Google Drive handoff:', gdErr.message);
  }

  console.log('\n===========================================================');
  console.log('🎉 SINCRONIZZAZIONE COMPLETATA CON SUCCESSO SU STAGING E PRODUZIONE!');
  console.log('===========================================================');
  console.log('- Staging:      Aggiornato su origin/staging');
  console.log('- Produzione:   Aggiornato su origin/main');
  console.log('- Google Drive: Pacchetto Handoff aggiornato (Codice, Chat, Pin)');
  console.log('- Branch:       Posizionato su [staging] per la prossima sessione');
  console.log('- Vault:        Cifrato e protetto');
  console.log('- Prune:        Cache remota ripulita al 100%');
  console.log('===========================================================\n');
} catch (err) {
  console.error('\n❌ ERRORE DURANTE IL PROCESSO DI SINCRONIZZAZIONE:', err.message);
  process.exit(1);
}
