import { execSync } from 'child_process';

function run(command, options = {}) {
  console.log(`\n⚙️  Esecuzione: ${command}`);
  return execSync(command, { stdio: 'inherit', cwd: process.cwd(), ...options });
}

function getOutput(command) {
  return execSync(command, { encoding: 'utf8', cwd: process.cwd() }).trim();
}

console.log('===========================================================');
console.log('🔀 AVVIO FUSIONE FEATURE BRANCH IN STAGING: MERGE-BRANCH');
console.log('===========================================================');

try {
  // 1. Rileva il branch di partenza
  let featureBranch = process.argv[2] || getOutput('git rev-parse --abbrev-ref HEAD');
  console.log(`📌 Branch da fondere rilevato: [${featureBranch}]`);

  if (featureBranch === 'staging' || featureBranch === 'main') {
    console.error(`\n⚠️ ERRORE: Ti trovi già sul branch [${featureBranch}].`);
    console.error('MERGE-BRANCH serve a unire un feature branch (es. feat/...) dentro staging.');
    console.error('Uso: posizionati sul feature branch da unire oppure scrivi:');
    console.error('node scripts/branch-merge.mjs <nome-feature-branch>');
    process.exit(1);
  }

  // 2. Se ci sono modifiche pendenti sul feature branch, committale prima del checkout
  const currentBranch = getOutput('git rev-parse --abbrev-ref HEAD');
  if (currentBranch === featureBranch) {
    const status = getOutput('git status --porcelain');
    if (status) {
      console.log(`\n📦 Passo 1: Salvataggio modifiche pendenti su [${featureBranch}]...`);
      run('git add .');
      run(`git commit -m "feat(${featureBranch}): final commit before merge to staging"`);
    }

    // Push dell'ultimo stato su GitHub
    console.log(`\n☁️ Passo 2: Sincronizzazione finale di [${featureBranch}] su GitHub...`);
    run(`git push -u origin ${featureBranch}`);
  }

  // 3. Spostati su staging
  console.log('\n🌿 Passo 3: Passaggio al branch [staging]...');
  run('git checkout staging');

  // Assicura che staging locale sia allineato con origin/staging
  try {
    run('git pull origin staging --ff-only');
  } catch {
    console.log('ℹ️ Pull ff-only saltato o non necessario.');
  }

  // 4. Merge del feature branch in staging
  console.log(`\n🔀 Passo 4: Fusione di [${featureBranch}] dentro [staging]...`);
  run(`git merge ${featureBranch} --no-edit`);

  console.log('\n===========================================================');
  console.log(`🎉 FUSIONE COMPLETATA CON SUCCESSO DENTRO [staging]!`);
  console.log('===========================================================');
  console.log(`- Feature Branch: [${featureBranch}] fuso al 100%`);
  console.log(`- Branch Attivo:  [staging] (ora ti trovi su staging)`);
  console.log(`- Produzione:     INTOCCATA (main non è stato modificato)`);
  console.log('-----------------------------------------------------------');
  console.log(`🚀 PROSSIMO PASSO:`);
  console.log(`Lancia MARKDOWN-STAGING per caricare le modifiche su Vercel Staging`);
  console.log(`(staging.flowerpowerpizza.com) e collaudarle da tablet/smartphone.`);
  console.log('===========================================================\n');
} catch (err) {
  console.error('\n❌ ERRORE DURANTE LA FUSIONE DEL BRANCH:', err.message);
  process.exit(1);
}

