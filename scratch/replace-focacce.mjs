import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import ffmpegPath from 'ffmpeg-static';
import { createClient } from '@supabase/supabase-js';

const execFileAsync = promisify(execFile);

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

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERRORE: Credenziali Supabase mancanti in .env o .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const FOCACCE_LIST = [
  {
    sourceFile: 'Focaccia Finocchiona.png',
    id: 'focaccia-pizza-sandwich-con-finocchiona',
    storageName: 'focaccia-pizza-sandwich-con-finocchiona.webp',
    nameIt: 'FOCACCIA\nCON FINOCCHIONA',
    nameEn: 'FOCACCIA\nWITH FINOCCHIONA',
    nameTh: 'ฟอคคาเซีย\nพร้อมฟินอคคิโอนา',
    nameDe: 'FOCACCIA\nMIT FINOCCHIONA',
    descriptionIt: "Focaccia da impasto pizza all'olio extravergine d'oliva, finocchiona toscana, pomodoro fresco a fette, lattuga gentile",
    descriptionEn: "Pizza dough focaccia with extra virgin olive oil, Tuscan finocchiona salami, fresh sliced tomatoes, and crisp lettuce",
    descriptionTh: "ฟอคคาเซียแป้งพิซซ่าอบสดใหม่ น้ำมันมะกอกบริสุทธิ์ ฟินอคคิโอนาซาลามี่สไตล์ทัสคานี มะเขือเทศสด และผักกาดหอม",
    descriptionDe: "Ofenfrische Focaccia aus Pizzateig mit nativem Olivenöl extra, toskanischer Finocchiona, frischen Tomatenscheiben und knackigem Blattsalat",
    price: 230
  },
  {
    sourceFile: 'Focaccia Pancetta Arrotolata.png',
    id: 'focaccia-pizza-sandwich-con-pancetta-arrotolata',
    storageName: 'focaccia-pizza-sandwich-con-pancetta-arrotolata.webp',
    nameIt: 'FOCACCIA\nCON PANCETTA ARROTOLATA',
    nameEn: 'FOCACCIA\nWITH ROLLED PANCETTA',
    nameTh: 'ฟอคคาเซีย\nพร้อมปานเชตตาม้วน',
    nameDe: 'FOCACCIA\nMIT GEROLLTER PANCETTA',
    descriptionIt: "Focaccia da impasto pizza all'olio extravergine d'oliva, pancetta arrotolata nostrana, pomodoro fresco a fette, lattuga gentile",
    descriptionEn: "Pizza dough focaccia with extra virgin olive oil, artisanal rolled pancetta, fresh sliced tomatoes, and crisp lettuce",
    descriptionTh: "ฟอคคาเซียแป้งพิซซ่าอบสดใหม่ น้ำมันมะกอกบริสุทธิ์ ปานเชตตาหมูสามชั้นม้วนสไตล์อิตาเลียน มะเขือเทศสด และผักกาดหอม",
    descriptionDe: "Ofenfrische Focaccia aus Pizzateig mit nativem Olivenöl extra, gerollter italienischer Pancetta, frischen Tomatenscheiben und knackigem Blattsalat",
    price: 230
  },
  {
    sourceFile: 'Focaccia Porchetta.png',
    id: 'focaccia-pizza-sandwich-con-porchetta',
    storageName: 'focaccia-pizza-sandwich-con-porchetta.webp',
    nameIt: 'FOCACCIA\nCON PORCHETTA',
    nameEn: 'FOCACCIA\nWITH PORCHETTA',
    nameTh: 'ฟอคคาเซีย\nพร้อมพอร์เคตตา',
    nameDe: 'FOCACCIA\nMIT PORCHETTA',
    descriptionIt: "Focaccia da impasto pizza all'olio extravergine d'oliva, porchetta di maiale arrosto speziata, pomodoro fresco a fette, lattuga gentile",
    descriptionEn: "Pizza dough focaccia with extra virgin olive oil, seasoned roasted Italian porchetta, fresh sliced tomatoes, and crisp lettuce",
    descriptionTh: "ฟอคคาเซียแป้งพิซซ่าอบสดใหม่ น้ำมันมะกอกบริสุทธิ์ พอร์เคตตาหมูอบสมุนไพรสไตล์โรมัน มะเขือเทศสด และผักกาดหอม",
    descriptionDe: "Ofenfrische Focaccia aus Pizzateig mit nativem Olivenöl extra, gewürzter Schweinebraten-Porchetta, frischen Tomatenscheiben und knackigem Blattsalat",
    price: 240
  },
  {
    sourceFile: 'Focaccia Prosciutto Cotto.png',
    id: 'focaccia-pizza-sandwich-con-prosciutto-cotto',
    storageName: 'focaccia-pizza-sandwich-con-prosciutto-cotto.webp',
    nameIt: 'FOCACCIA\nCON PROSCIUTTO COTTO',
    nameEn: 'FOCACCIA\nWITH COOKED HAM',
    nameTh: 'ฟอคคาเซีย\nพร้อมแฮมสุก',
    nameDe: 'FOCACCIA\nMIT KOCHSCHINKEN',
    descriptionIt: "Focaccia da impasto pizza all'olio extravergine d'oliva, prosciutto cotto di suino alta qualità, pomodoro fresco a fette, lattuga gentile",
    descriptionEn: "Pizza dough focaccia with extra virgin olive oil, premium Italian cooked ham, fresh sliced tomatoes, and crisp lettuce",
    descriptionTh: "ฟอคคาเซียแป้งพิซซ่าอบสดใหม่ น้ำมันมะกอกบริสุทธิ์ แฮมสุกอิตาเลียนคุณภาพพรีเมียม มะเขือเทศสด และผักกาดหอม",
    descriptionDe: "Ofenfrische Focaccia aus Pizzateig mit nativem Olivenöl extra, feinstem Kochschinken, frischen Tomatenscheiben und knackigem Blattsalat",
    price: 220
  },
  {
    sourceFile: 'Focaccia Salame.png',
    id: 'focaccia-pizza-sandwich-con-salame',
    storageName: 'focaccia-pizza-sandwich-con-salame.webp',
    nameIt: 'FOCACCIA\nCON SALAME',
    nameEn: 'FOCACCIA\nWITH SALAMI',
    nameTh: 'ฟอคคาเซีย\nพร้อมซาลามี่',
    nameDe: 'FOCACCIA\nMIT SALAMI',
    descriptionIt: "Focaccia da impasto pizza all'olio extravergine d'oliva, salame nostrano a grana media, pomodoro fresco a fette, lattuga gentile",
    descriptionEn: "Pizza dough focaccia with extra virgin olive oil, traditional Italian salami, fresh sliced tomatoes, and crisp lettuce",
    descriptionTh: "ฟอคคาเซียแป้งพิซซ่าอบสดใหม่ น้ำมันมะกอกบริสุทธิ์ ซาลามี่อิตาเลียนแบบดั้งเดิม มะเขือเทศสด และผักกาดหอม",
    descriptionDe: "Ofenfrische Focaccia aus Pizzateig mit nativem Olivenöl extra, traditioneller italienischer Salami, frischen Tomatenscheiben und knackigem Blattsalat",
    price: 230
  },
  {
    sourceFile: 'Focaccia con Milanese.png',
    id: 'focaccia-pizza-sandwich-con-milanese',
    storageName: 'focaccia-pizza-sandwich-con-milanese.webp',
    nameIt: 'FOCACCIA\nCON MILANESE',
    nameEn: 'FOCACCIA\nWITH MILANESE',
    nameTh: 'ฟอคคาเซีย\nพร้อมมิลานีสคัตเล็ต',
    nameDe: 'FOCACCIA\nMIT SCHNITZEL',
    descriptionIt: "Focaccia da impasto pizza all'olio extravergine d'oliva, cotoletta alla milanese croccante, pomodoro fresco a fette, lattuga gentile",
    descriptionEn: "Pizza dough focaccia with extra virgin olive oil, crispy Milanese breaded cutlet, fresh sliced tomatoes, and crisp lettuce",
    descriptionTh: "ฟอคคาเซียแป้งพิซซ่าอบสดใหม่ น้ำมันมะกอกบริสุทธิ์ มิลานีสคัตเล็ตหมูทอดกรอบ มะเขือเทศสด และผักกาดหอม",
    descriptionDe: "Ofenfrische Focaccia aus Pizzateig mit nativem Olivenöl extra, knusprigem Mailänder Schnitzel, frischen Tomatenscheiben und knackigem Blattsalat",
    price: 250
  }
];

