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

const inputSections = {
  SALAD_SUBFILTER_LABELS: { all: 'All Dishes', salads: 'Italian Salads', mains: 'Main Courses' },
  SANDWICH_SUBFILTER_LABELS: { all: 'All Dishes', focacce: 'Focaccia', sandwiches: 'Pizza Sandwich' },
  ITALIAN_SALADS_SECTIONS: {
    salads: {
      name: 'Italian Salads',
      desc: 'Fresh salads with eggs, chicken, potatoes or tuna prepared with selected crisp vegetables and artisan dressings.'
    },
    'main-courses': {
      name: 'Traditional Main Courses',
      desc: 'Italian culinary classics & savory pies made fresh: Crispy Milanese Cutlet with fries, Artisanal Cotechino with mashed potatoes, and Ligurian Torta Pasqualina.'
    }
  },
  FOCACCIA_SANDWICH_SECTIONS: {
    focacce: {
      name: 'Focaccia',
      desc: 'Fragrant oven-baked pizza dough focaccias filled with premium Italian cold cuts: Milanese cutlet, Tuscan Finocchiona, Rolled Pancetta, Roasted Porchetta, Cooked Ham, and Salami.'
    },
    'pizza-sandwiches': {
      name: 'Pizza Sandwich',
      desc: 'Flavorful sandwiches wrapped in our golden, crispy pizza crust with melted cheese, fresh tomatoes, and premium Italian cold cuts.'
    }
  },
  PASTA_SAUCES: {
    'special-pasta': {
      name: "Chef's Specials & Stuffed Pasta",
      desc: 'Seafood and artisan specialties: Seafood Spaghetti, Blue Crab Meat, Salmon Penne, Squid Ink Tagliatelle, and handmade stuffed Ravioli.'
    },
    'aglio-olio': {
      name: 'Garlic, Oil & Chili',
      desc: 'A simple and flavorful Italian classic made with garlic, olive oil, and chili, with an intense, aromatic taste that delights every single bite'
    },
    'pomodoro': {
      name: 'Tomato Sauce',
      desc: "Italian tomato sauce made with ripe tomatoes, olive oil, garlic or onion, salt, and basil. It's the heart of Italian cuisine"
    },
    'pesto': {
      name: 'Pesto Genovese',
      desc: 'Fresh basil sauce with cashews, parmesan cheese, garlic, and olive oil, with a rich, aromatic flavor that evokes the scent of Genoa'
    },
    'amatriciana': {
      name: 'Amatriciana',
      desc: 'Roman-style sauce with tomato, cured pork cheek, and pecorino, slowly cooked for a balanced sweet and savory flavor, a classic of Italian tradition'
    },
    'carbonara': {
      name: 'Carbonara',
      desc: 'Authentic Roman recipe with egg yolk, guanciale and pecorino cheese'
    },
    'bolognese': {
      name: 'Bolognese Ragù',
      desc: 'Slow-cooked traditional minced meat sauce'
    },
    'gorgonzola': {
      name: 'Creamy Gorgonzola',
      desc: 'Rich Italian blue cheese sauce'
    }
  }
};

const targetLangs = [
  { code: 'ES', name: 'Spanish' },
  { code: 'FR', name: 'French' },
  { code: 'RU', name: 'Russian' },
  { code: 'ZH', name: 'Chinese (Simplified)' }
];

async function run() {
  const result = {};

  for (const lang of targetLangs) {
    console.log(`Translating remaining sections for ${lang.name} (${lang.code})...`);

    const prompt = `You are a professional translator for Flower Power Pizza restaurant.
Translate the provided JSON structure into ${lang.name}.
Return a clean JSON object with identical keys matching the input structure.`;

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
          { role: 'user', content: JSON.stringify(inputSections) }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });

    const data = await res.json();
    result[lang.code] = JSON.parse(data.choices[0].message.content);
  }

  fs.writeFileSync('scratch/remaining_menu_sections_translated.json', JSON.stringify(result, null, 2), 'utf8');
  console.log('✅ Done! Saved to scratch/remaining_menu_sections_translated.json');
}

run().catch(console.error);
