import { execSync } from 'child_process';

async function main() {
  console.log('🔍 [Vercel Cleaner] Recupero lista preview deployments...');
  const jsonStr = execSync('npx vercel list --environment preview --limit 100 --format json', { encoding: 'utf8' });
  const data = JSON.parse(jsonStr);
  const deployments = data.deployments || [];

  console.log(`📊 Trovate ${deployments.length} preview deployments.`);
  if (deployments.length <= 2) {
    console.log('✅ Nessuna vecchia preview da pulire.');
    return;
  }

  // Conserviamo solo le 2 preview più recenti, eliminiamo tutte le altre (più vecchie)
  const toDelete = deployments.slice(2);
  console.log(`🧹 Avvio rimozione di ${toDelete.length} vecchie preview deployments con flag --safe...`);

  // Eseguiamo a blocchi di 5 per velocità ed efficienza
  const chunkSize = 5;
  let removedCount = 0;

  for (let i = 0; i < toDelete.length; i += chunkSize) {
    const chunk = toDelete.slice(i, i + chunkSize);
    const urls = chunk.map(d => d.url).join(' ');
    console.log(`[${i + 1}/${toDelete.length}] Rimozione ${chunk.length} deployments...`);
    try {
      execSync(`npx vercel rm ${urls} -y --safe`, { stdio: 'inherit' });
      removedCount += chunk.length;
    } catch (err) {
      console.warn(`⚠️ Avviso durante rimozione blocco: ${err.message}`);
    }
  }

  console.log(`\n🎉 [Vercel Cleaner] Completato! Rimosse ${removedCount} preview deployments.`);
}

main().catch(err => {
  console.error('❌ Errore:', err);
  process.exit(1);
});
