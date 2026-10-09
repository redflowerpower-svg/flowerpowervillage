import fs from 'fs';

let apiKey = process.env.DEEPSEEK_API_KEY || '';
if (!apiKey) {
  const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2 && parts[0].trim() === 'DEEPSEEK_API_KEY') {
        apiKey = parts.slice(1).join('=').trim();
      }
    });
  }
}

const enLabels = {
  title: 'Your Cart',
  emptyTitle: 'Your cart is empty',
  emptyDesc: 'Choose delicious specialties prepared with care by our Italian chef',
  totalText: 'TOTAL TO PAY',
  subtotalText: 'Dishes subtotal',
  firstOrderDiscountText: '1st Order Discount (10%)',
  deliveryText: 'Delivery in Ranong',
  freeText: 'FREE',
  freeDeliveryApplied: 'FREE delivery applied (Order > 300฿)',
  welcomePrivilegeNote: '10% Welcome Discount applied to your food!',
  checkoutBtn: 'PROCEED TO CHECKOUT',
  continueShoppingBtn: '← Back to Menu & choose more dishes',
  addMoreDishesBtn: '+ Keep choosing from our Menu',
  ordersPausedBtn: 'Orders Temporarily Paused',
  ordersClosedBtn: 'Pizzeria currently Closed',
  callPizzeria: 'Call Pizzeria (Ranong)',
  footerInfo: 'Artisanal Italian Cuisine • Fast Delivery in Ranong',
  pairingRitualTitle: 'Complete Your Order',
  pairingRitualSubtitle: '3 chef-recommended pairing rituals',
  slot1Badge: '1. Soft Drink',
  slot2Badge: '2. Coffee',
  slot3Badge: '3. Dessert',
  openSlot1: 'All Soft Drinks',
  openSlot2: 'All Coffee & Tea',
  openSlot3: 'All Desserts',
  slotAlt1Badge: '1. Pizza',
  slotAlt2Badge: '2. Pasta',
  slotAlt3Badge: '3. Snack',
  openSlotAlt1: 'All Pizzas',
  openSlotAlt2: 'All Pasta',
  openSlotAlt3: 'All Snacks',
  addDrinkBtn: '+ Add',
  wineDineInBadge: 'Wine Cellar Privilege • 10% Discount',
  wineDineInTitle: 'Book a Table: 10% Off Your Wine Bottle',
  wineDineInDesc: 'Reserve a table or garden hut in Ranong and enjoy 10% off any wine bottle from our Italian cellar.',
  wineDineInBtn: 'Book Table & Unlock 10% Wine Discount',
  wineDiscountBadge: '-10% WINE DISCOUNT',
  deliveryIncluded: '✓ Delivery included',
  tableOrderBtn: 'Send Table Order',
  tableAddMoreBtn: '+ Add more food & drinks',
};

async function run() {
  const filePath = 'src/pizza/components/CartDrawer.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  const langs = [
    { code: 'ES', name: 'Spanish' },
    { code: 'FR', name: 'French' },
    { code: 'RU', name: 'Russian' },
    { code: 'ZH', name: 'Chinese (Simplified)' }
  ];

  const translatedLangs = {};

  for (const l of langs) {
    console.log(`Translating CartDrawer labels into ${l.name} (${l.code})...`);
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: `Translate this CartDrawer UI JSON into natural, high-end ${l.name}. Return clean JSON matching the keys exactly.` },
          { role: 'user', content: JSON.stringify(enLabels) }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });
    const data = await res.json();
    translatedLangs[l.code] = JSON.parse(data.choices[0].message.content);
  }

  // Format blocks
  let allNewBlocks = '';
  for (const [code, dict] of Object.entries(translatedLangs)) {
    allNewBlocks += `\n  ${code}: {\n`;
    for (const [k, v] of Object.entries(dict)) {
      allNewBlocks += `    ${k}: '${String(v).replace(/'/g, "\\'")}',\n`;
    }
    // Add the function keys for remaining/achieved
    if (code === 'ES') {
      allNewBlocks += `    freeDeliveryRemaining: (amount: number) => \`¡Solo \${amount}฿ más para entrega GRATIS!\`,\n`;
      allNewBlocks += `    freeDeliveryAchieved: '¡Entrega GRATIS desbloqueada! 🎉',\n`;
    } else if (code === 'FR') {
      allNewBlocks += `    freeDeliveryRemaining: (amount: number) => \`Plus que \${amount}฿ pour la livraison GRATUITE !\`,\n`;
      allNewBlocks += `    freeDeliveryAchieved: 'Livraison GRATUITE débloquée ! 🎉',\n`;
    } else if (code === 'RU') {
      allNewBlocks += `    freeDeliveryRemaining: (amount: number) => \`Ещё \${amount}฿ до БЕСПЛАТНОЙ доставки!\`,\n`;
      allNewBlocks += `    freeDeliveryAchieved: 'БЕСПЛАТНАЯ доставка разблокирована! 🎉',\n`;
    } else if (code === 'ZH') {
      allNewBlocks += `    freeDeliveryRemaining: (amount: number) => \`再消费 \${amount}฿ 即可享受免费配送！\`,\n`;
      allNewBlocks += `    freeDeliveryAchieved: '已解锁免费配送！🎉',\n`;
    }
    allNewBlocks += `  },`;
  }

  // Add the new languages before the end of labels object
  content = content.replace(
    /tableAddMoreBtn: '\+ မီနူးမှ အရသာရှိသော အစားအစာများ ထပ်ရွေးမည်',\s*\},?\s*\};/s,
    `tableAddMoreBtn: '+ မီနူးမှ အရသာရှိသော အစားအစာများ ထပ်ရွေးမည်',\n  },${allNewBlocks}\n};`
  );

  // Safeguard const t = labels[lang]
  content = content.replace(
    'const t = labels[lang];',
    'const t = labels[lang] || labels.EN || labels.IT;'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ CartDrawer.tsx successfully updated with all 9 languages and fallback guard!');
}

run().catch(console.error);
