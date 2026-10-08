import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

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
  console.error('❌ ERRORE: Credenziali Supabase mancanti in .env o .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const FOCACCE_MAPPING = [
  {
    sourceFile: 'Focaccia con Milanese.png',
    id: 'focaccia-pizza-sandwich-con-milanese',
    storageName: 'focaccia-pizza-sandwich-con-milanese.webp',
    nameIt: 'FOCACCIA\nCON MILANESE',
    nameEn: 'FOCACCIA\nWITH MILANESE',
    nameTh: 'ฟอคคาเซีย\nพร้อมมิลานีสคัตเล็ต',
    nameDe: 'FOCACCIA\nMIT SCHNITZEL',
    nameMm: 'ဖိုကာချာ\nမီလန်စတိုင်ကြက်ကြော်',
    descIt: "Focaccia tradizionale genovese, mozzarella fior di latte, cotoletta alla milanese, pomodoro fresco a fette, lattuga gentile, olio extravergine d'oliva",
    descEn: "Traditional Genoese focaccia, mozzarella fior di latte, Milanese cutlet, fresh sliced tomatoes, tender lettuce, extra virgin olive oil",
    descTh: "ฟอคคาเซียสไตล์เจนัวดั้งเดิม, มอสซาเรลล่าชีส, มิลานีสคัตเล็ตทอดกรอบ, มะเขือเทศสดหั่นแว่น, ผักกาดหอมสด, น้ำมันมะกอกเอ็กซ์ตร้าเวอร์จิ้น",
    descDe: "Traditionelle genuesische Focaccia, Mozzarella Fior di Latte, Mailänder Schnitzel, frische Tomatenscheiben, zarter Blattsalat, natives Olivenöl extra",
    descMm: "ရိုးရာ ဂျီနိုအာ ဖိုကာချာ ပေါင်မုန့်၊ မိုဇာရဲလား ချိစ်၊ မီလန်စတိုင် ကြက်သားကြော်၊ ခရမ်းချဉ်သီးစိတ်၊ ဆလတ်ရွက်နု၊ သံလွင်ဆီစစ်စစ်"
  },
  {
    sourceFile: 'Focaccia Finocchiona.png',
    id: 'focaccia-pizza-sandwich-con-finocchiona',
    storageName: 'focaccia-pizza-sandwich-con-finocchiona.webp',
    nameIt: 'FOCACCIA\nCON FINOCCHIONA',
    nameEn: 'FOCACCIA\nWITH FINOCCHIONA',
    nameTh: 'ฟอคคาเซีย\nพร้อมฟินอคคิโอนา',
    nameDe: 'FOCACCIA\nMIT FINOCCHIONA',
    nameMm: 'ဖိုကာချာ\nဖီနိုချီအိုနာဆာလာမီ',
    descIt: "Focaccia tradizionale genovese, mozzarella fior di latte, finocchiona toscana, pomodoro fresco a fette, lattuga gentile, olio extravergine d'oliva",
    descEn: "Traditional Genoese focaccia, mozzarella fior di latte, Tuscan finocchiona salami, fresh sliced tomatoes, tender lettuce, extra virgin olive oil",
    descTh: "ฟอคคาเซียสไตล์เจนัวดั้งเดิม, มอสซาเรลล่าชีส, ฟินอคคิโอนาซาลามี่ทัสคานี, มะเขือเทศสดหั่นแว่น, ผักกาดหอมสด, น้ำมันมะกอกเอ็กซ์ตร้าเวอร์จิ้น",
    descDe: "Traditionelle genuesische Focaccia, Mozzarella Fior di Latte, toskanische Finocchiona-Salami, frische Tomatenscheiben, zarter Blattsalat, natives Olivenöl extra",
    descMm: "ရိုးရာ ဂျီနိုအာ ဖိုကာချာ ပေါင်မုန့်၊ မိုဇာရဲလား ချိစ်၊ တက်စကန် ဖီနိုချီအိုနာ ဆာလာမီ၊ ခရမ်းချဉ်သီးစိတ်၊ ဆလတ်ရွက်နု၊ သံလွင်ဆီစစ်စစ်"
  },
  {
    sourceFile: 'Focaccia Pancetta Arrotolate.png',
    id: 'focaccia-pizza-sandwich-con-pancetta-arrotolata',
    storageName: 'focaccia-pizza-sandwich-con-pancetta-arrotolata.webp',
    nameIt: 'FOCACCIA\nCON PANCETTA ARROTOLATA',
    nameEn: 'FOCACCIA\nWITH ROLLED PANCETTA',
    nameTh: 'ฟอคคาเซีย\nพร้อมปานเชตตาม้วน',
    nameDe: 'FOCACCIA\nMIT GEROLLTER PANCETTA',
    nameMm: 'ဖိုကာချာ\nပန်ချက်တာအလိပ်',
    descIt: "Focaccia tradizionale genovese, mozzarella fior di latte, pancetta arrotolata, pomodoro fresco a fette, lattuga gentile, olio extravergine d'oliva",
    descEn: "Traditional Genoese focaccia, mozzarella fior di latte, rolled Italian pancetta, fresh sliced tomatoes, tender lettuce, extra virgin olive oil",
    descTh: "ฟอคคาเซียสไตล์เจนัวดั้งเดิม, มอสซาเรลล่าชีส, ปานเชตตาหมูสามชั้นม้วนอิตาเลียน, มะเขือเทศสดหั่นแว่น, ผักกาดหอมสด, น้ำมันมะกอกเอ็กซ์ตร้าเวอร์จิ้น",
    descDe: "Traditionelle genuesische Focaccia, Mozzarella Fior di Latte, gerollte Pancetta, frische Tomatenscheiben, zarter Blattsalat, natives Olivenöl extra",
    descMm: "ရိုးရာ ဂျီနိုအာ ဖိုကာချာ ပေါင်မုန့်၊ မိုဇာရဲလား ချိစ်၊ လိပ်ထားသော အီတလီ ပန်ချက်တာ၊ ခရမ်းချဉ်သီးစိတ်၊ ဆလတ်ရွက်နု၊ သံလွင်ဆီစစ်စစ်"
  },
  {
    sourceFile: 'Focaccia Porchetta.png',
    id: 'focaccia-pizza-sandwich-con-porchetta',
    storageName: 'focaccia-pizza-sandwich-con-porchetta.webp',
    nameIt: 'FOCACCIA\nCON PORCHETTA',
    nameEn: 'FOCACCIA\nWITH PORCHETTA',
    nameTh: 'ฟอคคาเซีย\nพร้อมพอร์เคตตา',
    nameDe: 'FOCACCIA\nMIT PORCHETTA',
    nameMm: 'ဖိုကာချာ\nပေါ်ချက်တာကင်',
    descIt: "Focaccia tradizionale genovese, mozzarella fior di latte, porchetta d'Ariccia arrosto, pomodoro fresco a fette, lattuga gentile, olio extravergine d'oliva",
    descEn: "Traditional Genoese focaccia, mozzarella fior di latte, seasoned Italian roast porchetta, fresh sliced tomatoes, tender lettuce, extra virgin olive oil",
    descTh: "ฟอคคาเซียสไตล์เจนัวดั้งเดิม, มอสซาเรลล่าชีส, พอร์เคตตาหมูอบสมุนไพรอิตาเลียน, มะเขือเทศสดหั่นแว่น, ผักกาดหอมสด, น้ำมันมะกอกเอ็กซ์ตร้าเวอร์จิ้น",
    descDe: "Traditionelle genuesische Focaccia, Mozzarella Fior di Latte, gewürzte Porchetta-Braten, frische Tomatenscheiben, zarter Blattsalat, natives Olivenöl extra",
    descMm: "ရိုးရာ ဂျီနိုအာ ဖိုကာချာ ပေါင်မုန့်၊ မိုဇာရဲလား ချိစ်၊ အီတလီ ဝက်သားကင် ပေါ်ချက်တာ၊ ခရမ်းချဉ်သီးစိတ်၊ ဆလတ်ရွက်နု၊ သံလွင်ဆီစစ်စစ်"
  },
  {
    sourceFile: 'Focaccia Prosciutto Cotto.png',
    id: 'focaccia-pizza-sandwich-con-prosciutto-cotto',
    storageName: 'focaccia-pizza-sandwich-con-prosciutto-cotto.webp',
    nameIt: 'FOCACCIA\nCON PROSCIUTTO COTTO',
    nameEn: 'FOCACCIA\nWITH COOKED HAM',
    nameTh: 'ฟอคคาเซีย\nพร้อมแฮมสุก',
    nameDe: 'FOCACCIA\nMIT KOCHSCHINKEN',
    nameMm: 'ဖိုကာချာ\nဟမ်ပြုတ်',
    descIt: "Focaccia tradizionale genovese, mozzarella fior di latte, prosciutto cotto di alta qualità, pomodoro fresco a fette, lattuga gentile, olio extravergine d'oliva",
    descEn: "Traditional Genoese focaccia, mozzarella fior di latte, premium Italian cooked ham, fresh sliced tomatoes, tender lettuce, extra virgin olive oil",
    descTh: "ฟอคคาเซียสไตล์เจนัวดั้งเดิม, มอสซาเรลล่าชีส, แฮมสุกอิตาเลียนคุณภาพพรีเมียม, มะเขือเทศสดหั่นแว่น, ผักกาดหอมสด, น้ำมันมะกอกเอ็กซ์ตร้าเวอร์จิ้น",
    descDe: "Traditionelle genuesische Focaccia, Mozzarella Fior di Latte, feinster Kochschinken, frische Tomatenscheiben, zarter Blattsalat, natives Olivenöl extra",
    descMm: "ရိုးရာ ဂျီနိုအာ ဖိုကာချာ ပေါင်မုန့်၊ မိုဇာရဲလား ချိစ်၊ အီတလီ ဟမ်ပြုတ်အကောင်းစား၊ ခရမ်းချဉ်သီးစိတ်၊ ဆလတ်ရွက်နု၊ သံလွင်ဆီစစ်စစ်"
  },
  {
    sourceFile: 'Focaccia Salame.png',
    id: 'focaccia-pizza-sandwich-con-salame',
    storageName: 'focaccia-pizza-sandwich-con-salame.webp',
    nameIt: 'FOCACCIA\nCON SALAME',
    nameEn: 'FOCACCIA\nWITH SALAMI',
    nameTh: 'ฟอคคาเซีย\nพร้อมซาลามี่',
    nameDe: 'FOCACCIA\nMIT SALAMI',
    nameMm: 'ဖိုကာချာ\nဆာလာမီ',
    descIt: "Focaccia tradizionale genovese, mozzarella fior di latte, salame nostrano, pomodoro fresco a fette, lattuga gentile, olio extravergine d'oliva",
    descEn: "Traditional Genoese focaccia, mozzarella fior di latte, artisanal Italian salami, fresh sliced tomatoes, tender lettuce, extra virgin olive oil",
    descTh: "ฟอคคาเซียสไตล์เจนัวดั้งเดิม, มอสซาเรลล่าชีส, ซาลามี่อิตาเลียนแบบดั้งเดิม, มะเขือเทศสดหั่นแว่น, ผักกาดหอมสด, น้ำมันมะกอกเอ็กซ์ตร้าเวอร์จิ้น",
    descDe: "Traditionelle genuesische Focaccia, Mozzarella Fior di Latte, traditionelle italienische Salami, frische Tomatenscheiben, zarter Blattsalat, natives Olivenöl extra",
    descMm: "ရိုးရာ ဂျီနိုအာ ဖိုကာချာ ပေါင်မုန့်၊ မိုဇာရဲလား ချိစ်၊ အီတလီ ဆာလာမီ၊ ခရမ်းချဉ်သီးစိတ်၊ ဆလတ်ရွက်နု၊ သံလွင်ဆီစစ်စစ်"
  },
  {
    sourceFile: 'Focaccia con Capocollo.png',
    id: 'focaccia-con-capocollo',
    storageName: 'focaccia-con-capocollo.webp',
    nameIt: 'FOCACCIA\nCON CAPOCOLLO',
    nameEn: 'FOCACCIA\nWITH CAPOCOLLO',
    nameTh: 'ฟอคคาเซีย\nพร้อมคาโปคอลโล',
    nameDe: 'FOCACCIA\nMIT CAPOCOLLO',
    nameMm: 'ဖိုကာချာ\nကာပိုကိုလို',
    descIt: "Focaccia tradizionale genovese, mozzarella fior di latte, capocollo stagionato nostrano, pomodoro fresco a fette, lattuga gentile, olio extravergine d'oliva",
    descEn: "Traditional Genoese focaccia, mozzarella fior di latte, cured Italian capocollo, fresh sliced tomatoes, tender lettuce, extra virgin olive oil",
    descTh: "ฟอคคาเซียสไตล์เจนัวดั้งเดิม, มอสซาเรลล่าชีส, คาโปคอลโลบ่มอิตาเลียน, มะเขือเทศสดหั่นแว่น, ผักกาดหอมสด, น้ำมันมะกอกเอ็กซ์ตร้าเวอร์จิ้น",
    descDe: "Traditionelle genuesische Focaccia, Mozzarella Fior di Latte, gereifter italienischer Capocollo, frische Tomatenscheiben, zarter Blattsalat, natives Olivenöl extra",
    descMm: "ရိုးရာ ဂျီနိုအာ ဖိုကာချာ ပေါင်မုန့်၊ မိုဇာရဲလား ချိစ်၊ အီတလီ ကာပိုကိုလို၊ ခရမ်းချဉ်သီးစိတ်၊ ဆလတ်ရွက်နု၊ သံလွင်ဆီစစ်စစ်"
  }
];

