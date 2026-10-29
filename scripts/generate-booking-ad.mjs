import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { execSync } from 'child_process';

const FFMPEG_PATH = 'C:\\Program Files\\ShareX\\ffmpeg.exe';
const WORK_DIR = path.resolve('scripts/test-output/ad-render');
const OUTPUT_DIR = path.resolve('public/videos/ads');

if (!fs.existsSync(WORK_DIR)) fs.mkdirSync(WORK_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function createOverlayImages() {
  console.log("=== STEP 2: Generating Vector Overlay Graphics ===");

  // 1. Top Brand Header (1080 x 220)
  const headerSvg = `
    <svg width="1080" height="220" viewBox="0 0 1080 220" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="topVignette" x1="0" y1="0" x2="0" y2="100%">
          <stop offset="0%" stop-color="#05140d" stop-opacity="0.95"/>
          <stop offset="70%" stop-color="#05140d" stop-opacity="0.80"/>
          <stop offset="100%" stop-color="#05140d" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="220" fill="url(#topVignette)"/>
      <g transform="translate(60, 45)">
        <!-- Brand Logo Circle -->
        <circle cx="45" cy="45" r="42" fill="#047857" stroke="#10b981" stroke-width="3"/>
        <text x="45" y="55" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="28" fill="#fbbf24" text-anchor="middle">FP</text>
        
        <!-- Text details -->
        <text x="105" y="40" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="34" fill="#ffffff" letter-spacing="1.5">FLOWER POWER <tspan fill="#34d399">Village</tspan></text>
        <text x="105" y="68" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="700" font-size="19" fill="#9ca3af" letter-spacing="0.5">Koh Phayam, Thailand · Official Booking Website</text>
      </g>
    </svg>
  `;
  await sharp(Buffer.from(headerSvg)).png().toFile(path.join(WORK_DIR, 'overlay-header.png'));

  // 2. Subtitle Cards (1080 x 240)
  const subtitles = [
    {
      file: 'sub-1.png',
      tag: 'KOH PHAYAM DIRECT TRAVEL HACK 🌴',
      tagColor: '#fbbf24',
      main: 'Stop overpaying on Booking or Agoda! 💸❌',
      sub: 'Official website unlocks secret benefits &amp; discounts.'
    },
    {
      file: 'sub-2.png',
      tag: 'GUARANTEED SAVINGS FOR EVERYONE 🏷️',
      tagColor: '#34d399',
      main: '-10% OFF Every Stay + Long-Stay Rates!',
      sub: '-15% for 15+ days · -20% for 30+ days (Never on OTAs)'
    },
    {
      file: 'sub-3.png',
      tag: '100% TAILOR-MADE FREEDOM 🥐❄️',
      tagColor: '#60a5fa',
      main: 'Customize Your Stay Exactly How You Want!',
      sub: 'Flexible A/C options &amp; 1 or 2 breakfasts on YOUR terms.'
    },
    {
      file: 'sub-4.png',
      tag: 'REAL PERSONAL ISLAND CARE 💬🌺',
      tagColor: '#f472b6',
      main: 'Direct 1-on-1 Contact with the Owners!',
      sub: 'WhatsApp assistance before &amp; during your holiday. Zero robots.'
    },
    {
      file: 'sub-5.png',
      tag: 'BEST PRICE · FULL FREEDOM · REAL CARE ✨',
      tagColor: '#fbbf24',
      main: 'Reserve Directly in 3 Simple Clicks! 🛎️',
      sub: '👉 Tap LINK IN BIO or visit flowerpowervillage.com'
    }
  ];

  for (const s of subtitles) {
    const cardSvg = `
      <svg width="1080" height="260" viewBox="0 0 1080 260" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000000" flood-opacity="0.8"/>
          </filter>
          <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#051a11" stop-opacity="0.96"/>
            <stop offset="100%" stop-color="#0d2b1e" stop-opacity="0.96"/>
          </linearGradient>
        </defs>
        
        <!-- Pill Box -->
        <rect x="50" y="15" width="980" height="210" rx="32" fill="url(#cardGrad)" stroke="#10b981" stroke-width="3" filter="url(#cardShadow)"/>
        
        <!-- Badge Tag -->
        <rect x="90" y="38" width="540" height="36" rx="18" fill="rgba(16, 185, 129, 0.2)" stroke="${s.tagColor}" stroke-width="1.5"/>
        <text x="360" y="62" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="17" fill="${s.tagColor}" text-anchor="middle" letter-spacing="1">${s.tag}</text>
        
        <!-- Main Message -->
        <text x="90" y="128" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" font-size="34" fill="#ffffff" letter-spacing="0.2">${s.main}</text>
        
        <!-- Sub Message -->
        <text x="90" y="172" font-family="'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="600" font-size="22" fill="#d1d5db">${s.sub}</text>
      </svg>
    `;
    await sharp(Buffer.from(cardSvg)).png().toFile(path.join(WORK_DIR, s.file));
  }

  // 3. Phone Bezel / Frame Overlay (1080 x 1920)
  // The phone screen will sit at X: 110, Y: 130, width: 860, height: 1450
  const frameSvg = `
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stop-color="#0d2b1f"/>
          <stop offset="60%" stop-color="#061911"/>
          <stop offset="100%" stop-color="#020a07"/>
        </radialGradient>
      </defs>
      
      <!-- Ambient background -->
      <rect width="1080" height="1920" fill="url(#bgGrad)"/>
      
      <!-- Phone Bezel Border with Rounded Corners -->
      <rect x="100" y="130" width="880" height="1470" rx="46" fill="none" stroke="#22c55e" stroke-width="6" opacity="0.6"/>
      <rect x="106" y="136" width="868" height="1458" rx="42" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.4"/>
      
      <!-- Dynamic Island / Top Camera Notch -->
      <rect x="470" y="152" width="140" height="28" rx="14" fill="#000000" opacity="0.9"/>
      <circle cx="585" cy="166" r="6" fill="#1e293b"/>
    </svg>
  `;
  await sharp(Buffer.from(frameSvg)).png().toFile(path.join(WORK_DIR, 'phone-bezel.png'));

  // 4. Phone Screen Rounded Mask
  const maskSvg = `
    <svg width="860" height="1450" viewBox="0 0 860 1450" xmlns="http://www.w3.org/2000/svg">
      <rect width="860" height="1450" rx="40" fill="#ffffff"/>
    </svg>
  `;
  await sharp(Buffer.from(maskSvg)).png().toFile(path.join(WORK_DIR, 'screen-mask.png'));

  console.log("Vector overlay graphics generated successfully.");
}

async function renderFullVideo(rawWebmPath) {
  console.log("=== STEP 3: Rendering High-Definition 1080x1920 MP4 Video with FFmpeg ===");

  const audioTrack = path.resolve('public/audio/village/08 Flower Power Village - Sweet Island Sunshine (Chillhop Lo-Fi).mp3');
  const finalMp4 = path.join(OUTPUT_DIR, 'flower-power-booking-ad-en.mp4');

  // Input files for FFmpeg:
  // [0:v] raw webm recording (860x1864)
  // [1:v] phone-bezel.png (1080x1920)
  // [2:v] overlay-header.png (1080x220)
  // [3:v] sub-1.png (1080x260)
  // [4:v] sub-2.png (1080x260)
  // [5:v] sub-3.png (1080x260)
  // [6:v] sub-4.png (1080x260)
  // [7:v] sub-5.png (1080x260)
  // [8:a] background music mp3

  const bezelPng = path.join(WORK_DIR, 'phone-bezel.png');
  const headerPng = path.join(WORK_DIR, 'overlay-header.png');
  const sub1Png = path.join(WORK_DIR, 'sub-1.png');
  const sub2Png = path.join(WORK_DIR, 'sub-2.png');
  const sub3Png = path.join(WORK_DIR, 'sub-3.png');
  const sub4Png = path.join(WORK_DIR, 'sub-4.png');
  const sub5Png = path.join(WORK_DIR, 'sub-5.png');

  // Filter graph:
  // 1. Crop/scale raw mobile recording to fit inside the phone frame (860 x 1450)
  // 2. Overlay mobile recording onto phone bezel at (110, 140)
  // 3. Overlay header at (0, 0)
  // 4. Overlay subtitles at (0, 1610) with time intervals:
  //    - sub 1: between(t, 0.0, 4.2)
  //    - sub 2: between(t, 4.2, 8.8)
  //    - sub 3: between(t, 8.8, 14.2)
  //    - sub 4: between(t, 14.2, 17.5)
  //    - sub 5: between(t, 17.5, 20.0)
  // 5. Audio: trim to video duration, volume 0.75, fade out last 1.8s.

  const filterGraph = [
    `[0:v]scale=860:1450:force_original_aspect_ratio=decrease,pad=860:1450:(ow-iw)/2:(oh-ih)/2:color=black[screen]`,
    `[1:v][screen]overlay=110:140[bg_screen]`,
    `[bg_screen][2:v]overlay=0:0[v_head]`,
    `[v_head][3:v]overlay=0:1610:enable='between(t,0.0,4.2)'[v1]`,
    `[v1][4:v]overlay=0:1610:enable='between(t,4.2,8.8)'[v2]`,
    `[v2][5:v]overlay=0:1610:enable='between(t,8.8,14.2)'[v3]`,
    `[v3][6:v]overlay=0:1610:enable='between(t,14.2,17.5)'[v4]`,
    `[v4][7:v]overlay=0:1610:enable='between(t,17.5,22.0)'[outv]`,
    `[8:a]volume=0.85,afade=t=in:st=0:d=0.8,afade=t=out:st=17.5:d=1.7[outa]`
  ].join(';');

  const cmd = [
    `"${FFMPEG_PATH}"`,
    `-y`,
    `-i "${rawWebmPath}"`,
    `-i "${bezelPng}"`,
    `-i "${headerPng}"`,
    `-i "${sub1Png}"`,
    `-i "${sub2Png}"`,
    `-i "${sub3Png}"`,
    `-i "${sub4Png}"`,
    `-i "${sub5Png}"`,
    `-i "${audioTrack}"`,
    `-filter_complex "${filterGraph}"`,
    `-map "[outv]"`,
    `-map "[outa]"`,
    `-c:v libx264`,
    `-preset fast`,
    `-crf 19`,
    `-pix_fmt yuv420p`,
    `-c:a aac`,
    `-b:a 192k`,
    `-shortest`,
    `-movflags +faststart`,
    `"${finalMp4}"`
  ].join(' ');

  console.log("Executing FFmpeg encoding...");
  execSync(cmd, { stdio: 'inherit' });
  console.log(`\n🎉 PROMOTIONAL SOCIAL AD VIDEO CREATED SUCCESSFULLY!`);
  console.log(`📁 File location: ${finalMp4}`);

  const stat = fs.statSync(finalMp4);
  console.log(`📊 File size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
  return finalMp4;
}

async function main() {
  await createOverlayImages();
  
  // We already recorded raw webm or we can locate the latest one
  const rawVideoDir = path.resolve('scripts/test-output/raw-video');
  const webmFiles = fs.readdirSync(rawVideoDir).filter(f => f.endsWith('.webm'));
  if (webmFiles.length === 0) {
    throw new Error("No webm found!");
  }
  const rawWebmPath = path.join(rawVideoDir, webmFiles[0]);
  console.log("Using recorded WebM:", rawWebmPath);

  await renderFullVideo(rawWebmPath);
}

main().catch(err => {
  console.error("Ad pipeline failed:", err);
  process.exit(1);
});
