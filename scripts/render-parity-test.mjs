/**
 * 🧪 PARITY TEST — Social Media Studio (/social) — Reparto Stagno
 *
 * Apre il VERO player AutoCut Lab (stessa pagina che usi tu) in Chromium headless,
 * esporta il video con la funzione ufficiale `window.__autoCutGetVideo` (rendering a passi fissi,
 * 1080x1920) e produce frame + metriche per confrontarlo con un altro render (SSIM).
 *
 * Uso:
 *   node scripts/render-parity-test.mjs --mode=P1 [--base=http://localhost:3000]
 *        [--testRunFile=scratch/parity/P1.testrun.json]   (stesso montaggio => confronto 1:1)
 *        [--compare=scratch/parity/altro.mp4]              (calcola SSIM con ffmpeg)
 *        [--out=scratch/parity] [--channel=chrome]
 *
 * Nota auth: su localhost la pagina è già sbloccata (SocialAdminAuth.isLocal), quindi nel cloud
 * il robot serve l'app in locale sul runner e NON serve alcun bypass esposto al pubblico.
 */
import fs from 'fs';
import path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { chromium } from 'playwright';
import ffmpegStatic from 'ffmpeg-static';

const args = process.argv.slice(2);
const getArg = (k, d = '') => {
  const f = args.find(a => a.startsWith(`--${k}=`));
  return f ? f.slice(k.length + 3) : d;
};

const mode = getArg('mode', 'P1').toUpperCase();
const base = getArg('base', 'http://localhost:3000').replace(/\/$/, '');
const outDir = path.resolve(getArg('out', 'scratch/parity'));
const testRunFile = getArg('testRunFile');
const compare = getArg('compare');
const channel = getArg('channel');
const apiBase = getArg('api').replace(/\/$/, '');
const ffmpeg = process.env.FFMPEG_PATH || ffmpegStatic || 'ffmpeg';
fs.mkdirSync(outDir, { recursive: true });

const log = (...m) => console.log('[parity]', ...m);

