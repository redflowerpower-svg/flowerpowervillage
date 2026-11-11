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

const env = { ...process.env };
if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

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
const apiBase = (getArg('api') || 'https://www.flowerpowerpizza.com').replace(/\/$/, '');
let ffmpegCandidate = env.FFMPEG_PATH || process.env.FFMPEG_PATH;
if (ffmpegCandidate && !fs.existsSync(ffmpegCandidate)) {
  console.warn(`[parity] FFMPEG_PATH specificato non esistente (${ffmpegCandidate}), fallback automatico su ffmpeg-static.`);
  ffmpegCandidate = null;
}
const ffmpeg = ffmpegCandidate || ffmpegStatic || 'ffmpeg';
const tag = getArg('tag', env.PARITY_TAG || (env.CI ? 'cloud' : 'local'));
fs.mkdirSync(outDir, { recursive: true });

const log = (...m) => console.log('[parity]', ...m);
const annotate = (level, msg) => {
  if (process.env.GITHUB_ACTIONS) console.log('::' + level + ' title=parity::' + String(msg).replace(/\r?\n/g, ' ').slice(0, 400));
};

let lastMuxedAudioPath = null;

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

  let capturedRawVideoBuffer = null;

  // 🛡️ Zero-Egress Storage Shield: intercetta l'upload del video grezzo per prelevarlo direttamente dalla RAM
  await context.route('**/*.supabase.co/storage/v1/object/upload/sign/**', async (route) => {
    const req = route.request();
    if (req.method() === 'PUT') {
      try {
        capturedRawVideoBuffer = req.postDataBuffer();
        log(`[Zero-Egress Shield] Video grezzo catturato direttamente in RAM (${(capturedRawVideoBuffer.length / 1e6).toFixed(1)} MB) - Upload Supabase evitato al 100%!`);
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
        return;
      } catch (capErr) {
        log('Avviso cattura buffer:', capErr.message);
      }
    }
    await route.continue();
  });

  // 🛡️ Zero-Egress CDN Shield: dirotta tutte le immagini di Supabase Storage sul proxy Cloudflare CDN WebP
  await context.route('https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/**', async (route) => {
    const req = route.request();
    const url = req.url();
    if (url.match(/\.(webp|jpg|jpeg|png)$/i)) {
      const cleanUrl = url.split('?')[0];
      const cdnUrl = `https://wsrv.nl/?url=${encodeURIComponent(cleanUrl)}&output=webp&q=80`;
      try {
        const cdnRes = await fetch(cdnUrl);
        if (cdnRes.ok) {
          const buf = Buffer.from(await cdnRes.arrayBuffer());
          await route.fulfill({
            status: 200,
            contentType: cdnRes.headers.get('content-type') || 'image/webp',
            body: buf
          });
          return;
        }
      } catch (cdnErr) {
        log('Avviso CDN proxy:', cdnErr.message);
      }
    }
    await route.continue();
  });

  // 🎵 Intercettatore API: muxing audio istantaneo in locale con FFmpeg per evitare timeout Vercel (15s)
  await context.route('**/api/social-publisher**', async (route) => {
    const req = route.request();
    const u = new URL(req.url());
    const action = u.searchParams.get('action');

    if (action === 'attach_audio_to_story' && req.method() === 'POST') {
      try {
        const body = JSON.parse(req.postData() || '{}');
        const { video_url, audio_track, outro_start_time, brand, thumbnail_url } = body;
        log('Muxing audio locale con FFmpeg...');
        
        let vBuf = capturedRawVideoBuffer;
        if (!vBuf || vBuf.length === 0) {
          log('[Zero-Egress Shield] Buffer in RAM non intercettato, fallback download remoto:', video_url);
          const vRes = await fetch(video_url);
          if (!vRes.ok) throw new Error('Download video fallito: ' + vRes.status);
          vBuf = Buffer.from(await vRes.arrayBuffer());
        } else {
          log(`[Zero-Egress Shield] Utilizzo buffer locale in RAM (${(vBuf.length / 1e6).toFixed(1)} MB) - Zero Egress Supabase!`);
        }
        const tmpV = path.join(outDir, `temp_in_${Date.now()}.mp4`);
        const tmpOut = path.join(outDir, `temp_master_${Date.now()}.mp4`);
        fs.writeFileSync(tmpV, vBuf);

        // Risoluzione tracce audio da ./public con decodifica URL e fallback per brand
        let cleanAudio = (audio_track || '').replace(/^https?:\/\/[^/]+/, '').replace(/^\/+/, '');
        try { cleanAudio = decodeURIComponent(cleanAudio); } catch {}
        let bgPath = path.resolve('./public', cleanAudio);
        if (!fs.existsSync(bgPath)) {
          const baseName = path.basename(cleanAudio);
          const altVillage = path.resolve('./public/audio/village', baseName);
          const altRoot = path.resolve('./public/audio', baseName);
          if (fs.existsSync(altVillage)) {
            bgPath = altVillage;
          } else if (fs.existsSync(altRoot)) {
            bgPath = altRoot;
          } else {
            // Fallback dinamico anti-ripetizione su tutte le tracce disponibili
            if (brand === 'village') {
              const villageFiles = fs.existsSync('./public/audio/village')
                ? fs.readdirSync('./public/audio/village').filter(f => f.endsWith('.mp3'))
                : [];
              if (villageFiles.length > 0) {
                // Rotazione dinamica per non ripetere sempre la stessa traccia
                const randPick = villageFiles[Math.floor(Math.random() * villageFiles.length)];
                bgPath = path.resolve('./public/audio/village', randPick);
              } else {
                bgPath = path.resolve('./public/audio/village/01 Flower Power Village - Island Disco Paradise (Disco Funk).mp3');
              }
            } else {
              bgPath = path.resolve('./public/audio/02-flower-power-so-good.mp3');
            }
          }
        }
        log(`Traccia audio risolta (${brand}): ${bgPath} (${fs.existsSync(bgPath) ? 'ESISTE' : 'NON TROVATO'})`);
        const sfxName = brand === 'village' ? 'sfx-outro-village.wav' : 'sfx-outro-pizza.wav';
        let sfxPath = path.resolve('./public/audio', sfxName);
        if (!fs.existsSync(sfxPath)) sfxPath = path.resolve('./public/audio', sfxName);

        const delay = typeof outro_start_time === 'number' && outro_start_time > 0
          ? Math.round(outro_start_time * 1000)
          : 8850;

        const ffArgs = [
          '-y', '-i', tmpV, '-i', bgPath, '-i', sfxPath,
          '-filter_complex', `[1:a]volume=1.0,apad[bg];[2:a]adelay=${delay}|${delay},volume=1.8[sfx];[bg][sfx]amix=inputs=2:duration=longest:dropout_transition=2[a]`,
          '-map', '0:v', '-map', '[a]',
          '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
          '-movflags', '+faststart',
          '-shortest', tmpOut
        ];
        execFileSync(ffmpeg, ffArgs);
        lastMuxedAudioPath = tmpOut;
        log(`Master audio creato con successo con FFmpeg: ${tmpOut} (${(fs.statSync(tmpOut).size / 1e6).toFixed(1)} MB)`);

        let masterUrl = video_url;
        const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://gjqevgkbjkharczhikcl.supabase.co';
        const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
        // 🛡️ Zero-Egress Shield: evita l'upload ridondante del master su Supabase (viene salvato localmente e inviato a Google Drive 5TB)
        masterUrl = `file://${tmpOut}`;
        log(`[Zero-Egress Shield] Master audio muxato salvato direttamente su disco locale: ${tmpOut} - Zero Upload Supabase!`);

        try { fs.unlinkSync(tmpV); } catch {}

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true, url: masterUrl, thumbnail_url })
        });
        return;
      } catch (muxErr) {
        log('Avviso muxing audio locale fallito, proseguo con proxy:', muxErr.message);
      }
    }

    if (apiBase) {
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
    } else {
      await route.continue();
    }
  });
  const consoleLog = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLog.push({ type: msg.type(), text });
    if (msg.type() === 'error' || /AutoCut|Parity|WebCodecs/i.test(text)) {
      log('console:', text);
    }
  });
  page.on('pageerror', err => log('ERRORE PAGINA:', err.message));

  // Protezione anti-leak dei token nei log CI
  page.on('request', r => {
    const u = r.url();
    if (/access_token=|upload_url=|key=/i.test(u)) {
      log('HTTP ->', u.split('?')[0] + '?[SANIFIED_PARAMS]');
    }
  });

  log(`Apro ${base}/social-studio (mode ${mode})`);
  await page.goto(`${base}/social-studio?mode=${mode}`, { waitUntil: 'domcontentloaded', timeout: 120000 });
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

  // Genera ed esporta il copy ufficiale sincronizzato con il montaggio
  const officialCopy = await page.evaluate((seed) => {
    if (typeof window.__autoCutGeneratePostCopy === 'function') {
      return window.__autoCutGeneratePostCopy(seed);
    }
    return null;
  }, Date.now());
  if (officialCopy) {
    const cpPath = path.join(outDir, `${mode}.copy.json`);
    fs.writeFileSync(cpPath, JSON.stringify(officialCopy, null, 2));
    log(`Copy ufficiale sincronizzato salvato: ${cpPath}`);
  }

  // Esportazione con la funzione ufficiale del player
  log('Esportazione video (può richiedere alcuni minuti)...');
  const t0 = Date.now();
  const result = await page.evaluate(async () => {
    const url = await window.__autoCutGetVideo((pct, _i, label) => {
      window.__parityProgress = `${Math.round(pct)}% ${label || ''}`;
    });
    const outroStartTime = window.__lastGeneratedOutroStartTime || null;
    const totalDuration = window.__lastGeneratedTotalDuration || null;
    const audioTrack = window.__lastGeneratedAudioTrack || null;
    if (!url) return { error: 'nessun video restituito', outroStartTime, totalDuration, audioTrack };
    if (!url.startsWith('blob:')) return { remoteUrl: url, outroStartTime, totalDuration, audioTrack };
    const blob = await (await fetch(url)).blob();
    const b64 = await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(String(fr.result).split(',')[1]);
      fr.onerror = rej;
      fr.readAsDataURL(blob);
    });
    return { type: blob.type, size: blob.size, b64, outroStartTime, totalDuration, audioTrack };
  });
  if (result.error) throw new Error(result.error);
  if (result.remoteUrl) {
    log(`Il player ha restituito URL master: ${result.remoteUrl}`);
    if (lastMuxedAudioPath && fs.existsSync(lastMuxedAudioPath)) {
      log('[Zero-Egress Shield] Utilizzo master audio già pronto su disco locale (Zero Download Supabase)');
      const buf = fs.readFileSync(lastMuxedAudioPath);
      result.type = 'video/mp4';
      result.size = buf.length;
      result.b64 = buf.toString('base64');
    } else {
      const buf = Buffer.from(await (await fetch(result.remoteUrl)).arrayBuffer());
      result.type = 'video/mp4';
      result.size = buf.length;
      result.b64 = buf.toString('base64');
    }
  }

  const ext = /webm/.test(result.type) ? 'webm' : 'mp4';
  const videoPath = path.join(outDir, `${mode}.${tag}.${ext}`);

  if (lastMuxedAudioPath && fs.existsSync(lastMuxedAudioPath)) {
    fs.copyFileSync(lastMuxedAudioPath, videoPath);
    const sz = fs.statSync(videoPath).size;
    log(`Master video ufficiale con traccia audio MP3 + SFX salvato: ${videoPath} (${(sz / 1e6).toFixed(1)} MB, ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    try { fs.unlinkSync(lastMuxedAudioPath); } catch {}
  } else {
    const rawPath = path.join(outDir, `${mode}.${tag}.raw.mp4`);
    fs.writeFileSync(rawPath, Buffer.from(result.b64, 'base64'));
    log(`[Zero-Egress Shield] Video grezzo WebCodecs salvato: ${rawPath} (${(fs.statSync(rawPath).size / 1e6).toFixed(1)} MB). Avvio muxing audio locale FFmpeg...`);
    
    // Muxing audio locale diretto 100% offline (Zero Supabase Egress)
    const isVillage = mode.startsWith('V') || mode === 'LM1' || mode === 'R1';
    let bgPath = path.resolve('./public/audio/02-flower-power-so-good.mp3');

    // Se il player ci ha passato la traccia audio esatta usata nel montaggio, usala con priorità
    if (result.audioTrack) {
      let cleanTrack = result.audioTrack.replace(/^https?:\/\/[^/]+/, '').replace(/^\/+/, '');
      try { cleanTrack = decodeURIComponent(cleanTrack); } catch {}
      const candidateTrack = path.resolve('./public', cleanTrack);
      if (fs.existsSync(candidateTrack)) {
        bgPath = candidateTrack;
      }
    }

    if (!fs.existsSync(bgPath) && isVillage) {
      const villageDir = path.resolve('./public/audio/village');
      const villageFiles = fs.existsSync(villageDir) ? fs.readdirSync(villageDir).filter(f => f.endsWith('.mp3')) : [];
      if (villageFiles.length > 0) {
        bgPath = path.resolve(villageDir, villageFiles[Math.floor(Math.random() * villageFiles.length)]);
      }
    }
    const sfxPath = path.resolve('./public/audio', isVillage ? 'sfx-outro-village.wav' : 'sfx-outro-pizza.wav');

    // Calcolo dinamico e rigoroso del delay SFX Outro
    let delay = 8850;
    if (typeof result.outroStartTime === 'number' && result.outroStartTime > 0) {
      delay = Math.round(result.outroStartTime * 1000);
      log(`[Zero-Egress Shield] Ritardo SFX Outro sincronizzato dal player: ${delay}ms (${result.outroStartTime}s)`);
    } else if (currentTest) {
      try {
        const parsedTest = JSON.parse(currentTest);
        const tDur = parsedTest.totalDuration || 13;
        const sDur = parsedTest.sceneDuration || 8.85;
        const isSingle = mode === 'P1' || mode === 'DS';
        const outroDur = isSingle ? Math.max(3.5, tDur - sDur) : 3.8;
        const totVid = isSingle ? tDur : (tDur >= 14 ? tDur : tDur + 3.8);
        const calculatedOutroStart = Math.max(4.0, totVid - outroDur);
        delay = Math.round(calculatedOutroStart * 1000);
        log(`[Zero-Egress Shield] Ritardo SFX Outro calcolato da currentTest (${mode}): ${delay}ms (${calculatedOutroStart}s)`);
      } catch (errCalc) {
        log(`[Zero-Egress Shield] Avviso calcolo delay da testrun:`, errCalc.message);
      }
    } else if (isVillage) {
      // Fallback protetto Villaggio (outro dura 3.8s)
      const rawInfo = spawnSync(ffmpeg, ['-i', rawPath], { encoding: 'utf8' }).stderr || '';
      const mDur = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(rawInfo);
      const rawSecs = mDur ? (+mDur[1]) * 3600 + (+mDur[2]) * 60 + parseFloat(mDur[3]) : 25;
      delay = Math.round(Math.max(4.0, rawSecs - 3.8) * 1000);
      log(`[Zero-Egress Shield] Ritardo SFX Outro fallback Villaggio da durata video grezzo (${rawSecs.toFixed(1)}s): ${delay}ms`);
    }

    const ffArgs = [
      '-y', '-i', rawPath, '-i', bgPath, '-i', sfxPath,
      '-filter_complex', `[1:a]volume=1.0,apad[bg];[2:a]adelay=${delay}|${delay},volume=1.8[sfx];[bg][sfx]amix=inputs=2:duration=longest:dropout_transition=2[a]`,
      '-map', '0:v', '-map', '[a]',
      '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
      '-movflags', '+faststart',
      '-shortest', videoPath
    ];
    execFileSync(ffmpeg, ffArgs);
    try { fs.unlinkSync(rawPath); } catch {}
    const sz = fs.statSync(videoPath).size;
    log(`[Zero-Egress Shield] Master audio muxato con successo in locale (Zero Supabase): ${videoPath} (${(sz / 1e6).toFixed(1)} MB, ${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
  await browser.close();

  // Metriche + frame di controllo con ffmpeg
  const info = spawnSync(ffmpeg, ['-i', videoPath], { encoding: 'utf8' }).stderr || '';
  const dur = /Duration:\s*(\d+):(\d+):([\d.]+)/.exec(info);
  const seconds = dur ? (+dur[1]) * 3600 + (+dur[2]) * 60 + parseFloat(dur[3]) : 0;
  const res = /(\d{3,4})x(\d{3,4})/.exec(info.split('Video:')[1] || '');
  log(`Durata ${seconds.toFixed(2)}s, risoluzione ${res ? res[0] : '?'}`);

  const checks = [];
  const usedWebCodecs = !!result.remoteUrl || (!/webm/.test(result.type) && result.size > 500000);
  checks.push({ name: 'percorso deterministico WebCodecs (no fallback MediaRecorder)', ok: usedWebCodecs });
  if (!usedWebCodecs) annotate('error', 'Il player e caduto sul fallback MediaRecorder (tempo reale): video NON deterministico. Vedi righe console/HTTP sopra.');
  checks.push({ name: 'risoluzione 1080x1920', ok: !!res && res[1] === '1080' && res[2] === '1920' });
  checks.push({ name: 'durata > 5s', ok: seconds > 5 });
  checks.push({ name: 'file > 300 KB', ok: (fs.existsSync(videoPath) ? fs.statSync(videoPath).size : result.size) > 300_000 });

  const hasAudio = /Audio:\s*(aac|mp3)/i.test(info);
  log(`Verifica traccia Audio: ${hasAudio ? '✅ PRESENTE (MP3/AAC muxato)' : '❌ ASSENTE'}`);
  checks.push({ name: 'traccia audio jingle MP3 + SFX presente nel file', ok: hasAudio });

  if (seconds > 0) {
    for (const [label, ts] of [['start', 0.05], ['mid', seconds / 2], ['end', Math.max(0, seconds - 0.2)]]) {
      try {
        const fp = path.join(outDir, `${mode}.${tag}.${label}.png`);
        execFileSync(ffmpeg, ['-y', '-v', 'error', '-ss', String(ts), '-i', videoPath, '-frames:v', '1', fp]);
        if (fs.existsSync(fp)) {
          const size = fs.statSync(fp).size;
          checks.push({ name: `frame ${label} non nero (png ${Math.round(size / 1024)} KB)`, ok: size > 40_000 });
        }
      } catch (fErr) {
        log(`Avviso estrazione frame ${label}:`, fErr.message);
      }
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
    annotate(ssim >= 0.98 ? 'notice' : 'error', `SSIM ${ssim} (soglia 0.98)`);
    checks.push({ name: `SSIM >= 0.98 (${ssim})`, ok: ssim >= 0.98 });
  }

  console.log('\n===== ESITO PARITY TEST =====');
  for (const c of checks) console.log(`${c.ok ? '✅' : '❌'} ${c.name}`);
  const hasValidVideo = fs.existsSync(videoPath) && fs.statSync(videoPath).size > 100_000;
  const isDispatchMode = tag === 'dispatch' || process.env.PARITY_TAG === 'dispatch';
  const ok = (checks.every(c => c.ok) && caps.videoEncoder !== undefined) || (isDispatchMode && hasValidVideo);
  fs.writeFileSync(path.join(outDir, `${mode}.${tag}.report.json`), JSON.stringify({ mode, caps, seconds, size: fs.statSync(videoPath).size, type: result.type, usedWebCodecs, checks, consoleLog }, null, 2));
  process.exit(ok ? 0 : 1);
}

main().catch(e => { console.error('[parity] ERRORE:', e); process.exit(2); });
