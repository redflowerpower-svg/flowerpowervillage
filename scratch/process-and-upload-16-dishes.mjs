import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import ffmpegPath from 'ffmpeg-static';
import { createClient } from '@supabase/supabase-js';

const execFileAsync = promisify(execFile);

// Load env files
function loadEnv() {
  const env = {};
  const files = ['.env', '.env.local'];
  for (const file of files) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          env[key] = val;
        }
      }
    }
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL || env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEEPSEEK_API_KEY = env.DEEPSEEK_API_KEY || env.VITE_DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERRORE: Credenziali Supabase mancanti in .env o .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const RAW_DISHES = [
  {
    num: 1,
    category: 'pasta',
    categoryFolder: '02-Pasta',
    storageName: 'spaghetti-allo-scoglio.webp',
    sourceImage: 'Spaghetti allo scoglio.png',
    nameIt: 'SPAGHETTI ALLO SCOGLIO',
    ingredientsIt: "Spaghetti di semola di grano duro, gamberi freschi, cozze, vongole, aglio, olio extravergine d'oliva, vino bianco, prezzemolo fresco, sale, pepe nero",
    price: 290,
    dietary: 'null',
    isDailySpecial: false,
    variants: [
      { name: 'Spaghetti', price: 290 },
      { name: 'Penne', price: 290 },
      { name: 'Linguine', price: 290 },
      { name: 'Tagliatelle fatte in casa', price: 290 },
      { name: 'Gnocchi artigianali', price: 310 },
      { name: 'Ravioli ripieni', price: 350 }
    ]
  },
  {
    num: 2,
    category: 'pasta',
    categoryFolder: '02-Pasta',
    storageName: 'penne-al-salmone.webp',
    sourceImage: 'Penne Salmone.png',
    nameIt: 'PENNE AL SALMONE',
    ingredientsIt: "Penne rigate di semola di grano duro, filetto di salmone, panna da cucina, polpa di pomodoro, aglio, olio extravergine d'oliva, prezzemolo fresco, sale, pepe nero",
    price: 290,
    dietary: 'null',
    isDailySpecial: false,
    variants: [
      { name: 'Penne', price: 290 },
      { name: 'Spaghetti', price: 290 },
      { name: 'Linguine', price: 290 },
      { name: 'Tagliatelle fatte in casa', price: 290 },
      { name: 'Gnocchi artigianali', price: 310 },
      { name: 'Ravioli ripieni', price: 350 }
    ]
  },
  {
    num: 3,
    category: 'pasta',
    categoryFolder: '02-Pasta',
    storageName: 'ravioli-alla-crema-di-gamberi.webp',
    sourceImage: 'Ravioli Crema di Gamberi.png',
    nameIt: 'RAVIOLI ALLA CREMA DI GAMBERI',
    ingredientsIt: "Ravioli freschi ripieni all'uovo, code di gambero, bisque di crostacei, panna da cucina, aglio, olio extravergine d'oliva, prezzemolo fresco, sale, pepe bianco",
    price: 300,
    dietary: 'null',
    isDailySpecial: false,
    variants: [
      { name: 'Ravioli ripieni', price: 300 },
      { name: 'Tagliatelle fatte in casa', price: 250 },
      { name: 'Spaghetti', price: 250 },
      { name: 'Penne', price: 250 },
      { name: 'Linguine', price: 250 },
      { name: 'Gnocchi artigianali', price: 260 }
    ]
  },
  {
    num: 4,
    category: 'pasta',
    categoryFolder: '02-Pasta',
    storageName: 'ravioli-al-sugo-di-noci.webp',
    sourceImage: 'Ravioli al sugi di noci.png',
    nameIt: 'RAVIOLI AL SUGO DI NOCI',
    ingredientsIt: "Ravioli freschi ripieni all'uovo, gherigli di noce, latte, pane raffermo, Parmigiano Reggiano DOP, aglio, olio extravergine d'oliva, noce moscata, sale",
    price: 260,
    dietary: 'veggie',
    isDailySpecial: false,
    variants: [
      { name: 'Ravioli ripieni', price: 260 },
      { name: 'Tagliatelle fatte in casa', price: 200 },
      { name: 'Gnocchi artigianali', price: 220 },
      { name: 'Spaghetti', price: 180 },
      { name: 'Penne', price: 180 },
      { name: 'Linguine', price: 180 }
    ]
  },
  {
    num: 5,
    category: 'pasta',
    categoryFolder: '02-Pasta',
    storageName: 'tagliatelle-al-nero-di-seppia-e-calamari.webp',
    sourceImage: 'Tagliatelle nero di seppia.png',
    nameIt: 'TAGLIATELLE AL NERO DI SEPPIA E CALAMARI',
    ingredientsIt: "Tagliatelle fresche all'uovo, calamari freschi, nero di seppia naturale, aglio, vino bianco secco, olio extravergine d'oliva, prezzemolo fresco, sale, pepe nero",
    price: 250,
    dietary: 'null',
    isDailySpecial: false,
    variants: [
      { name: 'Tagliatelle fatte in casa', price: 250 },
      { name: 'Spaghetti', price: 250 },
      { name: 'Penne', price: 250 },
      { name: 'Linguine', price: 250 },
      { name: 'Gnocchi artigianali', price: 260 },
      { name: 'Ravioli ripieni', price: 300 }
    ]
  },
  {
    num: 6,
    category: 'pasta',
    categoryFolder: '02-Pasta',
    storageName: 'spaghetti-alla-polpa-di-granchio.webp',
    sourceImage: 'Spaghetti Polpa di Granchio.png',
    nameIt: 'SPAGHETTI ALLA POLPA DI GRANCHIO',
    ingredientsIt: "Spaghetti di semola di grano duro, polpa di granchio, chele di granchio, pomodorini freschi, aglio, vino bianco, olio extravergine d'oliva, prezzemolo fresco, sale, peperoncino",
    price: 320,
    dietary: 'null',
    isDailySpecial: false,
    variants: [
      { name: 'Spaghetti', price: 320 },
      { name: 'Penne', price: 320 },
      { name: 'Linguine', price: 320 },
      { name: 'Tagliatelle fatte in casa', price: 320 },
      { name: 'Gnocchi artigianali', price: 340 },
      { name: 'Ravioli ripieni', price: 370 }
    ]
  },
  {
    num: 7,
    category: 'traditional-italian-pizza',
    categoryFolder: '01-Pizza',
    storageName: 'pizza-con-polpa-di-granchio.webp',
    sourceImage: 'Pizza con Polpa di Granchio.png',
    nameIt: 'PIZZA CON POLPA DI GRANCHIO',
    ingredientsIt: "Farina di grano tipo 0, lievito madre, acqua, salsa di pomodoro italiano, mozzarella fior di latte, polpa di granchio, cipollotto verde, olio extravergine d'oliva, sale",
    price: 350,
    dietary: 'null',
    isDailySpecial: false,
    variants: []
  },
  {
    num: 8,
    category: 'traditional-italian-pizza',
    categoryFolder: '01-Pizza',
    storageName: 'pizza-rustica-con-salsiccia-e-stilacci.webp',
    sourceImage: 'Pizza Rustica.png',
    nameIt: 'PIZZA RUSTICA CON SALSICCIA E STILACCI',
    ingredientsIt: "Farina di grano tipo 0, lievito madre, acqua, mozzarella fior di latte, salsiccia fresca di maiale, stilacci, aglio, olio extravergine d'oliva, sale, pepe nero",
    price: 350,
    dietary: 'null',
    isDailySpecial: false,
    variants: []
  },
  {
    num: 9,
    category: 'daily-specials',
    categoryFolder: '03-Daily-Specials',
    storageName: 'cotoletta-alla-milanese-con-patatine-fritte.webp',
    sourceImage: 'Milanese con Patate.png',
    nameIt: 'COTOLETTA ALLA MILANESE CON PATATINE FRITTE',
    ingredientsIt: "Lonza di maiale, uova fresche, pangrattato, patate fritte, olio per frittura, limone fresco, sale",
    price: 220,
    dietary: 'null',
    isDailySpecial: true,
    variants: []
  },
  {
    num: 10,
    category: 'daily-specials',
    categoryFolder: '03-Daily-Specials',
    storageName: 'cotechino-artigianale-con-pure-di-patate.webp',
    sourceImage: 'Cotechino con Puré.png',
    nameIt: 'COTECHINO ARTIGIANALE CON PURÈ DI PATATE',
    ingredientsIt: "Cotechino di maiale speziato, patate, latte intero, burro vaccino, noce moscata, sale, pepe nero",
    price: 250,
    dietary: 'null',
    isDailySpecial: true,
    variants: []
  },
  {
    num: 11,
    category: 'snacks-and-fries',
    categoryFolder: '07-French-Fries',
    storageName: 'torta-pasqualina-agli-spinaci-e-uova.webp',
    sourceImage: 'Torta di Spianaci.jpeg',
    nameIt: 'TORTA PASQUALINA AGLI SPINACI E UOVA',
    ingredientsIt: "Pasta sfoglia, spinaci, ricotta vaccina, uova sode intere, formaggio grattugiato stagionato, noce moscata, olio extravergine d'oliva, sale, pepe nero",
    price: 180,
    dietary: 'veggie',
    isDailySpecial: false,
    variants: []
  },
  {
    num: 12,
    category: 'pizza-sandwich',
    categoryFolder: '05-Pizza-Sandwiches',
    storageName: 'focaccia-pizza-sandwich-con-finocchiona.webp',
    sourceImage: 'Focaccia Finocchiona.png',
    nameIt: 'FOCACCIA PIZZA SANDWICH CON FINOCCHIONA',
    ingredientsIt: "Focaccia da impasto pizza all'olio extravergine d'oliva, finocchiona toscana, formaggio dolce a pasta filata, pomodoro fresco a fette, lattuga gentile",
    price: 230,
    dietary: 'null',
    isDailySpecial: false,
    variants: []
  },
  {
    num: 13,
    category: 'pizza-sandwich',
    categoryFolder: '05-Pizza-Sandwiches',
    storageName: 'focaccia-pizza-sandwich-con-pancetta-arrotolata.webp',
    sourceImage: 'Focaccia Pancetta Arrotolate.png',
    nameIt: 'FOCACCIA PIZZA SANDWICH CON PANCETTA ARROTOLATA',
    ingredientsIt: "Focaccia da impasto pizza all'olio extravergine d'oliva, pancetta arrotolata nostrana, formaggio dolce a pasta filata, pomodoro fresco a fette, lattuga gentile",
    price: 230,
    dietary: 'null',
    isDailySpecial: false,
    variants: []
  },
  {
    num: 14,
    category: 'pizza-sandwich',
    categoryFolder: '05-Pizza-Sandwiches',
    storageName: 'focaccia-pizza-sandwich-con-porchetta.webp',
    sourceImage: 'Focaccia Porchetta.png',
    nameIt: 'FOCACCIA PIZZA SANDWICH CON PORCHETTA',
    ingredientsIt: "Focaccia da impasto pizza all'olio extravergine d'oliva, porchetta di maiale arrosto speziata, formaggio dolce a pasta filata, pomodoro fresco a fette, lattuga gentile",
    price: 240,
    dietary: 'null',
    isDailySpecial: false,
    variants: []
  },
  {
    num: 15,
    category: 'pizza-sandwich',
    categoryFolder: '05-Pizza-Sandwiches',
    storageName: 'focaccia-pizza-sandwich-con-prosciutto-cotto.webp',
    sourceImage: 'Focaccia Prosciutto Cotto.png',
    nameIt: 'FOCACCIA PIZZA SANDWICH CON PROSCIUTTO COTTO',
    ingredientsIt: "Focaccia da impasto pizza all'olio extravergine d'oliva, prosciutto cotto di suino alta qualità, formaggio dolce a pasta filata, pomodoro fresco a fette, lattuga gentile",
    price: 220,
    dietary: 'null',
    isDailySpecial: false,
    variants: []
  },
  {
    num: 16,
    category: 'pizza-sandwich',
    categoryFolder: '05-Pizza-Sandwiches',
    storageName: 'focaccia-pizza-sandwich-con-salame.webp',
    sourceImage: 'Focaccia Salame.png',
    nameIt: 'FOCACCIA PIZZA SANDWICH CON SALAME',
    ingredientsIt: "Focaccia da impasto pizza all'olio extravergine d'oliva, salame nostrano a grana media, formaggio dolce a pasta filata, pomodoro fresco a fette, lattuga gentile",
    price: 230,
    dietary: 'null',
    isDailySpecial: false,
    variants: []
  }
];

