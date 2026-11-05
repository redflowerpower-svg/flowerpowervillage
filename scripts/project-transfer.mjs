import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

function run(command) {
  console.log(`\n⚙️  Esecuzione: ${command}`);
  return execSync(command, { stdio: 'inherit', cwd: process.cwd() });
}

console.log('===========================================================');
console.log('📦 AVVIO PREPARAZIONE CAMBIO POSTAZIONE: MARKDOWN-TRANSFER');
console.log('   (Ranong <---> Koh Phayam via Google Drive 5TB)');
console.log('===========================================================');

try {
  // 1. Controllo e sincronizzazione automatica dei Worktree attivi
  console.log('\n🌿 Passo 1: Controllo e Sincronizzazione Worktree Paralleli...');
  const activeWorktrees = [];
  try {
    const wtRaw = execSync('git worktree list --porcelain', { encoding: 'utf8', cwd: process.cwd() });
    const blocks = wtRaw.trim().split('\n\n');
    const mainDir = process.cwd().replace(/\\/g, '/').toLowerCase();

    for (const block of blocks) {
      const lines = block.split('\n');
      const wtLine = lines.find(l => l.startsWith('worktree '));
      const branchLine = lines.find(l => l.startsWith('branch '));

      if (wtLine && branchLine) {
        const wtPath = wtLine.replace('worktree ', '').trim();
        const branchRef = branchLine.replace('branch ', '').trim();
        const branchName = branchRef.replace('refs/heads/', '');
        const normPath = wtPath.replace(/\\/g, '/');

        // Ignora il workspace principale
        if (normPath.toLowerCase() !== mainDir && !normPath.includes('new_worktree_explanation')) {
          const folderName = path.basename(wtPath);
          console.log(`  👉 Trovato Worktree attivo: [${folderName}] sul branch [${branchName}]`);

          // Verifica se ci sono modifiche non committate nel worktree
          try {
            const wtStatus = execSync(`git -C "${wtPath}" status --porcelain`, { encoding: 'utf8' }).trim();
            if (wtStatus) {
              console.log(`  📦 Salvataggio modifiche non committate in [${folderName}]...`);
              execSync(`git -C "${wtPath}" add .`, { stdio: 'inherit' });
              execSync(`git -C "${wtPath}" commit -m "chore(worktree): auto-save before workstation transfer"`, { stdio: 'inherit' });
            }
          } catch (e) {
            console.warn(`  ⚠️ Avviso commit worktree ${folderName}:`, e.message);
          }

          // Push del branch del worktree su GitHub
          try {
            console.log(`  ☁️ Push su GitHub del branch [${branchName}] per il Worktree...`);
            execSync(`git push -u origin "${branchName}"`, { stdio: 'inherit' });
            console.log(`  ✅ Branch [${branchName}] sincronizzato con successo su GitHub.`);
          } catch (pushErr) {
            console.warn(`  ⚠️ Avviso push branch ${branchName}:`, pushErr.message);
          }

          const isAntigravityInternal = normPath.toLowerCase().includes('.gemini/antigravity/worktrees');
          activeWorktrees.push({
            name: folderName,
            branch: branchName,
            isAntigravityInternal,
            originalPath: wtPath
          });
        }
      }
    }

    // Salva metadati worktree per Google Drive Handoff
    const scratchDir = path.resolve(process.cwd(), 'scratch');
    if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
    fs.writeFileSync(
      path.join(scratchDir, 'worktrees_info.json'),
      JSON.stringify(activeWorktrees, null, 2),
      'utf8'
    );
    console.log(`  ✅ Registrati ${activeWorktrees.length} Worktree per il pacchetto Cloud.`);
  } catch (wtErr) {
    console.warn('⚠️ Avviso scansione worktrees:', wtErr.message);
  }

  // 2. Esegui il deploy e la sincronizzazione del codice su staging e main
  console.log('\n🚀 Passo 2: Deploy e Sincronizzazione Master (Git, Vault & Vercel)...');
  run('node scripts/project-sync.mjs "chore(transfer): pre-handoff multi-workstation sync"');

  // 3. Creazione e Caricamento Pacchetto Handoff Ottimizzato su Google Drive 5TB
  console.log('\n☁️ Passo 3: Creazione Pacchetto Leggero & Upload Google Drive 5TB...');
  run('node scripts/gdrive-handoff.mjs');

  console.log('\n===========================================================');
  console.log('🎉 TRASFERIMENTO POSTAZIONE PRONTO AL 100%!');
  console.log('===========================================================');
  console.log('1. Codice e Vercel: Staging e Main aggiornati su GitHub');
  console.log(`2. Worktree:        ${activeWorktrees.length} salvati e sincronizzati`);
  console.log('3. Google Drive:    Pacchetto Handoff leggero caricato in Cloud');
  console.log('4. All\'arrivo:     Doppio click su "RIPRISTINA_TUTTO.bat"');
  console.log('===========================================================\n');
} catch (err) {
  console.error('\n❌ ERRORE DURANTE IL TRASFERIMENTO POSTAZIONE:', err.message);
  process.exit(1);
}
