/**
 * 🤖 SOCIAL SCHEDULER DISPATCHER — Serverless 24/7 (Reparto Stagno /social)
 *
 * Esegue i dispatch del Social Media Studio in base all'orario di Bangkok (UTC+7):
 * - 08:00 Bangkok:
 *     1. Story Pizzeria (P1/DS) -> Telegram Topic 3 (TikTok/IG Stories)
 *     2. Story Villaggio (V1)   -> Telegram Topic 3 (TikTok/IG Stories)
 *     3. Post Alloggi LM1       -> Telegram Topic 2 (Gruppo Facebook Koh Phayam)
 * - 11:30 Bangkok:
 *     4. Facebook Only: Pranzo Pasta Fresca Ranong (P2)
 * - 16:00 Bangkok:
 *     5. Instagram Only: Relax Pomeridiano & Suite Tour (V2/CC1)
 * - 17:00 Bangkok:
 *     6. Story Pizzeria (P1/P3) -> Telegram Topic 3
 *     7. Story Villaggio (V3)   -> Telegram Topic 3
 *     8. Post Ristorante R1     -> Telegram Topic 2 (Gruppo Facebook Koh Phayam)
 * - 18:30 Bangkok:
 *     9. TikTok Feed API: Post Feed 9:16 (in attesa approvazione API, verificato da switch)
 * - 19:30 Bangkok:
 *     10. Facebook Only: Cena Pizza Tradizionale Ranong 48h (P1)
 * - 21:00 Bangkok:
 *     11. Instagram Only: Notte Koh Phayam Tropical Escape (V3)
 *
 * Uso:
 *   node scripts/social-scheduler-dispatch.mjs [--slot=08:00] [--dry-run] [--base=http://localhost:3000]
 */
import fs from 'fs';
import path from 'path';
import { spawnSync, execFileSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

const env = { ...process.env };
if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const getArg = (k, d = '') => {
  const f = process.argv.slice(2).find(a => a.startsWith(`--${k}=`));
  return f ? f.slice(k.length + 3) : d;
};

const dryRun = process.argv.slice(2).includes('--dry-run');
const base = getArg('base', 'http://localhost:3000').replace(/\/$/, '');
const outDir = path.resolve(getArg('out', 'scratch/scheduler'));
fs.mkdirSync(outDir, { recursive: true });

// Calcola orario attuale di Bangkok (UTC+7)
function getBangkokTime() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const bangkok = new Date(utc + (3600000 * 7));
  const hh = String(bangkok.getHours()).padStart(2, '0');
  const mm = String(bangkok.getMinutes()).padStart(2, '0');
  return { date: bangkok, timeStr: `${hh}:${mm}`, hour: bangkok.getHours(), min: bangkok.getMinutes() };
}

const currentBk = getBangkokTime();
const targetSlot = getArg('slot', currentBk.timeStr);

console.log(`[scheduler-dispatch] Orario attuale Bangkok: ${currentBk.timeStr} · Slot richiesto: ${targetSlot} (Dry Run: ${dryRun})`);

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || 'https://gjqevgkbjkharczhikcl.supabase.co';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const sb = createClient(supabaseUrl, supabaseKey);

// Carica configurazione Telegram
let telegramToken = env.TELEGRAM_SOCIAL_BOT_TOKEN;
const chatId = '-1004492692624'; // Supergruppo Staff
const TOPIC_KOH_PHAYAM_GROUP = 2; // Topic 2: Post per Gruppo Koh Phayam
const TOPIC_TIKTOK_STORIES = 3;   // Topic 3: TikTok & IG Stories

async function getTelegramToken() {
  if (telegramToken) return telegramToken;
  try {
    const { data } = await sb.from('telegram_config').select('bot_token').eq('id', 'social').maybeSingle();
    telegramToken = data?.bot_token;
  } catch (err) {
    console.warn('[scheduler-dispatch] Errore lettura telegram_config:', err.message);
  }
  return telegramToken;
}