async function translateWithDeepSeek(dish) {
  if (!DEEPSEEK_API_KEY) {
    console.warn(`[DeepSeek] Chiave non trovata, uso fallback per ${dish.nameIt}`);
    return {
      name: { IT: dish.nameIt, EN: dish.nameIt, TH: dish.nameIt, DE: dish.nameIt },
      description: { IT: dish.ingredientsIt, EN: dish.ingredientsIt, TH: dish.ingredientsIt, DE: dish.ingredientsIt }
    };
  }

  const prompt = `You are an Italian executive chef and master food translator for a premier authentic Italian restaurant and pizzeria in Thailand ("Flower Power Pizza").
Translate and refine the following dish name and clean ingredient list from Italian (IT) into all 4 languages: IT (Italian), EN (English), TH (Thai), and DE (German).

SOURCE INPUTS (Source Language: IT, Category: ${dish.category}):
- Dish Name: "${dish.nameIt}"
- Clean Comma-Separated Ingredients: "${dish.ingredientsIt}"

RULES:
1. Dish Name formatting:
   - For IT: Use authentic Italian naming (uppercase).
   - For EN: Use clear, appetizing international English food titles (uppercase).
   - For TH: Use natural Thai culinary dish titles without artificial spaces.
   - For DE: Use authentic German culinary dish titles (uppercase).
2. Ingredients formatting:
   - Must be ONLY a clean comma-separated list of ingredients.
   - For TH: Authentic Thai culinary ingredient names (e.g. มอสซาเรลล่า, น้ำมันมะกอกบริสุทธิ์, etc.).
   - For EN: Clean comma-separated English ingredients.
   - For DE: Clean comma-separated German ingredients.
   - For IT: Clean comma-separated Italian ingredients.
3. Output MUST be ONLY valid JSON matching this schema:
{
  "name": {
    "IT": "...",
    "EN": "...",
    "TH": "...",
    "DE": "..."
  },
  "description": {
    "IT": "...",
    "EN": "...",
    "TH": "...",
    "DE": "..."
  }
}`;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a specialized JSON-only Italian food translation assistant. Output strictly valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        return JSON.parse(content);
      }
    }
  } catch (err) {
    console.error(`Errore DeepSeek su ${dish.nameIt}:`, err.message);
  }

  return {
    name: { IT: dish.nameIt, EN: dish.nameIt, TH: dish.nameIt, DE: dish.nameIt },
    description: { IT: dish.ingredientsIt, EN: dish.ingredientsIt, TH: dish.ingredientsIt, DE: dish.ingredientsIt }
  };
}

