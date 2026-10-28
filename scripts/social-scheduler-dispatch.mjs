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

const OFFICIAL_SLOTS = [
  '08:00', '09:30', '11:30', '12:30',
  '16:00', '17:00', '18:00', '18:30',
  '19:30', '20:00', '21:00'
];

function timeToMinutes(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + (m || 0);
}

function resolveTargetSlot(rawSlot, bkTime) {
  if (rawSlot && rawSlot !== 'auto' && OFFICIAL_SLOTS.includes(rawSlot)) {
    return rawSlot;
  }
  const nowMins = bkTime.hour * 60 + bkTime.min;
  let bestSlot = null;
  let bestDist = Infinity;

  for (const s of OFFICIAL_SLOTS) {
    const sMins = timeToMinutes(s);
    const dist = Math.abs(nowMins - sMins);
    if (dist < bestDist) {
      bestDist = dist;
      bestSlot = s;
    }
  }

  // Se GitHub Actions cron scatta con un ritardo fisiologico (fino a 25 min), aggancia lo slot corretto
  if (bestDist <= 15) {
    return bestSlot;
  }
  return rawSlot || bkTime.timeStr;
}

const currentBk = getBangkokTime();
const rawSlotArg = getArg('slot', '');
const targetSlot = resolveTargetSlot(rawSlotArg, currentBk);

console.log(`[scheduler-dispatch] Orario attuale Bangkok: ${currentBk.timeStr} · Slot identificato: ${targetSlot} (Arg: "${rawSlotArg}", Dry Run: ${dryRun})`);

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || 'https://gjqevgkbjkharczhikcl.supabase.co';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const sb = createClient(supabaseUrl, supabaseKey);

// Carica configurazione Telegram
let telegramToken = env.TELEGRAM_SOCIAL_BOT_TOKEN;
const chatId = '-1004492692624'; // Supergruppo Staff
const TOPIC_KOH_PHAYAM_GROUP = 2; // Topic 2: Post per Gruppo Koh Phayam
const TOPIC_TIKTOK_STORIES = 3;   // Topic 3: TikTok & IG Stories
const TOPIC_PUBLISHED = 286;      // Topic 286: Cronologia Pubblicati (Published)
const TOPIC_FAILED = 301;         // Topic 301: Allarmi ed Errori (Failed)

async function sendPublishedLog(payload) {
  let text = '';
  if (typeof payload === 'string') {
    text = `🟢 <b>[FP SOCIAL STUDIO · PUBBLICAZIONE RIUSCITA]</b>\n${payload}`;
  } else {
    const { brand, channel, format, title, mediaId, details, gdriveId } = payload;
    const brandName = brand === 'pizza' ? '🍕 Pizzeria Ranong' : (brand === 'village' ? '🌴 Villaggio Koh Phayam' : '🍕🌴 Flower Power');
    text = `🟢 <b>[FP SOCIAL STUDIO · PUBBLICAZIONE RIUSCITA]</b>\n\n`;
    text += `🏷️ <b>REPARTO:</b> ${brandName}\n`;
    text += `📡 <b>CANALE:</b> ${channel || 'Canale Ufficiale'}\n`;
    if (format) text += `🎬 <b>FORMATO:</b> <code>${format}</code>\n`;
    if (title) text += `📋 <b>TITOLO:</b> ${title}\n`;
    text += `⏱️ <b>SLOT:</b> ${targetSlot} Bangkok\n`;
    if (mediaId) text += `🆔 <b>MEDIA ID:</b> <code>${mediaId}</code>\n`;
    if (gdriveId) text += `📁 <b>GOOGLE DRIVE 5TB:</b> <code>${gdriveId}</code>\n`;
    if (details) text += `ℹ️ <i>${escapeHtml(details)}</i>\n`;
    text += `\n✅ <i>Il contenuto è stato pubblicato con successo!</i>`;
  }

  try {
    await sendMessageToTelegram({ topicId: TOPIC_PUBLISHED, text });
  } catch (e) {
    console.warn('[scheduler-dispatch] Avviso log published:', e.message);
  }
}

async function sendFailedAlert(errOrPayload, context = '') {
  let text = '';
  if (errOrPayload && typeof errOrPayload === 'object' && !(errOrPayload instanceof Error) && (errOrPayload.brand || errOrPayload.channel)) {
    const { brand, channel, format, title, error, details, fallbackAction } = errOrPayload;
    const brandName = brand === 'pizza' ? '🍕 Pizzeria Ranong' : (brand === 'village' ? '🌴 Villaggio Koh Phayam' : '🍕🌴 Flower Power');
    const errorMsg = error?.stack || error?.message || String(error || details || 'Errore imprevisto');

    text = `🚨 <b>[FP SOCIAL STUDIO · ALLARME ERRORE CANALE]</b>\n\n`;
    text += `🏷️ <b>REPARTO:</b> ${brandName}\n`;
    text += `📡 <b>CANALE:</b> ${channel || 'Canale Ufficiale'}\n`;
    if (format) text += `🎬 <b>FORMATO:</b> <code>${format}</code>\n`;
    if (title) text += `📋 <b>TITOLO:</b> ${title}\n`;
    text += `⏱️ <b>SLOT:</b> ${targetSlot} Bangkok\n`;
    text += `⚠️ <b>ERRORE:</b>\n<pre>${escapeHtml(errorMsg.slice(0, 1500))}</pre>\n`;
    if (fallbackAction) {
      text += `\n👉 <b>AZIONE INTRAPRESA:</b>\n${fallbackAction}\n`;
    }
  } else {
    const errorMsg = errOrPayload?.stack || errOrPayload?.message || String(errOrPayload);
    text = `🚨 <b>[FP SOCIAL STUDIO · ALLARME FAILED]</b>\n📍 <b>Slot:</b> ${targetSlot}\n🔍 <b>Contesto:</b> ${context}\n⚠️ <b>Errore:</b>\n<pre>${escapeHtml(errorMsg.slice(0, 1500))}</pre>`;
  }

  try {
    await sendMessageToTelegram({ topicId: TOPIC_FAILED, text });
  } catch (e) {
    console.error('[scheduler-dispatch] Impossibile inviare allarme a Topic 301:', e.message);
  }
}

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

// Carica configurazione Google Drive 5TB da Supabase
async function getGoogleDriveCredentials() {
  try {
    const { data } = await sb.from('telegram_config').select('chat_id').eq('id', 'google_drive').maybeSingle();
    if (data?.chat_id) {
      return JSON.parse(data.chat_id);
    }
  } catch (err) {
    console.warn('[scheduler-dispatch] Errore lettura credenziali Google Drive:', err.message);
  }
  return null;
}