async function main() {
  const browser = await chromium.launch({
    headless: true,
    ...(channel ? { channel } : {}),
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required']
  });
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });

  // Seed dello stato (stesso montaggio => confronto identico). Niente chiamate AI.
  let seeded = null;
  if (testRunFile) {
    seeded = JSON.parse(fs.readFileSync(path.resolve(testRunFile), 'utf8'));
    await context.addInitScript(({ m, t }) => {
      localStorage.setItem('autocut_active_mode', m);
      localStorage.setItem('autocut_current_test', JSON.stringify(t));
      localStorage.setItem('autocut_tests_by_mode', JSON.stringify({ [m]: t }));
    }, { m: mode, t: seeded });
    log(`Seed montaggio da ${testRunFile}`);
  } else {
    await context.addInitScript((m) => {
      localStorage.setItem('autocut_active_mode', m);
    }, mode);
  }

  const page = await context.newPage();

  // Runner cloud: nessun `vercel dev`. Le chiamate /api/social-publisher vanno all'API remota.
  if (apiBase) {
    await context.route('**/api/social-publisher**', async (route) => {
      const req = route.request();
      const u = new URL(req.url());
      try {
        const resp = await fetch(`${apiBase}${u.pathname}${u.search}`, {
          method: req.method(),
          headers: { 'content-type': req.headers()['content-type'] || 'application/json' },
          body: ['GET', 'HEAD'].includes(req.method()) ? undefined : req.postDataBuffer()
        });
        await route.fulfill({
          status: resp.status,
          contentType: resp.headers.get('content-type') || 'application/json',
          body: Buffer.from(await resp.arrayBuffer())
        });
      } catch (e) {
        await route.abort();
      }
    });
    log(`API instradata verso ${apiBase}`);
  }
  page.on('pageerror', e => log('pageerror:', e.message));
  page.on('console', m => {
    const t = m.text();
    if (/AutoCutLab|WebCodecs|MediaRecorder|publisher|error|warn/i.test(t)) log('console:', t.slice(0, 300));
  });
  page.on('response', r => {
    if (r.url().includes('/api/social-publisher') && !r.ok()) log(`HTTP ${r.status()} ${r.url().slice(0, 160)}`);
  });

  log(`Apro ${base}/social-studio (mode ${mode})`);
  await page.goto(`${base}/social-studio`, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForFunction(() => typeof window.__autoCutGetVideo === 'function', null, { timeout: 120000 });

  // Capacità del browser (decisiva per il cloud)
  const caps = await page.evaluate(async () => {
    const out = { videoEncoder: typeof VideoEncoder !== 'undefined', h264: false, mediaRecorder: typeof MediaRecorder !== 'undefined' };
    if (out.videoEncoder) {
      try {
        const r = await VideoEncoder.isConfigSupported({ codec: 'avc1.640028', width: 1080, height: 1920, bitrate: 8e6, framerate: 60 });
        out.h264 = !!r.supported;
      } catch { /* ignore */ }
    }
    return out;
  });
  log('Capacità browser:', JSON.stringify(caps));

  // Salva il montaggio effettivo per rendere il test riproducibile
  const currentTest = await page.evaluate((m) => {
    const cur = localStorage.getItem('autocut_current_test');
    if (cur) return cur;
    try {
      const byMode = JSON.parse(localStorage.getItem('autocut_tests_by_mode') || '{}');
      return byMode[m] ? JSON.stringify(byMode[m]) : null;
    } catch { return null; }
  }, mode);
  const trPath = path.join(outDir, `${mode}.testrun.json`);
  if (currentTest) {
    fs.writeFileSync(trPath, currentTest);
    log(`Montaggio salvato: ${trPath}`);
  }

  // Esportazione con la funzione ufficiale del player
  log('Esportazione video (può richiedere alcuni minuti)...');
  const t0 = Date.now();
  const result = await page.evaluate(async () => {
    const url = await window.__autoCutGetVideo((pct, _i, label) => {
      window.__parityProgress = `${Math.round(pct)}% ${label || ''}`;
    });
    if (!url) return { error: 'nessun video restituito' };
    if (!url.startsWith('blob:')) return { remoteUrl: url };
    const blob = await (await fetch(url)).blob();
    const b64 = await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result).split(',')[1]);
      fr.onerror = rej;
      fr.readAsDataURL(blob);
    });
    return { type: blob.type, size: blob.size, b64 };
  });
  if (result.error) throw new Error(result.error);
  if (result.remoteUrl) {
    log(`Il player ha restituito URL remoto: ${result.remoteUrl}`);
    const buf = Buffer.from(await (await fetch(result.remoteUrl)).arrayBuffer());
    result.type = 'video/mp4';
    result.size = buf.length;
    result.b64 = buf.toString('base64');
  }

  const ext = /webm/.test(result.type) ? 'webm' : 'mp4';
  const tag = process.env.PARITY_TAG || (process.env.CI ? 'cloud' : 'local');
  const videoPath = path.join(outDir, `${mode}.${tag}.${ext}`);
  fs.writeFileSync(videoPath, Buffer.from(result.b64, 'base64'));
  log(`Video: ${videoPath} (${result.type}, ${(result.size / 1e6).toFixed(1)} MB, ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  await browser.close();

  // Metriche + frame di controllo con ffmpeg
  const info = spawnSync(ffmpeg, ['-i', videoPath], { encoding: 'utf8' }).stderr || '';
  const dur = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(info);
  const seconds = dur ? (+dur[1]) * 3600 + (+dur[2]) * 60 + parseFloat(dur[3]) : 0;
  const res = /(\d{3,4})x(\d{3,4})/.exec(info.split('Video:')[1] || '');
  log(`Durata ${seconds.toFixed(2)}s, risoluzione ${res ? res[0] : '?'}`);

  const checks = [];
  checks.push({ name: 'risoluzione 1080x1920', ok: !!res && res[1] === '1080' && res[2] === '1920' });
  checks.push({ name: 'durata > 5s', ok: seconds > 5 });
  checks.push({ name: 'file > 300 KB', ok: result.size > 300_000 });

  if (seconds > 0) {
    for (const [label, ts] of [['start', 0.05], ['mid', seconds / 2], ['end', Math.max(0, seconds - 0.2)]]) {
      const fp = path.join(outDir, `${mode}.${tag}.${label}.png`);
      execFileSync(ffmpeg, ['-y', '-v', 'error', '-ss', String(ts), '-i', videoPath, '-frames:v', '1', fp]);
      const size = fs.statSync(fp).size;
      checks.push({ name: `frame ${label} non nero (png ${Math.round(size / 1024)} KB)`, ok: size > 40_000 });
    }
  }

  if (compare) {
    let cmpPath = path.resolve(compare);
    if (/^https?:\/\//.test(compare)) {
      cmpPath = path.join(outDir, `${mode}.baseline.mp4`);
      fs.writeFileSync(cmpPath, Buffer.from(await (await fetch(compare)).arrayBuffer()));
      log(`Baseline scaricata: ${cmpPath}`);
    }
    const r = spawnSync(ffmpeg, ['-i', videoPath, '-i', cmpPath, '-lavfi',
      '[0:v]scale=540:960,setpts=PTS-STARTPTS[a];[1:v]scale=540:960,setpts=PTS-STARTPTS[b];[a][b]ssim', '-f', 'null', '-'],
      { encoding: 'utf8' });
    const m = /All:([\d.]+)/.exec(r.stderr || '');
    const ssim = m ? parseFloat(m[1]) : 0;
    log(`SSIM vs ${compare}: ${ssim}`);
    checks.push({ name: `SSIM >= 0.98 (${ssim})`, ok: ssim >= 0.98 });
  }

  console.log('\n===== ESITO PARITY TEST =====');
  for (const c of checks) console.log(`${c.ok ? '✅' : '❌'} ${c.name}`);
  const ok = checks.every(c => c.ok) && caps.videoEncoder !== undefined;
  fs.writeFileSync(path.join(outDir, `${mode}.${tag}.report.json`), JSON.stringify({ mode, caps, seconds, size: result.size, type: result.type, checks }, null, 2));
  process.exit(ok ? 0 : 1);
}

main().catch(e => { console.error('[parity] ERRORE:', e); process.exit(2); });
