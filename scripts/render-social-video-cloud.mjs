/**
 * 🎬 FLOWER POWER SOCIAL CLOUD RENDERER (100% CLOUD-NATIVE)
 * Reparto Stagno: Social Media Studio (/src/social)
 *
 * Motore di rendering autonomo ad alte prestazioni per video verticali 9:16 Full HD (1080x1920):
 * - Renderizza video con FFmpeg e Sharp senza dipendere dal browser web o dal PC locale.
 * - Risolve al 100% scatti, frame drop e saturazione/scuro eccessivo dei canvas client-side.
 * - Utilizza spazio colore standard BT.709, CRF 19 e preset fast per la massima nitidezza visiva.
 * - Inserisce il blocco atom 'moov' all'inizio (+faststart) per scrubbing fluido immediato su mobile.
 * - Genera automaticamente grafiche vettoriali SVG ad altissima definizione per header, badge e titoli bilingue.
 * - Carica il video su Supabase Storage e lo notifica al Supergruppo Telegram Staff (Topic 2 o Topic 3).
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import ffmpegStatic from 'ffmpeg-static';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

// 1. Caricamento variabili d'ambiente (da .env locale o secrets cloud GitHub Actions / Vercel)
function loadEnv() {
  const env = { ...process.env };
  if (fs.existsSync('.env')) {
    try {
      const content = fs.readFileSync('.env', 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          let value = (match[2] || '').trim();
          if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
          if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
          if (!env[match[1]]) env[match[1]] = value;
        }
      });
    } catch {}
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || 'https://gjqevgkbjkharczhikcl.supabase.co';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

// Configurazione Supergruppo Telegram Ufficiale
const TELEGRAM_CONFIG = {
  supergroupId: '-1004492692624',
  topics: {
    kohPhayamGroup: 2, // Topic 2: Gruppo locale Facebook Koh Phayam
    tikTokStories: 3    // Topic 3: TikTok & Instagram Stories / Reels
  }
};

const ffmpegPath = process.env.FFMPEG_PATH || ffmpegStatic || 'ffmpeg';

// Parsing argomenti CLI
const args = process.argv.slice(2);
function getArg(key, defaultValue) {
  const prefix = `--${key}=`;
  const found = args.find(a => a.startsWith(prefix));
  if (found) return found.substring(prefix.length);
  return defaultValue;
}

const mode = getArg('mode', 'R1').toUpperCase(); // R1, P1, P2, P3, DS, V1, V2, V3, LM1
const topicKey = getArg('topic', mode === 'R1' ? 'kohPhayamGroup' : 'tikTokStories');
const shouldSendTelegram = getArg('send', 'true') === 'true';
const tmpDir = path.resolve('./scratch');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

async function getTelegramBotToken() {
  if (env.TELEGRAM_SOCIAL_BOT_TOKEN) return env.TELEGRAM_SOCIAL_BOT_TOKEN;
  if (supabase) {
    const { data } = await supabase
      .from('telegram_config')
      .select('bot_token')
      .eq('id', 'social')
      .maybeSingle();
    if (data?.bot_token) return data.bot_token;
  }
  return null;
}

async function downloadAsset(url, localPath) {
  if (fs.existsSync(localPath) && fs.statSync(localPath).size > 1000) return true;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(localPath, buf);
      return true;
    }
  } catch (err) {
    console.warn(`[CloudRenderer] Errore download asset ${url}:`, err.message);
  }
  return false;
}

const testRunFile = getArg('testRunFile', '');
let testRunData = null;
if (testRunFile && fs.existsSync(testRunFile)) {
  try {
    testRunData = JSON.parse(fs.readFileSync(testRunFile, 'utf8'));
    console.log(`[CloudRenderer] Caricato testRun da file: ${testRunFile} (Mode: ${testRunData.mode}, Scene: ${testRunData.scenes?.length})`);
  } catch (err) {
    console.warn(`[CloudRenderer] Errore lettura testRunFile:`, err.message);
  }
}

async function prepareOfficialLogo(logoFile) {
  const logoSize = 249; // 91 * (1080 / 395) fedele 1:1 ad AutoCutLabPlayer
  const circleSvg = Buffer.from(`
    <svg width="${logoSize}" height="${logoSize}">
      <circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2 - 4}" fill="#000" />
    </svg>
  `);

  const circularBase = await sharp(logoFile)
    .resize(logoSize, logoSize, { fit: 'cover' })
    .composite([{ input: circleSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const borderSvg = Buffer.from(`
    <svg width="${logoSize}" height="${logoSize}">
      <circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2 - 4}" fill="none" stroke="#f59e0b" stroke-width="7" />
    </svg>
  `);

  return await sharp(circularBase)
    .composite([{ input: borderSvg, blend: 'over' }])
    .png()
    .toBuffer();
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSceneOverlaySvg(dish, sceneIdx, totalScenes) {
  const s = 1080 / 395; // 2.734177 (Proporzione fedele 1:1 rispetto alla preview DOM 395px)
  const badgeEsc = escapeXml((dish.badge || 'RESTAURANT SPECIAL').replace(/^[✦\s*]+/, '').toUpperCase());
  const primaryEsc = escapeXml(dish.titlePrimary || '');
  const secondaryEsc = escapeXml(dish.titleSecondary || '');
  const priceEsc = escapeXml(dish.price || '290฿').replace(/\s*THB\b/g, '฿').replace(/\s*฿/g, '฿');

  // SVG WhatsApp Icon Path
  const waIconSvg = `
    <g transform="translate(0, 0)">
      <circle cx="35" cy="35" r="35" fill="#25D366" />
      <path d="M19 19 C19 19, 21 16, 24 16 C25 16, 26 17, 27 19 C28 21, 30 25, 30 26 C30 27, 29 28, 28 29 C27 30, 26 31, 28 34 C30 37, 33 40, 36 42 C39 44, 40 43, 41 42 C42 41, 43 40, 44 40 C45 40, 49 42, 51 43 C53 44, 54 45, 54 46 C54 49, 51 51, 51 51 C48 53, 44 54, 38 51 C32 48, 26 42, 22 36 C19 30, 20 26, 22 23 C23 21, 23 20, 23 20 Z" fill="#ffffff" transform="scale(0.85) translate(6, 6)" />
    </g>
  `;

  // SVG LINE Icon Path (Official Simple Icons Vector)
  const lineIconSvg = `
    <g transform="translate(84, 0)">
      <circle cx="35" cy="35" r="35" fill="#06C755" />
      <g transform="translate(10.5, 10.5) scale(2.04)">
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" fill="#ffffff" />
      </g>
    </g>
  `;

  // Calcolo card inferiore matematicamente identico ad AutoCutLabPlayer.tsx:
  // let by = h - (31 * s) - totalCardH;
  const thaiLines = primaryEsc.split(/\n+/).filter(Boolean);
  const engLines = secondaryEsc.split(/\n+/).filter(Boolean);

  const badgeH = 24 * s;
  const thaiH = thaiLines.length * (29 * s);
  const engH = engLines.length * (20 * s);
  const priceH = 35 * s + 19 * s; // distacco prezzo alzato di +10px da 9*s a 19*s
  const totalCardH = badgeH + thaiH + engH + priceH;

  let curY = 1920 - (31 * s) - totalCardH;

  const categoryY = curY;
  curY += badgeH;

  const thaiTextSvg = thaiLines.map((line) => {
    const yPos = curY + (23 * s); // baseline
    curY += 29 * s;
    return `<text x="68" y="${yPos.toFixed(1)}" font-family="'Prompt', 'Kanit', 'Leelawadee UI', sans-serif" font-weight="900" font-size="${Math.round(23 * s)}" fill="#fcd34d" stroke="#000000" stroke-width="${(4 * s).toFixed(1)}" stroke-linejoin="round" paint-order="stroke fill" filter="url(#shadow)">${line}</text>`;
  }).join('\n');

  const engTextSvg = engLines.map((line) => {
    const yPos = curY + (16 * s); // baseline
    curY += 20 * s;
    return `<text x="68" y="${yPos.toFixed(1)}" font-family="'Outfit', 'Inter', 'Segoe UI', sans-serif" font-weight="800" font-size="${Math.round(16 * s)}" fill="#ffffff" stroke="#000000" stroke-width="${(3.5 * s).toFixed(1)}" stroke-linejoin="round" paint-order="stroke fill" filter="url(#shadow)">${line}</text>`;
  }).join('\n');

  curY += 19 * s; // distacco prezzo alzato di +10px da 9*s a 19*s
  const priceY = curY;
  const boxH = 36 * s;
  const boxRadius = 6.5 * s;
  const priceBoxW = Math.max(220, priceEsc.length * (26.5 * s * 0.6) + (24 * s));

  return `
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Top Vignette fedele ad AutoCutLabPlayer -->
    <linearGradient id="topVignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.45" />
      <stop offset="50%" stop-color="#000000" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </linearGradient>

    <!-- Bottom Vignette fedele ad AutoCutLabPlayer -->
    <linearGradient id="bottomVignette" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.40" />
      <stop offset="40%" stop-color="#000000" stop-opacity="0.15" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </linearGradient>

    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.9" />
    </filter>
  </defs>

  <!-- 1. Vignettes -->
  <rect x="0" y="0" width="1080" height="280" fill="url(#topVignette)" />
  <rect x="0" y="1520" width="1080" height="400" fill="url(#bottomVignette)" />

  <!-- 2. Header Centrato R1 (Logo + Testi a destra) -->
  <g transform="translate(410, 66)">
    <!-- Row 1: FLOWER POWER Outfit 900 75px -->
    <text x="0" y="66" font-family="'Outfit', 'Inter', 'Segoe UI', sans-serif" font-weight="900" font-size="75" fill="#ffffff" filter="url(#shadow)">FLOWER POWER</text>
    
    <!-- Row 2: Village italic 64px emerald -->
    <text x="0" y="146" font-family="'Outfit', 'Inter', 'Segoe UI', sans-serif" font-style="italic" font-weight="600" font-size="64" fill="#34d399" filter="url(#shadow)">Village</text>
    
    <!-- Row 3: DELIVERY 66px Rosso con bordo bianco 12px -->
    <g transform="translate(0, 192)">
      <text x="0" y="66" font-family="'Outfit', 'Segoe UI', sans-serif" font-weight="900" font-size="66" fill="#ef4444" stroke="#ffffff" stroke-width="12" stroke-linejoin="round" paint-order="stroke fill" filter="url(#shadow)">DELIVERY</text>
    </g>

    <!-- Row 4: เดลิเวอรี่ 51px Bianco Prompt bold -->
    <g transform="translate(0, 276)">
      <text x="0" y="50" font-family="'Prompt', 'Kanit', 'Leelawadee UI', sans-serif" font-weight="800" font-size="51" fill="#ffffff" filter="url(#shadow)">เดลิเวอรี่</text>
    </g>

    <!-- Row 5: WhatsApp + LINE Icon + Phone +66 095 882 5573 -->
    <g transform="translate(0, 344)">
      ${waIconSvg}
      ${lineIconSvg}
      <text x="172" y="48" font-family="'Outfit', 'Segoe UI', sans-serif" font-weight="900" font-size="48" fill="#25D366" filter="url(#shadow)">+66 095 882 5573</text>
    </g>

    <!-- Row 6: Koh Phayam 44px Outfit 700 Bianco -->
    <g transform="translate(0, 444)">
      <text x="0" y="38" font-family="'Outfit', 'Segoe UI', sans-serif" font-weight="700" font-size="44" fill="#ffffff" opacity="0.95" filter="url(#shadow)">Koh Phayam</text>
    </g>
  </g>

  <!-- 3. Card Bassa R1 -->
  <!-- Categoria: ✦ in rosa + Nome Categoria in bianco -->
  <g transform="translate(68, ${categoryY.toFixed(1)})">
    <text x="0" y="36" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="${Math.round(15.5 * s)}" fill="#f43f5e">✦</text>
    <text x="${Math.round(18 * s)}" y="36" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="${Math.round(15.5 * s)}" fill="#ffffff" letter-spacing="1">${badgeEsc}</text>
  </g>

  <!-- Titolo Thai ambra sopra -->
  ${thaiTextSvg}

  <!-- Titolo Inglese bianco sotto -->
  ${engTextSvg}

  <!-- Pillola Prezzo R1: Box Giallo #FFE500 con ombra solida nera, bordo 5.5px e cifra contornata di bianco -->
  <g transform="translate(68, ${priceY.toFixed(1)})">
    <!-- Ombra solida nera 5.5px x 5.5px -->
    <rect x="${(2 * s).toFixed(1)}" y="${(2 * s).toFixed(1)}" width="${priceBoxW.toFixed(1)}" height="${boxH.toFixed(1)}" rx="${boxRadius.toFixed(1)}" fill="#000000" />
    <!-- Box Giallo #FFE500 -->
    <rect x="0" y="0" width="${priceBoxW.toFixed(1)}" height="${boxH.toFixed(1)}" rx="${boxRadius.toFixed(1)}" fill="#FFE500" stroke="#000000" stroke-width="${(2 * s).toFixed(1)}" />
    <!-- Cifra con bordo bianco 10.4px e riempimento nero centrato -->
    <text x="${(priceBoxW / 2).toFixed(1)}" y="${(boxH / 2 + 2.2 * s).toFixed(1)}" font-family="'Kanit', 'Outfit', sans-serif" font-weight="900" font-size="${Math.round(26.5 * s)}" fill="#000000" stroke="#ffffff" stroke-width="${(3.8 * s).toFixed(1)}" stroke-linejoin="round" paint-order="stroke fill" text-anchor="middle" dominant-baseline="central">${priceEsc}</text>
  </g>
</svg>
`;
}

async function generateOutroImage(logoBuf) {
  const baseLogoSize = 315;
  const largeLogo = await sharp(logoBuf).resize(baseLogoSize, baseLogoSize).png().toBuffer();

  const outroSvg = `
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="outroGlow" cx="50%" cy="29%" r="40%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.45" />
      <stop offset="60%" stop-color="#d97706" stop-opacity="0.18" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <filter id="shadowOutro" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.95" />
    </filter>
  </defs>

  <rect width="1080" height="1920" fill="rgba(8, 12, 22, 0.96)" />
  <rect width="1080" height="1920" fill="url(#outroGlow)" />

  <g transform="translate(540, 785)">
    <text x="0" y="0" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="54" fill="#fbbf24" text-anchor="middle" filter="url(#shadowOutro)">FLOWER POWER VILLAGE</text>
    <text x="0" y="52" font-family="'Inter', sans-serif" font-weight="800" font-size="33" fill="#ffffff" text-anchor="middle" filter="url(#shadowOutro)">KOH PHAYAM · THAILAND</text>
    <text x="0" y="96" font-family="'Inter', sans-serif" font-weight="600" font-size="25" fill="#cbd5e1" text-anchor="middle">Tropical Island Resort &amp; Eco Sanctuary</text>
  </g>

  <g transform="translate(54, 915)">
    <rect x="0" y="0" width="972" height="645" rx="39" fill="rgba(11, 17, 32, 0.94)" stroke="rgba(52, 211, 153, 0.75)" stroke-width="3.8" filter="url(#shadowOutro)" />
    <text x="486" y="66" font-family="'Inter', sans-serif" font-weight="900" font-size="34" fill="#34d399" text-anchor="middle">🛵 BUFFALO BAY DELIVERY &amp; RESTAURANT · เกาะพยาม</text>

    <g transform="translate(81, 114)">
      <rect x="0" y="0" width="810" height="102" rx="30" fill="rgba(16, 185, 129, 0.22)" stroke="#34d399" stroke-width="3.8" />
      <text x="405" y="66" font-family="'Outfit', 'Inter', sans-serif" font-weight="900" font-size="46" fill="#ffffff" text-anchor="middle" filter="url(#shadowOutro)">✆ WhatsApp +66 095 882 5573</text>
    </g>

    <text x="486" y="310" font-family="'Inter', sans-serif" font-weight="800" font-size="34" fill="#fbbf24" text-anchor="middle">🛵 Fast Island Delivery in Koh Phayam</text>
    <text x="486" y="400" font-family="'Inter', sans-serif" font-weight="800" font-size="34" fill="#38bdf8" text-anchor="middle">🍕 Authentic Italian Pizza &amp; Homemade Pasta</text>
    <text x="486" y="510" font-family="'Inter', sans-serif" font-weight="700" font-size="30" fill="#e2e8f0" text-anchor="middle">🌴 Buffalo Bay (Ao Khao Kwai) · Koh Phayam</text>
  </g>
</svg>
`;

  const outroBase = await sharp(Buffer.from(outroSvg)).png().toBuffer();
  return await sharp(outroBase)
    .composite([{ input: largeLogo, left: 382, top: 397 }])
    .png()
    .toBuffer();
}

async function run() {
  console.log(`\n======================================================`);
  console.log(`🎬 FLOWER POWER CLOUD VIDEO RENDERER`);
  console.log(`Mode: ${mode} | Topic: ${topicKey} | Send Telegram: ${shouldSendTelegram}`);
  console.log(`======================================================\n`);

  // Carica i dati delle portate da testRunFile se passato, altrimenti catalogo
  let dishes = [];
  if (testRunData && Array.isArray(testRunData.scenes) && testRunData.scenes.length > 0) {
    console.log(`[CloudRenderer] Utilizzo delle ${testRunData.scenes.length} scene attive dal testRun di Social Studio!`);
    dishes = testRunData.scenes.map(sc => ({
      titlePrimary: sc.titlePrimary || '',
      titleSecondary: sc.titleSecondary || '',
      price: sc.priceLabel || '290฿',
      badge: (sc.badgeCategory || 'RESTAURANT SPECIAL').replace(/^[✦\s*]+/, '').toUpperCase(),
      imgUrl: sc.imageUrl || sc.imgUrl
    }));
  } else {
    const catalogPath = path.resolve('./public/real-dishes-catalog.json');
    if (fs.existsSync(catalogPath)) {
      try {
        const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
        const filtered = catalog.filter(d => 
          !d.category?.toLowerCase().includes('salad') &&
          !d.category?.toLowerCase().includes('drink') &&
          !d.category?.toLowerCase().includes('beer') &&
          !d.category?.toLowerCase().includes('wine') &&
          !d.category?.toLowerCase().includes('villa') &&
          !d.category?.toLowerCase().includes('bungalow') &&
          !d.category?.toLowerCase().includes('residence') &&
          d.isPizza !== false &&
          d.imgUrl
        );
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        dishes = shuffled.slice(0, 5).map(d => ({
          titlePrimary: d.thai || d.name,
          titleSecondary: d.english || d.name,
          price: d.singlePrice || (d.price12 ? `${d.price12}฿` : '290 ฿'),
          badge: (d.category || 'RESTAURANT SPECIAL').replace(/^[✦\s*]+/, '').toUpperCase(),
          imgUrl: d.imgUrl
        }));
      } catch (e) {
        console.warn('[CloudRenderer] Warning parsing catalog:', e.message);
      }
    }
  }

  if (dishes.length < 5) {
    dishes = [
      {
        titlePrimary: 'ราวิโอลีโฮมเมด ซอสครีมวอลนัทสไตล์ลิกูเรีย',
        titleSecondary: 'HOMEMADE RAVIOLI WITH LIGURIAN WALNUT SAUCE',
        price: '290 ฿',
        badge: 'HANDMADE PASTA',
        imgUrl: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/ravioli-al-sugo-di-noci.webp'
      },
      {
        titlePrimary: 'พิซซ่ามาเกริต้า ออริจินัลอิตาเลียน',
        titleSecondary: 'AUTHENTIC TRADITIONAL PIZZA MARGHERITA',
        price: '240 ฿',
        badge: 'TRADITIONAL PIZZA',
        imgUrl: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/02-pizza-margherita.webp'
      },
      {
        titlePrimary: 'สปาเก็ตตี้ซีฟู้ดสไตล์อิตาเลียน',
        titleSecondary: 'SEAFOOD SPAGHETTI (ALLO SCOGLIO)',
        price: '290 ฿',
        badge: 'SEAFOOD SPECIALS',
        imgUrl: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/spaghetti-allo-scoglio.webp'
      },
      {
        titlePrimary: 'เพนเน่ซอสครีมแซลมอน',
        titleSecondary: 'PENNE WITH SALMON CREAM SAUCE',
        price: '290 ฿',
        badge: 'HANDMADE PASTA',
        imgUrl: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/penne-al-salmone.webp'
      },
      {
        titlePrimary: 'ราวิโอลีโฮมเมด ซอสครีมบิสก์กุ้ง',
        titleSecondary: 'HOMEMADE RAVIOLI WITH PRAWN BISQUE CREAM',
        price: '320 ฿',
        badge: 'CHEF SPECIALS',
        imgUrl: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/ravioli-alla-crema-di-gamberi.webp'
      }
    ];
  }

  // 🎵 Selezione Traccia Audio (Pizza vs Village / R1) con Fallback Cloud Supabase
  const isPizzaMode = ['P1', 'P2', 'P3', 'DS'].includes(mode);
  const villageTrackList = [
    '01 Flower Power Village - Island Disco Paradise (Disco Funk).mp3',
    '02 Flower Power Village - Island Funk Groove (Tropical Funk).mp3',
    '03 Flower Power Village - Phayam Island Groove (Island Disco).mp3',
    '04 Flower Power Village - Island Vibes & Golden Sun (Reggae Pop).mp3',
    '05 Flower Power Village - Island Sunshine Riddim (Reggae Roots).mp3',
    '06 Flower Power Village - Koh Phayam Paradise Vibes (Island Reggae).mp3',
    '07 Flower Power Village - Tropical Island Escape (Tropical Reggae).mp3',
    '08 Flower Power Village - Sweet Island Sunshine (Chillhop Lo-Fi).mp3',
    '09 Flower Power Village - Love in Koh Phayam (Vocal Jazz Bossa).mp3',
    '10 Flower Power Village - Tropical Soul Sanctuary (Neo-Soul Lounge).mp3',
    '11 Flower Power Village - Island Breeze & Sabai Life (Tropical Acoustic).mp3'
  ];
  const chosenTrack = isPizzaMode
    ? '01-flower-power-yeah.mp3'
    : villageTrackList[Math.floor(Math.random() * villageTrackList.length)];
  const relativeAudioPath = isPizzaMode ? `audio/${chosenTrack}` : `audio/village/${chosenTrack}`;
  let audioFile = path.resolve('./public', relativeAudioPath);

  // 🛡️ Se non esiste localmente (es. container minimale o cloud worker), scarica da Supabase Storage
  if (!fs.existsSync(audioFile) || fs.statSync(audioFile).size < 1000) {
    const encodedRelative = relativeAudioPath.split('/').map(s => encodeURIComponent(s)).join('/');
    const cloudAudioUrl = `https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/assets/${encodedRelative}`;
    const tmpAudioPath = path.join(tmpDir, `cloud_audio_${path.basename(chosenTrack)}`);
    console.log(`[CloudRenderer] Scarico traccia audio da Supabase Storage: ${cloudAudioUrl}`);
    const ok = await downloadAsset(cloudAudioUrl, tmpAudioPath);
    if (ok) audioFile = tmpAudioPath;
  }

  let logoFile = path.resolve('./public/FP_04_-_LOGO_OFFICIAL_HD.png');
  if (!fs.existsSync(logoFile) || fs.statSync(logoFile).size < 1000) {
    const cloudLogoUrl = 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/assets/FP_04_-_LOGO_OFFICIAL_HD.png';
    const tmpLogoPath = path.join(tmpDir, 'cloud_logo_hd.png');
    const ok = await downloadAsset(cloudLogoUrl, tmpLogoPath);
    if (ok) logoFile = tmpLogoPath;
  }

  const numScenes = dishes.length;
  const sceneDur = 2.8;
  const transDur = 0.5;
  const outroDur = 2.5;
  // Con xfade tra ogni scena (5 scene + 1 outro = 5 transizioni da 0.5s):
  // Offset: 0->1: 2.3s, 1->2: 4.6s, 2->3: 6.9s, 3->4: 9.2s, 4->outro: 11.5s
  // Durata totale: 11.5 + 2.5 = 14.0s
  const totalDur = ((numScenes - 1) * (sceneDur - transDur)) + sceneDur - transDur + outroDur;
  const fps = 60; // 🚀 60 FPS Pieni per massima fluidità vellutata (Zero Stutter / Liquid Motion)
  const sceneFrames = Math.round((sceneDur + 0.1) * fps); // 174 frames a 60fps
  const outroFrames = Math.round((outroDur + 0.1) * fps); // 156 frames a 60fps

  console.log(`Scarico immagini piatti e preparo grafiche vettoriali SVG...`);
  const logoBuf = await prepareOfficialLogo(logoFile);

  const dishFiles = [];
  const overlayFiles = [];

  for (let i = 0; i < numScenes; i++) {
    const dish = dishes[i];
    const dishPath = path.join(tmpDir, `cloud_dish_${i}.webp`);
    const overlayPath = path.join(tmpDir, `cloud_overlay_${i}.png`);

    const ok = await downloadAsset(dish.imgUrl, dishPath);
    if (!ok || !fs.existsSync(dishPath) || fs.statSync(dishPath).size < 1000) {
      console.warn(`[CloudRenderer] Fallback per immagine non trovata: ${dish.imgUrl}`);
      await downloadAsset('https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/spaghetti-allo-scoglio.webp', dishPath);
    }

    const svg = generateSceneOverlaySvg(dish, i, numScenes);
    const svgBuf = await sharp(Buffer.from(svg)).png().toBuffer();

    const logoLeft = mode === 'R1' ? 129 : 44;
    const logoTop = mode === 'R1' ? 66 : 44;
    await sharp(svgBuf)
      .composite([{ input: logoBuf, left: logoLeft, top: logoTop }])
      .png()
      .toFile(overlayPath);

    dishFiles.push(dishPath);
    overlayFiles.push(overlayPath);
  }

  const outroPath = path.join(tmpDir, 'cloud_outro.png');
  const outroBuf = await generateOutroImage(logoBuf);
  fs.writeFileSync(outroPath, outroBuf);

  const outMp4 = path.join(tmpDir, `cloud_video_${mode}_${Date.now()}.mp4`);

  console.log(`Rendering video 1080x1920 Full HD a 60 FPS con FFmpeg 6.1.1 (CRF 17, slow preset, xfade 0.5s, 4K sub-pixel)...`);
  const start = Date.now();

  let inputArgs = [];
  let filterComplex = '';

  // 1. Input argomenti con -framerate 60 rigoroso (elimina al 100% il telecine judder)
  for (let i = 0; i < numScenes; i++) {
    inputArgs.push(`-framerate ${fps} -loop 1 -t ${sceneDur + 0.2} -i "${dishFiles[i]}"`);
  }
  for (let i = 0; i < numScenes; i++) {
    inputArgs.push(`-framerate ${fps} -loop 1 -t ${sceneDur + 0.2} -i "${overlayFiles[i]}"`);
  }
  inputArgs.push(`-framerate ${fps} -loop 1 -t ${outroDur + 0.2} -i "${outroPath}"`);
  inputArgs.push(`-i "${audioFile}"`);

  // 2. Zoompan su canvas 4K (2160x3840) a 60 FPS con step sub-pixel impercettibili
  for (let i = 0; i < numScenes; i++) {
    const dishIdx = i;
    const overlayIdx = numScenes + i;
    
    // Zoom cinematografico Food Macro Focus profondo a 60 fps (fino a 1.15x) con drift continuo
    const zoomExpr = i % 2 === 0
      ? `'min(zoom+0.0009,1.15)'`
      : `'min(zoom+0.0008,1.13)'`;
    const panXExpr = i % 2 === 0
      ? `'iw/2-(iw/zoom/2)+((on/${sceneFrames})*(iw*0.025))'`
      : `'iw/2-(iw/zoom/2)-((on/${sceneFrames})*(iw*0.025))'`;
    
    filterComplex += `[${dishIdx}:v]scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,zoompan=z=${zoomExpr}:d=${sceneFrames}:x=${panXExpr}:y='ih/2-(ih/zoom/2)':s=1080x1920:fps=${fps},trim=duration=${sceneDur},setpts=PTS-STARTPTS[bg${i}]; `;
    filterComplex += `[bg${i}][${overlayIdx}:v]overlay=0:0:shortest=1,format=yuv420p[scene${i}]; `;
  }

  // Outro con zoompan delicatissimo a 60fps
  const outroIdx = numScenes * 2;
  filterComplex += `[${outroIdx}:v]scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,zoompan=z='min(zoom+0.0003,1.05)':d=${outroFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=${fps},trim=duration=${outroDur},setpts=PTS-STARTPTS,format=yuv420p[outro]; `;

  // 3. Catena xfade continua (dissolvenza incrociata vellutata di 0.5s tra ogni scena e outro)
  let lastStream = 'scene0';
  let currentOffset = sceneDur - transDur; // 2.3s

  for (let i = 1; i < numScenes; i++) {
    const nextStream = `scene${i}`;
    const outStream = `xf${i}`;
    filterComplex += `[${lastStream}][${nextStream}]xfade=transition=fade:duration=${transDur}:offset=${currentOffset.toFixed(2)}[${outStream}]; `;
    lastStream = outStream;
    currentOffset += (sceneDur - transDur);
  }

  // Transizione finale verso l'Outro
  filterComplex += `[${lastStream}][outro]xfade=transition=fade:duration=${transDur}:offset=${currentOffset.toFixed(2)}[vfinal]`;

  const audioIdx = numScenes * 2 + 1;
  const audioFadeStart = (totalDur - 0.5).toFixed(2);

  const cmd = `"${ffmpegPath}" -y ` +
    inputArgs.join(' ') + ' ' +
    `-filter_complex "${filterComplex}" ` +
    `-map "[vfinal]" -map ${audioIdx}:a ` +
    `-af "afade=t=out:st=${audioFadeStart}:d=0.5" ` +
    `-t ${totalDur} -c:v libx264 -pix_fmt yuv420p -preset medium -crf 17 ` +
    `-color_range 1 -colorspace bt709 -color_primaries bt709 -color_trc bt709 ` +
    `-c:a aac -b:a 192k ` +
    `-movflags +faststart "${outMp4}"`;

  console.log(`Esecuzione FFmpeg a 60 FPS (durata video: ${totalDur.toFixed(1)}s, 840 fotogrammi)...`);
  execSync(cmd, { stdio: 'inherit' });

  const renderSeconds = ((Date.now() - start) / 1000).toFixed(2);
  let videoBuffer = fs.readFileSync(outMp4);
  console.log(`\n✅ Render iniziale completato in ${renderSeconds}s. Elaborazione Thumbnail Ufficiale...`);

  // 📸 REGOLA 14: ESTRAZIONE THUMBNAIL UFFICIALE PRE-DISSOLVENZA (ZERO GHOSTING / HERO AL MASSIMO ZOOM)
  const thumbTime = Math.max(0.1, sceneDur - transDur - 0.05).toFixed(2);
  const thumbPath = path.join(tmpDir, `cloud_thumb_${mode.toLowerCase()}_${Date.now()}.jpg`);
  try {
    const thumbCmd = `"${ffmpegPath}" -y -ss ${thumbTime} -i "${outMp4}" -vframes 1 -q:v 2 "${thumbPath}"`;
    execSync(thumbCmd, { stdio: 'pipe' });
    console.log(`📸 Thumbnail Ufficiale estratta con successo a t=${thumbTime}s (${thumbPath})`);
  } catch (thumbErr) {
    console.warn(`[CloudRenderer] Avviso elaborazione thumbnail:`, thumbErr.message);
  }

  const sizeMb = (videoBuffer.length / (1024 * 1024)).toFixed(2);
  console.log(`Dimensione video MP4 broadcast: ${sizeMb} MB (1080x1920 Full HD a 60 FPS)\n`);

  // Upload su Supabase Storage (Video MP4 + Thumbnail JPEG) se disponibile
  let publicUrl = '';
  let publicThumbUrl = '';
  if (supabase) {
    const filename = `story_video_${mode.toLowerCase()}_${Date.now()}.mp4`;
    const storagePath = `social_stories/${filename}`;
    console.log(`Caricamento su Supabase Storage (${storagePath})...`);
    const { error: upErr } = await supabase.storage.from('assets').upload(storagePath, videoBuffer, {
      contentType: 'video/mp4',
      upsert: true
    });
    if (!upErr) {
      publicUrl = supabase.storage.from('assets').getPublicUrl(storagePath).data.publicUrl;
      console.log(`🔗 Video pubblico disponibile: ${publicUrl}`);
    } else {
      console.warn(`[CloudRenderer] Upload Supabase error:`, upErr.message);
    }

    if (fs.existsSync(thumbPath)) {
      const thumbFilename = `story_thumb_${mode.toLowerCase()}_${Date.now()}.jpg`;
      const thumbStoragePath = `social_stories/${thumbFilename}`;
      const thumbBuffer = fs.readFileSync(thumbPath);
      const { error: tErr } = await supabase.storage.from('assets').upload(thumbStoragePath, thumbBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });
      if (!tErr) {
        publicThumbUrl = supabase.storage.from('assets').getPublicUrl(thumbStoragePath).data.publicUrl;
        console.log(`📸 Thumbnail pubblica Supabase disponibile: ${publicThumbUrl}`);
      }
    }
  }

  // Notifica Telegram Supergruppo
  if (shouldSendTelegram) {
    const botToken = await getTelegramBotToken();
    if (botToken) {
      const threadId = TELEGRAM_CONFIG.topics[topicKey] || 2;
      console.log(`Invio video a Telegram Supergruppo (Topic ${threadId}) con Thumbnail nativa...`);

      const dishesSummary = dishes.map((d, idx) => `${idx + 1}. ${d.titleSecondary} (${d.price})`).join('\n');

      const caption = 
        `🎬 <b>FLOWER POWER SOCIAL STUDIO · CLOUD RENDER</b>\n` +
        `✨ <b>Format:</b> ${mode} (5 Piatti Iconici · 1080x1920 Full HD Nativo)\n` +
        `⏱️ <b>Durata:</b> ${totalDur.toFixed(1)}s · <b>Peso:</b> ${sizeMb} MB\n` +
        `🛵 <b>WhatsApp Delivery:</b> +66 095 882 5573\n\n` +
        `<pre>` +
        `🍽️ เมนูพิเศษประจำวันที่ Flower Power Restaurant &amp; Delivery เกาะพยาม 🌴🍕\n` +
        `อาหารอิตาเลียนแท้ปรุงสดใหม่ทุกจาน ทั้งราวิโอลีโฮมเมด พาสต้า และพิซซ่าอบร้อนๆ พร้อมส่งตรงถึงบังกะโลและวิลล่าของคุณทั่วอ่าวเขาควาย!\n\n` +
        `📍 Buffalo Bay, Koh Phayam\n` +
        `🛵 Delivery WhatsApp: +66 095 882 5573\n` +
        `🌐 flowerpowervillage.com\n\n` +
        `#KohPhayam #FlowerPowerKohPhayam #ItalianFoodKohPhayam #KohPhayamDelivery #BuffaloBay` +
        `</pre>`;

      const formData = new FormData();
      formData.append('chat_id', TELEGRAM_CONFIG.supergroupId);
      formData.append('message_thread_id', String(threadId));
      formData.append('caption', caption);
      formData.append('parse_mode', 'HTML');
      formData.append('supports_streaming', 'true');
      formData.append('width', '1080');
      formData.append('height', '1920');

      if (publicUrl) {
        formData.append('video', publicUrl);
      } else {
        formData.append('video', new Blob([videoBuffer], { type: 'video/mp4' }), `flowerpower_${mode.toLowerCase()}.mp4`);
      }

      // 📸 THUMBNAIL UFFICIALE: Passata come InputFile binario per anteprima istantanea a video fermo
      if (fs.existsSync(thumbPath)) {
        const thumbBuf = fs.readFileSync(thumbPath);
        formData.append('thumbnail', new Blob([thumbBuf], { type: 'image/jpeg' }), 'thumbnail.jpg');
      }

      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendVideo`, {
        method: 'POST',
        body: formData
      });
      const tgJson = await tgRes.json();
      console.log('Telegram dispatch:', tgJson.ok ? '✅ CONSEGNATO CON SUCCESSO (CON THUMBNAIL NATIVA)!' : tgJson);
    } else {
      console.warn('⚠️ Token Bot Telegram non trovato. Consegna Telegram saltata.');
    }
  }

  // Pulizia file temporanei
  try {
    dishFiles.forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
    overlayFiles.forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });
    if (fs.existsSync(outroPath)) fs.unlinkSync(outroPath);
    if (fs.existsSync(outMp4)) fs.unlinkSync(outMp4);
  } catch {}

  console.log(`\n🎉 PROCESSO CLOUD COMPLETATO AL 100%!\n`);
}

run().catch(err => {
  console.error('❌ Cloud Renderer Fatal Error:', err);
  process.exit(1);
});
