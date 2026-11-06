import { execSync } from 'child_process';

const DRY_RUN = process.argv.includes('--dry-run');
const KEEP_PROD = 2;
const KEEP_PREVIEW = 2;

console.log('===========================================================');
console.log('🧹 ROUTINE DI PULIZIA AUTOMATICA DEPLOYMENTS VERCEL');
console.log(`Modalità: ${DRY_RUN ? '🔍 DRY-RUN (Solo simulazione)' : '⚡ ESECUZIONE REALE'}`);
console.log(`Regola: mantieni ${KEEP_PROD} produzioni recenti e ${KEEP_PREVIEW} preview recenti`);
console.log('===========================================================');

function runJson(cmd) {
  try {
    const raw = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const jsonStart = raw.indexOf('{');
    if (jsonStart === -1) return null;
    return JSON.parse(raw.slice(jsonStart));
  } catch (err) {
    console.error(`Errore esecuzione comando: ${cmd}`, err.message);
    return null;
  }
}

async function main() {
  let allDeployments = [];
  let next = null;

  console.log('📡 Recupero lista di tutti i deployments da Vercel...');
  for (let page = 1; page <= 10; page++) {
    const cmd = next
      ? `vercel ls --format json --limit 100 --next ${next}`
      : `vercel ls --format json --limit 100`;
    const data = runJson(cmd);
    if (!data || !data.deployments || data.deployments.length === 0) break;
    allDeployments.push(...data.deployments);
    if (!data.pagination || !data.pagination.next) break;
    next = data.pagination.next;
  }

  console.log(`📦 Totale deployments censiti su Vercel: ${allDeployments.length}`);

  const prodDeployments = allDeployments.filter(d => d.target === 'production');
  const previewDeployments = allDeployments.filter(d => d.target !== 'production');

  const keepProd = prodDeployments.slice(0, KEEP_PROD);
  const deleteProd = prodDeployments.slice(KEEP_PROD);

  const keepPreview = previewDeployments.slice(0, KEEP_PREVIEW);
  const deletePreview = previewDeployments.slice(KEEP_PREVIEW);

  const toDelete = [...deleteProd, ...deletePreview];

  console.log(`\n🛡️  Deployments da CONSERVARE:`);
  console.log(`   - Produzione (${keepProd.length}):`);
  keepProd.forEach(d => console.log(`     ✓ [PROD] ${d.url} (${new Date(d.createdAt).toLocaleString()})`));
  console.log(`   - Preview (${keepPreview.length}):`);
  keepPreview.forEach(d => console.log(`     ✓ [PREV] ${d.url} (${new Date(d.createdAt).toLocaleString()})`));

  console.log(`\n🗑️  Deployments OBSOLETI da eliminare: ${toDelete.length}`);
  console.log(`   - Produzioni vecchie: ${deleteProd.length}`);
  console.log(`   - Preview vecchie: ${deletePreview.length}`);

  if (toDelete.length === 0) {
    console.log('\n✨ Nessun deployment obsoleto trovato. Lo storage Vercel è già ottimizzato!');
    return;
  }

  if (DRY_RUN) {
    console.log(`\n[DRY-RUN] Operazione terminata. Nessun file cancellato.`);
    console.log(`Stima spazio che verrebbe liberato: ~${(toDelete.length * 0.05).toFixed(1)} - ${(toDelete.length * 0.08).toFixed(1)} GB`);
    return;
  }

  console.log(`\n🚀 Avvio eliminazione sicura di ${toDelete.length} deployments a blocchi di 10...`);
  let successCount = 0;
  let failCount = 0;
  const BATCH_SIZE = 10;

  for (let i = 0; i < toDelete.length; i += BATCH_SIZE) {
    const chunk = toDelete.slice(i, i + BATCH_SIZE);
    const urls = chunk.map(d => d.url).join(' ');
    const progress = `[${Math.min(i + BATCH_SIZE, toDelete.length)}/${toDelete.length}]`;
    try {
      execSync(`vercel rm ${urls} --yes --safe`, { stdio: 'ignore' });
      successCount += chunk.length;
      console.log(`   ${progress} Rimossi ${successCount} deployments...`);
    } catch (err) {
      // If batch fails, try one by one in that chunk
      for (const item of chunk) {
        try {
          execSync(`vercel rm ${item.url} --yes --safe`, { stdio: 'ignore' });
          successCount++;
        } catch {
          failCount++;
        }
      }
    }
  }

  console.log('\n===========================================================');
  console.log(`✅ PULIZIA COMPLETATA!`);
  console.log(`   - Eliminati con successo: ${successCount}`);
  if (failCount > 0) console.log(`   - Saltati / Protetti: ${failCount}`);
  console.log(`   - Spazio stimato liberato: ~${(successCount * 0.06).toFixed(1)} GB`);
  console.log('===========================================================');
}

main().catch(err => {
  console.error('Errore durante la pulizia dei deployment:', err);
  process.exit(1);
});
