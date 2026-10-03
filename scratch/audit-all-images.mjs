const { menuData } = await import('../src/pizza/data/menuData.ts');

console.log('🔍 Starting Full HTTP Image Verification Audit...\n');

async function runAudit() {
  const allItems = menuData.flatMap((c) => c.items);
  console.log(`📦 Testing ${allItems.length} menu items from menuData...`);

  let successCount = 0;
  let failCount = 0;

  for (const item of allItems) {
    if (!item.image) {
      console.log(`❌ [MISSING IMAGE URL] Item: ${item.id} (${item.name})`);
      failCount++;
      continue;
    }

    try {
      const res = await fetch(item.image, { method: 'HEAD' });
      if (res.status === 200) {
        successCount++;
      } else {
        console.log(`❌ [HTTP ${res.status}] Item: ${item.id} -> ${item.image}`);
        failCount++;
      }
    } catch (err) {
      console.log(`❌ [NETWORK ERROR] Item: ${item.id} -> ${err.message}`);
      failCount++;
    }
  }

  console.log('\n--- AUDIT SUMMARY ---');
  console.log(`✅ Total Online & Verified (HTTP 200): ${successCount}`);
  console.log(`❌ Total Broken/Missing: ${failCount}`);

  if (failCount > 0) {
    console.error('\n⚠️ Image audit failed with broken links!');
    process.exit(1);
  } else {
    console.log('\n🎉 100% OF IMAGES ARE ACCESSIBLE AND VALID!');
    process.exit(0);
  }
}

runAudit();
