import fs from 'fs';
import path from 'path';

const SUPABASE_BASE_URL = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food';

const DISHES = [
  // 1. SPAGHETTI ALLO SCOGLIO
  {
    id: "spaghetti-allo-scoglio",
    categoryId: "pasta",
    name: "SEAFOOD SPAGHETTI (ALLO SCOGLIO)",
    nameTh: "สปาเก็ตตี้ซีฟู้ดสไตล์อิตาเลียน (อัลโล สโกกลิโอ)",
    nameIt: "SPAGHETTI ALLO SCOGLIO",
    nameDe: "MEERESFRÜCHTE SPAGHETTI (ALLO SCOGLIO)",
    name_it: "SPAGHETTI ALLO SCOGLIO",
    name_de: "MEERESFRÜCHTE SPAGHETTI (ALLO SCOGLIO)",
    description: "Durum wheat spaghetti, fresh prawns, mussels, clams, garlic, extra virgin olive oil, white wine, fresh parsley, salt, black pepper",
    descriptionTh: "เส้นสปาเก็ตตี้ดูรัมวีท, กุ้งสด, หอยแมลงภู่, หอยตลับ, กระเทียม, น้ำมันมะกอกบริสุทธิ์, ไวน์ขาว, พาร์สลีย์สด, เกลือ, พริกไทยดำ",
    descriptionIt: "Spaghetti di semola di grano duro, gamberi freschi, cozze, vongole, aglio, olio extravergine d'oliva, vino bianco, prezzemolo fresco, sale, pepe nero",
    descriptionDe: "Hartweizengrieß-Spaghetti, frische Garnelen, Miesmuscheln, Venusmuscheln, Knoblauch, natives Olivenöl extra, Weißwein, frische Petersilie, Salz, schwarzer Pfeffer",
    description_it: "Spaghetti di semola di grano duro, gamberi freschi, cozze, vongole, aglio, olio extravergine d'oliva, vino bianco, prezzemolo fresco, sale, pepe nero",
    description_de: "Hartweizengrieß-Spaghetti, frische Garnelen, Miesmuscheln, Venusmuscheln, Knoblauch, natives Olivenöl extra, Weißwein, frische Petersilie, Salz, schwarzer Pfeffer",
    price: 290,
    image: `${SUPABASE_BASE_URL}/02-Pasta/spaghetti-allo-scoglio.webp`,
    image_file: "02-Pasta/spaghetti-allo-scoglio.webp",
    variants: [
      { id: "var-scoglio-spaghetti", name: "Spaghetti", nameTh: "สปาเก็ตตี้", nameIt: "Spaghetti", nameDe: "Spaghetti", name_it: "Spaghetti", name_de: "Spaghetti", sku: "VAR-1-1", price: 290, priceModifier: 0 },
      { id: "var-scoglio-penne", name: "Penne", nameTh: "เพนเน่", nameIt: "Penne", nameDe: "Penne", name_it: "Penne", name_de: "Penne", sku: "VAR-1-2", price: 290, priceModifier: 0 },
      { id: "var-scoglio-linguine", name: "Linguine", nameTh: "ลิงกวินี", nameIt: "Linguine", nameDe: "Linguine", name_it: "Linguine", name_de: "Linguine", sku: "VAR-1-3", price: 290, priceModifier: 0 },
      { id: "var-scoglio-tagliatelle", name: "Tagliatelle fatte in casa", nameTh: "ตัลยาเตลเล่โฮมเมด", nameIt: "Tagliatelle fatte in casa", nameDe: "Hausgemachte Tagliatelle", name_it: "Tagliatelle fatte in casa", name_de: "Hausgemachte Tagliatelle", sku: "VAR-1-4", price: 290, priceModifier: 0 },
      { id: "var-scoglio-gnocchi", name: "Gnocchi artigianali", nameTh: "ญ็อกกี้สด", nameIt: "Gnocchi artigianali", nameDe: "Handgemachte Gnocchi", name_it: "Gnocchi artigianali", name_de: "Handgemachte Gnocchi", sku: "VAR-1-5", price: 310, priceModifier: 20 },
      { id: "var-scoglio-ravioli", name: "Ravioli ripieni", nameTh: "ราวิโอลีสอดไส้", nameIt: "Ravioli ripieni", nameDe: "Gefüllte Ravioli", name_it: "Ravioli ripieni", name_de: "Gefüllte Ravioli", sku: "VAR-1-6", price: 350, priceModifier: 60 }
    ]
  },
  // 2. PENNE AL SALMONE
  {
    id: "penne-al-salmone",
    categoryId: "pasta",
    name: "PENNE WITH SALMON CREAM SAUCE",
    nameTh: "เพนเน่ซอสครีมแซลมอน",
    nameIt: "PENNE AL SALMONE",
    nameDe: "PENNE MIT LACHS-SAHNESAUCE",
    name_it: "PENNE AL SALMONE",
    name_de: "PENNE MIT LACHS-SAHNESAUCE",
    description: "Durum wheat penne rigate, salmon fillet, cream sauce, tomato pulp, garlic, extra virgin olive oil, fresh parsley, salt, black pepper",
    descriptionTh: "เส้นเพนเน่ดูรัมวีท, เนื้อปลาแซลมอน, ครีมสด, ซอสมะเขือเทศเข้มข้น, กระเทียม, น้ำมันมะกอกบริสุทธิ์, พาร์สลีย์สด, เกลือ, พริกไทยดำ",
    descriptionIt: "Penne rigate di semola di grano duro, filetto di salmone, panna da cucina, polpa di pomodoro, aglio, olio extravergine d'oliva, prezzemolo fresco, sale, pepe nero",
    descriptionDe: "Hartweizengrieß-Penne, Lachsfilet, Kochsahne, Tomatenfruchtfleisch, Knoblauch, natives Olivenöl extra, frische Petersilie, Salz, schwarzer Pfeffer",
    description_it: "Penne rigate di semola di grano duro, filetto di salmone, panna da cucina, polpa di pomodoro, aglio, olio extravergine d'oliva, prezzemolo fresco, sale, pepe nero",
    description_de: "Hartweizengrieß-Penne, Lachsfilet, Kochsahne, Tomatenfruchtfleisch, Knoblauch, natives Olivenöl extra, frische Petersilie, Salz, schwarzer Pfeffer",
    price: 290,
    image: `${SUPABASE_BASE_URL}/02-Pasta/penne-al-salmone.webp`,
    image_file: "02-Pasta/penne-al-salmone.webp",
    variants: [
      { id: "var-salmone-penne", name: "Penne", nameTh: "เพนเน่", nameIt: "Penne", nameDe: "Penne", name_it: "Penne", name_de: "Penne", sku: "VAR-2-1", price: 290, priceModifier: 0 },
      { id: "var-salmone-spaghetti", name: "Spaghetti", nameTh: "สปาเก็ตตี้", nameIt: "Spaghetti", nameDe: "Spaghetti", name_it: "Spaghetti", name_de: "Spaghetti", sku: "VAR-2-2", price: 290, priceModifier: 0 },
      { id: "var-salmone-linguine", name: "Linguine", nameTh: "ลิงกวินี", nameIt: "Linguine", nameDe: "Linguine", name_it: "Linguine", name_de: "Linguine", sku: "VAR-2-3", price: 290, priceModifier: 0 },
      { id: "var-salmone-tagliatelle", name: "Tagliatelle fatte in casa", nameTh: "ตัลยาเตลเล่โฮมเมด", nameIt: "Tagliatelle fatte in casa", nameDe: "Hausgemachte Tagliatelle", name_it: "Tagliatelle fatte in casa", name_de: "Hausgemachte Tagliatelle", sku: "VAR-2-4", price: 290, priceModifier: 0 },
      { id: "var-salmone-gnocchi", name: "Gnocchi artigianali", nameTh: "ญ็อกกี้สด", nameIt: "Gnocchi artigianali", nameDe: "Handgemachte Gnocchi", name_it: "Gnocchi artigianali", name_de: "Handgemachte Gnocchi", sku: "VAR-2-5", price: 310, priceModifier: 20 },
      { id: "var-salmone-ravioli", name: "Ravioli ripieni", nameTh: "ราวิโอลีสอดไส้", nameIt: "Ravioli ripieni", nameDe: "Gefüllte Ravioli", name_it: "Ravioli ripieni", name_de: "Gefüllte Ravioli", sku: "VAR-2-6", price: 350, priceModifier: 60 }
    ]
  },
  // 3. RAVIOLI ALLA CREMA DI GAMBERI
  {
    id: "ravioli-alla-crema-di-gamberi",
    categoryId: "pasta",
    name: "HOMEMADE RAVIOLI WITH PRAWN BISQUE CREAM",
    nameTh: "ราวิโอลีโฮมเมดซอสครีมกุ้งและบิสก์",
    nameIt: "RAVIOLI ALLA CREMA DI GAMBERI",
    nameDe: "HAUSGEMACHTE RAVIOLI MIT GARNELEN-BISQUE-CREME",
    name_it: "RAVIOLI ALLA CREMA DI GAMBERI",
    name_de: "HAUSGEMACHTE RAVIOLI MIT GARNELEN-BISQUE-CREME",
    description: "Fresh egg stuffed ravioli, prawn tails, crustacean bisque, cooking cream, garlic, extra virgin olive oil, fresh parsley, salt, white pepper",
    descriptionTh: "ราวิโอลีแป้งไข่สดโฮมเมด, เนื้อกุ้งสด, ซอสบิสก์กุ้งเข้มข้น, ครีมสด, กระเทียม, น้ำมันมะกอกบริสุทธิ์, พาร์สลีย์สด, เกลือ, พริกไทยขาว",
    descriptionIt: "Ravioli freschi ripieni all'uovo, code di gambero, bisque di crostacei, panna da cucina, aglio, olio extravergine d'oliva, prezzemolo fresco, sale, pepe bianco",
    descriptionDe: "Frische gefüllte Eier-Ravioli, Garnelenschwänze, Krustentier-Bisque, Kochsahne, Knoblauch, natives Olivenöl extra, frische Petersilie, Salz, weißer Pfeffer",
    description_it: "Ravioli freschi ripieni all'uovo, code di gambero, bisque di crostacei, panna da cucina, aglio, olio extravergine d'oliva, prezzemolo fresco, sale, pepe bianco",
    description_de: "Frische gefüllte Eier-Ravioli, Garnelenschwänze, Krustentier-Bisque, Kochsahne, Knoblauch, natives Olivenöl extra, frische Petersilie, Salz, weißer Pfeffer",
    price: 300,
    image: `${SUPABASE_BASE_URL}/02-Pasta/ravioli-alla-crema-di-gamberi.webp`,
    image_file: "02-Pasta/ravioli-alla-crema-di-gamberi.webp",
    variants: [
      { id: "var-cremagamberi-ravioli", name: "Ravioli ripieni", nameTh: "ราวิโอลีสอดไส้", nameIt: "Ravioli ripieni", nameDe: "Gefüllte Ravioli", name_it: "Ravioli ripieni", name_de: "Gefüllte Ravioli", sku: "VAR-3-1", price: 300, priceModifier: 0 },
      { id: "var-cremagamberi-tagliatelle", name: "Tagliatelle fatte in casa", nameTh: "ตัลยาเตลเล่โฮมเมด", nameIt: "Tagliatelle fatte in casa", nameDe: "Hausgemachte Tagliatelle", name_it: "Tagliatelle fatte in casa", name_de: "Hausgemachte Tagliatelle", sku: "VAR-3-2", price: 250, priceModifier: -50 },
      { id: "var-cremagamberi-spaghetti", name: "Spaghetti", nameTh: "สปาเก็ตตี้", nameIt: "Spaghetti", nameDe: "Spaghetti", name_it: "Spaghetti", name_de: "Spaghetti", sku: "VAR-3-3", price: 250, priceModifier: -50 },
      { id: "var-cremagamberi-penne", name: "Penne", nameTh: "เพนเน่", nameIt: "Penne", nameDe: "Penne", name_it: "Penne", name_de: "Penne", sku: "VAR-3-4", price: 250, priceModifier: -50 },
      { id: "var-cremagamberi-linguine", name: "Linguine", nameTh: "ลิงกวินี", nameIt: "Linguine", nameDe: "Linguine", name_it: "Linguine", name_de: "Linguine", sku: "VAR-3-5", price: 250, priceModifier: -50 },
      { id: "var-cremagamberi-gnocchi", name: "Gnocchi artigianali", nameTh: "ญ็อกกี้สด", nameIt: "Gnocchi artigianali", nameDe: "Handgemachte Gnocchi", name_it: "Gnocchi artigianali", name_de: "Handgemachte Gnocchi", sku: "VAR-3-6", price: 260, priceModifier: -40 }
    ]
  },
  // 4. RAVIOLI AL SUGO DI NOCI
  {
    id: "ravioli-al-sugo-di-noci",
    categoryId: "pasta",
    name: "HOMEMADE RAVIOLI WITH LIGURIAN WALNUT SAUCE",
    nameTh: "ราวิโอลีโฮมเมดซอสครีมวอลนัทสไตล์ลิกูเรีย",
    nameIt: "RAVIOLI AL SUGO DI NOCI",
    nameDe: "HAUSGEMACHTE RAVIOLI MIT LIGURISCHER WALNUSSSAUCE",
    name_it: "RAVIOLI AL SUGO DI NOCI",
    name_de: "HAUSGEMACHTE RAVIOLI MIT LIGURISCHER WALNUSSSAUCE",
    description: "Fresh egg stuffed ravioli, walnut kernels, milk, breadcrumbs, Parmigiano Reggiano DOP, garlic, extra virgin olive oil, nutmeg, salt",
    descriptionTh: "ราวิโอลีแป้งไข่สดโฮมเมด, ถั่ววอลนัท, นมสด, พาร์มีเจียโน เรจจาโน DOP, กระเทียม, น้ำมันมะกอกบริสุทธิ์, ลูกจันทน์เทศ, เกลือ",
    descriptionIt: "Ravioli freschi ripieni all'uovo, gherigli di noce, latte, pane raffermo, Parmigiano Reggiano DOP, aglio, olio extravergine d'oliva, noce moscata, sale",
    descriptionDe: "Frische gefüllte Eier-Ravioli, Walnusskerne, Milch, Altbrot, Parmigiano Reggiano DOP, Knoblauch, natives Olivenöl extra, Muskatnuss, Salz",
    description_it: "Ravioli freschi ripieni all'uovo, gherigli di noce, latte, pane raffermo, Parmigiano Reggiano DOP, aglio, olio extravergine d'oliva, noce moscata, sale",
    description_de: "Frische gefüllte Eier-Ravioli, Walnusskerne, Milch, Altbrot, Parmigiano Reggiano DOP, Knoblauch, natives Olivenöl extra, Muskatnuss, Salz",
    price: 260,
    image: `${SUPABASE_BASE_URL}/02-Pasta/ravioli-al-sugo-di-noci.webp`,
    image_file: "02-Pasta/ravioli-al-sugo-di-noci.webp",
    variants: [
      { id: "var-noci-ravioli", name: "Ravioli ripieni", nameTh: "ราวิโอลีสอดไส้", nameIt: "Ravioli ripieni", nameDe: "Gefüllte Ravioli", name_it: "Ravioli ripieni", name_de: "Gefüllte Ravioli", sku: "VAR-4-1", price: 260, priceModifier: 0 },
      { id: "var-noci-tagliatelle", name: "Tagliatelle fatte in casa", nameTh: "ตัลยาเตลเล่โฮมเมด", nameIt: "Tagliatelle fatte in casa", nameDe: "Hausgemachte Tagliatelle", name_it: "Tagliatelle fatte in casa", name_de: "Hausgemachte Tagliatelle", sku: "VAR-4-2", price: 200, priceModifier: -60 },
      { id: "var-noci-gnocchi", name: "Gnocchi artigianali", nameTh: "ญ็อกกี้สด", nameIt: "Gnocchi artigianali", nameDe: "Handgemachte Gnocchi", name_it: "Gnocchi artigianali", name_de: "Handgemachte Gnocchi", sku: "VAR-4-3", price: 220, priceModifier: -40 },
      { id: "var-noci-spaghetti", name: "Spaghetti", nameTh: "สปาเก็ตตี้", nameIt: "Spaghetti", nameDe: "Spaghetti", name_it: "Spaghetti", name_de: "Spaghetti", sku: "VAR-4-4", price: 180, priceModifier: -80 },
      { id: "var-noci-penne", name: "Penne", nameTh: "เพนเน่", nameIt: "Penne", nameDe: "Penne", name_it: "Penne", name_de: "Penne", sku: "VAR-4-5", price: 180, priceModifier: -80 },
      { id: "var-noci-linguine", name: "Linguine", nameTh: "ลิงกวินี", nameIt: "Linguine", nameDe: "Linguine", name_it: "Linguine", name_de: "Linguine", sku: "VAR-4-6", price: 180, priceModifier: -80 }
    ]
  },
  // 5. TAGLIATELLE AL NERO DI SEPPIA E CALAMARI
  {
    id: "tagliatelle-al-nero-di-seppia-e-calamari",
    categoryId: "pasta",
    name: "HOMEMADE TAGLIATELLE WITH SQUID INK & SQUID",
    nameTh: "ตัลยาเตลเล่เส้นสดซอสหมึกดำและปลาหมึก",
    nameIt: "TAGLIATELLE AL NERO DI SEPPIA E CALAMARI",
    nameDe: "HAUSGEMACHTE TAGLIATELLE MIT TINTENFISCHTINTE & KALMAREN",
    name_it: "TAGLIATELLE AL NERO DI SEPPIA E CALAMARI",
    name_de: "HAUSGEMACHTE TAGLIATELLE MIT TINTENFISCHTINTE & KALMAREN",
    description: "Fresh homemade egg tagliatelle, fresh tender squid, natural cuttlefish squid ink, garlic, dry white wine, extra virgin olive oil, fresh parsley, salt, black pepper",
    descriptionTh: "เส้นตัลยาเตลเล่สดโฮมเมด, ปลาหมึกสด, ซอสหมึกดำธรรมชาติ, กระเทียม, ไวน์ขาว, น้ำมันมะกอกบริสุทธิ์, พาร์สลีย์สด, เกลือ, พริกไทยดำ",
    descriptionIt: "Tagliatelle fresche all'uovo, calamari freschi, nero di seppia naturale, aglio, vino bianco secco, olio extravergine d'oliva, prezzemolo fresco, sale, pepe nero",
    descriptionDe: "Frische Eier-Tagliatelle, zarte Calamari, natürliche Tintenfischtinte, Knoblauch, trockener Weißwein, natives Olivenöl extra, frische Petersilie, Salz, schwarzer Pfeffer",
    description_it: "Tagliatelle fresche all'uovo, calamari freschi, nero di seppia naturale, aglio, vino bianco secco, olio extravergine d'oliva, prezzemolo fresco, sale, pepe nero",
    description_de: "Frische Eier-Tagliatelle, zarte Calamari, natürliche Tintenfischtinte, Knoblauch, trockener Weißwein, natives Olivenöl extra, frische Petersilie, Salz, schwarzer Pfeffer",
    price: 250,
    image: `${SUPABASE_BASE_URL}/02-Pasta/tagliatelle-al-nero-di-seppia-e-calamari.webp`,
    image_file: "02-Pasta/tagliatelle-al-nero-di-seppia-e-calamari.webp",
    variants: [
      { id: "var-neroseppia-tagliatelle", name: "Tagliatelle fatte in casa", nameTh: "ตัลยาเตลเล่โฮมเมด", nameIt: "Tagliatelle fatte in casa", nameDe: "Hausgemachte Tagliatelle", name_it: "Tagliatelle fatte in casa", name_de: "Hausgemachte Tagliatelle", sku: "VAR-5-1", price: 250, priceModifier: 0 },
      { id: "var-neroseppia-spaghetti", name: "Spaghetti", nameTh: "สปาเก็ตตี้", nameIt: "Spaghetti", nameDe: "Spaghetti", name_it: "Spaghetti", name_de: "Spaghetti", sku: "VAR-5-2", price: 250, priceModifier: 0 },
      { id: "var-neroseppia-penne", name: "Penne", nameTh: "เพนเน่", nameIt: "Penne", nameDe: "Penne", name_it: "Penne", name_de: "Penne", sku: "VAR-5-3", price: 250, priceModifier: 0 },
      { id: "var-neroseppia-linguine", name: "Linguine", nameTh: "ลิงกวินี", nameIt: "Linguine", nameDe: "Linguine", name_it: "Linguine", name_de: "Linguine", sku: "VAR-5-4", price: 250, priceModifier: 0 },
      { id: "var-neroseppia-gnocchi", name: "Gnocchi artigianali", nameTh: "ญ็อกกี้สด", nameIt: "Gnocchi artigianali", nameDe: "Handgemachte Gnocchi", name_it: "Gnocchi artigianali", name_de: "Handgemachte Gnocchi", sku: "VAR-5-5", price: 260, priceModifier: 10 },
      { id: "var-neroseppia-ravioli", name: "Ravioli ripieni", nameTh: "ราวิโอลีสอดไส้", nameIt: "Ravioli ripieni", nameDe: "Gefüllte Ravioli", name_it: "Ravioli ripieni", name_de: "Gefüllte Ravioli", sku: "VAR-5-6", price: 300, priceModifier: 50 }
    ]
  },
  // 6. SPAGHETTI ALLA POLPA DI GRANCHIO
  {
    id: "spaghetti-alla-polpa-di-granchio",
    categoryId: "pasta",
    name: "SPAGHETTI WITH REAL CRAB MEAT & CHERRY TOMATOES",
    nameTh: "สปาเก็ตตี้เนื้อปูม้าสดและมะเขือเทศเชอร์รี่",
    nameIt: "SPAGHETTI ALLA POLPA DI GRANCHIO",
    nameDe: "SPAGHETTI MIT FRISCHEM KRABBENFLEISCH & KIRSCHTOMATEN",
    name_it: "SPAGHETTI ALLA POLPA DI GRANCHIO",
    name_de: "SPAGHETTI MIT FRISCHEM KRABBENFLEISCH & KIRSCHTOMATEN",
    description: "Durum wheat spaghetti, tender blue crab meat, whole crab claws, fresh cherry tomatoes, garlic, white wine, extra virgin olive oil, fresh parsley, salt, mild chili",
    descriptionTh: "เส้นสปาเก็ตตี้ดูรัมวีท, เนื้อปูม้าสด, ก้ามปู, มะเขือเทศเชอร์รี่สด, กระเทียม, ไวน์ขาว, น้ำมันมะกอกบริสุทธิ์, พาร์สลีย์สด, เกลือ, พริกเล็กน้อย",
    descriptionIt: "Spaghetti di semola di grano duro, polpa di granchio, chele di granchio, pomodorini freschi, aglio, vino bianco, olio extravergine d'oliva, prezzemolo fresco, sale, peperoncino",
    descriptionDe: "Hartweizengrieß-Spaghetti, Krabbenfleisch, Krebsscheren, frische Kirschtomaten, Knoblauch, Weißwein, natives Olivenöl extra, frische Petersilie, Salz, milder Chili",
    description_it: "Spaghetti di semola di grano duro, polpa di granchio, chele di granchio, pomodorini freschi, aglio, vino bianco, olio extravergine d'oliva, prezzemolo fresco, sale, peperoncino",
    description_de: "Hartweizengrieß-Spaghetti, Krabbenfleisch, Krebsscheren, frische Kirschtomaten, Knoblauch, Weißwein, natives Olivenöl extra, frische Petersilie, Salz, milder Chili",
    price: 320,
    image: `${SUPABASE_BASE_URL}/02-Pasta/spaghetti-alla-polpa-di-granchio.webp`,
    image_file: "02-Pasta/spaghetti-alla-polpa-di-granchio.webp",
    variants: [
      { id: "var-granchio-spaghetti", name: "Spaghetti", nameTh: "สปาเก็ตตี้", nameIt: "Spaghetti", nameDe: "Spaghetti", name_it: "Spaghetti", name_de: "Spaghetti", sku: "VAR-6-1", price: 320, priceModifier: 0 },
      { id: "var-granchio-penne", name: "Penne", nameTh: "เพนเน่", nameIt: "Penne", nameDe: "Penne", name_it: "Penne", name_de: "Penne", sku: "VAR-6-2", price: 320, priceModifier: 0 },
      { id: "var-granchio-linguine", name: "Linguine", nameTh: "ลิงกวินี", nameIt: "Linguine", nameDe: "Linguine", name_it: "Linguine", name_de: "Linguine", sku: "VAR-6-3", price: 320, priceModifier: 0 },
      { id: "var-granchio-tagliatelle", name: "Tagliatelle fatte in casa", nameTh: "ตัลยาเตลเล่โฮมเมด", nameIt: "Tagliatelle fatte in casa", nameDe: "Hausgemachte Tagliatelle", name_it: "Tagliatelle fatte in casa", name_de: "Hausgemachte Tagliatelle", sku: "VAR-6-4", price: 320, priceModifier: 0 },
      { id: "var-granchio-gnocchi", name: "Gnocchi artigianali", nameTh: "ญ็อกกี้สด", nameIt: "Gnocchi artigianali", nameDe: "Handgemachte Gnocchi", name_it: "Gnocchi artigianali", name_de: "Handgemachte Gnocchi", sku: "VAR-6-5", price: 340, priceModifier: 20 },
      { id: "var-granchio-ravioli", name: "Ravioli ripieni", nameTh: "ราวิโอลีสอดไส้", nameIt: "Ravioli ripieni", nameDe: "Gefüllte Ravioli", name_it: "Ravioli ripieni", name_de: "Gefüllte Ravioli", sku: "VAR-6-6", price: 370, priceModifier: 50 }
    ]
  },
  // 7. PIZZA CON POLPA DI GRANCHIO
  {
    id: "pizza-con-polpa-di-granchio",
    categoryId: "traditional-italian-pizza",
    name: "GOURMET CRAB MEAT PIZZA",
    nameTh: "พิซซ่าเนื้อปูม้าสดสไตล์กูร์เมต์",
    nameIt: "PIZZA CON POLPA DI GRANCHIO",
    nameDe: "GOURMET PIZZA MIT KRABBENFLEISCH",
    name_it: "PIZZA CON POLPA DI GRANCHIO",
    name_de: "GOURMET PIZZA MIT KRABBENFLEISCH",
    description: "Italian type 0 flour dough, sourdough yeast, water, Italian tomato sauce, fiordilatte mozzarella, fresh crab meat, green spring onion, extra virgin olive oil, salt",
    descriptionTh: "แป้งพิซซ่าอิตาเลียนหมักยีสต์ธรรมชาติ, ซอสมะเขือเทศอิตาลี, มอสซาเรลล่าชีสสด, เนื้อปูม้าสด, ต้นหอมซอย, น้ำมันมะกอกบริสุทธิ์, เกลือ",
    descriptionIt: "Farina di grano tipo 0, lievito madre, acqua, salsa di pomodoro italiano, mozzarella fior di latte, polpa di granchio, cipollotto verde, olio extravergine d'oliva, sale",
    descriptionDe: "Italienischer Hefeteig, italienische Tomatensauce, Fior di Latte Mozzarella, zartes Krabbenfleisch, Frühlingszwiebeln, natives Olivenöl extra, Salz",
    description_it: "Farina di grano tipo 0, lievito madre, acqua, salsa di pomodoro italiano, mozzarella fior di latte, polpa di granchio, cipollotto verde, olio extravergine d'oliva, sale",
    description_de: "Italienischer Hefeteig, italienische Tomatensauce, Fior di Latte Mozzarella, zartes Krabbenfleisch, Frühlingszwiebeln, natives Olivenöl extra, Salz",
    price: 350,
    image: `${SUPABASE_BASE_URL}/01-Pizza/pizza-con-polpa-di-granchio.webp`,
    image_file: "01-Pizza/pizza-con-polpa-di-granchio.webp"
  },
  // 8. PIZZA RUSTICA CON SALSICCIA E STILACCI
  {
    id: "pizza-rustica-con-salsiccia-e-stilacci",
    categoryId: "traditional-italian-pizza",
    name: "RUSTIC PIZZA WITH ITALIAN SAUSAGE & STILACCI GREENS",
    nameTh: "พิซซ่ารัสติกาไส้กรอกหมูอิตาเลียนและผักสตีลัชชี",
    nameIt: "PIZZA RUSTICA CON SALSICCIA E STILACCI",
    nameDe: "RUSTIKALE PIZZA MIT ITALIENISCHER SALSICCIA & STILACCI",
    name_it: "PIZZA RUSTICA CON SALSICCIA E STILACCI",
    name_de: "RUSTIKALE PIZZA MIT ITALIENISCHER SALSICCIA & STILACCI",
    description: "Italian sourdough crust, fiordilatte mozzarella, fresh seasoned Italian pork sausage, sautéed stilacci greens, garlic, extra virgin olive oil, salt, black pepper",
    descriptionTh: "แป้งพิซซ่าอิตาเลียนหมักยีสต์ธรรมชาติ, มอสซาเรลล่าชีสสด, ไส้กรอกหมูอิตาเลียนสด, ผักสตีลัชชีผัดกระเทียม, น้ำมันมะกอกบริสุทธิ์, เกลือ, พริกไทยดำ",
    descriptionIt: "Farina di grano tipo 0, lievito madre, acqua, mozzarella fior di latte, salsiccia fresca di maiale, stilacci, aglio, olio extravergine d'oliva, sale, pepe nero",
    descriptionDe: "Italienischer Sauerteigboden, Fior di Latte Mozzarella, frische italienische Schweinesalsiccia, gedünstetes Stilacci-Gemüse, Knoblauch, natives Olivenöl extra, Salz, schwarzer Pfeffer",
    description_it: "Farina di grano tipo 0, lievito madre, acqua, mozzarella fior di latte, salsiccia fresca di maiale, stilacci, aglio, olio extravergine d'oliva, sale, pepe nero",
    description_de: "Italienischer Sauerteigboden, Fior di Latte Mozzarella, frische italienische Schweinesalsiccia, gedünstetes Stilacci-Gemüse, Knoblauch, natives Olivenöl extra, Salz, schwarzer Pfeffer",
    price: 350,
    image: `${SUPABASE_BASE_URL}/01-Pizza/pizza-rustica-con-salsiccia-e-stilacci.webp`,
    image_file: "01-Pizza/pizza-rustica-con-salsiccia-e-stilacci.webp"
  },
  // 9. COTOLETTA ALLA MILANESE CON PATATINE FRITTE (Daily Special)
  {
    id: "cotoletta-alla-milanese-con-patatine-fritte",
    categoryId: "daily-specials",
    name: "CRISPY MILANESE CUTLET WITH FRENCH FRIES",
    nameTh: "มิลานีสคัตเล็ตหมูชุบเกล็ดขนมปังทอดพร้อมเฟรนช์ฟรายส์",
    nameIt: "COTOLETTA ALLA MILANESE CON PATATINE FRITTE",
    nameDe: "MAILÄNDER SCHNITZEL MIT POMMES FRITES",
    name_it: "COTOLETTA ALLA MILANESE CON PATATINE FRITTE",
    name_de: "MAILÄNDER SCHNITZEL MIT POMMES FRITES",
    description: "Tender breaded pork loin cutlet, fresh eggs, crispy breadcrumbs, golden french fries, frying oil, fresh lemon wedges, salt",
    descriptionTh: "เนื้อหมูสันนอกชุบไข่สดและเกล็ดขนมปังทอดกรอบ, เฟรนช์ฟรายส์สีทอง, เลมอนสด, เกลือ",
    descriptionIt: "Lonza di maiale, uova fresche, pangrattato, patate fritte, olio per frittura, limone fresco, sale",
    descriptionDe: "Paniertes Schweinelenden-Schnitzel nach Mailänder Art, frische Eier, knuspriges Paniermehl, knusprige Pommes Frites, frische Zitrone, Salz",
    description_it: "Lonza di maiale, uova fresche, pangrattato, patate fritte, olio per frittura, limone fresco, sale",
    description_de: "Paniertes Schweinelenden-Schnitzel nach Mailänder Art, frische Eier, knuspriges Paniermehl, knusprige Pommes Frites, frische Zitrone, Salz",
    price: 220,
    image: `${SUPABASE_BASE_URL}/03-Daily-Specials/cotoletta-alla-milanese-con-patatine-fritte.webp`,
    image_file: "03-Daily-Specials/cotoletta-alla-milanese-con-patatine-fritte.webp"
  },
  // 10. COTECHINO ARTIGIANALE CON PURÈ DI PATATE (Daily Special)
  {
    id: "cotechino-artigianale-con-pure-di-patate",
    categoryId: "daily-specials",
    name: "ARTISANAL ITALIAN COTECHINO WITH MASHED POTATOES",
    nameTh: "ไส้กรอกโคเตคิโนอิตาเลียนโบราณพร้อมมันบดเนื้อเนียน",
    nameIt: "COTECHINO ARTIGIANALE CON PURÈ DI PATATE",
    nameDe: "TRADITIONELLER ITALIENISCHER COTECHINO MIT KARTOFFELPÜREE",
    name_it: "COTECHINO ARTIGIANALE CON PURÈ DI PATATE",
    name_de: "TRADITIONELLER ITALIENISCHER COTECHINO MIT KARTOFFELPÜREE",
    description: "Traditional spiced Italian artisanal pork cotechino, creamy mashed potatoes, whole milk, dairy butter, nutmeg, salt, black pepper",
    descriptionTh: "ไส้กรอกหมูโคเตคิโนสูตรดั้งเดิมอิตาลี, มันฝรั่งบดเนียนนุ่ม, นมสด, เนยแท้, ลูกจันทน์เทศ, เกลือ, พริกไทยดำ",
    descriptionIt: "Cotechino di maiale speziato, patate, latte intero, burro vaccino, noce moscata, sale, pepe nero",
    descriptionDe: "Würzige handwerkliche italienische Cotechino-Wurst, cremiges Kartoffelpüree, Vollmilch, Butter, Muskatnuss, Salz, schwarzer Pfeffer",
    description_it: "Cotechino di maiale speziato, patate, latte intero, burro vaccino, noce moscata, sale, pepe nero",
    description_de: "Würzige handwerkliche italienische Cotechino-Wurst, cremiges Kartoffelpüree, Vollmilch, Butter, Muskatnuss, Salz, schwarzer Pfeffer",
    price: 250,
    image: `${SUPABASE_BASE_URL}/03-Daily-Specials/cotechino-artigianale-con-pure-di-patate.webp`,
    image_file: "03-Daily-Specials/cotechino-artigianale-con-pure-di-patate.webp"
  },
  // 11. TORTA PASQUALINA AGLI SPINACI E UOVA
  {
    id: "torta-pasqualina-agli-spinaci-e-uova",
    categoryId: "french-fries",
    name: "TORTA PASQUALINA (SAVORY SPINACH & RICOTTA PIE)",
    nameTh: "พายตอร์ตา ปาสควาลินา ไส้ผักโขม ริคอตต้า และไข่ต้ม",
    nameIt: "TORTA PASQUALINA AGLI SPINACI E UOVA",
    nameDe: "TORTA PASQUALINA (HERZHAFTE SPINAT- & RICOTTA-TORTE)",
    name_it: "TORTA PASQUALINA AGLI SPINACI E UOVA",
    name_de: "TORTA PASQUALINA (HERZHAFTE SPINAT- & RICOTTA-TORTE)",
    description: "Flaky puff pastry, fresh spinach, creamy cow's milk ricotta, whole hard-boiled eggs, aged grated cheese, nutmeg, extra virgin olive oil, salt, black pepper",
    descriptionTh: "แป้งพัฟเพสตรีกรอบ, ผักโขมสด, ริคอตต้าชีส, ไข่ต้มทั้งฟอง, พาร์มีซานชีส, ลูกจันทน์เทศ, น้ำมันมะกอกบริสุทธิ์, เกลือ, พริกไทยดำ",
    descriptionIt: "Pasta sfoglia, spinaci, ricotta vaccina, uova sode intere, formaggio grattugiato stagionato, noce moscata, olio extravergine d'oliva, sale, pepe nero",
    descriptionDe: "Blätterteig, frischer Spinat, Kuhmilch-Ricotta, ganze gekochte Eier, gereifter Reibekäse, Muskatnuss, natives Olivenöl extra, Salz, schwarzer Pfeffer",
    description_it: "Pasta sfoglia, spinaci, ricotta vaccina, uova sode intere, formaggio grattugiato stagionato, noce moscata, olio extravergine d'oliva, sale, pepe nero",
    description_de: "Blätterteig, frischer Spinat, Kuhmilch-Ricotta, ganze gekochte Eier, gereifter Reibekäse, Muskatnuss, natives Olivenöl extra, Salz, schwarzer Pfeffer",
    price: 180,
    image: `${SUPABASE_BASE_URL}/07-French-Fries/torta-pasqualina-agli-spinaci-e-uova.webp`,
    image_file: "07-French-Fries/torta-pasqualina-agli-spinaci-e-uova.webp"
  },
  // 12. FOCACCIA PIZZA SANDWICH CON FINOCCHIONA
  {
    id: "focaccia-pizza-sandwich-con-finocchiona",
    categoryId: "pizza-sandwich",
    name: "FOCACCIA PIZZA SANDWICH WITH TUSCAN FINOCCHIONA",
    nameTh: "ฟอคคาเซีย พิตซ่าแซนด์วิช ซาลามีฟินอคคิโอนา",
    nameIt: "FOCACCIA PIZZA SANDWICH CON FINOCCHIONA",
    nameDe: "FOCACCIA PIZZA SANDWICH MIT TOSKANISCHER FINOCCHIONA",
    name_it: "FOCACCIA PIZZA SANDWICH CON FINOCCHIONA",
    name_de: "FOCACCIA PIZZA SANDWICH MIT TOSKANISCHER FINOCCHIONA",
    description: "Freshly baked pizza dough focaccia with extra virgin olive oil, Tuscan fennel salami (finocchiona), mild string cheese, sliced fresh tomato, crisp lettuce",
    descriptionTh: "แป้งฟอคคาเซียพิซซ่าอบสดน้ำมันมะกอกบริสุทธิ์, ซาลามีฟินอคคิโอนาสไตล์ทัสคานี, ชีสยืดรสนุ่ม, มะเขือเทศสดหั่นแว่น, ผักกาดแก้ว",
    descriptionIt: "Focaccia da impasto pizza all'olio extravergine d'oliva, finocchiona toscana, formaggio dolce a pasta filata, pomodoro fresco a fette, lattuga gentile",
    descriptionDe: "Ofenfrische Pizza-Focaccia mit nativem Olivenöl extra, toskanische Fenchel-Finocchiona-Salami, milder Schnittkäse, frische Tomatenscheiben, knackiger Salat",
    description_it: "Focaccia da impasto pizza all'olio extravergine d'oliva, finocchiona toscana, formaggio dolce a pasta filata, pomodoro fresco a fette, lattuga gentile",
    description_de: "Ofenfrische Pizza-Focaccia mit nativem Olivenöl extra, toskanische Fenchel-Finocchiona-Salami, milder Schnittkäse, frische Tomatenscheiben, knackiger Salat",
    price: 230,
    image: `${SUPABASE_BASE_URL}/05-Pizza-Sandwiches/focaccia-pizza-sandwich-con-finocchiona.webp`,
    image_file: "05-Pizza-Sandwiches/focaccia-pizza-sandwich-con-finocchiona.webp"
  },
  // 13. FOCACCIA PIZZA SANDWICH CON PANCETTA ARROTOLATA
  {
    id: "focaccia-pizza-sandwich-con-pancetta-arrotolata",
    categoryId: "pizza-sandwich",
    name: "FOCACCIA PIZZA SANDWICH WITH ROLLED ITALIAN PANCETTA",
    nameTh: "ฟอคคาเซีย พิตซ่าแซนด์วิช ปานเชตตาม้วนอิตาเลียน",
    nameIt: "FOCACCIA PIZZA SANDWICH CON PANCETTA ARROTOLATA",
    nameDe: "FOCACCIA PIZZA SANDWICH MIT GEROLLTER PANCETTA",
    name_it: "FOCACCIA PIZZA SANDWICH CON PANCETTA ARROTOLATA",
    name_de: "FOCACCIA PIZZA SANDWICH MIT GEROLLTER PANCETTA",
    description: "Freshly baked pizza dough focaccia with extra virgin olive oil, Italian cured rolled pancetta, mild string cheese, sliced fresh tomato, crisp lettuce",
    descriptionTh: "แป้งฟอคคาเซียพิซซ่าอบสดน้ำมันมะกอกบริสุทธิ์, เบคอนปานเชตตาม้วนอิตาเลียน, ชีสยืดรสนุ่ม, มะเขือเทศสดหั่นแว่น, ผักกาดแก้ว",
    descriptionIt: "Focaccia da impasto pizza all'olio extravergine d'oliva, pancetta arrotolata nostrana, formaggio dolce a pasta filata, pomodoro fresco a fette, lattuga gentile",
    descriptionDe: "Ofenfrische Pizza-Focaccia mit nativem Olivenöl extra, gerollte italienische Pancetta, milder Schnittkäse, frische Tomatenscheiben, knackiger Salat",
    description_it: "Focaccia da impasto pizza all'olio extravergine d'oliva, pancetta arrotolata nostrana, formaggio dolce a pasta filata, pomodoro fresco a fette, lattuga gentile",
    description_de: "Ofenfrische Pizza-Focaccia mit nativem Olivenöl extra, gerollte italienische Pancetta, milder Schnittkäse, frische Tomatenscheiben, knackiger Salat",
    price: 230,
    image: `${SUPABASE_BASE_URL}/05-Pizza-Sandwiches/focaccia-pizza-sandwich-con-pancetta-arrotolata.webp`,
    image_file: "05-Pizza-Sandwiches/focaccia-pizza-sandwich-con-pancetta-arrotolata.webp"
  },
  // 14. FOCACCIA PIZZA SANDWICH CON PORCHETTA
  {
    id: "focaccia-pizza-sandwich-con-porchetta",
    categoryId: "pizza-sandwich",
    name: "FOCACCIA PIZZA SANDWICH WITH ROMAN ROASTED PORCHETTA",
    nameTh: "ฟอคคาเซีย พิตซ่าแซนด์วิช หมูอบพอร์เคตตาอิตาเลียน",
    nameIt: "FOCACCIA PIZZA SANDWICH CON PORCHETTA",
    nameDe: "FOCACCIA PIZZA SANDWICH MIT GEBRATENER PORCHETTA",
    name_it: "FOCACCIA PIZZA SANDWICH CON PORCHETTA",
    name_de: "FOCACCIA PIZZA SANDWICH MIT GEBRATENER PORCHETTA",
    description: "Freshly baked pizza dough focaccia with extra virgin olive oil, traditional herb-roasted Italian pork porchetta, mild string cheese, sliced fresh tomato, crisp lettuce",
    descriptionTh: "แป้งฟอคคาเซียพิซซ่าอบสดน้ำมันมะกอกบริสุทธิ์, หมูอบเครื่องเทศพอร์เคตตาสไตล์โรมัน, ชีสยืดรสนุ่ม, มะเขือเทศสดหั่นแว่น, ผักกาดแก้ว",
    descriptionIt: "Focaccia da impasto pizza all'olio extravergine d'oliva, porchetta di maiale arrosto speziata, formaggio dolce a pasta filata, pomodoro fresco a fette, lattuga gentile",
    descriptionDe: "Ofenfrische Pizza-Focaccia mit nativem Olivenöl extra, traditionell gewürzte italienische Porchetta, milder Schnittkäse, frische Tomatenscheiben, knackiger Salat",
    description_it: "Focaccia da impasto pizza all'olio extravergine d'oliva, porchetta di maiale arrosto speziata, formaggio dolce a pasta filata, pomodoro fresco a fette, lattuga gentile",
    description_de: "Ofenfrische Pizza-Focaccia mit nativem Olivenöl extra, traditionell gewürzte italienische Porchetta, milder Schnittkäse, frische Tomatenscheiben, knackiger Salat",
    price: 240,
    image: `${SUPABASE_BASE_URL}/05-Pizza-Sandwiches/focaccia-pizza-sandwich-con-porchetta.webp`,
    image_file: "05-Pizza-Sandwiches/focaccia-pizza-sandwich-con-porchetta.webp"
  },
  // 15. FOCACCIA PIZZA SANDWICH CON PROSCIUTTO COTTO
  {
    id: "focaccia-pizza-sandwich-con-prosciutto-cotto",
    categoryId: "pizza-sandwich",
    name: "FOCACCIA PIZZA SANDWICH WITH PREMIUM COOKED HAM",
    nameTh: "ฟอคคาเซีย พิตซ่าแซนด์วิช แฮมสุกโปรชุตโต คอตโต",
    nameIt: "FOCACCIA PIZZA SANDWICH CON PROSCIUTTO COTTO",
    nameDe: "FOCACCIA PIZZA SANDWICH MIT GEKOCHTEM SCHINKEN",
    name_it: "FOCACCIA PIZZA SANDWICH CON PROSCIUTTO COTTO",
    name_de: "FOCACCIA PIZZA SANDWICH MIT GEKOCHTEM SCHINKEN",
    description: "Freshly baked pizza dough focaccia with extra virgin olive oil, premium Italian cooked ham (prosciutto cotto), mild string cheese, sliced fresh tomato, crisp lettuce",
    descriptionTh: "แป้งฟอคคาเซียพิซซ่าอบสดน้ำมันมะกอกบริสุทธิ์, แฮมสุกอิตาเลียนพรีเมียม, ชีสยืดรสนุ่ม, มะเขือเทศสดหั่นแว่น, ผักกาดแก้ว",
    descriptionIt: "Focaccia da impasto pizza all'olio extravergine d'oliva, prosciutto cotto di suino alta qualità, formaggio dolce a pasta filata, pomodoro fresco a fette, lattuga gentile",
    descriptionDe: "Ofenfrische Pizza-Focaccia mit nativem Olivenöl extra, feiner italienischer Kochschinken (Prosciutto Cotto), milder Schnittkäse, frische Tomatenscheiben, knackiger Salat",
    description_it: "Focaccia da impasto pizza all'olio extravergine d'oliva, prosciutto cotto di suino alta qualità, formaggio dolce a pasta filata, pomodoro fresco a fette, lattuga gentile",
    description_de: "Ofenfrische Pizza-Focaccia mit nativem Olivenöl extra, feiner italienischer Kochschinken (Prosciutto Cotto), milder Schnittkäse, frische Tomatenscheiben, knackiger Salat",
    price: 220,
    image: `${SUPABASE_BASE_URL}/05-Pizza-Sandwiches/focaccia-pizza-sandwich-con-prosciutto-cotto.webp`,
    image_file: "05-Pizza-Sandwiches/focaccia-pizza-sandwich-con-prosciutto-cotto.webp"
  },
  // 16. FOCACCIA PIZZA SANDWICH CON SALAME
  {
    id: "focaccia-pizza-sandwich-con-salame",
    categoryId: "pizza-sandwich",
    name: "FOCACCIA PIZZA SANDWICH WITH ITALIAN SALAMI",
    nameTh: "ฟอคคาเซีย พิตซ่าแซนด์วิช ซาลามีอิตาเลียน",
    nameIt: "FOCACCIA PIZZA SANDWICH CON SALAME",
    nameDe: "FOCACCIA PIZZA SANDWICH MIT ITALIENISCHER SALAMI",
    name_it: "FOCACCIA PIZZA SANDWICH CON SALAME",
    name_de: "FOCACCIA PIZZA SANDWICH MIT ITALIENISCHER SALAMI",
    description: "Freshly baked pizza dough focaccia with extra virgin olive oil, medium-grain cured Italian salami, mild string cheese, sliced fresh tomato, crisp lettuce",
    descriptionTh: "แป้งฟอคคาเซียพิซซ่าอบสดน้ำมันมะกอกบริสุทธิ์, ซาลามีอิตาเลียนดั้งเดิม, ชีสยืดรสนุ่ม, มะเขือเทศสดหั่นแว่น, ผักกาดแก้ว",
    descriptionIt: "Focaccia da impasto pizza all'olio extravergine d'oliva, salame nostrano a grana media, formaggio dolce a pasta filata, pomodoro fresco a fette, lattuga gentile",
    descriptionDe: "Ofenfrische Pizza-Focaccia mit nativem Olivenöl extra, mittelgekörnte italienische Landsalami, milder Schnittkäse, frische Tomatenscheiben, knackiger Salat",
    description_it: "Focaccia da impasto pizza all'olio extravergine d'oliva, salame nostrano a grana media, formaggio dolce a pasta filata, pomodoro fresco a fette, lattuga gentile",
    description_de: "Ofenfrische Pizza-Focaccia mit nativem Olivenöl extra, mittelgekörnte italienische Landsalami, milder Schnittkäse, frische Tomatenscheiben, knackiger Salat",
    price: 230,
    image: `${SUPABASE_BASE_URL}/05-Pizza-Sandwiches/focaccia-pizza-sandwich-con-salame.webp`,
    image_file: "05-Pizza-Sandwiches/focaccia-pizza-sandwich-con-salame.webp"
  }
];

