/**
 * 🎬 FLOWER POWER PIZZA — STORYBOARD RUNNER (TikTok 9:16)
 * 
 * Motore Playwright ad alta precisione per registrare video promozionali TikTok / Reels
 * con movimenti sinuosi, curve di Bézier fluide e simulazione tocco umano naturale.
 * 
 * Output: Video MP4 nativo (H.264 / 9:16 Full Bleed) salvato in ./video_out/
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

// Presets Storyboards
const FALLBACK_STORYBOARDS = [
  {
    id: 'tiktok-pizza-order-15s',
    name: '🍕 Ordine Pizza Margherita (15s)',
    targetDevice: 'iPhone 14 Pro Max',
    blocks: [
      { type: 'navigate', durationMs: 2500, pauseAfterMs: 600 },
      { type: 'scroll_down', scrollAmount: 380, durationMs: 1400, pauseAfterMs: 600 },
      { type: 'expand_product_card', targetProductName: 'MARGHERITA', durationMs: 1600, pauseAfterMs: 800 },
      { type: 'select_variant', targetVariantName: '12"', durationMs: 1200, pauseAfterMs: 600 },
      { type: 'confirm_add_to_cart', durationMs: 1400, pauseAfterMs: 800 },
      { type: 'open_cart_drawer', durationMs: 1600, pauseAfterMs: 1000 },
      { type: 'click_checkout_button', durationMs: 1800, pauseAfterMs: 1200 },
      { type: 'pause', durationMs: 3000 }
    ]
  },
  {
    id: 'tiktok-table-reservation-12s',
    name: '🛖 Prenotazione Tavolo Capanna (12s)',
    targetDevice: 'iPhone 14 Pro Max',
    blocks: [
      { type: 'navigate', durationMs: 2500, pauseAfterMs: 600 },
      { type: 'open_table_reservation_modal', durationMs: 2000, pauseAfterMs: 800 },
      { 
        type: 'fill_table_reservation', 
        durationMs: 3500, 
        pauseAfterMs: 1200,
        formValues: {
          name: 'Marco & Friends',
          phone: '0949800200',
          email: 'marco.guest@gmail.com'
        }
      },
      { type: 'pause', durationMs: 3000 }
    ]
  }
];

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    storyboardId: 'tiktok-pizza-order-15s',
    baseUrl: 'auto',
    headless: true,
    speed: 1.0
  };

  for (const arg of args) {
    if (arg.startsWith('--storyboard=')) {
      config.storyboardId = arg.split('=')[1];
    } else if (arg.startsWith('--url=')) {
      config.baseUrl = arg.split('=')[1];
    } else if (arg.startsWith('--headless=')) {
      config.headless = arg.split('=')[1] === 'true';
    } else if (arg.startsWith('--speed=')) {
      config.speed = parseFloat(arg.split('=')[1]) || 1.0;
    }
  }
  return config;
}

// Auto-detect active dev server (Vite or Vercel)
async function detectAvailableBaseUrl(requestedUrl) {
  if (requestedUrl && requestedUrl !== 'auto') return requestedUrl;
  const candidates = [
    'http://127.0.0.1:3001/pizza',
    'http://127.0.0.1:3000/pizza',
    'http://localhost:3001/pizza',
    'http://localhost:3000/pizza',
    'http://127.0.0.1:5173/pizza',
    'http://localhost:5173/pizza'
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(1200) });
      if (res.ok || res.status === 200 || res.status === 304) {
        return url;
      }
    } catch {}
  }
  return 'http://127.0.0.1:3001/pizza';
}

function getStoryboard(id) {
  try {
    const customPath = path.resolve(process.cwd(), 'scratch', 'storyboards.json');
    if (fs.existsSync(customPath)) {
      const data = JSON.parse(fs.readFileSync(customPath, 'utf8'));
      if (Array.isArray(data)) {
        const found = data.find(s => s.id === id);
        if (found) return found;
      }
    }
  } catch {}
  return FALLBACK_STORYBOARDS.find(s => s.id === id) || FALLBACK_STORYBOARDS[0];
}

// Injects the Virtual Touch Pointer
async function injectTouchCursor(page) {
  await page.addStyleTag({
    content: `
      #fp-touch-cursor {
        position: fixed;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(220, 38, 38, 0.85) 0%, rgba(185, 28, 28, 0.5) 60%, rgba(0,0,0,0) 100%);
        border: 2.5px solid #ffffff;
        box-shadow: 0 0 16px rgba(220, 38, 38, 0.8), 0 4px 10px rgba(0, 0, 0, 0.4);
        pointer-events: none;
        z-index: 9999999;
        transform: translate(-50%, -50%) scale(1);
        transition: transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1);
        opacity: 0.95;
      }
      #fp-touch-cursor.touching {
        transform: translate(-50%, -50%) scale(0.72);
        background: radial-gradient(circle, rgba(239, 68, 68, 1) 0%, rgba(185, 28, 28, 0.9) 70%);
        box-shadow: 0 0 25px rgba(239, 68, 68, 1), 0 0 8px #ffffff;
      }
      .fp-touch-ripple {
        position: fixed;
        width: 54px;
        height: 54px;
        border-radius: 50%;
        border: 2.5px solid rgba(239, 68, 68, 0.9);
        transform: translate(-50%, -50%) scale(0.2);
        opacity: 1;
        pointer-events: none;
        z-index: 9999998;
        animation: fpRippleAnim 0.55s ease-out forwards;
      }
      @keyframes fpRippleAnim {
        0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0.95; }
        100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
      }
    `
  });

  await page.evaluate(() => {
    if (!document.getElementById('fp-touch-cursor')) {
      const cursor = document.createElement('div');
      cursor.id = 'fp-touch-cursor';
      cursor.style.left = '270px';
      cursor.style.top = '720px';
      document.body.appendChild(cursor);
      window.__fpCursorX = 270;
      window.__fpCursorY = 720;
    }
  });
}

// Sinuous movement using Cubic Bézier interpolation (Smooth Human-like curve)
async function smoothMoveCursorTo(page, targetX, targetY, durationMs = 600) {
  await page.evaluate(async ({ tx, ty, duration }) => {
    const cursor = document.getElementById('fp-touch-cursor');
    if (!cursor) return;

    const startX = window.__fpCursorX || 270;
    const startY = window.__fpCursorY || 720;

    // Subtle natural organic curve
    const midX = (startX + tx) / 2 + ((Math.sin(startY * 0.02) * 40));
    const midY = (startY + ty) / 2 - Math.abs(startX - tx) * 0.12;

    const startTime = performance.now();

    return new Promise((resolve) => {
      function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-in-out easing
        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        // Quadratic Bézier formula
        const currentX = Math.pow(1 - ease, 2) * startX + 2 * (1 - ease) * ease * midX + Math.pow(ease, 2) * tx;
        const currentY = Math.pow(1 - ease, 2) * startY + 2 * (1 - ease) * ease * midY + Math.pow(ease, 2) * ty;

        cursor.style.left = `${currentX}px`;
        cursor.style.top = `${currentY}px`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          cursor.style.left = `${tx}px`;
          cursor.style.top = `${ty}px`;
          window.__fpCursorX = tx;
          window.__fpCursorY = ty;
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }, { tx: targetX, ty: targetY, duration: durationMs });

  await page.waitForTimeout(50);
}

// Performs realistic Touch Down + Ripple + Click + Touch Up on an element locator
async function simulateHumanTapLocator(page, locator, moveDuration = 600) {
  try {
    await locator.scrollIntoViewIfNeeded({ timeout: 4000 }).catch(() => {});
    await page.waitForTimeout(150);

    const box = await locator.boundingBox();
    if (!box) {
      console.log('  ⚠️ Bounding box non trovato per locator');
      return false;
    }

    const targetX = Math.round(box.x + box.width / 2);
    const targetY = Math.round(box.y + box.height / 2);

    // 1. Move cursor smoothly to target with Bézier curve
    await smoothMoveCursorTo(page, targetX, targetY, moveDuration);

    // 2. Touch down & trigger ripple animation
    await page.evaluate(({ tx, ty }) => {
      const cursor = document.getElementById('fp-touch-cursor');
      if (cursor) cursor.classList.add('touching');

      const ripple = document.createElement('div');
      ripple.className = 'fp-touch-ripple';
      ripple.style.left = `${tx}px`;
      ripple.style.top = `${ty}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 550);
    }, { tx: targetX, ty: targetY });

    await page.waitForTimeout(160);

    // 3. Physical click
    await locator.click({ force: true }).catch(() => {});

    await page.waitForTimeout(140);

    // 4. Touch up
    await page.evaluate(() => {
      const cursor = document.getElementById('fp-touch-cursor');
      if (cursor) cursor.classList.remove('touching');
    });

    await page.waitForTimeout(200);
    return true;
  } catch (err) {
    console.log(`  (tap error: ${err.message})`);
    return false;
  }
}

// Sinuous Human-Like Touch Drag Scrolling (60 FPS Smooth Scroll)
async function smoothHumanScroll(page, scrollAmount, durationMs = 1500) {
  await page.evaluate(({ amount, duration }) => {
    return new Promise((resolve) => {
      const startScroll = window.scrollY;
      const startTime = performance.now();

      function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Sinusoidal / Cubic Ease Out
        const ease = 1 - Math.pow(1 - progress, 3);
        window.scrollTo(0, startScroll + amount * ease);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }, { amount: scrollAmount, duration: durationMs });

  await page.waitForTimeout(150);
}

async function main() {
  const cliArgs = parseArgs();
  const targetUrl = await detectAvailableBaseUrl(cliArgs.baseUrl);
  const storyboard = getStoryboard(cliArgs.storyboardId);

  console.log('\n======================================================');
  console.log('🎬 FLOWER POWER PIZZA — STORYBOARD RUNNER (9:16)');
  console.log('======================================================');
  console.log(`📌 Storyboard:   ${storyboard.name}`);
  console.log(`📱 Dispositivo:  iPhone 14 Pro Max · 9:16 Full Bleed (540x960 HD)`);
  console.log(`🌐 Target URL:   ${targetUrl}`);
  console.log(`⚡ Modalità:     ${cliArgs.headless ? 'Headless (Background)' : 'Finestra Visibile'}`);
  console.log('======================================================\n');

  const videoOutDir = path.resolve(process.cwd(), 'video_out');
  if (!fs.existsSync(videoOutDir)) {
    fs.mkdirSync(videoOutDir, { recursive: true });
  }

  let browser = null;
  let context = null;

  try {
    browser = await chromium.launch({
      headless: cliArgs.headless,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    context = await browser.newContext({
      viewport: { width: 540, height: 960 }, // 100% 9:16 Native Aspect Ratio
      deviceScaleFactor: 2, // Ultra HD Retina Rendering
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      recordVideo: {
        dir: videoOutDir,
        size: { width: 540, height: 960 } // Full Bleed 9:16 Video
      }
    });

    const page = await context.newPage();

    // Route intercept: Mock pizzeria status to 24h open
    await page.route('**/*pizzeria_service_status*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          isOpen: true,
          pausedUntil: null,
          pauseReason: 'busy',
          openingHours: { openTime: '00:00', closeTime: '23:59', closedDays: [] },
          lastUpdated: new Date().toISOString()
        })
      });
    });

    await page.route('**/api/pizza-service-status*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: {
            isOpen: true,
            pausedUntil: null,
            pauseReason: 'busy',
            openingHours: { openTime: '00:00', closeTime: '23:59', closedDays: [] },
            lastUpdated: new Date().toISOString()
          }
        })
      });
    });

    // Mock time & status in browser environment
    await page.addInitScript(() => {
      try {
        localStorage.setItem('fp_pizzeria_service_status', JSON.stringify({
          isOpen: true,
          pausedUntil: null,
          pauseReason: 'busy',
          openingHours: { openTime: '00:00', closeTime: '23:59', closedDays: [] },
          lastUpdated: new Date().toISOString()
        }));
      } catch {}
    });

    console.log('🚀 Avvio esecuzione fluida a curve di Bézier...');

    for (let i = 0; i < storyboard.blocks.length; i++) {
      const block = storyboard.blocks[i];
      console.log(`\n▶ [${i + 1}/${storyboard.blocks.length}] ${block.title || block.type}...`);

      switch (block.type) {
        case 'navigate': {
          await page.goto(targetUrl);
          await page.waitForLoadState('networkidle').catch(() => {});
          await page.waitForTimeout(1000);
          await injectTouchCursor(page);
          break;
        }

        case 'scroll_down': {
          const px = block.scrollAmount || 350;
          await smoothHumanScroll(page, px, block.durationMs || 1500);
          break;
        }

        case 'scroll_up': {
          const px = block.scrollAmount || 350;
          await smoothHumanScroll(page, -px, block.durationMs || 1400);
          break;
        }

        case 'expand_product_card':
        case 'open_product_modal': {
          // Find the card containing PIZZA MARGHERITA
          const margheritaHeading = page.locator('h3:has-text("MARGHERITA"), h3:has-text("Margherita")').first();
          await margheritaHeading.scrollIntoViewIfNeeded().catch(() => {});
          await page.waitForTimeout(300);

          // Find the customize button near or within that card
          const cardBtn = page.locator('button:has-text("Personalizza"), button:has-text("Customize"), button:has-text("Scegli"), button:has-text("Choose")').first();
          await simulateHumanTapLocator(page, cardBtn, 750);
          await page.waitForTimeout(800);
          break;
        }

        case 'select_variant': {
          // Select 12" or 8" or Gigante variant
          const variantBtn = page.locator('button:has-text("12\\""), button:has-text("8\\""), button:has-text("Gigante"), button:has-text("Standard")').first();
          if (await variantBtn.isVisible().catch(() => false)) {
            await simulateHumanTapLocator(page, variantBtn, 600);
          }
          await page.waitForTimeout(500);
          break;
        }

        case 'confirm_add_to_cart':
        case 'add_to_cart_and_close': {
          // The confirm button on the expanded card
          const confirmBtn = page.locator('button:has-text("Aggiungi all\'Ordine"), button:has-text("Add to Order"), button:has-text("Aggiungi"), button:has-text("เพิ่มในรายการ")').first();
          await simulateHumanTapLocator(page, confirmBtn, 700);
          await page.waitForTimeout(1000);
          break;
        }

        case 'open_cart_drawer': {
          // Floating Cart Button at the bottom
          const cartBtn = page.locator('.fixed.bottom-6 button, button:has-text("item"), button:has-text("prodotto")').first();
          await simulateHumanTapLocator(page, cartBtn, 800);
          await page.waitForTimeout(1200);
          break;
        }

        case 'click_checkout_button': {
          // Checkout button inside CartDrawer footer
          const checkoutBtn = page.locator('.fixed.top-0.right-0 button:has-text("Checkout"), .fixed.top-0.right-0 button:has-text("Ordine"), .fixed.top-0.right-0 button:has-text("Kasse"), .fixed.top-0.right-0 button:has-text("ชำระเงิน"), .fixed.top-0.right-0 div.border-t button').first();
          await simulateHumanTapLocator(page, checkoutBtn, 800);
          await page.waitForTimeout(1800);
          break;
        }

        case 'open_table_reservation_modal': {
          const resBtn = page.locator('button:has-text("PRENOTA ORA"), button:has-text("BOOK NOW"), button:has-text("TAVOLO"), button:has-text("จองเลย")').first();
          await simulateHumanTapLocator(page, resBtn, 800);
          await page.waitForTimeout(1000);
          break;
        }

        case 'fill_table_reservation': {
          const values = block.formValues || {};
          const nameInput = page.locator('input[placeholder*="Nome"], input[placeholder*="Name"], input[name="name"], input#name').first();
          if (await nameInput.isVisible().catch(() => false)) {
            await simulateHumanTapLocator(page, nameInput, 500);
            await nameInput.fill(values.name || 'Marco & Friends');
          }
          const phoneInput = page.locator('input[placeholder*="09"], input[placeholder*="Phone"], input[placeholder*="WhatsApp"]').first();
          if (await phoneInput.isVisible().catch(() => false)) {
            await simulateHumanTapLocator(page, phoneInput, 400);
            await phoneInput.fill(values.phone || '0949800200');
          }
          await page.waitForTimeout(1500);
          break;
        }

        case 'pause':
        default: {
          await page.waitForTimeout(block.durationMs || 2500);
          break;
        }
      }

      if (block.pauseAfterMs) {
        await page.waitForTimeout(block.pauseAfterMs);
      }
    }

    console.log('\n⚙️ Conversione in MP4 nativo (H.264 / 9:16)...');
    const recordedVideo = page.video();
    let videoPath = null;
    if (recordedVideo) {
      videoPath = await recordedVideo.path();
    }

    await context.close();
    context = null;

    if (videoPath && fs.existsSync(videoPath)) {
      const mp4FileName = `tiktok_${storyboard.id}_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.mp4`;
      const mp4Path = path.resolve(videoOutDir, mp4FileName);

      let ffmpegPath = null;
      try {
        const mod = await import('ffmpeg-static');
        ffmpegPath = mod.default || mod;
      } catch {}

      if (ffmpegPath && fs.existsSync(ffmpegPath)) {
        const ffRes = spawnSync(ffmpegPath, [
          '-y',
          '-i', videoPath,
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          '-crf', '20',
          '-preset', 'fast',
          mp4Path
        ], { stdio: 'inherit' });

        if (ffRes.status === 0 && fs.existsSync(mp4Path)) {
          console.log(`🎬 Video MP4 salvato con successo: ${mp4FileName}`);
          try { fs.unlinkSync(videoPath); } catch {}
          console.log('\n======================================================');
          console.log('✅ REGISTRAZIONE COMPLETATA CON SUCCESSO!');
          console.log(`📁 Video salvato: ${mp4Path}`);
          console.log('======================================================\n');
        } else {
          console.log(`⚠️ Conversione fallita, conservato raw webm: ${videoPath}`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Errore durante l\'esecuzione:', err);
  } finally {
    if (context) {
      try { await context.close(); } catch {}
    }
    if (browser) {
      try { await browser.close(); } catch {}
    }
  }
}

main();
