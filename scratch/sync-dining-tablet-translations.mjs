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

const enTablePicker = {
  title: 'Flower Power Pizza Dining',
  subtitle: 'Select Table or Guest Station',
  desc: 'Touch your table or station to access the full menu with 5% table discount applied to all dishes.',
  tablesHeading: 'Dining Tables & Guest Stations',
  freeLabel: 'Available',
  activeLabel: 'Kitchen Order',
  guestLabel: 'Smartphone Live',
  freeCard: 'New Order',
  activeCardPrefix: 'Open Tab:',
  guestCardPrefix: 'Guest Ordering Live',
  customLabel: 'Or Enter Custom Table / Station',
  customPlaceholder: 'e.g. Terrace 3 / Garden / Counter',
  enterBtn: 'Access Menu',
  logoutBtn: 'Logout',
  qrStudioBtn: 'Table QRs 1-16'
};

const enResetConfirm = {
  prompt: 'Are you sure you want to cancel the order?',
  short: 'Confirm?',
  full: 'Sure? Tap to cancel and reset'
};

const enWineFilterLabels = {
  winesCount: 'Italian & fine international wines',
  italianFirstBadge: '🇮🇹 Italian Wines First',
  allTypes: 'All Wine Types',
  allCountries: 'All Countries',
  noWinesFound: 'No wines found matching criteria.'
};

async function run() {
  const targetLangs = [
    { code: 'ES', name: 'Spanish', loc: 'RANONG, TAILANDIA' },
    { code: 'FR', name: 'French', loc: 'RANONG, THAÏLANDE' },
    { code: 'RU', name: 'Russian', loc: 'РАНОНГ, ТАИЛАНД' },
    { code: 'ZH', name: 'Chinese (Simplified)', loc: '泰国拉廊' }
  ];

  const results = {};

  for (const l of targetLangs) {
    console.log(`Translating Dining Tablet dictionaries for ${l.name} (${l.code})...`);
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: `Translate these Dining Tablet POS UI dictionaries into natural, high-end ${l.name}. Return clean JSON matching the keys.` },
          { role: 'user', content: JSON.stringify({ tablePicker: enTablePicker, resetConfirm: enResetConfirm, wineFilter: enWineFilterLabels }) }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });
    const data = await res.json();
    results[l.code] = JSON.parse(data.choices[0].message.content);
    results[l.code].loc = l.loc;
  }

  const filePath = 'src/pizza/pages/DiningTabletSite.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Patch I18N_TABLE_PICKER
  let tablePickerBlocks = '';
  for (const [code, r] of Object.entries(results)) {
    tablePickerBlocks += `,\n  ${code}: {\n`;
    for (const [k, v] of Object.entries(r.tablePicker)) {
      tablePickerBlocks += `    ${k}: '${String(v).replace(/'/g, "\\'")}',\n`;
    }
    tablePickerBlocks += `  }`;
  }

  content = content.replace(
    /qrStudioBtn: 'စားပွဲ QR ၁-၁၆'\s*\}\s*\};/s,
    `qrStudioBtn: 'စားပွဲ QR ၁-၁၆'\n  }${tablePickerBlocks}\n};`
  );

  // 2. Patch I18N_RESET_CONFIRM
  let resetConfirmBlocks = '';
  for (const [code, r] of Object.entries(results)) {
    resetConfirmBlocks += `,\n  ${code}: {\n`;
    for (const [k, v] of Object.entries(r.resetConfirm)) {
      resetConfirmBlocks += `    ${k}: '${String(v).replace(/'/g, "\\'")}',\n`;
    }
    resetConfirmBlocks += `  }`;
  }

  content = content.replace(
    /full: "အတည်ပြုရန် ထပ်မံနှိပ်ပါ"\s*\}\s*\};/s,
    `full: "အတည်ပြုရန် ထပ်မံနှိပ်ပါ"\n  }${resetConfirmBlocks}\n};`
  );

  // 3. Patch LOCATION_BY_LANG
  let locBlocks = '';
  for (const [code, r] of Object.entries(results)) {
    locBlocks += `,\n  ${code}: '${r.loc}'`;
  }
  content = content.replace(
    /MM: 'ရနောင်း၊ ထိုင်းနိုင်ငံ'\s*\};/s,
    `MM: 'ရနောင်း၊ ထိုင်းနိုင်ငံ'${locBlocks}\n};`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ DiningTabletSite.tsx updated with all 9 languages for all dictionaries!');
}

run().catch(console.error);