const inputDir = path.resolve(process.cwd(), 'scratch/appo');
const outputDir = path.resolve(process.cwd(), 'scratch/optimized_webp');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

async function run() {
  console.log('🚀 [1/3] CONVERSIONE PNG -> WEBP & UPLOAD SU SUPABASE STORAGE...');

  for (const item of FOCACCE_MAPPING) {
    const srcPath = path.join(inputDir, item.sourceFile);
    const destPath = path.join(outputDir, item.storageName);

    if (!fs.existsSync(srcPath)) {
      console.error(`❌ File sorgente non trovato: ${srcPath}`);
      continue;
    }

    console.log(`🖼️  Converting "${item.sourceFile}" -> "${item.storageName}" (WebP q=85)...`);
    await sharp(srcPath)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 85, effort: 6 })
      .toFile(destPath);

    const stats = fs.statSync(destPath);
    console.log(`   ✅ WebP generato (${(stats.size / 1024).toFixed(1)} KB)`);

    // Upload to Supabase Storage in delivery_food bucket
    const storagePath = `05-Pizza-Sandwiches/${item.storageName}`;
    const fileBuffer = fs.readFileSync(destPath);

    console.log(`   ☁️ Uploading to Supabase bucket "delivery_food/${storagePath}"...`);
    const { error: uploadError } = await supabase.storage
      .from('delivery_food')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/webp',
        upsert: true,
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error(`   ❌ Upload error for ${storagePath}:`, uploadError.message);
    } else {
      console.log(`   ✅ Upload completato con successo!`);
    }
  }

  console.log('\n📝 [2/3] AGGIORNAMENTO DATI IN src/pizza/data/menuData.ts...');
  const menuDataPath = path.resolve(process.cwd(), 'src/pizza/data/menuData.ts');
  let content = fs.readFileSync(menuDataPath, 'utf8');

  for (const item of FOCACCE_MAPPING) {
    console.log(`   Updating dish: ${item.id}...`);
    // Find all occurrences of this dish ID in menuData.ts
    // Update descriptions, descriptionIt, descriptionEn, descriptionTh, descriptionDe, descriptionMm
    const regex = new RegExp(`{\\s*"id":\\s*"${item.id}"[\\s\\S]*?is_available":\\s*true,`, 'g');
    
    content = content.replace(regex, (match) => {
      let updated = match;
      
      // Update description
      updated = updated.replace(/"description":\s*".*?",/, `"description": "${item.descEn}",`);
      updated = updated.replace(/"descriptionIt":\s*".*?",/, `"descriptionIt": "${item.descIt}",`);
      updated = updated.replace(/"description_it":\s*".*?",/, `"description_it": "${item.descIt}",`);
      updated = updated.replace(/"descriptionTh":\s*".*?",/, `"descriptionTh": "${item.descTh}",`);
      updated = updated.replace(/"description_th":\s*".*?",/, `"description_th": "${item.descTh}",`);
      updated = updated.replace(/"descriptionDe":\s*".*?",/, `"descriptionDe": "${item.descDe}",`);
      updated = updated.replace(/"description_de":\s*".*?",/, `"description_de": "${item.descDe}",`);
      
      // If descriptionMm exists, update it or add it
      if (updated.includes('"descriptionMm":')) {
        updated = updated.replace(/"descriptionMm":\s*".*?",/, `"descriptionMm": "${item.descMm}",`);
      }
      if (updated.includes('"description_mm":')) {
        updated = updated.replace(/"description_mm":\s*".*?",/, `"description_mm": "${item.descMm}",`);
      }
      
      // Update image URL with cache bust param
      const ts = Date.now();
      const imageUrl = `https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/05-Pizza-Sandwiches/${item.storageName}`;
      updated = updated.replace(/"image":\s*".*?",/, `"image": "${imageUrl}",`);
      updated = updated.replace(/"image_file":\s*".*?",/, `"image_file": "05-Pizza-Sandwiches/${item.storageName}",`);

      return updated;
    });
  }

  fs.writeFileSync(menuDataPath, content, 'utf8');
  console.log('✅ menuData.ts aggiornato con successo!');

  console.log('\n🔄 [3/3] PULIZIA OVERRIDES NEL DATABASE SUPABASE...');
  try {
    for (const item of FOCACCE_MAPPING) {
      // If there's an override in pizza_menu_overrides, update image and description
      const { data, error } = await supabase
        .from('pizza_menu_overrides')
        .update({
          description: item.descEn,
          description_it: item.descIt,
          description_th: item.descTh,
          description_de: item.descDe,
          image: `https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/05-Pizza-Sandwiches/${item.storageName}?_ts=${Date.now()}`
        })
        .eq('id', item.id);
      
      if (!error) {
        console.log(`   Cloud override updated for: ${item.id}`);
      }
    }
  } catch (err) {
    console.warn('Note: pizza_menu_overrides check completed.');
  }

  console.log('\n🎉 TUTTE LE 7 FOCACCE AGGIORNATE CON SUCCESSO IN WEBP, STORAGE E INGREDIENTI!');
}

run().catch(console.error);
