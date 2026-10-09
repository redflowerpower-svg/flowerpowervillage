import fs from 'fs';

let content = fs.readFileSync('scripts/deepseek-universal-translator.mjs', 'utf8');

const newFunc = `
// -------------------------------------------------------------
// STEP 7: Translate DeliveryMenu.tsx (Header, Hero Cards, Category Tabs)
// -------------------------------------------------------------
async function processDeliveryMenuCards() {
  console.log(\`\\n🍕 STEP 7: Translating DeliveryMenu.tsx into \${langConfig.name}\`);
  const filePath = 'src/pizza/pages/DeliveryMenu.tsx';
  let fileContent = fs.readFileSync(filePath, 'utf8');
  const code = langConfig.code;

  const payload = {
    bookTableTitle: 'Book a Table',
    bookTableDesc: 'Indoor, outdoor tables or bamboo garden hut',
    bookTableBtn: 'Book Now',
    discountTitle: '10% OFF',
    discountDesc: '1st order? Discount applied automatically in cart!',
    discountBadge: 'In Cart',
    deliveryTitle: 'Delivery & Takeaway',
    deliveryDesc: 'Ranong (>300฿ free), takeaway always free!',
    deliveryBtn: 'To Menu',
    tagline1: 'PIZZA & ITALIAN CUISINE',
    tagline2: 'Italian Chef • Imported Ingredients',
    info1: 'Open Daily',
    info2: '11:00 – 21:30',
    info3: 'Delivery & Takeaway'
  };

  const result = await callDeepSeekWithRetry(
    \`Translate these delivery menu promotion cards and hero details into prestigious \${langConfig.name} (\${langConfig.native}). Return JSON object.\`,
    payload,
    \`DeliveryMenu Top Cards & Hero [\${code}]\`
  );

  if (result) {
    const block = \`  \${code}: {
    title: 'Flower Power Pizza',
    subtitle: 'Ranong, Thailand',
    tagline1: '\${(result.tagline1 || '').replace(/'/g, "\\\\'")}',
    tagline2: '\${(result.tagline2 || '').replace(/'/g, "\\\\'")}',
    info1: '\${(result.info1 || '').replace(/'/g, "\\\\'")}',
    info2: '\${(result.info2 || '11:00 – 21:30').replace(/'/g, "\\\\'")}',
    info3: '\${(result.info3 || '').replace(/'/g, "\\\\'")}',
    cartItems: 'items in cart',
    cartItem: 'item in cart',
    promoTitle: 'Promotions & Delivery Info',
    deliveryLimit: 'Deliveries are made exclusively within the city of Ranong.',
    promoFreeDelivery: 'FREE delivery for orders over 300฿',
    promoFirstOrder: '10% discount on your first order',
    bookTableBadge: 'DINE-IN',
    bookTableTitle: '\${(result.bookTableTitle || '').replace(/'/g, "\\\\'")}',
    bookTableSubtitle: '\${(result.bookTableDesc || '').replace(/'/g, "\\\\'")}',
    bookTableBtn: '\${(result.bookTableBtn || '').replace(/'/g, "\\\\'")}',
  },\`;

    if (!fileContent.includes(\`  \${code}: {\`)) {
      fileContent = fileContent.replace(/const translations: Record<string, any> = \\{([^;]+)\\};/s, (match, p1) => {
        return \`const translations: Record<string, any> = {\${p1}\\n\${block}\\n};\`;
      });
      fs.writeFileSync(filePath, fileContent, 'utf8');
      console.log(\`✅ DeliveryMenu.tsx updated with [\${code}] translations.\`);
    }
  }
}
`;

if (!content.includes('processDeliveryMenuCards')) {
  content = content.replace('async function run() {', newFunc + '\nasync function run() {');
  content = content.replace('await processTableReservation();', 'await processTableReservation();\n  await processDeliveryMenuCards();');
  fs.writeFileSync('scripts/deepseek-universal-translator.mjs', content, 'utf8');
  console.log('✅ Added processDeliveryMenuCards to scripts/deepseek-universal-translator.mjs');
}