const menuDataPath = path.resolve(process.cwd(), 'src/pizza/data/menuData.ts');
let fileContent = fs.readFileSync(menuDataPath, 'utf8');

// Match menuData = [...]
const prefixMatch = fileContent.match(/export const menuData: MenuCategory\[\] = (\[[\s\S]*\]);/);
if (!prefixMatch) {
  console.error('Non riesco a trovare l\'array menuData in menuData.ts');
  process.exit(1);
}

const rawJson = prefixMatch[1];
const categories = JSON.parse(rawJson);

// Insert or update items into categories
for (const dish of DISHES) {
  const cat = categories.find(c => c.id === dish.categoryId);
  if (!cat) {
    console.warn(`Categoria non trovata: ${dish.categoryId}`);
    continue;
  }

  // Remove categoryId from item payload
  const { categoryId, ...itemData } = dish;

  // Check if item already exists
  const existingIdx = cat.items.findIndex(i => i.id === dish.id);
  if (existingIdx >= 0) {
    cat.items[existingIdx] = { ...cat.items[existingIdx], ...itemData };
    console.log(`Aggiornato piatto ${dish.id} in categoria ${cat.id}`);
  } else {
    cat.items.push(itemData);
    console.log(`Aggiunto nuovo piatto ${dish.id} in categoria ${cat.id}`);
  }
}

const updatedJson = JSON.stringify(categories, null, 2);
const updatedFileContent = fileContent.replace(
  /export const menuData: MenuCategory\[\] = \[[\s\S]*\];/,
  `export const menuData: MenuCategory[] = ${updatedJson};`
);

fs.writeFileSync(menuDataPath, updatedFileContent, 'utf8');
console.log('✅ menuData.ts aggiornato con successo con tutti i 16 nuovi piatti!');
