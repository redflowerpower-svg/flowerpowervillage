import { execSync } from 'child_process';

function run(command, options = {}) {
  console.log(`\n⚙️  Esecuzione: ${command}`);
  return execSync(command, { stdio: 'inherit', cwd: process.cwd(), ...options });
}

function getOutput(command) {
  return execSync(command, { encoding: 'utf8', cwd: process.cwd() }).trim();
}

console.log('===========================================================');
console.log('🌿 AVVIO SINCRONIZZAZIONE FEATURE BRANCH: MARKDOWN-BRANCH');
console.log('===========================================================');

try {
  // 1. Rileva il branch attivo corrente
  const currentBranch = getOutput('git rev-parse --abbrev-ref HEAD');
  console.log(`📌 Branch attivo rilevato: [${currentBranch}]`);

  if (currentBranch === 'main') {
    console.error('\n⚠️ ATTENZIONE: Ti trovi sul branch di produzione [main].');
    console.error('MARKDOWN-BRANCH serve a salvare i branch sperimentali/feature branch.');
    console.error('Se vuoi pubblicare sul sito ufficiale, usa MARKDOWN-WEBSITE.');
    process.exit(1);
  }

  // 2. Audit di sicurezza anti-secret leak
  console.log('\n🔒 Passo 1: Audit di Sicurezza...');
  run('node scratch/security-audit.mjs');

  // 3. Cifratura vault credenziali
  console.log('\n🔐 Passo 2: Cifratura Vault Credenziali...');
  run('node scratch/vault-sync.mjs encrypt');

  // 4. Verifica e commit delle modifiche locali del feature branch
  const status = getOutput('git status --porcelain');
  if (status) {
    console.log(`\n📦 Passo 3: Rilevate modifiche non committate su [${currentBranch}]. Creazione commit...`);
    run('git add .');
    const commitMsg = process.argv[2] || `feat(${currentBranch}): work in progress sync`;
    run(`git commit -m "${commitMsg}"`);
  } else {
    console.log('\n✅ Nessuna modifica pendente da committare.');
  }

  // 5. Push SOLO sul branch corrente su GitHub
  console.log(`\n☁️ Passo 4: Push su origin/${currentBranch} (Solo questo branch su GitHub)...`);
  run(`git push -u origin ${currentBranch}`);

  console.log('\n===========================================================');
  console.log(`🎉 BRANCH [${currentBranch}] SALVATO E SINCRONIZZATO SU GITHUB!`);
  console.log('===========================================================');
  console.log(`- Branch Remoto: origin/${currentBranch}`);
  console.log(`- Staging:       INTOCCATO (zero modifiche, zero merge)`);
  console.log(`- Main:          INTOCCATO (produzione intatta al 100%)`);
  console.log(`- Vault:         Cifrato e protetto`);
  console.log('-----------------------------------------------------------');
  console.log(`💡 Puoi spegnere il PC o cambiare postazione (Ranong ↔ Koh Phayam).`);
  console.log(`💡 Quando avrai FINITO il lavoro, usa: MERGE-BRANCH per unire a staging.`);
  console.log('===========================================================\n');
} catch (err) {
  console.error('\n❌ ERRORE DURANTE IL SALVATAGGIO DEL BRANCH:', err.message);
  process.exit(1);
}