const inputDir = path.resolve(process.cwd(), 'scratch/Nuovi Piatti');
const outputDir = path.resolve(process.cwd(), 'scratch/optimized_webp');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function convertAndUpload() {
  console.log('--- 1. CONVERTING AND UPLOADING 6 FOCACCE ---');
  
  for (const focaccia of FOCACCE_LIST) {
    const src = path.join(inputDir, focaccia.sourceFile);
    const dest = path.join(outputDir, focaccia.storageName);

    if (!fs.existsSync(src)) {
      console.error(`File non trovato: ${src}`);
      continue;
    }

    console.log(`Converting ${focaccia.sourceFile} -> ${focaccia.storageName}...`);
    // Convert to webp with ffmpeg
    await execFileAsync(ffmpegPath, [
      '-y',
      '-i', src,
      '-vf', 'scale=1000:-1',
      '-c:v', 'libwebp',
      '-quality', '85',
      dest
    ]);

    const stats = fs.statSync(dest);
    console.log(`  Converted size: ${(stats.size / 1024).toFixed(1)} KB`);

    // Upload to Supabase Storage
    const storagePath = `05-Pizza-Sandwiches/${focaccia.storageName}`;
    const fileBuffer = fs.readFileSync(dest);

    console.log(`  Uploading to Supabase: delivery_food/${storagePath}...`);
    const { data, error } = await supabase.storage
      .from('delivery_food')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/webp',
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      console.error(`  Upload error for ${storagePath}:`, error.message);
    } else {
      console.log(`  ✅ Uploaded successfully!`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('delivery_food')
      .getPublicUrl(storagePath);

    focaccia.uploadedUrl = publicUrlData.publicUrl;
  }

  console.log('\n--- 2. UPDATING menuData.ts ---');
  const menuDataPath = 'src/pizza/data/menuData.ts';
  const content = fs.readFileSync(menuDataPath, 'utf8');

  const jsonStart = content.indexOf('export const menuCategories');
  const dataStr = content.slice(content.indexOf('=', jsonStart) + 1, content.lastIndexOf(';'));
  const categories = eval('(' + dataStr + ')');

  const swCategory = categories.find(c => c.id === 'pizza-sandwich');
  const dailyCategory = categories.find(c => c.id === 'daily-specials');
  const sandwichExtras = swCategory?.items[0]?.extras || [];

  for (const focaccia of FOCACCE_LIST) {
    const itemData = {
      id: focaccia.id,
      name: focaccia.nameEn,
      nameIt: focaccia.nameIt,
      nameTh: focaccia.nameTh,
      nameDe: focaccia.nameDe,
      description: focaccia.descriptionEn,
      descriptionIt: focaccia.descriptionIt,
      descriptionTh: focaccia.descriptionTh,
      descriptionDe: focaccia.descriptionDe,
      description_it: focaccia.descriptionIt,
      description_th: focaccia.descriptionTh,
      description_de: focaccia.descriptionDe,
      price: focaccia.price,
      image: focaccia.uploadedUrl,
      image_file: `05-Pizza-Sandwiches/${focaccia.storageName}`,
      category: 'pizza-sandwich',
      is_available: true,
      extras: sandwichExtras,
      allowed_extras_group: 'None'
    };

    // Update in pizza-sandwich
    const swIdx = swCategory.items.findIndex(i => i.id === focaccia.id);
    if (swIdx >= 0) {
      swCategory.items[swIdx] = { ...swCategory.items[swIdx], ...itemData };
    } else {
      swCategory.items.push(itemData);
    }

    // Update in daily-specials
    const dailyIdx = dailyCategory.items.findIndex(i => i.id === focaccia.id);
    if (dailyIdx >= 0) {
      dailyCategory.items[dailyIdx] = { ...dailyCategory.items[dailyIdx], ...itemData, category: 'daily-specials' };
    } else {
      dailyCategory.items.push({ ...itemData, category: 'daily-specials' });
    }
  }

  const newCategoriesJson = JSON.stringify(categories, null, 2);
  const newContent = content.slice(0, content.indexOf('=', jsonStart) + 1) + ' ' + newCategoriesJson + ';' + content.slice(content.lastIndexOf(';') + 1);
  fs.writeFileSync(menuDataPath, newContent, 'utf8');

  console.log('✅ menuData.ts updated with new images and cheese-free ingredients for all 6 focacce!');
}

convertAndUpload().catch(console.error);