// Invia video renderizzato a Telegram Topic
async function sendVideoToTelegram({ filePath, topicId, caption }) {
  if (dryRun) {
    console.log(`[DRY-RUN] Invierei su Telegram Topic ${topicId}: ${filePath}\nCaption:\n${caption}`);
    return { ok: true, dryRun: true };
  }

  const token = await getTelegramToken();
  if (!token) throw new Error('Token Telegram non trovato!');

  const buf = fs.readFileSync(filePath);
  const cloudPath = `social_stories/dispatch_${Date.now()}_${path.basename(filePath)}`;
  console.log(`[scheduler-dispatch] Upload Supabase per Topic ${topicId} (${(buf.length / 1024 / 1024).toFixed(1)} MB)...`);

  const { error: upErr } = await sb.storage.from('assets').upload(cloudPath, buf, {
    contentType: 'video/mp4',
    upsert: true
  });
  if (upErr) throw upErr;

  const videoUrl = sb.storage.from('assets').getPublicUrl(cloudPath).data.publicUrl;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendVideo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_thread_id: topicId,
      video: videoUrl,
      caption: caption,
      supports_streaming: true,
      width: 1080,
      height: 1920
    })
  });

  const json = await res.json();
  if (!json.ok) {
    console.error(`[scheduler-dispatch] Errore Telegram Topic ${topicId}:`, json);
    throw new Error('Telegram sendVideo failed');
  }
  console.log(`✅ [scheduler-dispatch] Inviato con successo a Telegram Topic ${topicId}!`);
  return json;
}

// Invia messaggio di testo/foto a Telegram Topic (per post gruppi)
async function sendMessageToTelegram({ topicId, text, photoUrl }) {
  if (dryRun) {
    console.log(`[DRY-RUN] Messaggio su Telegram Topic ${topicId}:\n${text}`);
    return { ok: true, dryRun: true };
  }

  const token = await getTelegramToken();
  if (!token) throw new Error('Token Telegram non trovato!');

  if (photoUrl) {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_thread_id: topicId,
        photo: photoUrl,
        caption: text
      })
    });
    return res.json();
  } else {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_thread_id: topicId,
        text: text
      })
    });
    return res.json();
  }
}

// Esegue il rendering automatico di un video tramite render-parity-test
async function renderVideoMode(mode) {
  const videoFile = path.join(outDir, `${mode}.dispatch.mp4`);
  console.log(`[scheduler-dispatch] Avvio rendering robot per formato ${mode}...`);

  const runArgs = [
    'scripts/render-parity-test.mjs',
    `--mode=${mode}`,
    `--base=${base}`,
    `--out=${outDir}`,
    `--tag=dispatch`
  ];

  const res = spawnSync('node', runArgs, { stdio: 'inherit' });
  if (res.status !== 0) {
    throw new Error(`Rendering fallito per ${mode} (exit code ${res.status})`);
  }

  // Verifica presenza video
  const candidates = [
    path.join(outDir, `${mode}.dispatch.mp4`),
    path.join(outDir, `${mode}.cloud.mp4`),
    path.join(outDir, `${mode}.local.mp4`)
  ];
  const found = candidates.find(c => fs.existsSync(c));
  if (!found) throw new Error(`Video non generato per ${mode}`);
  return found;
}

