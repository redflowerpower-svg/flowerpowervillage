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

const headerDict = {
  title: 'Flower Power Pizza',
  subtitle: 'Ranong, Thailand',
  tagline1: 'PIZZA & ITALIAN CUISINE',
  tagline2: 'Italian Chef • Imported Ingredients',
  info1: 'Open Daily',
  info2: '11:00 – 21:30',
  info3: 'Delivery & Takeaway',
  cartItems: 'items in cart',
  cartItem: 'item in cart',
  promoTitle: 'Promotions & Delivery Info',
  deliveryLimit: 'Deliveries are made exclusively within the city of Ranong.',
  promoFreeDelivery: 'FREE delivery for orders over 300฿',
  promoFirstOrder: '10% discount on your first order',
  bookTableBadge: 'DINE-IN',
  bookTableTitle: 'Book a Table or Hut',
  bookTableSubtitle: 'Indoor, outdoor tables or hut',
  bookTableBtn: 'BOOK NOW'
};

const categoryDict = {
  'daily-specials': { name: 'Daily Specials', desc: 'Exclusive daily creations and seasonal specialties freshly prepared by our Italian chef with premium ingredients' },
  'traditional-italian-pizza': { name: 'Classic Pizzas', desc: 'Slow-fermented Italian dough' },
  'pasta': { name: 'Pasta & First Courses', desc: 'Traditional Italian pasta & fresh first courses' },
  'breakfast-and-snacks': { name: 'Breakfast & Snacks', desc: 'To start your day' },
  'coffee-shop': { name: 'Coffee Shop', desc: 'Italian espresso coffee' },
  'fruit-drinks': { name: 'Fruit Drinks', desc: 'Fresh fruit shakes' },
  'soft-drinks': { name: 'Soft Drinks & Water', desc: 'Canned soft drinks, natural mineral water, and chilled refreshing beverages.' },
  'beers': { name: 'Beers', desc: 'The best Thai and international bottled beers served ice cold.' },
  'beers-and-wines': { name: 'Beers & Wines', desc: 'Chilled beers and Italian wine selection' },
  'wines': { name: 'Wine List', desc: 'Carefully curated selection of fine Italian and international wines, chosen to enhance the flavors of every dish on our menu.' }
};

const dailySpecialsSections = {
  pasta: {
    name: 'First Courses',
    desc: 'Seafood Spaghetti, Fresh Crab Meat, Salmon Penne, Squid Ink Tagliatelle, and artisanal Ravioli with your choice of pasta format.'
  },
  'traditional-italian-pizza': {
    name: 'Gourmet Special Pizzas',
    desc: 'Artisanal naturally leavened pizzas with fresh crab meat or local sausage, spinach, and gorgonzola.'
  },
  'daily-specials': {
    name: 'Traditional Main Courses',
    desc: 'Great classics and savory Italian pies prepared fresh: Milanese Cutlet, artisanal Cotechino with mashed potatoes, and authentic Ligurian Torta Pasqualina.'
  }
};

const targetLangs = [
  { code: 'ES', name: 'Spanish' },
  { code: 'FR', name: 'French' },
  { code: 'RU', name: 'Russian' },
  { code: 'ZH', name: 'Chinese (Simplified)' }
];

async function run() {
  const result = {
    header: {},
    categories: {},
    dailySpecials: {}
  };

  for (const lang of targetLangs) {
    console.log(`Translating for ${lang.name} (${lang.code})...`);

    const prompt = `You are a professional native translator for Flower Power Pizza in Thailand.
Translate the provided JSON objects into ${lang.name}.
Ensure translations are natural, elegant, and accurate.
Return a JSON object with:
- "header": translated header dict
- "categories": translated categories dict
- "dailySpecials": translated daily specials sections dict`;

    const inputData = {
      header: headerDict,
      categories: categoryDict,
      dailySpecials: dailySpecialsSections
    };

    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: JSON.stringify(inputData) }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });

    const data = await res.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    result.header[lang.code] = parsed.header;
    result.categories[lang.code] = parsed.categories;
    result.dailySpecials[lang.code] = parsed.dailySpecials;
  }

  fs.writeFileSync('scratch/delivery_menu_translated_dicts.json', JSON.stringify(result, null, 2), 'utf8');
  console.log('✅ Done! Saved to scratch/delivery_menu_translated_dicts.json');
}

run().catch(console.error);
