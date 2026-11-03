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

  // 2. Controllo di sicurezza anti-secret leak
  console.log('\n🔒 Passo 1: Audit di Sicurezza...');
  run('node scratch/security-audit.mjs');

  // 3. Cifratura automatica Vault
  console.log('\n🔐 Passo 2: Cifratura Vault Credenziali...');
  run('node scratch/vault-sync.mjs encrypt');

  // 4. Verifica stato git (commit automatico se ci sono modifiche tracciate/piste)
  const status = getOutput('git status --porcelain');
  if (status) {
    console.log('\n📦 Passo 3: Rilevate modifiche non committate. Creazione commit...');
    run('git add .');
    const commitMsg = process.argv[2] || `chore(project): full multi-workstation sync (${initialBranch})`;
    run(`git commit -m "${commitMsg}"`);
  } else {
    console.log('\n✅ Nessuna modifica pendente da committare.');
  }

  // 5. Se siamo su un feature branch, pushalo su origin
  if (initialBranch !== 'staging' && initialBranch !== 'main') {
    console.log(`\n🌿 Passo 4: Sincronizzazione Feature Branch [${initialBranch}] su origin...`);
    run(`git push -u origin ${initialBranch}`);

    // Merge nel branch staging
    console.log('\n🔀 Passo 5: Merge del Feature Branch in [staging]...');
    run('git checkout staging');
    run(`git merge ${initialBranch} --no-edit`);
  } else if (initialBranch === 'main') {
    run('git checkout staging');
  }

  // 6. Push su origin staging
  console.log('\n🌐 Passo 6: Push su origin/staging (Ambiente Virtuale Vercel)...');
  run('git push origin staging');

  // 7. Merge e Push su origin main
  console.log('\n🚀 Passo 7: Merge in [main] e Push su origin/main (Produzione Ufficiale)...');
  run('git checkout main');
  run('git merge staging --no-edit');
  run('git push origin main');

  // 8. Pulizia rami remoti eliminati (prune)
  console.log('\n🧹 Passo 8: Pulizia rami obsoleti (git fetch --all --prune)...');
  run('git fetch --all --prune');

  // 9. Ritorno al branch iniziale
  console.log(`\n↩️ Passo 9: Ritorno al branch originale [${initialBranch}]...`);
  run(`git checkout ${initialBranch}`);

  console.log('\n===========================================================');
  console.log('🎉 SINCRONIZZAZIONE COMPLETATA CON SUCCESSO SU TUTTI I RAMI!');
  console.log('===========================================================');
  console.log(`- Staging:    Aggiornato su origin/staging`);
  console.log(`- Produzione: Aggiornato su origin/main`);
  if (initialBranch !== 'staging' && initialBranch !== 'main') {
    console.log(`- Feature:    Aggiornato su origin/${initialBranch}`);
  }
  console.log(`- Vault:      Cifrato e protetto`);
  console.log(`- Prune:      Cache remota ripulita al 100%`);
  console.log('===========================================================\n');
} catch (err) {
  console.error('\n❌ ERRORE DURANTE IL PROCESSO DI SINCRONIZZAZIONE:', err.message);
  process.exit(1);
}