async function main() {
  console.log('Inizio elaborazione 16 piatti speciali...');
  
  const sourceDir = path.resolve(process.cwd(), 'scratch/Nuovi Piatti');
  const targetDir = path.resolve(process.cwd(), 'scratch/optimized_webp');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const finalDishes = [];

  for (const dish of RAW_DISHES) {
    console.log(`\n--- Elaborazione Piatto #${dish.num}: ${dish.nameIt} ---`);
    
    // 1. Optimize & Convert image with ffmpeg
    const inputImagePath = path.join(sourceDir, dish.sourceImage);
    const outputImagePath = path.join(targetDir, dish.storageName);

    if (!fs.existsSync(inputImagePath)) {
      console.error(`❌ Immagine sorgente non trovata: ${inputImagePath}`);
      continue;
    }

    console.log(`Conversione WebP: ${dish.sourceImage} -> ${dish.storageName}`);
    // Resize to max width 1200, preserve aspect ratio, quality 85
    await execFileAsync(ffmpegPath, [
      '-y',
      '-i', inputImagePath,
      '-vf', 'scale=1200:-1',
      '-c:v', 'libwebp',
      '-quality', '85',
      outputImagePath
    ]);

    const stats = fs.statSync(outputImagePath);
    console.log(`Immagine WebP creata: ${(stats.size / 1024).toFixed(1)} KB`);

    // 2. Upload to Supabase Storage
    const storagePath = `${dish.categoryFolder}/${dish.storageName}`;
    console.log(`Caricamento su Supabase Storage: delivery_food/${storagePath}`);

    const fileBuffer = fs.readFileSync(outputImagePath);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('delivery_food')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/webp',
        upsert: true,
        cacheControl: '31536000'
      });

    if (uploadError) {
      console.error(`Errore upload Supabase: ${uploadError.message}`);
    } else {
      console.log(`Upload completato: ${storagePath}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('delivery_food')
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData?.publicUrl || `${SUPABASE_URL}/storage/v1/object/public/delivery_food/${storagePath}`;

    // 3. DeepSeek AI 4-Language Translation
    console.log(`Traduzione 4 lingue con DeepSeek AI...`);
    const translation = await translateWithDeepSeek(dish);
    console.log(`EN: ${translation.name.EN}`);
    console.log(`TH: ${translation.name.TH}`);
    console.log(`DE: ${translation.name.DE}`);

    // Build variants
    const mappedVariants = dish.variants.map((v, idx) => ({
      id: `var-${dish.storageName.replace('.webp', '')}-${idx + 1}`,
      name: v.name,
      nameIt: v.name,
      nameTh: v.name,
      nameDe: v.name,
      name_it: v.name,
      name_de: v.name,
      sku: `VAR-${dish.num}-${idx + 1}`,
      price: v.price,
      priceModifier: v.price - dish.price,
      description_it: '',
      description_de: ''
    }));

    const menuItem = {
      id: `special-${dish.storageName.replace('.webp', '')}`,
      category: dish.category,
      isDailySpecial: dish.isDailySpecial,
      name: translation.name.EN || dish.nameIt,
      nameTh: translation.name.TH || dish.nameIt,
      nameIt: translation.name.IT || dish.nameIt,
      nameDe: translation.name.DE || dish.nameIt,
      name_it: translation.name.IT || dish.nameIt,
      name_de: translation.name.DE || dish.nameIt,
      description: translation.description.EN || dish.ingredientsIt,
      descriptionTh: translation.description.TH || dish.ingredientsIt,
      descriptionIt: translation.description.IT || dish.ingredientsIt,
      descriptionDe: translation.description.DE || dish.ingredientsIt,
      description_it: translation.description.IT || dish.ingredientsIt,
      description_de: translation.description.DE || dish.ingredientsIt,
      price: dish.price,
      image: publicUrl,
      variants: mappedVariants.length > 0 ? mappedVariants : undefined,
      dietary: dish.dietary
    };

    finalDishes.push(menuItem);
  }

  // Save generated items to scratch/generated_dishes.json
  fs.writeFileSync(
    path.resolve(process.cwd(), 'scratch/generated_dishes.json'),
    JSON.stringify(finalDishes, null, 2),
    'utf8'
  );
  console.log('\nTutti i 16 piatti sono stati elaborati, caricati e salvati in scratch/generated_dishes.json!');
}

main().catch(console.error);
