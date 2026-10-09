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

if (!apiKey) {
  console.error('❌ DEEPSEEK_API_KEY not configured!');
  process.exit(1);
}

async function callDeepSeek(prompt) {
  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: 'You are a professional restaurant and food delivery UI translator. Return valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API Error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

const payload = {
  wineBannerBadge: "🍷 DINE-IN WINE PRIVILEGE • 10% OFF",
  wineBannerTitle: "Fine Wine Selection • Book online to receive an exclusive 10% table discount",
  wineBannerDesc: "In compliance with Thai law, online delivery of alcohol is not permitted. We invite you to enjoy our cellar selection at our restaurant in Ranong: reserve a table from our website to get a 10% discount on all wine bottles at your table!",
  wineBannerButton: "Book Table (-10% Wine)",
  checkoutFirstOrderDiscount: "10% 1st Order Welcome Discount",
  takeawayBoxExplanation: "Your pizzas will be baked fresh and packed in thermal boxes ready for your arrival at our restaurant counter.",
  kshopTitle: "How to pay with K-Shop (Kasikorn Bank):",
  kshopStep1: "Save the QR code or scan it directly with your Banking App.",
  kshopStep2: "Manually enter the exact order total: {amount} ฿",
  kshopStep3: "Confirm the transfer and complete the payment.",
  kshopStep4: "Upload your payment receipt screenshot (slip) below.",
  omiseGenerating: "Generating Omise QR...",
  omiseNoUploadNeeded: "✅ No upload needed — payment confirmed automatically.",
  omiseFailedToLoad: "Failed to load Omise QR. Please retry.",
  retryQrBtn: "Retry QR",
  saveQrBtn: "Save QR",
  extras: {
    "spicy-no": "Not Spicy",
    "spicy-light": "Mildly Spicy",
    "spicy-medium": "Medium Spicy",
    "spicy-very": "Very Spicy",
    "sugar-no": "No Sugar (0%)",
    "sugar-less": "Less Sugar (50%)",
    "sugar-regular": "Regular Sweet (100%)",
    "sauce-none": "No Sauces",
    "sauce-ketchup": "Ketchup",
    "sauce-mayo": "Mayonnaise",
    "sauce-chili": "Chili Sauce",
    "fruit-watermelon": "Watermelon",
    "fruit-pineapple": "Pineapple",
    "fruit-banana": "Banana",
    "fruit-papaya": "Papaya",
    "fruit-lime": "Fresh Lime",
    "extra-mozzarella": "Extra Mozzarella",
    "extra-mushrooms": "Fresh Mushrooms",
    "extra-ham": "Cooked Ham",
    "extra-bacon": "Crispy Bacon",
    "extra-salami": "Spicy Salami",
    "extra-olives": "Black Olives",
    "extra-anchovies": "Mediterranean Anchovies",
    "extra-parmigiano": "Parmigiano Reggiano",
    "extra-gorgonzola": "Gorgonzola Cheese",
    "extra-truffle": "Truffle Oil",
    "extra-egg": "Egg",
    "extra-onion": "Red Onion",
    "extra-fries": "French Fries (Topping)"
  },
  pairingDishes: {
    "coca-cola-can": "Coca-Cola (Can)",
    "coke-zero-can": "Coke Zero (Can)",
    "sprite-can": "Sprite (Can)",
    "soda-water-bottle": "Soda Water (Bottle)",
    "mineral-water-bottle": "Mineral Water (Bottle)",
    "espresso": "Italian Espresso",
    "cappuccino": "Creamy Cappuccino",
    "americano": "Caffè Americano",
    "latte-macchiato": "Latte Macchiato",
    "tiramisu": "Artisan Tiramisù",
    "cake-of-the-day": "Cake of the Day",
    "affogato": "Affogato al Caffè",
    "crepes": "Nutella Crepes",
    "pizza-margherita": "Pizza Margherita",
    "pizza-marinara": "Pizza Marinara (Vegan)",
    "carbonara": "Spaghetti Carbonara",
    "bolognese": "Spaghetti Bolognese",
    "french-fries": "French Fries",
    "pizza-sandwich-parma": "Focaccia Parma Ham"
  }
};

async function translateForLanguages(langs, langNames) {
  console.log(`🔄 Translating for: ${langs.join(', ')}...`);
  const prompt = `Translate the following English JSON data into: ${langNames}.
Keep '{amount}' placeholder unchanged.
Return JSON with top-level keys matching the language codes:
{
  ${langs.map(l => `"${l}": { ... }`).join(',\n  ')}
}
Source English data:
${JSON.stringify(payload, null, 2)}`;

  return await callDeepSeek(prompt);
}

async function run() {
  try {
    const batch1 = await translateForLanguages(['IT', 'TH', 'MM', 'DE'], 'Italian (IT), Thai (TH), Burmese Unicode (MM), German (DE)');
    const batch2 = await translateForLanguages(['ES', 'FR', 'RU', 'ZH'], 'Spanish (ES), French (FR), Russian (RU), Simplified Chinese (ZH)');

    const finalTranslations = {
      EN: payload,
      ...batch1,
      ...batch2
    };

    fs.writeFileSync('scratch/deepseek_targeted_translations.json', JSON.stringify(finalTranslations, null, 2));
    console.log('✅ Successfully fetched all targeted translations in 9 languages!');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

run();