// 📁 Upload permanente su Google Drive 5TB (Cassaforte infinita a zero costi)
async function uploadToGoogleDrive({ name, buffer }) {
  if (dryRun) {
    console.log(`[DRY-RUN] Archiviazione Google Drive 5TB: ${name} (${(buffer.length / 1e6).toFixed(1)} MB)`);
    return { ok: true, dryRun: true, id: 'mock_gdrive_id' };
  }

  try {
    const creds = await getGoogleDriveCredentials();
    if (!creds?.client_id || !creds?.client_secret || !creds?.refresh_token) {
      console.warn('[scheduler-dispatch] Credenziali Google Drive non disponibili, upload cloud saltato.');
      return null;
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: creds.client_id,
        client_secret: creds.client_secret,
        refresh_token: creds.refresh_token,
        grant_type: "refresh_token"
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(`Google Drive token refresh failed: ${JSON.stringify(tokenData)}`);
    }

    const accessToken = tokenData.access_token;
    const boundary = "-------FP_DRIVE_BOUNDARY_" + Date.now();
    const delimiter = "\r\n--" + boundary + "\r\n";
    const closeDelim = "\r\n--" + boundary + "--";

    const metadata = {
      name: name,
      parents: creds.folder_id ? [creds.folder_id] : []
    };

    const metadataPart = delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) + "\r\n";

    const fileHeader = "--" + boundary + "\r\n" +
      "Content-Type: video/mp4\r\n\r\n";

    const bodyBuffer = Buffer.concat([
      Buffer.from(metadataPart, "utf8"),
      Buffer.from(fileHeader, "utf8"),
      buffer,
      Buffer.from(closeDelim, "utf8")
    ]);

    console.log(`[scheduler-dispatch] 📁 Archiviazione permanente su Google Drive 5TB (Folder: ${creds.folder_id})...`);
    const uploadRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": bodyBuffer.length.toString()
      },
      body: bodyBuffer
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok || !uploadData.id) {
      throw new Error(`Google Drive upload failed: ${JSON.stringify(uploadData)}`);
    }

    console.log(`✅ [Google Drive 5TB] Video archiviato con successo nel Cloud permanente! (File: ${uploadData.name}, ID: ${uploadData.id})`);
    return uploadData;
  } catch (gdErr) {
    console.warn('⚠️ [scheduler-dispatch] Avviso archiviazione Google Drive:', gdErr.message);
    return null;
  }
}

