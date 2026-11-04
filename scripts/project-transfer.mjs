import { execSync } from 'child_process';
import path from 'path';

function run(command) {
  console.log(`\n⚙️  Esecuzione: ${command}`);
  return execSync(command, { stdio: 'inherit', cwd: process.cwd() });
}

console.log('===========================================================');
console.log('📦 AVVIO PREPARAZIONE CAMBIO POSTAZIONE: MARKDOWN-TRANSFER');
console.log('   (Ranong <---> Koh Phayam via Google Drive 5TB)');
console.log('===========================================================');

try {
  // 1. Esegui il deploy e la sincronizzazione del codice su staging e main
  console.log('\n🚀 Passo 1: Deploy e Sincronizzazione Master (Git, Vault & Vercel)...');
  run('node scripts/project-sync.mjs "chore(transfer): pre-handoff multi-workstation sync"');

  // 2. Creazione e Caricamento Pacchetto Handoff Ottimizzato su Google Drive 5TB
  console.log('\n☁️ Passo 2: Creazione Pacchetto Leggero & Upload Google Drive 5TB...');
  run('node scripts/gdrive-handoff.mjs');

  console.log('\n===========================================================');
  console.log('🎉 TRASFERIMENTO POSTAZIONE PRONTO AL 100%!');
  console.log('===========================================================');
  console.log('1. Codice e Vercel: Staging e Main aggiornati su GitHub');
  console.log('2. Google Drive:    Pacchetto Handoff leggero caricato in Cloud');
  console.log('3. All\'arrivo:     Doppio click su "RIPRISTINA_TUTTO.bat"');
  console.log('===========================================================\n');
} catch (err) {
  console.error('\n❌ ERRORE DURANTE IL TRASFERIMENTO POSTAZIONE:', err.message);
  process.exit(1);
}

