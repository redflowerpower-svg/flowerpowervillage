async function checkHttpGrid() {
  const res = await fetch('http://localhost:3000/api/resort/octorate-restrictions-grid?testOnly=true');
  console.log('HTTP Status:', res.status);
  const data = await res.json();

  console.log('\n================================================================');
  console.log('  📊 DATI GRID RESTRIZIONI RITORNATI DAL BACKEND (TEST MODE)');
  console.log('================================================================\n');

  if (data && data.grid) {
    for (const [planKey, periods] of Object.entries(data.grid)) {
      console.log(`📌 Plan: ${planKey.toUpperCase()} (${periods.length} periodi):`);
      periods.forEach(p => {
        console.log(`   ➔ [${p.dateFrom} .. ${p.dateTo}] | Strategy: ${p.strategy} | StopSell: ${p.stopSell} | CTA: ${p.closedToArrival} | Name: "${p.name}"`);
      });
    }
  } else {
    console.log('Response:', data);
  }
}

checkHttpGrid().catch(err => console.error(err));