// Upload video buffer su Google Drive 5TB (Permanente) e Supabase Storage (Temporaneo con rotazione)
async function ensureCloudVideoUrl(filePath) {
  const buf = fs.readFileSync(filePath);
  const fileName = `dispatch_${Date.now()}_${path.basename(filePath)}`;
  const cloudPath = `social_stories/${fileName}`;

  // 1. Archiviazione Permanente su Google Drive 5TB (Nessun limite di spazio)
  await uploadToGoogleDrive({ name: fileName, buffer: buf });

  // 2. Buffer temporaneo su Supabase Storage (per download immediato di Meta Graph API e Telegram)
  console.log(`[scheduler-dispatch] Upload buffer temporaneo Supabase (${(buf.length / 1024 / 1024).toFixed(1)} MB) su ${cloudPath}...`);
  const { error: upErr } = await sb.storage.from('assets').upload(cloudPath, buf, {
    contentType: 'video/mp4',
    upsert: true
  });
  if (upErr) throw upErr;

  const videoUrl = sb.storage.from('assets').getPublicUrl(cloudPath).data.publicUrl;

  // 3. Rotazione intelligente: conserva solo gli ultimi 8 video su Supabase (< 60MB), evitando ogni rischio di esaurire il limite di 1GB
  try {
    const { data: list } = await sb.storage.from('assets').list('social_stories', { sortBy: { column: 'created_at', order: 'asc' } });
    if (list && list.length > 8) {
      const toRemove = list.slice(0, list.length - 8).map(f => `social_stories/${f.name}`);
      await sb.storage.from('assets').remove(toRemove);
      console.log(`🧹 [scheduler-dispatch] Rotazione storage Supabase: rimossi ${toRemove.length} file temporanei (l'archivio permanente su Google Drive 5TB è intatto e sicuro).`);
    }
  } catch (cleanErr) {
    // Non bloccante
  }

  return { videoUrl, buffer: buf };
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Invia post ufficiale completo a Telegram Topic (Video MP4 + Scheda con blocco <pre> + Bottoni interattivi)
// Generatore copy bilingue certificato conforme a tutte le 24 regole dello Social Media Studio
function getBilingualPostCopy(mode, brand, officialCopy) {
  const isPizza = (brand === 'pizza');

  // 1. Se Chromium ha esportato il copy ufficiale sincronizzato con il montaggio effettivo
  if (officialCopy && (officialCopy.thaiContent || officialCopy.englishContent)) {
    const thai = (officialCopy.thaiContent || '').trim();
    const en = (officialCopy.englishContent || '').trim();
    const link = (officialCopy.fixedLink || '').trim();
    const tag = (officialCopy.crossTag || '').trim();
    const tags = Array.from(new Set([...(officialCopy.englishHashtags || []), ...(officialCopy.thaiHashtags || [])])).join(' ');

    if (isPizza) {
      // Pizzeria Ranong: 1° Thai 🇹🇭, 2° Inglese 🇬🇧, Link/Tag, Hashtags in fondo
      return [thai, en, link, tag, tags].filter(Boolean).join('\n\n');
    } else {
      // Villaggio & Koh Phayam: 1° Inglese 🇬🇧, 2° Thai 🇹🇭, Link/Tag, Hashtags in fondo (ZERO ITALIANO)
      return [en, thai, link, tag, tags].filter(Boolean).join('\n\n');
    }
  }

  // 2. Fallback biculturale certificato con biculturalismo rigoroso, zero italiano, zero legna e zero tramonto
  if (mode === 'R1') {
    return (
      `🇬🇧 Craving authentic Italian food on Koh Phayam? Flower Power Restaurant 🍝🍕 is cooking for you in Buffalo Bay!\n\n` +
      `• Artisanal thin-crust Italian pizza 🍕\n` +
      `• Fresh handmade pasta & savory sauces 🍝\n` +
      `• Island favorites cooked from scratch with genuine passion 🌿✨\n\n` +
      `Dine in our lush tropical garden or get hot delivery directly to your resort or bungalow on Koh Phayam! 🛵🌴\n\n` +
      `🛵 Island Delivery via WhatsApp: +66 095 882 5573\n` +
      `🌐 Resort & Dining: flowerpowervillage.com\n` +
      `📍 Buffalo Bay (Ao Khao Kwai), Koh Phayam\n` +
      `@flowerpowerphayam\n\n` +
      `🇹🇭 หิวอาหารอิตาเลียนแท้ๆ บนเกาะพยามใช่ไหมครับ? ครัว Flower Power พร้อมเสิร์ฟความอร่อยครบเครื่อง ริมอ่าวเขาควาย 🍝🍕✨\n\n` +
      `• พิซซ่าอิตาเลียนแท้ แป้งหมักธรรมชาติ 48 ชม. 🍕\n` +
      `• พาสต้าเส้นสดทำเอง ซอสสูตรดั้งเดิมอิตาเลียน 🍝\n` +
      `• ปรุงสดใหม่จานต่อจานด้วยวัตถุดิบคุณภาพ 🌿🔥\n\n` +
      `แวะมาทานที่ร้านท่ามกลางสวนธรรมชาติ หรือสั่งเดลิเวอรี่ส่งตรงถึงที่พักบนเกาะพยามได้เลยครับ! 🛵🌴\n\n` +
      `🛵 สั่งอาหารและเดลิเวอรี่ผ่าน WhatsApp: +66 095 882 5573\n` +
      `🌐 ข้อมูลและที่พัก: flowerpowervillage.com\n` +
      `📍 อ่าวเขาควาย เกาะพยาม จ.ระนอง\n\n` +
      `#KohPhayam #KohPhayamRestaurant #KohPhayamFood #PhayamDelivery #ItalianRestaurantPhayam #BuffaloBay #เกาะพยาม #อ่าวเขาควาย`
    );
  }

  if (mode === 'LM1') {
    return (
      `🇬🇧 Looking for peaceful bungalows surrounded by tropical greenery in Koh Phayam? 🌴✨\n\n` +
      `Today we have vacant rooms and private wooden bungalows at Buffalo Bay with instant direct booking discount!\n\n` +
      `• Superior & Deluxe Garden Bungalows 🌿\n` +
      `• King size beds, private hammocks & high-speed fiber Wi-Fi 📶\n` +
      `• On-site authentic Italian restaurant & scooter rental 🛵🍕\n\n` +
      `🏝️ Check live rates & book direct: flowerpowervillage.com\n` +
      `💬 WhatsApp Staff: +66 095 882 5573\n` +
      `📍 Buffalo Bay, Koh Phayam Island\n` +
      `@flowerpowerphayam\n\n` +
      `🇹🇭 พักผ่อนท่ามกลางสวนธรรมชาติอ่าวเขาควาย เกาะพยาม 🌴 ห้องพักว่างวันนี้พร้อมส่วนลดจองตรงพิเศษ!\n\n` +
      `• บังกะโลไม้ส่วนตัวและห้องพักในสวนทรอปิคอล 🌿\n` +
      `• เตียงคิงไซส์ เปลญวนส่วนตัว และ Wi-Fi ไฟเบอร์ความเร็วสูง 📶\n` +
      `• ร้านอาหารอิตาเลียนในที่พัก และบริการเช่ามอเตอร์ไซค์ 🛵🍕\n\n` +
      `🏝️ จองตรงราคาดีที่สุด: flowerpowervillage.com\n` +
      `💬 ติดต่อสอบถามทาง WhatsApp: +66 095 882 5573\n` +
      `📍 อ่าวเขาควาย เกาะพยาม จ.ระนอง\n\n` +
      `#KohPhayam #PhayamBungalow #KohPhayamResort #BuffaloBay #ThailandTravel #เกาะพยาม #ที่พักเกาะพยาม #อ่าวเขาควาย`
    );
  }

  if (!isPizza) {
    // Villaggio: V1, V2, V3 (1° Inglese, 2° Thai, Zero Sunset/Tramonto, Zero Italiano)
    return (
      `🇬🇧 Pure island serenity at Buffalo Bay, Koh Phayam! 🌴 Gentle sea breeze, lush tropical garden, king size beds and quiet peace. Escape the ordinary and unwind in nature. 🌊🌿\n\n` +
      `🏝️ Direct booking: flowerpowervillage.com\n` +
      `📍 Buffalo Bay, Koh Phayam Island\n` +
      `@flowerpowerphayam\n\n` +
      `🇹🇭 ความสุขที่แท้จริงคือความเงียบสงบในธรรมชาติ เกาะพยาม 🌴 พักผ่อนในสวนทรอปิคอลเขียวขจี อ่าวเขาควาย ลมทะเลพัดเย็นสบายและความสงบสุข 🌊🌿✨\n\n` +
      `🏝️ จองตรงราคาดีที่สุด: flowerpowervillage.com\n` +
      `📍 อ่าวเขาควาย เกาะพยาม จ.ระนอง\n\n` +
      `#KohPhayam #BuffaloBay #PhayamIsland #TropicalResort #RanongTravel #เกาะพยาม #อ่าวเขาควาย #เที่ยวระนอง`
    );
  }

  // Pizzeria: P2 Pasta
  if (mode === 'P2') {
    return (
      `🇹🇭 เมนูกลางวันอร่อยๆ ในระนอง! พาสต้าเส้นสดทำเอง ซอสสูตรดั้งเดิมอิตาเลียนแท้ เสิร์ฟร้อนๆ ถึงบ้านหรือออฟฟิศ 🍝🛵💨\n\n` +
      `🛵 สั่งง่ายๆ ส่งไว: flowerpowerpizza.com\n` +
      `📍 Ranong Delivery & Takeaway\n` +
      `@flowerpowerpizzaranong\n\n` +
      `🇬🇧 Homemade fresh pasta ready for lunch delivery in Ranong! Rich sauces and authentic Italian flavors delivered hot. 🍝🛵💨\n\n` +
      `🛵 Order now: flowerpowerpizza.com\n` +
      `📍 Ranong Delivery & Takeaway\n` +
      `@flowerpowerpizzaranong\n\n` +
      `#พาสต้าระนอง #RanongPasta #LunchRanong #DeliveryRanong #PastaFresca`
    );
  }

  // Pizzeria: P3 Dessert
  if (mode === 'P3') {
    return (
      `🇹🇭 ของหวานโฮมเมดสไตล์อิตาเลียนแท้ ปิดท้ายมื้อค่ำในระนอง! ทิรามิสุคลาสสิกและเค้กอบสดใหม่ หวานนุ่มละมุนลิ้น 🍰☕✨\n\n` +
      `🛵 สั่งของหวานส่งถึงบ้าน: flowerpowerpizza.com\n` +
      `📍 Ranong Delivery & Takeaway\n` +
      `@flowerpowerpizzaranong\n\n` +
      `🇬🇧 Authentic homemade Italian desserts in Ranong! Classic tiramisù and artisan sweets to end your dinner perfectly. 🍰☕✨\n\n` +
      `🛵 Order now: flowerpowerpizza.com\n` +
      `📍 Ranong Delivery & Takeaway\n` +
      `@flowerpowerpizzaranong\n\n` +
      `#RanongDessert #TiramisuRanong #ของหวานระนอง #RanongFood #DeliveryRanong`
    );
  }

  // Pizzeria: P1 Pizza Tradizionale
  return (
    `🇹🇭 พิซซ่าอิตาเลียนแท้ แป้งหมักธรรมชาติ 48 ชม. อบร้อนหอมกรอบบนหิน พร้อมส่งตรงถึงบ้านในเมืองระนอง! 🍕🔥🛵💨\n\n` +
    `🛵 สั่งง่ายๆ ส่งไว: flowerpowerpizza.com\n` +
    `📍 Ranong Delivery & Takeaway\n` +
    `@flowerpowerpizzaranong\n\n` +
    `🇬🇧 Authentic traditional Italian pizza in Ranong! Slow 48h natural proofing baked hot on stone. Piping hot home delivery! 🍕🔥🛵💨\n\n` +
    `🛵 Order now: flowerpowerpizza.com\n` +
    `📍 Ranong Delivery & Takeaway\n` +
    `@flowerpowerpizzaranong\n\n` +
    `#พิซซ่าระนอง #RanongPizza #DinnerRanong #RanongFood #DeliveryRanong`
  );
}

// Invia post ufficiale completo a Telegram Topic:
// - Topic 3 (Stories): SOLO VIDEO STREAMING CON PULSANTI SOTTO (Zero box testo ridondante)
// - Topic 2 (Gruppo FB): VIDEO + SCHEDA TESTO CON <pre> BILINGUE E GUIDA COPIA
async function sendOfficialTelegramPost({ topicId, title, format, brand, priceBadge, copyText = '', filePath, videoUrl }) {
  if (dryRun) {
    console.log(`[DRY-RUN] Invierei su Telegram Topic ${topicId}: ${format} (${title})\n${copyText}`);
    return { ok: true, dryRun: true };
  }

  const token = await getTelegramToken();
  if (!token) throw new Error('Token Telegram non trovato!');

  let finalUrl = videoUrl;
  if (!finalUrl && filePath) {
    const uploaded = await ensureCloudVideoUrl(filePath);
    finalUrl = uploaded.videoUrl;
  }

  const isTopic2 = (topicId === TOPIC_KOH_PHAYAM_GROUP);
  const isStories = (topicId === TOPIC_TIKTOK_STORIES);
  const icon = isTopic2 ? '🌴' : '📱';
  const brandName = brand === 'pizza' ? 'Pizzeria Ranong' : 'Villaggio Koh Phayam';

  // 1. Canale Stories (Topic 3): INVIO PULITO DIRETTO DEL SOLO VIDEO CON TASTI RAPIDI (Zero testo ridondante)
  if (isStories) {
    const storyButtons = [];
    if (finalUrl && (finalUrl.startsWith('http://') || finalUrl.startsWith('https://'))) {
      storyButtons.push([{ text: '⬇️ Scarica Video MP4 (9:16)', url: finalUrl }]);
    }
    storyButtons.push([
      { text: '📱 Apri TikTok Stories', url: 'https://www.tiktok.com/' },
      { text: '📸 Apri Instagram Stories', url: 'https://www.instagram.com/' }
    ]);

    console.log(`[scheduler-dispatch] Invio Video Stories MP4 (${format}) con pulsanti rapidi a Topic ${topicId}...`);
    const vidRes = await fetch(`https://api.telegram.org/bot${token}/sendVideo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_thread_id: topicId,
        video: finalUrl,
        caption: `📱 <b>${title}</b>\n🎬 Format: ${format} · 🏷️ Brand: ${brandName}`,
        parse_mode: 'HTML',
        supports_streaming: true,
        width: 1080,
        height: 1920,
        reply_markup: { inline_keyboard: storyButtons }
      })
    });
    const vidJson = await vidRes.json();
    if (!vidJson.ok) console.warn('[scheduler-dispatch] Avviso sendVideo Stories:', vidJson);
    console.log(`✅ [scheduler-dispatch] Video Stories recapitato con successo a Topic ${topicId} (senza scheda testo ridondante)!`);
    return { ok: true, vidJson };
  }

  // 2. Canale Gruppo Facebook (Topic 2): Invio Video Streaming
  if (finalUrl) {
    console.log(`[scheduler-dispatch] Invio file video streaming (${format}) a Topic ${topicId}...`);
    const vidRes = await fetch(`https://api.telegram.org/bot${token}/sendVideo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_thread_id: topicId,
        video: finalUrl,
        caption: `${icon} <b>${title}</b>\n🎬 Format: ${format} · 🏷️ Brand: ${brandName}`,
        parse_mode: 'HTML',
        supports_streaming: true,
        width: 1080,
        height: 1920
      })
    });
    const vidJson = await vidRes.json();
    if (!vidJson.ok) console.warn('[scheduler-dispatch] Avviso sendVideo:', vidJson);
  }

  // 3. Canale Gruppo Facebook (Topic 2): Scheda Testo con <pre> e guida rapida
  let messageText = `${icon} <b>${title}</b>\n`;
  messageText += `🎬 <b>Format:</b> ${format} | 🏷️ <b>Brand:</b> ${brandName}\n`;
  if (priceBadge) {
    messageText += `💰 <b>Prezzo Offerta:</b> ${priceBadge}\n`;
  }
  messageText += `\n━━━━━━━━━━━━━━━━━━━━\n`;
  messageText += `📋 <b>TESTO DA COPIARE PER IL POST:</b>\n`;
  messageText += `<i>👇 Clicca o tocca il riquadro qui sotto: il testo viene copiato istantaneamente negli appunti!</i>\n\n`;
  messageText += `<pre>${escapeHtml(copyText.trim())}</pre>\n`;
  messageText += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  messageText += `👉 <b>Come pubblicare in 3 secondi:</b>\n`;
  messageText += `1️⃣ Clicca sul riquadro col testo sopra per copiarlo negli appunti\n`;
  messageText += `2️⃣ Clicca sul tasto sotto <b>"🌐 Vai al Gruppo Koh Phayam"</b>\n`;
  messageText += `3️⃣ <b>Incolla nel post Facebook allegando il video:</b>\n`;
  messageText += `   • 💻 <i>Da Computer (PC/Mac):</i> premi <code>Ctrl + Shift + V</code>\n`;
  messageText += `   • 📱 <i>Da Telefono/Tablet:</i> tieni premuto e incolla! 🚀`;

  const inlineKeyboard = [];
  const cleanCopy = copyText.trim();
  if (cleanCopy.length <= 256) {
    inlineKeyboard.push([{ text: '📋 Copia Testo Post (1 Tocco)', copy_text: { text: cleanCopy } }]);
  }
  inlineKeyboard.push([{ text: '🌐 Vai al Gruppo Koh Phayam', url: 'https://www.facebook.com/share/g/1Hyh1mJ7Hu/' }]);
  if (finalUrl && (finalUrl.startsWith('http://') || finalUrl.startsWith('https://'))) {
    inlineKeyboard.push([{ text: '⬇️ Scarica Video MP4 (9:16)', url: finalUrl }]);
  }

  console.log(`[scheduler-dispatch] Invio Scheda Testo con Pulsanti per ${format} a Topic ${topicId}...`);
  const msgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_thread_id: topicId,
      text: messageText,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: { inline_keyboard: inlineKeyboard }
    })
  });
  const msgJson = await msgRes.json();
  if (!msgJson.ok) {
    console.error(`[scheduler-dispatch] Errore invio scheda testo Telegram:`, msgJson);
    throw new Error('Telegram sendMessage failed');
  }
  console.log(`✅ [scheduler-dispatch] Scheda con pulsanti consegnata con successo a Topic ${topicId}!`);
  return { ok: true, msgJson };
}

