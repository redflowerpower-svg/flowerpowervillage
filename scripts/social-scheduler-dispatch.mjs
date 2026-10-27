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
  if (bestDist <= 25) {
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

// Invia video renderizzato a Telegram Topic
async function sendVideoToTelegram({ filePath, topicId, caption, videoUrl }) {
  if (dryRun) {
    console.log(`[DRY-RUN] Invierei su Telegram Topic ${topicId}: ${filePath}\nCaption:\n${caption}`);
    return { ok: true, dryRun: true };
  }

  const token = await getTelegramToken();
  if (!token) throw new Error('Token Telegram non trovato!');

  let finalUrl = videoUrl;
  if (!finalUrl) {
    const uploaded = await ensureCloudVideoUrl(filePath);
    finalUrl = uploaded.videoUrl;
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendVideo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_thread_id: topicId,
      video: finalUrl,
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
  for (let i = 0; i < 15; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const sRes = await fetch(`https://graph.facebook.com/v19.0/${creationId}?fields=status_code,status&access_token=${pageToken}`);
    if (sRes.ok) {
      const sData = await sRes.json();
      console.log(`[scheduler-dispatch] Status container IG (${i + 1}/15): ${sData.status_code || sData.status}`);
      if (sData.status_code === 'FINISHED') {
        isReady = true;
        break;
      }
      if (sData.status_code === 'ERROR') {
        throw new Error(`IG Video processing error: ${JSON.stringify(sData)}`);
      }
    }
  }

  if (!isReady) {
    throw new Error(`IG Video processing timeout (superati i 45s di elaborazione)`);
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
    console.log(`🌿 [09:30 BANGKOK] Slot Story Mattino — PUBBLICAZIONE 100% AUTOMATICA INSTAGRAM STORIES`);
    const storyVid = await renderVideoMode('V1');
    const { videoUrl } = await ensureCloudVideoUrl(storyVid);
    const igRes = await publishToInstagram({ videoUrl, brand: 'village', isStory: true });

    await sendMessageToTelegram({
      topicId: TOPIC_TIKTOK_STORIES,
      text: `✅ [09:30 BANGKOK] Storia Instagram pubblicata automaticamente via Meta Graph API!\nID Media: ${igRes.id}\nBrand: Flower Power Village 🌴`
    });
  } else if (is1130) {
    console.log(`🍝 [11:30 BANGKOK] Slot Pranzo Ranong — PUBBLICAZIONE 100% AUTOMATICA FACEBOOK REEL`);
    const p2Vid = await renderVideoMode('P2');
    const { videoUrl } = await ensureCloudVideoUrl(p2Vid);
    const p2Caption = `🇹🇭 เมนูกลางวันอร่อยๆ ในระนอง! พาสต้าเส้นสดทำเอง ซอสสูตรดั้งเดิมอิตาเลียนแท้ เสิร์ฟร้อนๆ ถึงบ้านหรือออฟฟิศ 🍝🛵💨\n\n` +
      `🇬🇧 Homemade fresh pasta ready for lunch delivery in Ranong! Rich sauces and authentic Italian flavors delivered hot. 🍝🛵💨\n\n` +
      `🛵 Order now: flowerpowerpizza.com\n` +
      `📍 Ranong Delivery & Takeaway\n` +
      `@flowerpowerpizzaranong\n\n` +
      `#พาสต้าระนอง #RanongPasta #LunchRanong #DeliveryRanong #PastaFresca`;

    const fbRes = await publishToFacebook({
      videoUrl,
      title: 'Pranzo Pasta Fresca Ranong 🍝 Piatto Espresso Caldo',
      caption: p2Caption,
      brand: 'pizza',
      isStory: false
    });

    await sendMessageToTelegram({
      topicId: TOPIC_KOH_PHAYAM_GROUP,
      text: `✅ [11:30 BANGKOK] Reel Pranzo Pasta Fresca pubblicato automaticamente su Pagina Facebook!\nLink: ${fbRes.postUrl || fbRes.id}\nBrand: Flower Power Pizza Ranong 🍕`
    });
  } else if (is1230) {
    console.log(`🍕 [12:30 BANGKOK] Slot Story Pranzo — PUBBLICAZIONE 100% AUTOMATICA FACEBOOK STORIES`);
    const fbStoryVid = await renderVideoMode('P1');
    const { videoUrl, buffer } = await ensureCloudVideoUrl(fbStoryVid);
    const fbRes = await publishToFacebook({
      videoUrl,
      videoBuffer: buffer,
      brand: 'pizza',
      isStory: true
    });

    await sendMessageToTelegram({
      topicId: TOPIC_TIKTOK_STORIES,
      text: `✅ [12:30 BANGKOK] Storia Facebook pubblicata automaticamente via Meta Graph API!\nID Post: ${fbRes.id}\nBrand: Flower Power Pizza Ranong 🍕`
    });
  } else if (is1600) {
    console.log(`🌿 [16:00 BANGKOK] Slot Pomeriggio Relax — PUBBLICAZIONE 100% AUTOMATICA INSTAGRAM REEL`);
    const v2Vid = await renderVideoMode('V2');
    const { videoUrl } = await ensureCloudVideoUrl(v2Vid);
    const v2Caption = `🇹🇭 ความสุขที่แท้จริงคือความเงียบสงบในธรรมชาติ เกาะพยาม 🌴 พักผ่อนในวิลล่าส่วนตัวพร้อมระเบียงและเปลญวน 🌊✨\n\n` +
      `🇬🇧 True peace in lush nature at Koh Phayam Island. King size beds, private hammocks and bird songs. 🌿🌴🌊\n\n` +
      `🏝️ Direct booking: flowerpowervillage.com\n` +
      `📍 Koh Phayam Island, Thailand\n` +
      `@flowerpowervillage\n\n` +
      `#KohPhayam #ThailandResort #TropicalVibe #IslandLiving`;

    const igRes = await publishToInstagram({
      videoUrl,
      caption: v2Caption,
      brand: 'village',
      isStory: false
    });

    await sendMessageToTelegram({
      topicId: TOPIC_TIKTOK_STORIES,
      text: `✅ [16:00 BANGKOK] Reel Pomeriggio Relax pubblicato automaticamente su Instagram!\nID Media: ${igRes.id}\nBrand: Flower Power Village 🌴`
    });
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
    console.log(`🌅 [18:00 BANGKOK] Slot Story Golden Hour — PUBBLICAZIONE 100% AUTOMATICA INSTAGRAM STORIES`);
    const sunsetVid = await renderVideoMode('V3');
    const { videoUrl } = await ensureCloudVideoUrl(sunsetVid);
    const igRes = await publishToInstagram({ videoUrl, brand: 'village', isStory: true });

    await sendMessageToTelegram({
      topicId: TOPIC_TIKTOK_STORIES,
      text: `✅ [18:00 BANGKOK] Storia Instagram Golden Hour pubblicata automaticamente via Meta Graph API!\nID Media: ${igRes.id}\nBrand: Flower Power Village 🌴`
    });
  } else if (is1830) {
    console.log(`🎵 [18:30 BANGKOK] Slot TikTok Feed API (Post Feed 9:16)`);
    console.log(`ℹ️ Canale TikTok Feed API attualmente disattivato in attesa dell'approvazione v2 da TikTok for Developers. Slot saltato correttamente.`);
  } else if (is1930) {
    console.log(`🍕 [19:30 BANGKOK] Slot Cena Ranong — PUBBLICAZIONE 100% AUTOMATICA FACEBOOK REEL`);
    const p1Vid = await renderVideoMode('P1');
    const { videoUrl } = await ensureCloudVideoUrl(p1Vid);
    const p1Caption = `🇹🇭 พิซซ่าอิตาเลียนแท้ อบใหม่แป้งหมักธรรมชาติ 48 ชม. หอมกรอบส่งตรงถึงบ้านคุณในเมืองระนอง! 🍕🛵💨\n\n` +
      `🇬🇧 Authentic traditional Italian pizza in Ranong! Slow 48h natural proofing baked hot on stone. Home delivery! 🍕🔥🛵💨\n\n` +
      `🛵 Order now: flowerpowerpizza.com\n` +
      `📍 Ranong Delivery & Takeaway\n` +
      `@flowerpowerpizzaranong\n\n` +
      `#พิซซ่าระนอง #RanongPizza #DinnerRanong #PizzaRanong #DeliveryRanong`;

    const fbRes = await publishToFacebook({
      videoUrl,
      title: 'Cena Pizza Tradizionale Ranong 🍕 Impasto Naturale 48h',
      caption: p1Caption,
      brand: 'pizza',
      isStory: false
    });

    await sendMessageToTelegram({
      topicId: TOPIC_KOH_PHAYAM_GROUP,
      text: `✅ [19:30 BANGKOK] Reel Cena Pizza Tradizionale pubblicato automaticamente su Pagina Facebook!\nLink: ${fbRes.postUrl || fbRes.id}\nBrand: Flower Power Pizza Ranong 🍕`
    });
  } else if (is2000) {
    console.log(`☕ [20:00 BANGKOK] Slot Story Serale — PUBBLICAZIONE 100% AUTOMATICA FACEBOOK STORIES`);
    const dessertVid = await renderVideoMode('P3');
    const { videoUrl, buffer } = await ensureCloudVideoUrl(dessertVid);
    const fbRes = await publishToFacebook({
      videoUrl,
      videoBuffer: buffer,
      brand: 'pizza',
      isStory: true
    });

    await sendMessageToTelegram({
      topicId: TOPIC_TIKTOK_STORIES,
      text: `✅ [20:00 BANGKOK] Storia Facebook Serata pubblicata automaticamente via Meta Graph API!\nID Post: ${fbRes.id}\nBrand: Flower Power Pizza Ranong 🍕`
    });
  } else if (is2100) {
    console.log(`🌙 [21:00 BANGKOK] Slot Notte — PUBBLICAZIONE 100% AUTOMATICA INSTAGRAM REEL`);
    const v3Vid = await renderVideoMode('V3');
    const { videoUrl } = await ensureCloudVideoUrl(v3Vid);
    const v3Caption = `🇹🇭 ราตรีสวัสดิ์จากเกาะพยาม เสียงคลื่นและสายลมใต้แสงดาว 🌴🌙🌊\n\n` +
      `🇬🇧 Peaceful tropical nights at Koh Phayam Island. Escape the cold winter and wake up in paradise. 🌴☀️\n\n` +
      `🏝️ Direct booking discounts: flowerpowervillage.com\n` +
      `📍 Koh Phayam Island, Thailand\n` +
      `@flowerpowervillage\n\n` +
      `#KohPhayam #TropicalEscape #EscapeWinter #IslandNights`;

    const igRes = await publishToInstagram({
      videoUrl,
      caption: v3Caption,
      brand: 'village',
      isStory: false
    });

    await sendMessageToTelegram({
      topicId: TOPIC_TIKTOK_STORIES,
      text: `✅ [21:00 BANGKOK] Reel Notte Tropicale pubblicato automaticamente su Instagram!\nID Media: ${igRes.id}\nBrand: Flower Power Village 🌴`
    });
  } else {
    console.log(`ℹ️ Nessun evento programmato per lo slot ${targetSlot}. Scheduler a riposo.`);
  }

  console.log(`\n🎉 Esecuzione completata con successo!`);
}

run().catch(err => {
  console.error('[scheduler-dispatch] ERRORE:', err);
  process.exit(1);
});