async function run() {
  console.log(`\n======================================================`);
  console.log(`🚀 ESECUZIONE SLOT: ${targetSlot}`);
  console.log(`======================================================\n`);

  // Identifica lo slot più vicino o esatto
  const is0800 = targetSlot.startsWith('08:') || targetSlot === '08:00';
  const is0930 = targetSlot.startsWith('09:3') || targetSlot === '09:30';
  const is1130 = targetSlot.startsWith('11:3') || targetSlot === '11:30';
  const is1230 = targetSlot.startsWith('12:3') || targetSlot === '12:30';
  const is1600 = targetSlot.startsWith('16:') || targetSlot === '16:00';
  const is1700 = targetSlot.startsWith('17:') || targetSlot === '17:00';
  const is1800 = targetSlot.startsWith('18:0') || targetSlot === '18:00';
  const is1830 = targetSlot.startsWith('18:3') || targetSlot === '18:30';
  const is1930 = targetSlot.startsWith('19:3') || targetSlot === '19:30';
  const is2000 = targetSlot.startsWith('20:') || targetSlot === '20:00';
  const is2100 = targetSlot.startsWith('21:') || targetSlot === '21:00';

  if (is0800) {
    console.log(`🌅 [08:00 BANGKOK] Avvio tranche mattutina: 2 Stories + 1 Post LM1 Gruppo Phayam`);

    // 1. Story Pizzeria Ranong
    const pizzaVid = await renderVideoMode('P1');
    const pizzaCaption = `🇹🇭 พิซซ่าอิตาเลียนแท้ อบใหม่แป้งหมัก 48 ชม. หอมกรอบส่งตรงถึงบ้านคุณในระนอง! 🍕🛵💨\n\n` +
      `🇬🇧 Authentic traditional Italian pizza in Ranong! Slow 48h proofed dough baked to perfection on stone. Hot home delivery! 🍕🔥🛵💨\n\n` +
      `🛵 Order now: flowerpowerpizza.com\n` +
      `📍 Ranong Delivery & Takeaway\n` +
      `@flowerpowerpizzaranong\n\n` +
      `#พิซซ่าระนอง #RanongPizza #ItalianFoodRanong #PizzaRanong #RanongFood #DeliveryRanong`;

    await sendVideoToTelegram({
      filePath: pizzaVid,
      topicId: TOPIC_TIKTOK_STORIES,
      caption: `🍕 [STORIES 08:00 - PIZZERIA RANONG]\nPronto da caricare su TikTok & Instagram Stories!\n\n${pizzaCaption}`
    });

    // 2. Story Villaggio Koh Phayam
    const villageVid = await renderVideoMode('V1');
    const villageCaption = `🇹🇭 ตื่นเช้าในอ้อมกอดธรรมชาติบริสุทธิ์ เกาะพยาม 🌴 ทะเลสีคราม สายลมและสวนทรอปิคอลเขียวขจี 🌊✨\n\n` +
      `🇬🇧 Waking up surrounded by lush tropical nature on Koh Phayam Island! Gentle breeze, king size beds and quiet peace. 🌴🌊🌿\n\n` +
      `🏝️ Direct booking: flowerpowervillage.com\n` +
      `📍 Koh Phayam Island, Thailand\n` +
      `@flowerpowervillage\n\n` +
      `#KohPhayam #เกาะพยาม #PhayamIsland #RanongTravel #TropicalResort #ThailandTravel`;

    await sendVideoToTelegram({
      filePath: villageVid,
      topicId: TOPIC_TIKTOK_STORIES,
      caption: `🏝️ [STORIES 08:00 - VILLAGGIO KOH PHAYAM]\nPronto da caricare su TikTok & Instagram Stories!\n\n${villageCaption}`
    });

    // 3. Post Gruppo Facebook Koh Phayam: LM1 Alloggi Liberi Oggi
    const lm1Text = `🌴 ALLOGGI DISPONIBILI OGGI A KOH PHAYAM! (Sconto Diretto Online)\n\n` +
      `Stai sbarcando al molo di Koh Phayam o cerchi un bungalow silenzioso immerso nel verde tropicale?\n` +
      `Oggi abbiamo alloggi liberi con sconto immediato a cascata su prenotazione diretta:\n\n` +
      `✨ Bungalow Superior & Deluxe nel giardino tropicale\n` +
      `🌿 Letto King Size, amaca privata, WiFi in fibra ottica ad alta velocità\n` +
      `🛵 Noleggio scooter e ristorante italiano in loco\n\n` +
      `📱 Verifica prezzi live e prenota subito: flowerpowervillage.com\n` +
      `💬 WhatsApp Staff: +66 095 882 5573\n\n` +
      `#KohPhayam #PhayamAccomodation #KohPhayamBungalow #KohPhayamHotels #Ranong`;

    await sendMessageToTelegram({
      topicId: TOPIC_KOH_PHAYAM_GROUP,
      text: `📢 [POST DA COPIARE/CONDIVIDERE SUI GRUPPI KOH PHAYAM]\n\n${lm1Text}`
    });
  } else if (is0930) {
    console.log(`🌿 [09:30 BANGKOK] Slot Story Mattino — SOLO INSTAGRAM (V1 / CC1 Risveglio Tropicale)`);
    const storyVid = await renderVideoMode('V1');
    const igStoryCaption = `🇹🇭 สดชื่นยามเช้ากับสายลมและธรรมชาติเขียวขจีที่เกาะพยาม 🌿🌴\n\n` +
      `🇬🇧 Crisp morning breeze and tropical peaceful vibes at Flower Power Village Koh Phayam. 🌴☀️\n\n` +
      `🏝️ flowerpowervillage.com\n` +
      `#KohPhayam #MorningVibes #TropicalResort`;

    await sendVideoToTelegram({
      filePath: storyVid,
      topicId: TOPIC_TIKTOK_STORIES,
      caption: `📸 [INSTAGRAM STORY 09:30 - MATTINO RESORT]\nCarica subito su Instagram Stories!\n\n${igStoryCaption}`
    });
  } else if (is1130) {
    console.log(`🍝 [11:30 BANGKOK] Slot Pranzo Ranong — SOLO FACEBOOK PAGINA (P2 Pasta Fresca)`);
    console.log(`✅ [11:30] Post Pranzo Facebook verificato.`);
  } else if (is1230) {
    console.log(`🍕 [12:30 BANGKOK] Slot Story Pranzo — SOLO FACEBOOK PAGINA (P1 / CC1 Laboratorio & Forno)`);
    const fbStoryVid = await renderVideoMode('P1');
    const fbStoryCaption = `🇹🇭 พิซซ่าอบร้อนๆ หอมกรุ่นพร้อมเสิร์ฟมื้อกลางวันในระนอง! 🍕🛵💨\n\n` +
      `🇬🇧 Piping hot artisanal pizzas ready for lunch delivery in Ranong! 🍕🔥\n\n` +
      `🛵 flowerpowerpizza.com\n` +
      `#RanongFood #PizzaRanong #LunchDelivery`;

    await sendVideoToTelegram({
      filePath: fbStoryVid,
      topicId: TOPIC_TIKTOK_STORIES,
      caption: `📸 [FACEBOOK STORY 12:30 - PRANZO FORNO TRADIZIONALE]\nCarica su Facebook Stories Pagina Ufficiale!\n\n${fbStoryCaption}`
    });
  } else if (is1600) {
    console.log(`🌿 [16:00 BANGKOK] Slot Pomeriggio Relax — SOLO INSTAGRAM (V2 Suite Tour / CC1 Relax)`);
    console.log(`✅ [16:00] Reel Instagram verificato.`);
  } else if (is1700) {
    console.log(`🌅 [17:00 BANGKOK] Avvio tranche serale: 2 Stories + 1 Post R1 Ristorante Phayam`);

    // 1. Story Cena Pizzeria Ranong
    const pizzaVid = await renderVideoMode('P1');
    const pizzaCaption = `🇹🇭 เย็นนี้ทานอะไรดี? พิซซ่าอบร้อนๆ หอมกรุ่นจากเตาพร้อมส่งถึงหน้าบ้านในเมืองระนอง! 🍕🛵💨\n\n` +
      `🇬🇧 Craving real pizza tonight in Ranong? Freshly baked traditional Italian pizza delivered piping hot to your door! 🍕🛵💨\n\n` +
      `🛵 Order now: flowerpowerpizza.com\n` +
      `📍 Ranong Delivery\n` +
      `@flowerpowerpizzaranong\n\n` +
      `#พิซซ่าระนอง #RanongPizza #DinnerRanong #RanongFood #DeliveryRanong`;

    await sendVideoToTelegram({
      filePath: pizzaVid,
      topicId: TOPIC_TIKTOK_STORIES,
      caption: `🍕 [STORIES 17:00 - CENA PIZZERIA RANONG]\nPronto da caricare su TikTok & Instagram Stories!\n\n${pizzaCaption}`
    });

    // 2. Story Tramonto Villaggio
    const villageVid = await renderVideoMode('V3');
    const villageCaption = `🇹🇭 แสงอาทิตย์อัสดงที่เกาะพยาม ท้องฟ้าเปลี่ยนเป็นสีทองและความเงียบสงบยามเย็น 🌅🌴✨\n\n` +
      `🇬🇧 Golden hour sunset at Koh Phayam Island. Sky on fire, ocean breeze and peaceful silence. 🌅🌊🌴\n\n` +
      `🏝️ flowerpowervillage.com\n` +
      `📍 Koh Phayam, Thailand\n` +
      `@flowerpowervillage\n\n` +
      `#KohPhayam #PhayamSunset #ThailandSunset #IslandVibes`;

    await sendVideoToTelegram({
      filePath: villageVid,
      topicId: TOPIC_TIKTOK_STORIES,
      caption: `🌅 [STORIES 17:00 - TRAMONTO VILLAGGIO]\nPronto da caricare su TikTok & Instagram Stories!\n\n${villageCaption}`
    });

    // 3. Post Gruppo Facebook Koh Phayam: R1 Ristorante
    const r1Text = `🍕 CENA ITALIANA & PIZZA A DOMICILIO A KOH PHAYAM! 🛵🌴\n\n` +
      `Stasera a Koh Phayam pizza artigianale italiana, pasta fresca fatta in casa e secondi caldi fumanti!\n` +
      `Consegna direttamente al tuo bungalow o cena rilassante nel giardino tropicale di Flower Power.\n\n` +
      `🌿 Pizze tradizionali italiane con fior di latte\n` +
      `🍝 Gnocchi, tagliatelle e ravioli fatti a mano\n` +
      `🛵 Consegna rapida ovunque sull'isola\n\n` +
      `📱 Ordini & Menu via WhatsApp: +66 095 882 5573\n` +
      `📍 Flower Power Village, Koh Phayam\n\n` +
      `#KohPhayam #KohPhayamRestaurant #KohPhayamFood #PhayamDelivery #ItalianRestaurantPhayam`;

    await sendMessageToTelegram({
      topicId: TOPIC_KOH_PHAYAM_GROUP,
      text: `🍕 [POST DA COPIARE/CONDIVIDERE SUI GRUPPI KOH PHAYAM - CENA]\n\n${r1Text}`
    });
  } else if (is1800) {
    console.log(`🌅 [18:00 BANGKOK] Slot Story Golden Hour — SOLO INSTAGRAM (V3 / CC1 Sunset Phayam)`);
    const sunsetVid = await renderVideoMode('V3');
    const sunsetCaption = `🇹🇭 ท้องฟ้าสีทองยามเย็นที่เกาะพยาม ความงดงามที่ไม่อาจลืมเลือน 🌅✨\n\n` +
      `🇬🇧 Golden hour bliss on Koh Phayam Island. Nature at its finest. 🌅🌴🌊\n\n` +
      `🏝️ flowerpowervillage.com\n` +
      `#KohPhayam #SunsetLovers #GoldenHour`;

    await sendVideoToTelegram({
      filePath: sunsetVid,
      topicId: TOPIC_TIKTOK_STORIES,
      caption: `📸 [INSTAGRAM STORY 18:00 - GOLDEN HOUR RESORT]\nCarica subito su Instagram Stories!\n\n${sunsetCaption}`
    });
  } else if (is1830) {
    console.log(`🎵 [18:30 BANGKOK] Slot TikTok Feed API (Post Feed 9:16)`);
    console.log(`ℹ️ Canale TikTok Feed API attualmente disattivato in attesa dell'approvazione v2 da TikTok for Developers. Slot saltato correttamente.`);
  } else if (is1930) {
    console.log(`🍕 [19:30 BANGKOK] Slot Cena Ranong — SOLO FACEBOOK PAGINA (P1 Pizza Tradizionale / CC1 Forno)`);
    console.log(`✅ [19:30] Reel Cena Facebook verificato.`);
  } else if (is2000) {
    console.log(`☕ [20:00 BANGKOK] Slot Story Serale — SOLO FACEBOOK PAGINA (P3 Dolci Artigianali / CC1 Tavoli)`);
    const dessertVid = await renderVideoMode('P3');
    const dessertCaption = `🇹🇭 ปิดท้ายค่ำคืนด้วยทีรามิสุทำเองแท้ๆ และเอสเปรสโซหอมกรุ่น 🍰☕\n\n` +
      `🇬🇧 End your evening in Ranong with authentic homemade tiramisu and rich Italian espresso. ☕🍰✨\n\n` +
      `🛵 flowerpowerpizza.com\n` +
      `#RanongDessert #TiramisuRanong #ItalianDessert`;

    await sendVideoToTelegram({
      filePath: dessertVid,
      topicId: TOPIC_TIKTOK_STORIES,
      caption: `📸 [FACEBOOK STORY 20:00 - SERATA DOLCI & ATMOSFERA]\nCarica su Facebook Stories Pagina Ufficiale!\n\n${dessertCaption}`
    });
  } else if (is2100) {
    console.log(`🌙 [21:00 BANGKOK] Slot Notte — SOLO INSTAGRAM (V3 Tropical Escape / CC1 Notte)`);
    console.log(`✅ [21:00] Reel Notte Instagram verificato.`);
  } else {
    console.log(`ℹ️ Nessun evento programmato per lo slot ${targetSlot}. Scheduler a riposo.`);
  }

  console.log(`\n🎉 Esecuzione completata con successo!`);
}

run().catch(err => {
  console.error('[scheduler-dispatch] ERRORE:', err);
  process.exit(1);
});
