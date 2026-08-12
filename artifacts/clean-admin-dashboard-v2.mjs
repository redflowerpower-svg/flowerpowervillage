import fs from 'fs';
import path from 'path';

// Trova il file ResortDashboard.tsx nel progetto
function findFile(dir, fileName) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'dist' || file === 'scratch') continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const found = findFile(fullPath, fileName);
      if (found) return found;
    } else if (file === fileName) {
      return fullPath;
    }
  }
  return null;
}

async function main() {
  console.log('🧹 AVVIO PULIZIA PLANCIA AMMINISTRATIVA (V2 - SAFE)...');
  const targetPath = findFile(process.cwd(), 'ResortDashboard.tsx');
  
  if (!targetPath) {
    console.error("❌ Errore: Non ho trovato il file ResortDashboard.tsx nel tuo progetto.");
    process.exit(1);
  }

  console.log(`🔍 Trovato file: ${targetPath}`);
  
  const backupPath = `${targetPath}.bak`;
  if (fs.existsSync(backupPath)) {
    console.log(`🔄 Ripristino il file originale pulito dal backup: ${backupPath}`);
    const originalCode = fs.readFileSync(backupPath, 'utf-8');
    fs.writeFileSync(targetPath, originalCode, 'utf-8');
  } else {
    console.warn(`⚠️ Attenzione: Non ho trovato il file di backup ${backupPath}. Procedo con il file corrente.`);
  }

  // Rileggiamo il file pulito appena ripristinato
  let code = fs.readFileSync(targetPath, 'utf-8');
  let modified = false;

  // 1. Rimuove il tab nel menu delle linguette (Sostituzione con stringa vuota per evitare bug JSX)
  const buttonRegex = /(<button[^>]*>[\s\S]*?(?:IMPORTA SPECIFICHE|📡 IMPORTA SPECIFICHE)[\s\S]*?<\/button>)/gi;
  if (buttonRegex.test(code)) {
    code = code.replace(buttonRegex, (match) => {
      console.log(`✨ Rimuovo completamente il pulsante del Tab nel menu...`);
      return '';
    });
    modified = true;
  }

  const arrayItemRegex = /(\{[\s\S]*?id:\s*['"](?:import|importa|import-specs)['"]\s*,\s*label:\s*['"](?:📡\s*)?IMPORTA SPECIFICHE['"][\s\S]*?\})/gi;
  if (arrayItemRegex.test(code)) {
    code = code.replace(arrayItemRegex, (match) => {
      console.log(`✨ Rimuovo la voce dall'array dei Tab...`);
      return `/* ${match} */`;
    });
    modified = true;
  }

  // 2. Rimuove il pannello di visualizzazione corrispondente (Sostituzione con stringa vuota per evitare bug JSX)
  const panelRegex = /(\{\s*activeTab\s*===\s*['"](?:import|importa|import-specs)['"]\s*&&\s*[\s\S]*?\})/gi;
  if (panelRegex.test(code)) {
    code = code.replace(panelRegex, (match) => {
      console.log(`✨ Rimuovo completamente il pannello di visualizzazione "Importa Specifiche"...`);
      return '';
    });
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(targetPath, code, 'utf-8');
    console.log(`\n🎉 OPERAZIONE COMPLETATA CON SUCCESSO!`);
    console.log(`✅ Il file ResortDashboard.tsx è stato ripulito in modo sicuro.`);
    console.log(`👉 Il tab "IMPORTA SPECIFICHE" e la relativa sezione sono stati completamente rimossi.`);
  } else {
    console.log(`\n⚠️ Nessuna modifica necessaria o pattern non riconosciuto.`);
  }
}

main().catch(err => {
  console.error('❌ Errore imprevisto:', err);
  process.exit(1);
});