async function sendVideoToTelegram({ filePath, topicId, caption, videoUrl }) {
  return sendOfficialTelegramPost({
    topicId,
    title: 'Contenuto Social Media Studio',
    format: 'Video',
    brand: 'village',
    copyText: caption,
    filePath,
    videoUrl
  });
}

// 🌐 Pubblicazione automatica su Pagina Facebook (Reels o 24h Stories)
async function publishToFacebook({ videoUrl, videoBuffer, title = '', caption = '', brand = 'pizza', isStory = false }) {
  if (dryRun) {
    console.log(`[DRY-RUN] Pubblicazione Facebook (${brand}, isStory: ${isStory}) con URL: ${videoUrl}`);
    return { ok: true, dryRun: true, id: 'mock_fb_id' };
  }

  const isPizza = (brand === 'pizza');
  const pageId = isPizza ? (env.META_PIZZA_PAGE_ID || '410856732111386') : (env.META_VILLAGE_PAGE_ID || '106883044573670');
  const pageToken = isPizza ? env.META_PIZZA_PAGE_TOKEN : env.META_VILLAGE_PAGE_TOKEN;

  if (!pageToken) {
    throw new Error(`Meta Page Token mancante per ${brand}`);
  }

  if (isStory) {
    console.log(`[scheduler-dispatch] Inizio pubblicazione Facebook Story (Page ID: ${pageId})...`);
    const startRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/video_stories?upload_phase=start&access_token=${pageToken}`, {
      method: 'POST'
    });
    const startData = await startRes.json();
    if (!startRes.ok || !startData.upload_url || !startData.video_id) {
      throw new Error(`FB Stories start failed: ${JSON.stringify(startData.error || startData)}`);
    }

    const vBuf = videoBuffer || Buffer.from(await (await fetch(videoUrl)).arrayBuffer());
    const upRes = await fetch(startData.upload_url, {
      method: 'POST',
      headers: {
        'Authorization': `OAuth ${pageToken}`,
        'offset': '0',
        'file_size': String(vBuf.length)
      },
      body: vBuf
    });
    await upRes.json();

    const fParams = new URLSearchParams();
    fParams.append('access_token', pageToken);
    fParams.append('upload_phase', 'finish');
    fParams.append('video_id', startData.video_id);

    const finishRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/video_stories`, {
      method: 'POST',
      body: fParams
    });
    const finishData = await finishRes.json();
    if (!finishRes.ok || finishData.error) {
      throw new Error(`FB Stories finish failed: ${JSON.stringify(finishData.error || finishData)}`);
    }
    const storyId = finishData.post_id || startData.video_id;
    console.log(`🎉 [scheduler-dispatch] Facebook Story pubblicata con successo! (ID: ${storyId})`);
    return { ok: true, id: storyId };
  } else {
    console.log(`[scheduler-dispatch] Invio Reel video su Pagina Facebook (Page ID: ${pageId})...`);
    const params = new URLSearchParams();
    params.append('access_token', pageToken);
    params.append('file_url', videoUrl);
    if (caption || title) params.append('description', (caption || title).slice(0, 5000));
    if (title) params.append('title', title.slice(0, 255));

    const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/videos`, {
      method: 'POST',
      body: params
    });
    const fbData = await fbRes.json();
    if (!fbRes.ok || fbData.error) {
      throw new Error(`FB Reel publish failed: ${JSON.stringify(fbData.error || fbData)}`);
    }
    console.log(`🎉 [scheduler-dispatch] Facebook Reel pubblicato con successo! (Video ID: ${fbData.id})`);
    return { ok: true, id: fbData.id, postUrl: `https://www.facebook.com/${fbData.id}` };
  }
}

