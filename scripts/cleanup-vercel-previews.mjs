import { execSync } from 'child_process';

async function main() {
  console.log('🔍 [Vercel Cleaner] Recupero lista completa di tutti i deployments (preview + production)...');
  const jsonStr = execSync('npx vercel list --limit 100 --format json', { encoding: 'utf8' });
  const data = JSON.parse(jsonStr);
  const deployments = data.deployments || [];

  console.log(`📊 Trovati ${deployments.length} deployments totali.`);
  if (deployments.length <= 2) {
    console.log('✅ Nessun vecchio deployment da pulire.');
    return;
  }

  // Conserviamo solo i 2 deployment più recenti (la produzione corrente e l'ultima anteprima)
  const toDelete = deployments.slice(2);
  console.log(`🧹 Avvio rimozione di ${toDelete.length} vecchi deployments (produzione passata e preview) con flag --safe...`);

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

  console.log(`\n🎉 [Vercel Cleaner] Completato! Rimosse ${removedCount} deployments storiche.`);
}

main().catch(err => {
  console.error('❌ Errore:', err);
  process.exit(1);
});