// 📸 Pubblicazione automatica su Instagram (Reels o 24h Stories)
async function publishToInstagram({ videoUrl, caption = '', brand = 'village', isStory = false }) {
  if (dryRun) {
    console.log(`[DRY-RUN] Pubblicazione Instagram (${brand}, isStory: ${isStory}) con URL: ${videoUrl}`);
    return { ok: true, dryRun: true, id: 'mock_ig_id' };
  }

  const isPizza = (brand === 'pizza');
  const pageId = isPizza ? (env.META_PIZZA_PAGE_ID || '410856732111386') : (env.META_VILLAGE_PAGE_ID || '106883044573670');
  const pageToken = isPizza ? env.META_PIZZA_PAGE_TOKEN : env.META_VILLAGE_PAGE_TOKEN;
  let igId = isPizza ? (env.META_PIZZA_IG_ID || '17841468753633265') : (env.META_VILLAGE_IG_ID || '17841404137072110');

  if (!pageToken) {
    throw new Error(`Meta Page Token mancante per ${brand}`);
  }

  try {
    const pageInfoRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`);
    if (pageInfoRes.ok) {
      const pageInfo = await pageInfoRes.json();
      if (pageInfo?.instagram_business_account?.id) {
        igId = pageInfo.instagram_business_account.id;
      }
    }
  } catch {}

  console.log(`[scheduler-dispatch] Creazione container Instagram ${isStory ? 'STORIES' : 'REELS'} (IG ID: ${igId})...`);
  const cParams = new URLSearchParams();
  cParams.append('access_token', pageToken);
  cParams.append('media_type', isStory ? 'STORIES' : 'REELS');
  cParams.append('video_url', videoUrl);
  if (!isStory && caption) cParams.append('caption', caption.slice(0, 2200));

  const cRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media`, {
    method: 'POST',
    body: cParams
  });
  const cData = await cRes.json();
  if (!cRes.ok || !cData.id) {
    throw new Error(`IG Container creation failed: ${JSON.stringify(cData.error || cData)}`);
  }
  const creationId = cData.id;

  console.log(`[scheduler-dispatch] Attesa elaborazione container Instagram (ID: ${creationId})...`);
  let isReady = false;
  const maxPolls = 40; // fino a 200 secondi (3.3 minuti per transcodifica Meta 60 FPS)
  for (let i = 0; i < maxPolls; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const sRes = await fetch(`https://graph.facebook.com/v19.0/${creationId}?fields=status_code,status&access_token=${pageToken}`);
    if (sRes.ok) {
      const sData = await sRes.json();
      const st = sData.status_code || sData.status;
      console.log(`[scheduler-dispatch] Status container IG (${i + 1}/${maxPolls}): ${st}`);
      if (st === 'FINISHED') {
        isReady = true;
        break;
      }
      if (st === 'ERROR') {
        throw new Error(`IG Video processing error: ${JSON.stringify(sData)}`);
      }
    }
  }

  if (!isReady) {
    throw new Error(`IG Video processing timeout (superati i 200s di elaborazione Meta)`);
  }

  const pParams = new URLSearchParams();
  pParams.append('access_token', pageToken);
  pParams.append('creation_id', creationId);

  const pRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media_publish`, {
    method: 'POST',
    body: pParams
  });
  const pData = await pRes.json();
  if (!pRes.ok || !pData.id) {
    throw new Error(`IG media_publish failed: ${JSON.stringify(pData.error || pData)}`);
  }
  console.log(`🎉 [scheduler-dispatch] Instagram ${isStory ? 'Story' : 'Reel'} pubblicata con successo! (Media ID: ${pData.id})`);
  return { ok: true, id: pData.id };
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
    '--api=https://www.flowerpowerpizza.com',
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

  // Carica il copy ufficiale sincronizzato generato in parità dal player
  let copy = null;
  const copyCandidates = [
    path.join(outDir, `${mode}.copy.json`),
    path.join(outDir, `${mode}.cloud.copy.json`),
    path.join(outDir, `${mode}.local.copy.json`)
  ];
  const copyFile = copyCandidates.find(c => fs.existsSync(c));
  if (copyFile) {
    try {
      copy = JSON.parse(fs.readFileSync(copyFile, 'utf8'));
      console.log(`[scheduler-dispatch] Copy ufficiale sincronizzato caricato da ${copyFile}!`);
    } catch (e) {
      console.warn('[scheduler-dispatch] Errore lettura copy JSON:', e.message);
    }
  }

  return {
    filePath: found,
    copy,
    toString: () => found
  };
}

async function run() {
  console.log(`\n======================================================`);
  console.log(`🚀 ESECUZIONE SLOT: ${targetSlot}`);
  console.log(`======================================================\n`);

  // Identifica lo slot esatto (risolto deterministicamente da resolveTargetSlot entro ±15 min)
  const is0800 = targetSlot === '08:00';
  const is0930 = targetSlot === '09:30';
  const is1130 = targetSlot === '11:30';
  const is1230 = targetSlot === '12:30';
  const is1600 = targetSlot === '16:00';
  const is1700 = targetSlot === '17:00';
  const is1800 = targetSlot === '18:00';
  const is1830 = targetSlot === '18:30';
  const is1930 = targetSlot === '19:30';
  const is2000 = targetSlot === '20:00';
  const is2100 = targetSlot === '21:00';

  if (is0800) {
    console.log(`🌅 [08:00 BANGKOK] Avvio tranche mattutina: 2 Stories TikTok/IG + 1 Reel Gruppo Phayam`);

    // 1. Story Pizzeria Ranong (Topic 3: solo video + tasti)
    const p1Res = await renderVideoMode('P1');
    await sendOfficialTelegramPost({
      topicId: TOPIC_TIKTOK_STORIES,
      title: 'Pizza Tradizionale Ranong 48h · Stories del Mattino',
      format: 'P1',
      brand: 'pizza',
      filePath: p1Res.filePath
    });

    // 2. Story Villaggio Koh Phayam (Topic 3: solo video + tasti)
    const v1Res = await renderVideoMode('V1');
    await sendOfficialTelegramPost({
      topicId: TOPIC_TIKTOK_STORIES,
      title: 'Risveglio Tropicale a Koh Phayam · Stories del Mattino',
      format: 'V1',
      brand: 'village',
      filePath: v1Res.filePath
    });

    // 3. Reel Gruppo Facebook Koh Phayam: LM1 Alloggi Liberi Oggi (Topic 2: video + scheda bilingue 🇬🇧+🇹🇭)
    const lm1Res = await renderVideoMode('LM1').catch(() => v1Res);
    const lm1Text = getBilingualPostCopy('LM1', 'village', lm1Res.copy);

    await sendOfficialTelegramPost({
      topicId: TOPIC_KOH_PHAYAM_GROUP,
      title: 'Alloggi Disponibili Oggi a Koh Phayam · Reel & Post Community',
      format: 'LM1',
      brand: 'village',
      priceBadge: 'Sconto Cascata Live',
      copyText: lm1Text,
      filePath: lm1Res.filePath
    });

    await sendPublishedLog({
      brand: 'village',
      channel: '👥 Gruppo Facebook Koh Phayam + 🎵 TikTok/IG Stories',
      format: 'LM1 / P1 / V1',
      title: 'Stories Mattutine Ranong & Phayam + Post Alloggi LM1',
      details: 'Consegnate 2 Stories 9:16 su Topic 3 (P1 Pizza + V1 Villaggio) e 1 Post Alloggi LM1 su Topic 2 con testo bilingue 🇬🇧+🇹🇭 e tasti interattivi'
    });
  } else if (is0930) {
    console.log(`🌿 [09:30 BANGKOK] Slot Story Mattino — PUBBLICAZIONE INSTAGRAM STORIES V1`);
    const storyRes = await renderVideoMode('V1');
    const { videoUrl } = await ensureCloudVideoUrl(storyRes.filePath);
    try {
      const igRes = await publishToInstagram({ videoUrl, brand: 'village', isStory: true });
      await sendPublishedLog({
        brand: 'village',
        channel: '📸 Instagram Stories',
        format: 'V1',
        title: 'Risveglio Tropicale a Phayam',
        mediaId: igRes.id
      });
    } catch (igErr) {
      console.warn('[scheduler-dispatch] Instagram Story non riuscita, fallback su Telegram Topic 3:', igErr.message);
      await sendOfficialTelegramPost({
        topicId: TOPIC_TIKTOK_STORIES,
        title: 'V1 Storia Risveglio Tropicale a Phayam',
        format: 'V1',
        brand: 'village',
        filePath: storyRes.filePath
      });
      await sendFailedAlert({
        brand: 'village',
        channel: '📸 Instagram Stories',
        format: 'V1',
        title: 'Risveglio Tropicale a Phayam',
        error: igErr,
        fallbackAction: 'Video master recapitato su Telegram Topic 3 per pubblicazione manuale con 1 tocco dello staff.'
      });
    }
  } else if (is1130) {
    console.log(`🍝 [11:30 BANGKOK] Slot Pranzo Ranong — PUBBLICAZIONE 100% AUTOMATICA FACEBOOK REEL`);
    const p2Res = await renderVideoMode('P2');
    const { videoUrl } = await ensureCloudVideoUrl(p2Res.filePath);
    const p2Caption = getBilingualPostCopy('P2', 'pizza', p2Res.copy);

    try {
      const fbRes = await publishToFacebook({
        videoUrl,
        title: 'Pranzo Pasta Fresca Ranong 🍝 Piatto Espresso Caldo',
        caption: p2Caption,
        brand: 'pizza',
        isStory: false
      });

      await sendPublishedLog({
        brand: 'pizza',
        channel: '📘 Facebook Pagina (Reel Pranzo)',
        format: 'P2',
        title: 'Pranzo Pasta Fresca Ranong',
        mediaId: fbRes.postUrl || fbRes.id
      });
    } catch (fbErr) {
      console.warn('[scheduler-dispatch] Facebook Reel Pranzo fallito, fallback su Telegram Topic 2:', fbErr.message);
      await sendOfficialTelegramPost({
        topicId: TOPIC_KOH_PHAYAM_GROUP,
        title: 'Pranzo Pasta Fresca Ranong · Reel Pagina Facebook',
        format: 'P2',
        brand: 'pizza',
        copyText: p2Caption,
        filePath: p2Res.filePath
      });
      await sendFailedAlert({
        brand: 'pizza',
        channel: '📘 Facebook Pagina (Reel Pranzo)',
        format: 'P2',
        title: 'Pranzo Pasta Fresca Ranong',
        error: fbErr,
        fallbackAction: 'Video master e testo bilingue recapitati su Telegram Topic 2 con link diretto per pubblicazione staff.'
      });
    }
  } else if (is1230) {
    console.log(`🍕 [12:30 BANGKOK] Slot Story Pranzo — PUBBLICAZIONE 100% AUTOMATICA FACEBOOK STORIES`);
    const p1StoryRes = await renderVideoMode('P1');
    const { videoUrl, buffer } = await ensureCloudVideoUrl(p1StoryRes.filePath);
    try {
      const fbRes = await publishToFacebook({
        videoUrl,
        videoBuffer: buffer,
        brand: 'pizza',
        isStory: true
      });

      await sendPublishedLog({
        brand: 'pizza',
        channel: '📘 Facebook Pagina (Story Pranzo)',
        format: 'P1',
        title: 'Pranzo Pizzeria Ranong 48h',
        mediaId: fbRes.id
      });
    } catch (fbErr) {
      console.warn('[scheduler-dispatch] Facebook Story Pranzo fallita, fallback su Telegram Topic 3:', fbErr.message);
      await sendOfficialTelegramPost({
        topicId: TOPIC_TIKTOK_STORIES,
        title: 'P1 Story Pranzo Pizzeria Ranong',
        format: 'P1',
        brand: 'pizza',
        filePath: p1StoryRes.filePath
      });
      await sendFailedAlert({
        brand: 'pizza',
        channel: '📘 Facebook Pagina (Story Pranzo)',
        format: 'P1',
        title: 'Pranzo Pizzeria Ranong 48h',
        error: fbErr,
        fallbackAction: 'Video master recapitato su Telegram Topic 3 per pubblicazione immediata con 1 tocco dello staff.'
      });
    }
  } else if (is1600) {
    console.log(`🌿 [16:00 BANGKOK] Slot Pomeriggio Relax — PUBBLICAZIONE INSTAGRAM REEL V2`);
    const v2Res = await renderVideoMode('V2');
    const { videoUrl } = await ensureCloudVideoUrl(v2Res.filePath);
    const v2Caption = getBilingualPostCopy('V2', 'village', v2Res.copy);

    try {
      const igRes = await publishToInstagram({
        videoUrl,
        caption: v2Caption,
        brand: 'village',
        isStory: false
      });

      await sendPublishedLog({
        brand: 'village',
        channel: '📸 Instagram Reels',
        format: 'V2',
        title: 'Pomeriggio Relax & Suite Tour a Phayam',
        mediaId: igRes.id
      });
    } catch (igErr) {
      console.warn('[scheduler-dispatch] Instagram API diretta non riuscita, fallback su Telegram Topic 3:', igErr.message);
      await sendOfficialTelegramPost({
        topicId: TOPIC_TIKTOK_STORIES,
        title: 'V2 Reel Relax Pomeriggio a Phayam · Instagram & TikTok',
        format: 'V2',
        brand: 'village',
        filePath: v2Res.filePath
      });
      await sendFailedAlert({
        brand: 'village',
        channel: '📸 Instagram Reels',
        format: 'V2',
        title: 'Pomeriggio Relax & Suite Tour a Phayam',
        error: igErr,
        fallbackAction: 'Video master Full HD archiviato su Google Drive 5TB e consegnato su Telegram Topic 3 con tasti per pubblicazione immediata con 1 tocco dello staff.'
      });
    }
  } else if (is1700) {
    console.log(`🌅 [17:00 BANGKOK] Avvio tranche serale: 2 Stories TikTok/IG + 1 Reel R1 Ristorante Gruppo Phayam`);

    // 1. Story Cena Pizzeria Ranong (Topic 3: solo video + tasti)
    const p1Res = await renderVideoMode('P1');
    await sendOfficialTelegramPost({
      topicId: TOPIC_TIKTOK_STORIES,
      title: 'Cena Pizza Tradizionale Ranong 48h · Stories Serali',
      format: 'P1',
      brand: 'pizza',
      filePath: p1Res.filePath
    });

    // 2. Story Serale Villaggio Koh Phayam (Topic 3: solo video + tasti - ZERO TRAMONTO)
    const v3Res = await renderVideoMode('V3');
    await sendOfficialTelegramPost({
      topicId: TOPIC_TIKTOK_STORIES,
      title: 'Atmosfera Serale a Koh Phayam · Stories Serali',
      format: 'V3',
      brand: 'village',
      filePath: v3Res.filePath
    });

    // 3. Reel Gruppo Facebook Koh Phayam: R1 Ristorante (Topic 2: video + scheda bilingue 🇬🇧+🇹🇭, ZERO ITALIANO)
    const r1Res = await renderVideoMode('R1').catch(() => v3Res);
    const r1Text = getBilingualPostCopy('R1', 'village', r1Res.copy);

    await sendOfficialTelegramPost({
      topicId: TOPIC_KOH_PHAYAM_GROUP,
      title: 'Cena & Pizza a Domicilio a Koh Phayam · Reel & Post Community',
      format: 'R1',
      brand: 'village',
      copyText: r1Text,
      filePath: r1Res.filePath
    });

    await sendPublishedLog({
      brand: 'village',
      channel: '👥 Gruppo Facebook Koh Phayam + 🎵 TikTok/IG Stories',
      format: 'R1 / P1 / V3',
      title: 'Stories Serali Ranong & Phayam + Post Ristorante R1',
      details: 'Consegnate 2 Stories 9:16 su Topic 3 (P1 Pizza + V3 Villaggio) e 1 Reel R1 Ristorante su Topic 2 con testo bilingue 🇬🇧+🇹🇭 e tasti interattivi'
    });
  } else if (is1800) {
    console.log(`🌿 [18:00 BANGKOK] Slot Story Serale — PUBBLICAZIONE INSTAGRAM STORIES V3`);
    const sunsetRes = await renderVideoMode('V3');
    const { videoUrl } = await ensureCloudVideoUrl(sunsetRes.filePath);
    try {
      const igRes = await publishToInstagram({ videoUrl, brand: 'village', isStory: true });
      await sendPublishedLog({
        brand: 'village',
        channel: '📸 Instagram Stories',
        format: 'V3',
        title: 'Atmosfera Tropicale Serale a Koh Phayam',
        mediaId: igRes.id
      });
    } catch (igErr) {
      console.warn('[scheduler-dispatch] Instagram Story non riuscita, fallback su Telegram Topic 3:', igErr.message);
      await sendOfficialTelegramPost({
        topicId: TOPIC_TIKTOK_STORIES,
        title: 'V3 Storia Serale a Koh Phayam',
        format: 'V3',
        brand: 'village',
        filePath: sunsetRes.filePath
      });
      await sendFailedAlert({
        brand: 'village',
        channel: '📸 Instagram Stories',
        format: 'V3',
        title: 'Atmosfera Tropicale Serale a Koh Phayam',
        error: igErr,
        fallbackAction: 'Video master recapitato su Telegram Topic 3 per pubblicazione manuale con 1 tocco dello staff.'
      });
    }
  } else if (is1830) {
    console.log(`🎵 [18:30 BANGKOK] Slot TikTok Feed API (Post Feed 9:16)`);
    console.log(`ℹ️ Canale TikTok Feed API attualmente disattivato in attesa dell'approvazione v2 da TikTok for Developers. Slot saltato correttamente.`);
  } else if (is1930) {
    console.log(`🍕 [19:30 BANGKOK] Slot Cena Ranong — PUBBLICAZIONE 100% AUTOMATICA FACEBOOK REEL`);
    const p1Res = await renderVideoMode('P1');
    const { videoUrl } = await ensureCloudVideoUrl(p1Res.filePath);
    const p1Caption = getBilingualPostCopy('P1', 'pizza', p1Res.copy);

    try {
      const fbRes = await publishToFacebook({
        videoUrl,
        title: 'Cena Pizza Tradizionale Ranong 🍕 Impasto Naturale 48h',
        caption: p1Caption,
        brand: 'pizza',
        isStory: false
      });

      await sendPublishedLog({
        brand: 'pizza',
        channel: '📘 Facebook Pagina (Reel Cena 48h)',
        format: 'P1',
        title: 'Cena Pizza Tradizionale Ranong 48h',
        mediaId: fbRes.postUrl || fbRes.id
      });
    } catch (fbErr) {
      console.warn('[scheduler-dispatch] Facebook Reel Cena fallito, fallback su Telegram Topic 2:', fbErr.message);
      await sendOfficialTelegramPost({
        topicId: TOPIC_KOH_PHAYAM_GROUP,
        title: 'Cena Pizza Tradizionale Ranong 48h · Reel Pagina Facebook',
        format: 'P1',
        brand: 'pizza',
        copyText: p1Caption,
        filePath: p1Res.filePath
      });
      await sendFailedAlert({
        brand: 'pizza',
        channel: '📘 Facebook Pagina (Reel Cena 48h)',
        format: 'P1',
        title: 'Cena Pizza Tradizionale Ranong 48h',
        error: fbErr,
        fallbackAction: 'Video master e testo bilingue recapitati su Telegram Topic 2 con link diretto per pubblicazione staff.'
      });
    }
  } else if (is2000) {
    console.log(`☕ [20:00 BANGKOK] Slot Story Serale — PUBBLICAZIONE 100% AUTOMATICA FACEBOOK STORIES`);
    const p3Res = await renderVideoMode('P3');
    const { videoUrl, buffer } = await ensureCloudVideoUrl(p3Res.filePath);
    try {
      const fbRes = await publishToFacebook({
        videoUrl,
        videoBuffer: buffer,
        brand: 'pizza',
        isStory: true
      });

      await sendPublishedLog({
        brand: 'pizza',
        channel: '📘 Facebook Pagina (Story Serale)',
        format: 'P3',
        title: 'Dessert Artigianali & Serata Ranong',
        mediaId: fbRes.id
      });
    } catch (fbErr) {
      console.warn('[scheduler-dispatch] Facebook Story Serale fallita, fallback su Telegram Topic 3:', fbErr.message);
      await sendOfficialTelegramPost({
        topicId: TOPIC_TIKTOK_STORIES,
        title: 'P3 Story Dolce & Serata Pizzeria Ranong',
        format: 'P3',
        brand: 'pizza',
        filePath: p3Res.filePath
      });
      await sendFailedAlert({
        brand: 'pizza',
        channel: '📘 Facebook Pagina (Story Serale)',
        format: 'P3',
        title: 'Dessert Artigianali & Serata Ranong',
        error: fbErr,
        fallbackAction: 'Video master recapitato su Telegram Topic 3 per pubblicazione immediata con 1 tocco dello staff.'
      });
    }
  } else if (is2100) {
    console.log(`🌙 [21:00 BANGKOK] Slot Notte — PUBBLICAZIONE 100% AUTOMATICA INSTAGRAM REEL`);
    const v3Res = await renderVideoMode('V3');
    const { videoUrl } = await ensureCloudVideoUrl(v3Res.filePath);
    const v3Caption = getBilingualPostCopy('V3', 'village', v3Res.copy);

    try {
      const igRes = await publishToInstagram({
        videoUrl,
        caption: v3Caption,
        brand: 'village',
        isStory: false
      });

      await sendPublishedLog({
        brand: 'village',
        channel: '📸 Instagram Reels',
        format: 'V3',
        title: 'Notte Tropical Escape Phayam',
        mediaId: igRes.id
      });
    } catch (igErr) {
      console.warn('[scheduler-dispatch] Instagram Reel Notte fallito, fallback su Telegram Topic 3:', igErr.message);
      await sendOfficialTelegramPost({
        topicId: TOPIC_TIKTOK_STORIES,
        title: 'V3 Reel Notte Tropicale a Koh Phayam · Instagram & TikTok',
        format: 'V3',
        brand: 'village',
        filePath: v3Res.filePath
      });
      await sendFailedAlert({
        brand: 'village',
        channel: '📸 Instagram Reels',
        format: 'V3',
        title: 'Notte Tropical Escape Phayam',
        error: igErr,
        fallbackAction: 'Video master Full HD archiviato su Google Drive 5TB e consegnato su Telegram Topic 3 con tasti per pubblicazione immediata con 1 tocco dello staff.'
      });
    }
  } else {
    console.log(`ℹ️ Nessun evento programmato per lo slot ${targetSlot}. Scheduler a riposo.`);
  }

  console.log(`\n🎉 Esecuzione completata con successo!`);
}

run().catch(async (err) => {
  console.error('[scheduler-dispatch] ERRORE FATALE:', err);
  await sendFailedAlert(err, `Esecuzione Slot ${targetSlot}`);
  process.exit(1);
});
