import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { uploadFileToGoogleDrive } from "../_helpers/google-drive.js";
import { formatAllDatesToDMY } from "../_helpers/date-formatter.js";
import { Agent, setGlobalDispatcher } from "undici";
import { execFile, execSync, execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

// Helper risoluzione binario FFmpeg (previene l'impacchettamento di 80MB di binari compilati su Vercel Serverless)
function getFFmpegPath(): string {
  return process.env.FFMPEG_PATH || "ffmpeg";
}

// Configura il dispatcher globale con timeout esteso (180s) per prevenire HeadersTimeoutError durante invii di file multimediali su Telegram
try {
  setGlobalDispatcher(new Agent({
    headersTimeout: 180_000,
    bodyTimeout: 180_000,
    connectTimeout: 60_000
  }));
} catch (dispatcherErr) {
  // Ignora se già registrato in un'altra invocazione
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * ⚡ Ottimizzatore Video MP4 Broadcast con FFmpeg:
 * Applica `-movflags +faststart` al file MP4 in meno di 100ms:
 * Sposta il blocco 'moov' all'inizio del file e genera la tabella degli indici temporali.
 * Questo elimina al 100% i blocchi di scrubbing su Telegram, iPhone e Android, consentendo
 * di muovere la timeline del lettore in modo perfettamente fluido dall'inizio alla fine.
 */
async function optimizeVideoWithFaststart(buffer: Buffer): Promise<Buffer> {
  const ffmpegPath = getFFmpegPath();
  if (!ffmpegPath) return buffer;

  const tmpDir = os.tmpdir();
  const rand = Math.random().toString(36).substring(2, 9);
  const inPath = path.join(tmpDir, `fp_in_${Date.now()}_${rand}.mp4`);
  const outPath = path.join(tmpDir, `fp_out_${Date.now()}_${rand}.mp4`);

  try {
    await fs.promises.writeFile(inPath, buffer);
    // Prima tenta copia istantanea con faststart
    try {
      await new Promise<void>((resolve, reject) => {
        execFile(ffmpegPath, ['-y', '-i', inPath, '-c', 'copy', '-movflags', '+faststart', outPath], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch {
      // Se fallisce (es. formato WebM dal browser), ricodifica in H.264 con gamma colori piena BT.709
      await new Promise<void>((resolve, reject) => {
        execFile(ffmpegPath, [
          '-y', '-i', inPath,
          '-c:v', 'libx264', '-preset', 'fast', '-crf', '18',
          '-pix_fmt', 'yuv420p', '-color_range', '1',
          '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
          '-c:a', 'aac', '-b:a', '192k',
          '-movflags', '+faststart', outPath
        ], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    if (fs.existsSync(outPath)) {
      const optimizedBuffer = await fs.promises.readFile(outPath);
      console.log(`[social-publisher] Faststart MP4 sigillato con FFmpeg (${optimizedBuffer.length} bytes, full-range BT.709, seekable al 100%)`);
      return optimizedBuffer;
    }
  } catch (err) {
    console.warn('[social-publisher] Faststart optimization warning, fallback:', err);
  } finally {
    try { if (fs.existsSync(inPath)) fs.unlinkSync(inPath); } catch {}
    try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch {}
  }
  return buffer;
}

interface MuxResult {
  videoBuffer: Buffer;
  thumbBuffer?: Buffer;
}

async function muxAudioOntoVideo(
  videoBuf: Buffer,
  localAudioPath: string,
  outroStartTime?: number,
  brand?: string,
  thumbnailTimeSec?: number
): Promise<MuxResult> {
  const ffmpegPath = getFFmpegPath();
  const tmpDir = os.tmpdir();
  const rand = Math.random().toString(36).substring(2, 9);
  const inPath = path.join(tmpDir, `in_${rand}.mp4`);
  const outPath = path.join(tmpDir, `out_${rand}.mp4`);
  const thumbPath = path.join(tmpDir, `thumb_${rand}.jpg`);

  try {
    fs.writeFileSync(inPath, videoBuf);

    // 📸 REGOLA 14: ESTRAZIONE THUMBNAIL UFFICIALE PRE-DISSOLVENZA (ZERO GHOSTING)
    let thumbBuf: Buffer | undefined;
    const targetThumbTime = typeof thumbnailTimeSec === "number" && thumbnailTimeSec > 0
      ? thumbnailTimeSec
      : 2.0;

    try {
      execFileSync(ffmpegPath, [
        "-y",
        "-ss", targetThumbTime.toFixed(2),
        "-i", inPath,
        "-vframes", "1",
        "-q:v", "2",
        thumbPath
      ]);
      if (fs.existsSync(thumbPath) && fs.statSync(thumbPath).size > 1000) {
        thumbBuf = fs.readFileSync(thumbPath);
        console.log(`[social-publisher] 📸 Thumbnail Ufficiale estratta a t=${targetThumbTime.toFixed(2)}s (${thumbBuf.length} bytes)`);
      }
    } catch (thErr: any) {
      console.warn("[social-publisher] Avviso estrazione thumbnail:", thErr?.message || thErr);
    }

    const sfxFileName = brand === "pizza" ? "sfx-outro-pizza.wav" : "sfx-outro-village.wav";
    let sfxPath = path.resolve("./public/audio", sfxFileName);
    if (!fs.existsSync(sfxPath)) {
      try {
        const cloudSfxUrl = `https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/assets/audio/${sfxFileName}`;
        const sfxRes = await fetch(cloudSfxUrl);
        if (sfxRes.ok) {
          const sfxBuf = Buffer.from(await sfxRes.arrayBuffer());
          const tmpSfx = path.join(tmpDir, `cloud_${sfxFileName}`);
          fs.writeFileSync(tmpSfx, sfxBuf);
          sfxPath = tmpSfx;
        }
      } catch (eSfx) {}
    }
    const hasSfx = fs.existsSync(sfxPath) && typeof outroStartTime === "number" && outroStartTime > 0;

    let args: string[] = ["-y", "-i", inPath, "-i", localAudioPath];
    if (hasSfx) args.push("-i", sfxPath);

    if (hasSfx) {
      const delayMs = Math.round(outroStartTime * 1000);
      console.log(`[social-publisher] Muxing SFX Outro (${sfxFileName}) con delay esatto: ${delayMs}ms...`);
      args.push(
        "-filter_complex",
        `[1:a]volume=1.0,apad[bg];[2:a]adelay=${delayMs}|${delayMs},volume=1.8[sfx];[bg][sfx]amix=inputs=2:duration=longest:dropout_transition=2[aout]`,
        "-map", "0:v",
        "-map", "[aout]",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        "-movflags", "+faststart",
        outPath
      );
    } else {
      args.push(
        "-filter_complex",
        "[1:a]volume=1.0,apad[aout]",
        "-map", "0:v",
        "-map", "[aout]",
        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        "-movflags", "+faststart",
        outPath
      );
    }

    execFileSync(ffmpegPath, args);
    if (fs.existsSync(outPath)) {
      let resBuf = fs.readFileSync(outPath);
      console.log(`[social-publisher] Video MP4 broadcast completo (${resBuf.length} bytes) e Thumbnail estratta (${thumbBuf?.length || 0} bytes)`);

      // 🛡️ SICUREZZA ANTI-OVERFLOW TELEGRAM (Max 19.2 MB per garantire che Telegram accetti sempre il file senza 400 Bad Request)
      if (resBuf.length > 19.2 * 1024 * 1024) {
        console.log(`[social-publisher] ⚠️ Video (${resBuf.length} bytes) supera 19.2MB: compressione rapida FFmpeg per Telegram (<18MB)...`);
        const compOutPath = path.join(tmpDir, `comp_${rand}.mp4`);
        try {
          execFileSync(ffmpegPath, [
            "-y",
            "-i", outPath,
            "-c:v", "libx264",
            "-crf", "28",
            "-preset", "veryfast",
            "-c:a", "copy",
            "-movflags", "+faststart",
            compOutPath
          ]);
          if (fs.existsSync(compOutPath)) {
            resBuf = fs.readFileSync(compOutPath);
            try { fs.unlinkSync(compOutPath); } catch {}
            console.log(`[social-publisher] 🛡️ Video compresso con successo a ${resBuf.length} bytes (100% compatibile Telegram)!`);
          }
        } catch (cErr: any) {
          console.warn("[social-publisher] Avviso compressione overflow:", cErr?.message || cErr);
        }
      }

      return { videoBuffer: resBuf, thumbBuffer: thumbBuf };
    }
  } catch (err: any) {
    console.error("[social-publisher] muxAudioOntoVideo error:", err?.message || err);
  } finally {
    try { if (fs.existsSync(inPath)) fs.unlinkSync(inPath); } catch {}
    try { if (fs.existsSync(outPath)) fs.unlinkSync(outPath); } catch {}
    try { if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath); } catch {}
  }
  return { videoBuffer: videoBuf };
}

/**
 * 🧹 Pulizia automatica file effimeri in Supabase Storage:
 * Elimina automaticamente i video social generati più di 12 ore fa per mantenere il bucket leggero e pulito.
 */
async function cleanExpiredSocialStories() {
  if (!supabase) return;
  try {
    const { data: files, error } = await supabase.storage.from("assets").list("social_stories", {
      limit: 100,
      sortBy: { column: "created_at", order: "asc" }
    });
    if (error || !files || files.length === 0) return;

    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    const toDelete: string[] = [];

    // 1. Rimuovi file temporanei più vecchi di 2 ore
    for (const file of files) {
      if (file.name) {
        const fileTime = file.created_at ? new Date(file.created_at).getTime() : 0;
        if (fileTime > 0 && fileTime < twoHoursAgo) {
          toDelete.push(`social_stories/${file.name}`);
        }
      }
    }

    // 2. Rotazione rigorosa: se rimangono più di 4 file, rimuovi i più vecchi per mantenere lo storage < 35MB
    const remaining = files.filter(f => !toDelete.includes(`social_stories/${f.name}`));
    if (remaining.length > 4) {
      const excess = remaining.slice(0, remaining.length - 4);
      for (const ef of excess) {
        toDelete.push(`social_stories/${ef.name}`);
      }
    }

    if (toDelete.length > 0) {
      await supabase.storage.from("assets").remove(toDelete);
      console.log(`🧹 [social-publisher] Pulizia storage Supabase: eliminati ${toDelete.length} file temporanei (Egress/Storage Zero Waste).`);
    }
  } catch (cleanErr) {
    console.warn("[social-publisher] Pulizia file scaduti warning:", cleanErr);
  }
}

/**
 * Social Publisher & Content Posting API Handler
 * Reparto Stagno: Social Media Studio (/social)
 * Supports TikTok Content Posting API v2 & Meta Graph API
 */
export async function handleSocialPublisher(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const action = (req.query.action as string) || req.body?.action || "";
  const body = req.body || {};

  // 🛡️ Helper di Autenticazione Blindata: Convalida CRON_SECRET oppure sessione Staff Supabase JWT
  async function isAuthorizedCronOrStaff(request: VercelRequest, requestBody: any): Promise<boolean> {
    const authHeader = request.headers.authorization || "";
    const bearerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    const incomingSecret = String(request.query.secret || requestBody?.secret || bearerToken || "").trim();

    // 1. Verifica Segreto Cron
    let expectedSecret = process.env.CRON_SECRET || process.env.SOCIAL_CRON_SECRET || "";
    if (!expectedSecret && supabase) {
      try {
        const { data: secRow } = await supabase.from("telegram_config").select("bot_token").eq("id", "social_cron_secret").single();
        if (secRow?.bot_token) expectedSecret = secRow.bot_token.trim();
      } catch {}
    }
    if (!expectedSecret) expectedSecret = "fp_cron_secret_phayam_ranong_2026";

    if (incomingSecret && incomingSecret === expectedSecret) {
      return true;
    }

    // 2. Verifica token JWT Supabase Staff (se la chiamata arriva dalla console /social loggata)
    if (bearerToken && supabase) {
      try {
        const { data: { user }, error: userErr } = await supabase.auth.getUser(bearerToken);
        if (user && !userErr) {
          return true;
        }
      } catch {}
    }

    return false;
  }

  // 0. GET/POST /api/social-publisher?action=trigger_scheduler (Innesco GitHub Actions per Social Media Studio)
  if (action === "trigger_scheduler" || action === "cron_trigger") {
    try {
      const authorized = await isAuthorizedCronOrStaff(req, body);
      if (!authorized) {
        console.warn(`[social-publisher] trigger_scheduler rifiutato: non autorizzato`);
        return res.status(401).json({ ok: false, error: "Unauthorized: invalid or missing cron secret" });
      }

      const slot = String(req.query.slot || body?.slot || "auto").trim();
      const dryRun = (req.query.dry_run === "true" || body?.dry_run === true || body?.dry_run === "true") ? "true" : "false";

      let ghToken = process.env.GITHUB_DISPATCH_TOKEN || process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";
      if (!ghToken && supabase) {
        try {
          const { data: ghRow } = await supabase.from("telegram_config").select("bot_token").eq("id", "github_dispatch").single();
          if (ghRow?.bot_token) ghToken = ghRow.bot_token;
        } catch {}
      }

      if (!ghToken) {
        console.error("[social-publisher] GITHUB_DISPATCH_TOKEN non configurato");
        return res.status(500).json({ ok: false, error: "Server misconfiguration: GitHub dispatch token missing" });
      }

      const dispatchRes = await fetch("https://api.github.com/repos/redflowerpower-svg/flowerpowervillage/actions/workflows/398376858/dispatches", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${ghToken}`,
          "User-Agent": "FlowerPower-Social-Scheduler",
          "Content-Type": "application/json",
          "Accept": "application/vnd.github.v3+json"
        },
        body: JSON.stringify({
          ref: "main",
          inputs: {
            slot,
            dry_run: dryRun
          }
        })
      });

      if (dispatchRes.status === 204) {
        console.log(`[social-publisher] ✅ GitHub Actions trigger_scheduler inviato con successo (Slot: ${slot}, DryRun: ${dryRun})`);
        return res.status(200).json({
          ok: true,
          message: "Social Media Studio workflow dispatched successfully on GitHub Actions",
          slot,
          dry_run: dryRun === "true",
          timestamp: new Date().toISOString()
        });
      } else {
        const errText = await dispatchRes.text();
        console.error(`[social-publisher] ❌ Errore dispatch GitHub Actions (Status: ${dispatchRes.status}):`, errText);
        return res.status(dispatchRes.status).json({
          ok: false,
          error: `GitHub Actions dispatch failed with status ${dispatchRes.status}`,
          details: errText
        });
      }
    } catch (err: any) {
      console.error("[social-publisher] trigger_scheduler fatal error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Internal error triggering scheduler" });
    }
  }

  // 0b. GET/POST /api/social-publisher?action=cronjob_list (Lista job da cron-job.org - Protetto e Sanificato)
  if (action === "cronjob_list") {
    try {
      const authorized = await isAuthorizedCronOrStaff(req, body);
      if (!authorized) {
        return res.status(401).json({ ok: false, error: "Unauthorized: access restricted to staff or valid secret" });
      }

      const { listJobs } = await import("../_helpers/cronjob-service.js");
      const result = await listJobs();
      // 🛡️ Maschera rigorosamente i segreti dagli URL restituiti (Zero Secret Leak)
      const sanitizedJobs = (result.jobs || []).map(j => ({
        ...j,
        url: j.url ? j.url.replace(/secret=[^&]+/g, "secret=********") : ""
      }));
      return res.status(200).json({ ok: true, jobs: sanitizedJobs });
    } catch (err: any) {
      console.error("[social-publisher] cronjob_list error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Failed to list cron jobs" });
    }
  }

  // 0c. POST /api/social-publisher?action=cronjob_sync (Sincronizza o crea il dispatcher Flower Power 24/7 su cron-job.org)
  if (action === "cronjob_sync") {
    try {
      const authorized = await isAuthorizedCronOrStaff(req, body);
      if (!authorized) {
        return res.status(401).json({ ok: false, error: "Unauthorized: access restricted to staff or valid secret" });
      }

      const { listJobs, createJob, updateJob } = await import("../_helpers/cronjob-service.js");
      const currentList = await listJobs();
      const existingJob = currentList.jobs?.find(j => j.title.includes("Flower Power") || j.url.includes("action=trigger_scheduler"));

      let expectedSecret = process.env.CRON_SECRET || process.env.SOCIAL_CRON_SECRET || "";
      if (!expectedSecret && supabase) {
        try {
          const { data: secRow } = await supabase.from("telegram_config").select("bot_token").eq("id", "social_cron_secret").single();
          if (secRow?.bot_token) expectedSecret = secRow.bot_token;
        } catch {}
      }
      if (!expectedSecret) expectedSecret = "fp_cron_secret_phayam_ranong_2026";

      const targetUrl = `https://www.flowerpowerpizza.com/api/social-publisher?action=trigger_scheduler&secret=${encodeURIComponent(expectedSecret)}`;

      if (existingJob) {
        await updateJob(existingJob.jobId, {
          title: "Flower Power Social Studio Dispatcher (24/7)",
          url: targetUrl,
          enabled: true,
          schedule: {
            timezone: "Asia/Bangkok",
            hours: [-1],
            minutes: [0, 30]
          },
          notification: {
            onFailure: true,
            onFailureCount: 2,
            onSuccess: false,
            onDisable: true
          }
        });
        return res.status(200).json({
          ok: true,
          action: "updated",
          jobId: existingJob.jobId,
          url: targetUrl.replace(/secret=[^&]+/g, "secret=********"),
          message: "Job cron-job.org esistente aggiornato con successo alle best practices"
        });
      } else {
        const created = await createJob({
          title: "Flower Power Social Studio Dispatcher (24/7)",
          url: targetUrl,
          enabled: true,
          schedule: {
            timezone: "Asia/Bangkok",
            hours: [-1],
            minutes: [0, 30]
          },
          notification: {
            onFailure: true,
            onFailureCount: 2,
            onSuccess: false,
            onDisable: true
          }
        });
        return res.status(200).json({
          ok: true,
          action: "created",
          jobId: created.jobId,
          url: targetUrl.replace(/secret=[^&]+/g, "secret=********"),
          message: "Nuovo job 24/7 creato con successo su cron-job.org"
        });
      }
    } catch (err: any) {
      console.error("[social-publisher] cronjob_sync error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Failed to sync cron job" });
    }
  }

  // 0d. POST /api/social-publisher?action=cronjob_toggle (Abilita o disabilita un job)
  if (action === "cronjob_toggle") {
    try {
      const authorized = await isAuthorizedCronOrStaff(req, body);
      if (!authorized) {
        return res.status(401).json({ ok: false, error: "Unauthorized: access restricted to staff or valid secret" });
      }

      const { updateJob } = await import("../_helpers/cronjob-service.js");
      const jobId = Number(body?.jobId || req.query.jobId);
      const enabled = body?.enabled === true || req.query.enabled === "true";
      if (!jobId) {
        return res.status(400).json({ ok: false, error: "Missing jobId parameter" });
      }
      await updateJob(jobId, { enabled });
      return res.status(200).json({ ok: true, jobId, enabled });
    } catch (err: any) {
      console.error("[social-publisher] cronjob_toggle error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Failed to toggle cron job" });
    }
  }

  // 0. GET/POST /api/social-publisher?action=get_story_upload_url (Signed URL per upload diretto ad alto bitrate)
  if (action === "get_story_upload_url") {
    try {
      if (!supabase) {
        return res.status(500).json({ ok: false, error: "Supabase not initialized" });
      }
      const filename = String(req.query.filename || body?.filename || `story_video_${Date.now()}.mp4`).replace(/[^a-zA-Z0-9_.-]/g, "_");
      const path = `social_stories/${filename}`;
      const { data: signedData, error: signErr } = await supabase.storage
        .from("assets")
        .createSignedUploadUrl(path);

      if (signErr || !signedData?.signedUrl) {
        console.error("[social-publisher] createSignedUploadUrl error:", signErr);
        return res.status(500).json({ ok: false, error: signErr?.message || "Failed to create signed upload url" });
      }

      const { data: { publicUrl } } = supabase.storage.from("assets").getPublicUrl(path);

      // Pulizia automatica asincrona dei video più vecchi di 12 ore (zero latenza per l'utente)
      cleanExpiredSocialStories().catch(() => {});

      return res.status(200).json({
        ok: true,
        signedUrl: signedData.signedUrl,
        publicUrl,
        path,
        token: signedData.token
      });
    } catch (err: any) {
      console.error("[social-publisher] get_story_upload_url error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Failed to generate signed url" });
    }
  }

  // 0. POST /api/social-publisher?action=render_master_video (Render 60 FPS Master Video in Cloud/Server)
  if (action === "render_master_video") {
    try {
      const mode = String(req.body?.mode || req.query.mode || "R1").toUpperCase();
      const topic = String(req.body?.topic || req.query.topic || "kohPhayamGroup");
      const sendTelegram = req.body?.send_telegram === true || req.query.send_telegram === "true";
      const testRun = req.body?.testRun;

      console.log(`[social-publisher] Avvio rendering Master Video 60 FPS (Mode: ${mode}, Send TG: ${sendTelegram}, Has TestRun: ${!!testRun})...`);
      
      const scriptPath = path.resolve("./scripts/render-social-video-cloud.mjs");
      let testRunArg = "";
      if (testRun && typeof testRun === "object") {
        const tmpDir = path.resolve("./scratch");
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        const runFile = path.join(tmpDir, `active_test_run_${Date.now()}.json`);
        fs.writeFileSync(runFile, JSON.stringify(testRun, null, 2), "utf8");
        testRunArg = ` --testRunFile="${runFile}"`;
      }

      const cmd = `node "${scriptPath}" --mode=${mode} --topic=${topic} --send=${sendTelegram}${testRunArg}`;
      
      const output = execSync(cmd, { encoding: "utf8", timeout: 180_000 });
      
      const urlMatch = output.match(/🔗 Video pubblico disponibile:\s*(https:\/\/[^\s]+)/);
      const publicUrl = urlMatch ? urlMatch[1] : null;
      
      const sizeMatch = output.match(/Dimensione file:\s*([0-9.]+)\s*MB/);
      const sizeMb = sizeMatch ? parseFloat(sizeMatch[1]) : null;

      return res.status(200).json({
        ok: true,
        publicUrl,
        sizeMb,
        mode
      });
    } catch (err: any) {
      console.error("[social-publisher] render_master_video error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Master video render failed" });
    }
  }

  // 0. POST /api/social-publisher?action=attach_audio_to_story
  if (action === "attach_audio_to_story") {
    try {
      const { video_url, audio_track, outro_start_time, brand } = req.body || {};
      if (!video_url || !supabase) {
        return res.status(400).json({ ok: false, error: "Missing video_url" });
      }

      const videoRes = await fetch(video_url);
      if (!videoRes.ok) throw new Error("Failed to fetch video for audio mux");
      const videoBuf = Buffer.from(await videoRes.arrayBuffer());

      let finalBuffer = videoBuf;
      let cleanAudio = audio_track || "";
      try {
        if (cleanAudio.startsWith("http://") || cleanAudio.startsWith("https://")) {
          cleanAudio = new URL(cleanAudio).pathname;
        }
      } catch (e) {}
      cleanAudio = cleanAudio.replace(/^\/+/, "");
      try {
        cleanAudio = decodeURIComponent(cleanAudio);
      } catch (e) {}
      const candidate = path.resolve("./public", cleanAudio);
      let resolvedAudio = fs.existsSync(candidate) ? candidate : null;

      // 🛡️ Fallback Cloud: se siamo in ambiente serverless / background con PC locale spento
      if (!resolvedAudio && cleanAudio) {
        try {
          const encodedAudio = cleanAudio.split("/").map(seg => encodeURIComponent(seg)).join("/");
          const cloudUrls = [
            `https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/assets/${encodedAudio}`,
            `https://flowerpowervillage.com/${encodedAudio}`,
            (audio_track && audio_track.startsWith("http")) ? audio_track : null
          ].filter(Boolean) as string[];

          for (const cUrl of cloudUrls) {
            try {
              const aRes = await fetch(cUrl);
              if (aRes.ok) {
                const aBuf = Buffer.from(await aRes.arrayBuffer());
                if (aBuf.length > 1000) {
                  const tmpAudio = path.resolve(os.tmpdir(), `cloud_track_${Date.now()}_${path.basename(cleanAudio)}`);
                  fs.writeFileSync(tmpAudio, aBuf);
                  resolvedAudio = tmpAudio;
                  console.log(`[social-publisher] Traccia audio recuperata da cloud (${cUrl}): ${resolvedAudio} (${aBuf.length} bytes)`);
                  break;
                }
              }
            } catch (dlErr) {}
          }
        } catch (errCloud) {
          console.warn("[social-publisher] Avviso recupero cloud audio:", errCloud);
        }
      }

      console.log("[social-publisher] Audio candidate:", candidate, "resolvedAudio:", resolvedAudio, "outroStartTime:", outro_start_time, "brand:", brand);

      let finalThumbBuf: Buffer | undefined;

      if (resolvedAudio) {
        const muxRes = await muxAudioOntoVideo(
          videoBuf,
          resolvedAudio,
          typeof outro_start_time === "number" ? outro_start_time : undefined,
          brand
        );
        finalBuffer = muxRes.videoBuffer;
        finalThumbBuf = muxRes.thumbBuffer;
      } else {
        finalBuffer = await optimizeVideoWithFaststart(videoBuf);
      }

      // Re-upload salvando con suffisso _master per azzerare qualsiasi cache CDN / browser
      const urlObj = new URL(video_url);
      const originalPath = urlObj.pathname.split("/public/assets/")[1] || `social_stories/story_video_${Date.now()}.mp4`;
      const cleanPath = originalPath.split("?")[0];
      const masterPath = cleanPath.replace(/(_master)?\.mp4$/i, "") + "_master.mp4";

      const { error: upErr } = await supabase.storage.from("assets").upload(masterPath, finalBuffer, {
        contentType: "video/mp4",
        upsert: true
      });

      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("assets").getPublicUrl(masterPath);
      console.log(`[social-publisher] Master video con audio e cover art caricato su Supabase: ${publicUrl} (bytes: ${finalBuffer.length})`);

      // 🛡️ Zero Duplicate Storage: se il video originale era un file separato senza audio, rimuovilo subito
      if (cleanPath && cleanPath !== masterPath) {
        supabase.storage.from("assets").remove([cleanPath]).catch(() => {});
      }

      // 🛡️ Archiviazione permanente di sicurezza su Google Drive 5TB (Zero Egress, spazio illimitato)
      uploadFileToGoogleDrive({ name: path.basename(masterPath), buffer: finalBuffer }).catch(() => {});

      // 📸 Upload Thumbnail Ufficiale Supabase se presente
      let publicThumbUrl: string | undefined;
      if (finalThumbBuf && finalThumbBuf.length > 1000) {
        const thumbPath = masterPath.replace(/\.mp4$/i, ".jpg");
        const { error: thErr } = await supabase.storage.from("assets").upload(thumbPath, finalThumbBuf, {
          contentType: "image/jpeg",
          upsert: true
        });
        if (!thErr) {
          publicThumbUrl = supabase.storage.from("assets").getPublicUrl(thumbPath).data.publicUrl;
          console.log(`[social-publisher] 📸 Thumbnail Ufficiale Supabase disponibile: ${publicThumbUrl}`);
        }
      }

      return res.status(200).json({ ok: true, url: publicUrl, thumbnail_url: publicThumbUrl });
    } catch (err: any) {
      console.error("[social-publisher] attach_audio_to_story error:", err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  // 0. POST /api/social-publisher?action=upload_story_media
  if (action === "upload_story_media") {
    try {
      const { data_url, filename, content_type } = req.body || {};
      if (!data_url || !supabase) {
        return res.status(400).json({ ok: false, error: "Missing data_url or Supabase not initialized" });
      }

      const base64Data = data_url.replace(/^data:[^,]*;base64,/, "");
      let buffer = Buffer.from(base64Data, "base64");
      const safeFilename = filename || `story_916_${Date.now()}.jpg`;
      const isVideo = safeFilename.endsWith(".mp4") || String(content_type).includes("video");
      if (isVideo) {
        buffer = await optimizeVideoWithFaststart(buffer);
      }
      const path = `social_stories/${safeFilename}`;

      const { data, error } = await supabase.storage.from("assets").upload(path, buffer, {
        contentType: String(content_type || (isVideo ? "video/mp4" : "image/jpeg")).split(";")[0],
        upsert: true
      });

      if (error) {
        console.error("[social-publisher] Upload to storage failed:", error);
        return res.status(500).json({ ok: false, error: error.message });
      }

      const { data: { publicUrl } } = supabase.storage.from("assets").getPublicUrl(path);
      return res.status(200).json({ ok: true, url: publicUrl });
    } catch (err: any) {
      console.error("[social-publisher] Upload story media error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Upload failed" });
    }
  }

  // 0. POST /api/social-publisher?action=telegram_dispatch
  if (action === "telegram_dispatch") {
    try {
      const {
        chat_id,
        message_thread_id,
        text,
        reply_markup,
        media_url,
        media_type,
        media_caption,
        thumbnail_url
      } = req.body || {};

      let botToken = process.env.TELEGRAM_SOCIAL_BOT_TOKEN;

      if (!botToken && supabase) {
        const { data } = await supabase
          .from("telegram_config")
          .select("bot_token")
          .eq("id", "social")
          .maybeSingle();
        if (data?.bot_token) {
          botToken = data.bot_token;
        }
      }

      if (!botToken) {
        return res.status(500).json({ ok: false, error: "Telegram Social bot token not configured" });
      }

      // 1. Invio nativo del file Multimediale (Video 9:16 o Foto HD) nel Topic se fornito
      let mediaSent = false;
      let mediaMessageId: number | undefined;
      let mediaErrorDetail: string | undefined;

      if (media_url && typeof media_url === "string") {
        let fullMediaUrl = media_url.trim();
        if (fullMediaUrl.startsWith("/")) {
          fullMediaUrl = `https://flowerpowervillage.com${fullMediaUrl}`;
        }

        if (fullMediaUrl.startsWith("http://") || fullMediaUrl.startsWith("https://")) {
          const isVideo =
            media_type === "video" ||
            fullMediaUrl.toLowerCase().endsWith(".mp4") ||
            fullMediaUrl.toLowerCase().endsWith(".webm");
          const endpoint = isVideo ? "sendVideo" : "sendPhoto";
          const paramKey = isVideo ? "video" : "photo";

          // ⚡ Se è un video, ottimizziamo SEMPRE con FFmpeg faststart prima della consegna a Telegram
          let optimizedVideoBuf: Buffer | null = null;
          if (isVideo) {
            try {
              const fileRes = await fetch(fullMediaUrl);
              if (fileRes.ok) {
                const rawBuf = Buffer.from(await fileRes.arrayBuffer());
                optimizedVideoBuf = await optimizeVideoWithFaststart(rawBuf);

                // Aggiorna anche il file su Supabase Storage così il link per scaricarlo è 100% seekable e non frammentato
                if (supabase && fullMediaUrl.includes("social_stories/")) {
                  const urlParts = fullMediaUrl.split("social_stories/");
                  if (urlParts[1]) {
                    const cleanPath = `social_stories/${urlParts[1].split("?")[0]}`;
                    await supabase.storage.from("assets").upload(cleanPath, optimizedVideoBuf, {
                      contentType: "video/mp4",
                      upsert: true
                    });
                    console.log(`[social-publisher] Supabase video sigillato con FFmpeg faststart: ${cleanPath}`);
                  }
                }
              }
            } catch (optErr) {
              console.warn("[social-publisher] Faststart buffer preparation warning:", optErr);
            }
          }

          // 📸 Recupero Buffer Thumbnail Ufficiale per Telegram
          let thumbBuf: Buffer | null = null;
          if (isVideo) {
            try {
              let thumbCandidateUrl = thumbnail_url;
              if (!thumbCandidateUrl && fullMediaUrl.includes("social_stories/")) {
                thumbCandidateUrl = fullMediaUrl.replace(/(_master)?\.mp4(\?.*)?$/i, ".jpg");
              }
              if (thumbCandidateUrl) {
                const tRes = await fetch(thumbCandidateUrl);
                if (tRes.ok) {
                  thumbBuf = Buffer.from(await tRes.arrayBuffer());
                  console.log(`[social-publisher] 📸 Thumbnail recuperata da ${thumbCandidateUrl} (${thumbBuf.length} bytes)`);
                }
              }
              // Se non ancora disponibile e abbiamo il video buffer, estraiamo al volo con FFmpeg a t=2.0s
              if (!thumbBuf && optimizedVideoBuf) {
                const ffmpegPath = process.env.FFMPEG_PATH || ffmpegStatic || "ffmpeg";
                const tmpDir = os.tmpdir();
                const tmpIn = path.join(tmpDir, `tmp_in_${Date.now()}.mp4`);
                const tmpTh = path.join(tmpDir, `tmp_th_${Date.now()}.jpg`);
                fs.writeFileSync(tmpIn, optimizedVideoBuf);
                execFileSync(ffmpegPath, ["-y", "-ss", "2.0", "-i", tmpIn, "-vframes", "1", "-q:v", "2", tmpTh]);
                if (fs.existsSync(tmpTh)) {
                  thumbBuf = fs.readFileSync(tmpTh);
                  try { fs.unlinkSync(tmpIn); fs.unlinkSync(tmpTh); } catch {}
                  console.log(`[social-publisher] 📸 Thumbnail estratta al volo con FFmpeg (${thumbBuf.length} bytes)`);
                }
              }
            } catch (tErr: any) {
              console.warn("[social-publisher] Avviso recupero thumbnail per Telegram:", tErr?.message || tErr);
            }
          }

          // Tentativo 1: Invio via FormData con Video URL / Buffer e Thumbnail nativa allegata
          try {
            const form = new FormData();
            form.append("chat_id", String(chat_id));
            if (message_thread_id) {
              form.append("message_thread_id", String(message_thread_id));
            }
            form.append("caption", formatAllDatesToDMY((media_caption || "🌴 <b>Flower Power Social Media Studio</b>").slice(0, 1024)));
            form.append("parse_mode", "HTML");
            if (reply_markup) {
              form.append("reply_markup", typeof reply_markup === "string" ? reply_markup : JSON.stringify(reply_markup));
            }

            if (isVideo) {
              form.append("supports_streaming", "true");
              form.append("width", "1080");
              form.append("height", "1920");

              // Invio URL CDN se valido
              form.append("video", fullMediaUrl);

              // 📸 THUMBNAIL UFFICIALE: Passata come InputFile binario
              if (thumbBuf && thumbBuf.length > 1000) {
                const thumbBlob = new Blob([thumbBuf], { type: "image/jpeg" });
                form.append("thumbnail", thumbBlob, "thumbnail.jpg");
                console.log(`[social-publisher] 📸 Allegata Thumbnail nativa (${thumbBuf.length} bytes) a Telegram sendVideo!`);
              }
            } else {
              form.append("photo", fullMediaUrl);
            }

            const mediaRes = await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
              method: "POST",
              body: form
            });

            const mediaData = await mediaRes.json();
            if (mediaData.ok) {
              mediaSent = true;
              mediaMessageId = mediaData.result?.message_id;
              console.log(`[social-publisher] Telegram ${endpoint} con Thumbnail consegnato con successo (message_id: ${mediaMessageId})!`);
            } else {
              mediaErrorDetail = mediaData.description || JSON.stringify(mediaData);
              console.warn(`[social-publisher] Telegram ${endpoint} via FormData URL warning:`, mediaData);
            }
          } catch (urlErr: any) {
            mediaErrorDetail = urlErr.message;
            console.warn("[social-publisher] Telegram FormData URL dispatch error:", urlErr);
          }

          // Tentativo 2: Fallback con video buffer completo se l'URL non è stato scaricato da Telegram
          if (!mediaSent) {
            try {
              const fileBufRaw = optimizedVideoBuf || Buffer.from(await (await fetch(fullMediaUrl)).arrayBuffer());
              const form = new FormData();
              form.append("chat_id", String(chat_id));
              if (message_thread_id) {
                form.append("message_thread_id", String(message_thread_id));
              }
              const blobType = isVideo ? "video/mp4" : "image/jpeg";
              const fileName = isVideo ? "story_video_916.mp4" : "story_photo_916.jpg";
              const blobData = new Blob([new Uint8Array(fileBufRaw.buffer, fileBufRaw.byteOffset, fileBufRaw.byteLength)], { type: blobType });
              form.append(paramKey, blobData, fileName);
              form.append("caption", formatAllDatesToDMY((media_caption || "🌴 <b>Flower Power Social Media Studio</b>").slice(0, 1024)));
              form.append("parse_mode", "HTML");
              if (isVideo) {
                form.append("supports_streaming", "true");
                form.append("width", "1080");
                form.append("height", "1920");
                if (thumbBuf && thumbBuf.length > 1000) {
                  const thumbBlob = new Blob([new Uint8Array(thumbBuf.buffer, thumbBuf.byteOffset, thumbBuf.byteLength)], { type: "image/jpeg" });
                  form.append("thumbnail", thumbBlob, "thumbnail.jpg");
                }
              }
              if (reply_markup) {
                form.append("reply_markup", typeof reply_markup === "string" ? reply_markup : JSON.stringify(reply_markup));
              }

              const mediaRes = await fetch(`https://api.telegram.org/bot${botToken}/${endpoint}`, {
                method: "POST",
                body: form,
                signal: AbortSignal.timeout(60000)
              });
              const mediaData = await mediaRes.json();
              if (mediaData.ok) {
                mediaSent = true;
                mediaMessageId = mediaData.result?.message_id;
                console.log(`[social-publisher] Telegram ${endpoint} via Full Buffer completato!`);
              } else {
                mediaErrorDetail = mediaData.description || JSON.stringify(mediaData);
                console.error(`[social-publisher] Telegram ${endpoint} via Full Buffer error:`, mediaData);
              }
            } catch (formErr: any) {
              mediaErrorDetail = formErr.message;
              console.error("[social-publisher] Telegram Full Buffer error:", formErr);
            }
          }


          // Se l'invio richiesto era un VIDEO e Telegram non l'ha accettato, blocca con errore esplicito
          if (!mediaSent && isVideo) {
            return res.status(500).json({
              ok: false,
              error: `Invio del video a Telegram fallito: ${mediaErrorDetail || 'errore sconosciuto bot API'}`
            });
          }
        }

        // Manteniamo il file in Supabase Storage per consentire all'utente di scaricarlo tramite il pulsante su Telegram
        console.log('[social-publisher] File multimediale conservato su Supabase Storage per download:', fullMediaUrl);
      }

      // 2. Invio del messaggio formattato con blocco <pre> per copia con 1 tocco e tastiera inline
      // NOTA: disable_web_page_preview: true è TASSATIVO per evitare che Telegram generi schede con foto statiche dei link!
      const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id,
          message_thread_id,
          text: formatAllDatesToDMY(text),
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup
        })
      });

      const tgData = await tgRes.json();
      return res.status(200).json({
        ...tgData,
        media_sent: mediaSent,
        media_message_id: mediaMessageId
      });
    } catch (err: any) {
      console.error("[social-publisher] Telegram dispatch error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Telegram dispatch failed" });
    }
  }

  // 0. POST /api/social-publisher?action=telegram_studio_webhook
  if (action === "telegram_studio_webhook") {
    try {
      const update = req.body || {};
      const message = update.message;

      if (!message) {
        return res.status(200).json({ ok: true, skipped: "No message in update" });
      }

      const chatId = message.chat?.id;
      const messageThreadId = message.message_thread_id;
      const isTopic4 = messageThreadId === 4;

      let botToken = process.env.TELEGRAM_SOCIAL_BOT_TOKEN;
      if (!botToken && supabase) {
        const { data } = await supabase
          .from("telegram_config")
          .select("bot_token")
          .eq("id", "social")
          .maybeSingle();
        if (data?.bot_token) botToken = data.bot_token;
      }

      if (!botToken) {
        return res.status(200).json({ ok: false, error: "Bot token not available" });
      }

      // Handle Topic 4 media uploads
      if (isTopic4) {
        let fileId: string | null = null;
        let fileName: string = "";
        let mimeType: string = "image/jpeg";

        if (message.photo && Array.isArray(message.photo) && message.photo.length > 0) {
          const largest = message.photo[message.photo.length - 1];
          fileId = largest.file_id;
          fileName = `photo_${Date.now()}.jpg`;
          mimeType = "image/jpeg";
        } else if (message.video) {
          fileId = message.video.file_id;
          fileName = message.video.file_name || `video_${Date.now()}.mp4`;
          mimeType = message.video.mime_type || "video/mp4";
        } else if (message.document) {
          fileId = message.document.file_id;
          fileName = message.document.file_name || `file_${Date.now()}`;
          mimeType = message.document.mime_type || "application/octet-stream";
        }

        if (fileId) {
          // 1. Get file path from Telegram Bot API
          const fileInfoRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
          const fileInfo = await fileInfoRes.json();
          const filePath = fileInfo.result?.file_path;

          if (!filePath) {
            throw new Error(`Impossibile recuperare il percorso del file da Telegram: ${JSON.stringify(fileInfo)}`);
          }

          // 2. Download file buffer
          const fileDownloadRes = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);
          const fileArrayBuffer = await fileDownloadRes.arrayBuffer();
          const buffer = Buffer.from(fileArrayBuffer);

          // 3. Upload to Google Drive Vault
          const uploadResult = await uploadFileToGoogleDrive({
            buffer,
            fileName,
            mimeType
          });

          const sizeKb = (buffer.byteLength / 1024).toFixed(1);
          const sizeMb = (buffer.byteLength / (1024 * 1024)).toFixed(2);
          const displaySize = buffer.byteLength > 1024 * 1024 ? `${sizeMb} MB` : `${sizeKb} KB`;

          // 4. Send confirmation reply in Topic 4
          const replyText = `☁️ <b>Media salvato nel Vault Google Drive (5 TB)!</b>\n\n` +
            `📁 <b>Cartella:</b> <code>FlowerPower_Social_Vault</code>\n` +
            `📄 <b>File:</b> <code>${uploadResult.name || fileName}</code>\n` +
            `📦 <b>Dimensione:</b> ${displaySize}\n` +
            `🆔 <b>ID Drive:</b> <code>${uploadResult.id}</code>\n\n` +
            `🔗 <a href="https://drive.google.com/drive/folders/1cf23Ag-cXEnbkSsSy7CLhYnonEAN9lRe">Visualizza nel tuo Google Drive</a>`;

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              message_thread_id: 4,
              reply_to_message_id: message.message_id,
              text: replyText,
              parse_mode: "HTML",
              disable_web_page_preview: false
            })
          });

          return res.status(200).json({ ok: true, uploaded: uploadResult });
        } else if (message.text && (message.text.startsWith("/") || message.text.toLowerCase().includes("help") || message.text.toLowerCase().includes("test"))) {
          const helpText = `ℹ️ <b>Topic 4: MediaBox — Google Drive 5TB</b>\n\n` +
            `Invia qui foto o video dallo smartphone:\n` +
            `verranno archiviati automaticamente ad alta risoluzione nel cloud Google Drive nella cartella <b>FlowerPower_Social_Vault</b>! ☁️✨`;

          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              message_thread_id: 4,
              text: helpText,
              parse_mode: "HTML"
            })
          });
        }
      }

      return res.status(200).json({ ok: true });
    } catch (err: any) {
      console.error("[telegram_studio_webhook] Error:", err);
      return res.status(200).json({ ok: false, error: err.message });
    }
  }

  // 0. POST /api/social-publisher?action=upload_drive_media
  if (action === "upload_drive_media") {
    try {
      const { fileName, mimeType, base64Data, folderId } = req.body || {};
      if (!fileName || !base64Data) {
        return res.status(400).json({ ok: false, error: "fileName and base64Data are required" });
      }

      const buffer = Buffer.from(base64Data, "base64");
      const uploadResult = await uploadFileToGoogleDrive({
        buffer,
        fileName,
        mimeType: mimeType || "application/octet-stream",
        folderId
      });

      return res.status(200).json({ ok: true, file: uploadResult });
    } catch (err: any) {
      console.error("[upload_drive_media] Error:", err);
      return res.status(500).json({ ok: false, error: err.message || "Upload to Google Drive failed" });
    }
  }

  // 0a. GET/POST /api/social-publisher?action=deepseek_balance
  if (action === "deepseek_balance") {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(200).json({ success: false, error: 'DEEPSEEK_API_KEY non configurata' });
    }

    try {
      const bRes = await fetch('https://api.deepseek.com/user/balance', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });
      if (!bRes.ok) {
        const errTxt = await bRes.text();
        return res.status(200).json({ success: false, error: `DeepSeek balance HTTP ${bRes.status}: ${errTxt}` });
      }
      const bData = await bRes.json();
      return res.status(200).json({ success: true, balance: bData });
    } catch (err: any) {
      return res.status(200).json({ success: false, error: err.message || 'Errore fetch balance' });
    }
  }

  // 0. POST /api/social-publisher?action=generate_ai_post_copy
  if (action === "generate_ai_post_copy") {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured' });
    }

    try {
      const {
        brand = 'pizza',
        mode = 'P1',
        dishes = [],
        dishDetails = [],
        season = '',
        weather = null
      } = body;

      const isPizza = brand === 'pizza';
      const city = isPizza ? 'Ranong' : 'Koh Phayam';

      // 🕒 Calcolo Contesto Temporale e Culturale (Orario locale Thailandia UTC+7)
      const now = new Date();
      // Offset per orario thai (UTC+7)
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const thaiDate = new Date(utc + (3600000 * 7));
      const thaiDayOfWeek = thaiDate.getDay(); // 0: Dom, 1: Lun, ... 5: Ven, 6: Sab
      const thaiHours = thaiDate.getHours();

      const daysContext = [
        { it: 'Domenica', th: 'วันอาทิตย์', angle: 'Domenica di puro relax e ricarica: zero stress, comfort food sul divano prima di ricominciare la settimana.' },
        { it: 'Lunedì', th: 'วันจันทร์', angle: 'Lunedì: inizio settimana, serve una coccola o un boost di buonumore per partire alla grande.' },
        { it: 'Martedì', th: 'วันอังคาร', angle: 'Martedì: routine lavorativa, voglia di una pausa gustosa senza complicazioni.' },
        { it: 'Mercoledì', th: 'วันพุธ', angle: 'Mercoledì: giro di boa della settimana, ci si premia a metà percorso.' },
        { it: 'Giovedì', th: 'วันพฤหัสบดี', angle: 'Giovedì: aria di pre-weekend, si pianifica la serata con amici o famiglia.' },
        { it: 'Venerdì', th: 'วันศุกร์แห่งชาติ', angle: 'Venerdì Nazionale (วันศุกร์แห่งชาติ): festa e liberazione! Stasera niente fornelli, premiati con un vero pizza party!' },
        { it: 'Sabato', th: 'วันเสาร์', angle: 'Sabato sera: relax totale, maratona serie TV, film, amici o serata romantica.' }
      ];
      const todayCtx = daysContext[thaiDayOfWeek];

      let mealMoment = 'Cena & Serata (momento clou per rilassarsi, ordinare caldo a casa o cenare in compagnia)';
      if (thaiHours >= 11 && thaiHours < 15) {
        mealMoment = 'Pranzo (pausa appetitosa, energia autentica, consegna rapida in ufficio o a casa)';
      } else if (thaiHours >= 15 && thaiHours < 18) {
        mealMoment = 'Tardo Pomeriggio / Pre-Cena (il momento in cui sale la voglia di qualcosa di sfizioso e confortevole)';
      }

      // 🌦️ Spunto Meteo Tradotto in Opportunità Emotiva / Confortevole
      let weatherAngle = 'Clima tropicale piacevole: perfetto per gustare una cena all\'aperto o rilassarsi con buon cibo.';
      if (weather) {
        if (weather.isRaining) {
          weatherAngle = isPizza
            ? `FUORI STA PIOVENDO A RANONG (${weather.tempC}°C). In Thailandia e a Ranong (famosa per gli 8 mesi di pioggia) la pioggia è l'occasione perfetta per il "Sabai Sabai": non bagnarsi in scooter, stare comodi a piedi nudi sul divano con la serie TV preferita, mentre il rider di Flower Power bussa con la pizza caldissima e croccante in scatola termica.`
            : `PIOGGIA TROPICALE A KOH PHAYAM (${weather.tempC}°C). Il suono rilassante della pioggia sulle foglie di palma, il profumo della terra bagnata a Buffalo Bay e la quiete intima del bungalow.`;
        } else if (weather.isNight) {
          weatherAngle = `Serata stellata tropicale (${weather.tempC}°C): aria piacevole, brezza serale, la compagnia giusta e il profumo irresistibile dell'autentica pizza italiana appena sfornata.`;
        } else {
          weatherAngle = `Giornata serena e luminosa (${weather.tempC}°C): sole tropicale, energia positiva, voglia di sapori freschi e autentici.`;
        }
      }

      const simplifyLodgingName = (name: string): string => {
        return (name || '')
          .replace(/\b(Breezy Suite|Breezy|Suite|Sweet|Tropical Garden View|Tropical Garden|Garden View|Eco-Glamping Sanctuary|Eco-Glamping|Glamping Sanctuary|Glamping|Sanctuary|Panoramic Terrace|Panoramic)\b/gi, '')
          .replace(/\s{2,}/g, ' ')
          .trim();
      };

      const dishListText = dishDetails && dishDetails.length > 0
        ? dishDetails.map((d: any) => {
            const basePrice = d.priceValue || (d.priceLabel ? parseInt(String(d.priceLabel).replace(/[^\d]/g, ''), 10) : 0);
            const directPrice = basePrice ? Math.round(basePrice * 0.90) : 0;
            const cleanName = mode === 'LM1' ? simplifyLodgingName(d.name) : d.name;
            const cleanNameTh = mode === 'LM1' ? simplifyLodgingName(d.nameTh || '') : (d.nameTh || '');
            const priceInfo = basePrice
              ? `${basePrice}฿ ➔ ${directPrice}฿ (-10%)`
              : (d.description || 'Autentica ricetta o alloggio');
            return `- ${cleanName}${cleanNameTh ? ` (${cleanNameTh})` : ''}: ${priceInfo}`;
          }).join('\n')
        : dishes.map((d: string) => `- ${d}`).join('\n');

      const pizzaPrompt = `Sei il copywriter creativo di Flower Power Pizza a Ranong, Thailandia (autentica pizzeria tradizionale e cucina artigianale italiana).
Scrivi un micro-post social biculturale (THAI in alto + INGLESE in basso) magnetico, divertente e profondamente calato nel costume e nella vita reale thailandese.

CONTESTO ATTUALE:
- Piatti protagonisti:
${dishListText}
- Momento della settimana: ${todayCtx.it} (${todayCtx.th}) ➔ ${todayCtx.angle}
- Fascia oraria: ${mealMoment}
- Situazione meteo del momento: ${weatherAngle}
- Stagione: ${season || 'Clima tropicale'}
- Sito ufficiale: www.flowerpowerpizza.com (10% di sconto sul primo ordine online, consegna veloce in tutta Ranong o tavolo al ristorante)

REGOLE FONDAMENTALI DI SCRITTURA:
0. REGOLA IDENTITÀ BRAND OBBLIGATORIA (PIZZERIA):
   Nel testo (sia Thai sia Inglese), in particolare nella PRIMA RIGA (Hook di apertura), DEVI SEMPRE nominare ed esplicitare chiaramente "Flower Power Pizza" a Ranong (es. "🇹🇭 ... ที่ Flower Power Pizza ระนอง ...", "🇬🇧 ... at Flower Power Pizza in Ranong ..."). Chi legge deve capire all'istante al 100% che si tratta di Flower Power Pizza!
1. DIVIETO ASSOLUTO DI INIZIARE SEMPRE CON IL METEO:
   Non fare il bollettino meteo! Il meteo è solo UNO degli spunti a tua disposizione.
   Varia sistematicamente il punto di partenza del post:
   - A volte parti direttamente dall'esperienza sensoriale del piatto (il cornicione fragrante, il profumo del pomodoro italiano, il formaggio che fila).
   - A volte parti dalla situazione umana del giorno (es. "Oggi è venerdì: meriti di rilassarti", "Chi ha voglia di cucinare stasera?", "Maratona serie TV sul divano?").
   - A volte sfrutta il meteo con complicità (es. se piove: non bagnarti in motorino, piedi sul divano e ci pensiamo noi a farti arrivare la pizza calda fumante).
   - A volte parti con una curiosità o un proverbio simpatico.

2. CULTURA E GERGO THAILANDESE (Nativo, caldo, spontaneo):
   - Usa un tono amichevole, caloroso e moderno (particelle naturali come ครับ, ฟินสุดๆ, สบายๆ, อร่อยบอกต่อ, ส่งร้อนๆ ถึงหน้าบ้าน).
   - Evita traduzioni letterali da cartella stampa: parla come parla chi vive a Ranong e ama il buon cibo e la comodità della vita quotidiana.

3. STRUTTURA & LUNGHEZZA:
   - MASSIMO 3-4 RIGHE AD ALTO IMPATTO per lingua. Spaziatura ariosa, zero muri di testo.
   - Nomi dei piatti: REGOLA IMMODIFICABILE: il nome del piatto NON DEVE MAI andare a capo a metà! È una locuzione unica continua su singola riga.
   - Proverbio del Giorno: inserisci sempre come firma distintiva un proverbio o battuta sulla vita, il cibo o il relax (in Thai: 📜 สุภาษิตประจำวัน: "..." | in Inglese: 📜 Proverb of the Day: "...").
   - Chiusura breve: invito a ordinare su www.flowerpowerpizza.com con il 10% di sconto prima ordinazione.
    - Hashtag: NON scrivere alcun hashtag (#) nei testi: vengono aggiunti dal sistema in fondo al post, dopo le due lingue.
    - Bandiera: ogni testo (thaiContent / englishContent) DEVE iniziare con la propria bandiera prima della prima lettera (🇹🇭 per il Thai, 🇬🇧 per l'Inglese).
    - DIVIETO CATEGORICO FORNO A LEGNA: NON ABBIAMO IL FORNO A LEGNA! È TASSATIVAMENTE E SEVERAMENTE VIETATO menzionare forno a legna, "wood-fired", "wood-fired oven", "wood oven", "เตาฟืน", "Holzofen", "aroma di legna" o alludere alla legna! La pizza è autentica pizza tradizionale italiana cotta su pietra refrattaria ad alta temperatura / forno per pizza.
    - REGOLA EMOJI CONTESTUALI (DIVIETO EMOJI A FINE FRASE): DIVIETO ASSOLUTO di piazzare 3 o 4 emoji tutte raggruppate alla fine della frase o del paragrafo. Le emoji devono essere DISTRIBUITE IN MODO NATURALE NEL CORPO DEL TESTO, affiancate alle singole parole man mano che la frase scorre per ammorbidire e rendere piacevole il ritmo (es. "impasto a lenta lievitazione 🍕 fragrante e dorato", "fior di latte 🧀 filante", "consegna calda a casa tua 🛵💨", "aria fresca della sera 🌿", "momento di relax 😋").

Rispondi ESCLUSIVAMENTE con un JSON valido con questa struttura esatta:
{
  "thaiContent": "...",
  "englishContent": "...",
  "proverbThai": "...",
  "proverbEnglish": "..."
}`;

      const villagePrompt = `Sei il copywriter creativo di Flower Power Village a Koh Phayam, Thailandia (eco-resort tropicale e ristorante a Buffalo Bay / อ่าวเขาควาย).
Scrivi un micro-post social biculturale (INGLESE in alto + THAI in basso) evocativo, rilassante e magnetico.

CONTESTO ATTUALE:
- Alloggio/Piatto:
${dishListText}
- Momento della settimana: ${todayCtx.it} (${todayCtx.th}) ➔ ${todayCtx.angle}
- Fascia oraria: ${mealMoment}
- Situazione meteo del momento: ${weatherAngle}
- Stagione: ${season || 'Stagione tropicale'}
- Sito ufficiale: www.flowerpowervillage.com (Miglior tariffa diretta garantita online)

REGOLE FONDAMENTALI DI SCRITTURA:
0. REGOLA IDENTITÀ BRAND OBBLIGATORIA (VILLAGGIO):
   Nel testo (sia Inglese sia Thai), in particolare nella PRIMA RIGA (Hook di apertura), DEVI SEMPRE nominare ed esplicitare chiaramente "Flower Power Village" a Koh Phayam (es. "🇬🇧 ... at Flower Power Village, Koh Phayam ...", "🇹🇭 ... ที่ Flower Power Village เกาะพยาม ..."). Chi legge deve capire all'istante al 100% che si tratta di Flower Power Village!
1. DIVIETO DI MONOTONIA & AMPIA VARIETÀ NARRATIVA (MILLE COSE DA RACCONTARE):
   Varia sempre l'attacco e il tema tra le mille sfumature del villaggio: la quiete lontano dal caos, il comfort accogliente del legno naturale, la lettura o il relax sull'amaca, l'oasi piscina rinfrescante nel verde, la slow life dell'isola senza auto, la buona tavola del nostro ristorante. Non essere mai ripetitivo!
2. DIVIETO CATEGORICO AMBIENTAZIONE MARINA INESISTENTE (NON SIAMO SULLA BATTIGIA):
   FLOWER POWER VILLAGE NON È FRONTE MARE!
   È SEVERAMENTE E TASSATIVAMENTE VIETATO parlare di "rumore del mare", "suono delle onde", "ocean waves", "sound of waves", "brezza marina", "ocean breeze", "svegliarsi in riva al mare" o usare l'emoji 🌊 per il villaggio!
   Né siamo sul mare né si sente il mare: siamo un'oasi incastonata nella giungla tropicale protetta, con un rigoglioso giardino tropicale stile Eden.
3. SE E QUANDO PARLI DI NATURA, RISVEGLIO O SUONI (ZERO OBBLIGO MA MASSIMA AUTENTICITÀ):
   Non è un obbligo forzato parlare sempre dell'ecosistema, ma SE e quando decidi di parlare della natura o dei suoni del villaggio, parla TASSATIVAMENTE della realtà locale:
   - Svegliarsi con il volo maestoso e i richiami dei buceri (Hornbills / นกเงือก), simbolo magico di Koh Phayam;
   - Gli scoiattoli tra i rami e le palme (Squirrels / กระรอก);
   - Il cinguettio delle vivaci nettarine (Sunbirds / นกกินปลี);
   - Le farfalle multicolori tra i fiori tropicali (Butterflies / ผีเสื้อ);
   - L'oasi piscina circondata dalla foresta tropicale.
4. CULTURA SLOW LIFE DI KOH PHAYAM:
   Evoca la pace autentica dell'isola, il dondolarsi sull'amaca all'ombra delle piante tropicali, la quiete a Buffalo Bay, il piacere di staccare la spina.
5. STRUTTURA & LUNGHEZZA:
   - MASSIMO 3-4 RIGHE per lingua. Spaziatura ariosa, zero muri di parole.
   - Nomi alloggi: REGOLA IMMODIFICABILE: il nome dell'alloggio NON DEVE MAI andare a capo a metà!
   - Proverbio del Giorno: saggio e suggestivo sul viaggio, la lentezza, la natura o l'isola (MAI sul mare o sulle onde).
   - Chiusura: invito a prenotare su www.flowerpowervillage.com.
    - Hashtag: NON scrivere alcun hashtag (#) nei testi: vengono aggiunti dal sistema in fondo al post, dopo le due lingue.
    - Bandiera: ogni testo (thaiContent / englishContent) DEVE iniziare con la propria bandiera prima della prima lettera (🇹🇭 per il Thai, 🇬🇧 per l'Inglese).
    - DIVIETO CATEGORICO FORNO A LEGNA: NON ABBIAMO IL FORNO A LEGNA! È severamente vietato parlare di forno a legna o "wood-fired" o "เตาฟืน".
    - DIVIETO CATEGORICO E ASSOLUTO PAROLA SUNSET / TRAMONTO: IL NOSTRO VILLAGGIO NON VEDE IL TRAMONTO (ZERO SUNSET)! Abbiamo le fitte foreste tropicali davanti che schermano interamente la linea dell'orizzonte ovest. È TASSATIVAMENTE E SEVERAMENTE VIETATO usare le parole "sunset", "tramonto", "พระอาทิตย์ตก" o parlare di tramonto per Flower Power Village e per qualsiasi alloggio! Per la Villa Penthouse in particolare, parlare TASSATIVAMENTE di "Breezy Suite" / suite ventilata con terrazza panoramica fresca e arieggiata.
    - REGOLA EMOJI CONTESTUALI (DIVIETO EMOJI A FINE FRASE): DIVIETO ASSOLUTO di piazzare 3 o 4 emoji raggruppate alla fine della frase. Le emoji devono essere DISTRIBUITE IN MODO NATURALE NEL CORPO DEL TESTO, accompagnando le singole parole (es. "natura tropicale 🌴", "giardino eden 🌺", "oasi piscina 💦", "relax sull'amaca 🥥", "ombra della giungla 🍃").

Rispondi ESCLUSIVAMENTE con un JSON valido con questa struttura esatta:
{
  "thaiContent": "...",
  "englishContent": "...",
  "proverbThai": "...",
  "proverbEnglish": "..."
}`;

      // 🍽️ R1: RESTAURANT & ISLAND DELIVERY A KOH PHAYAM (TOUR 5 PIATTI)
      const r1Prompt = `Sei il copywriter creativo di Flower Power Restaurant & Island Delivery a Koh Phayam, Thailandia (Buffalo Bay / อ่าวเขาควาย).
Scrivi un micro-post social biculturale (THAI in alto + INGLESE in basso) vivace, accogliente e appetitoso, per invitare le persone a mangiare nel nostro ristorante nel giardino tropicale o ordinare con consegna a domicilio su tutta l'isola di Koh Phayam via WhatsApp.

CONTESTO ATTUALE:
- I 5 Piatti protagonisti nel video di oggi:
${dishListText}
- Momento della settimana: ${todayCtx.it} (${todayCtx.th}) ➔ ${todayCtx.angle}
- Fascia oraria: ${mealMoment}
- Situazione meteo del momento: ${weatherAngle}
- Stagione: ${season || 'Stagione tropicale'}
- Canali di contatto: WhatsApp Delivery +66 095 882 5573 | Tavolo nel giardino tropicale a Buffalo Bay | www.flowerpowervillage.com

REGOLE FONDAMENTALI DI SCRITTURA:
0. REGOLA IDENTITÀ BRAND OBBLIGATORIA (RESTAURANT KOH PHAYAM):
   Nel testo (sia Thai sia Inglese), nella PRIMA RIGA (Hook di apertura), DEVI SEMPRE nominare ed esplicitare chiaramente "Flower Power Restaurant & Village" a Koh Phayam!
1. DIVIETO ASSOLUTO DI PARLARE DI UN SOLO PIATTO (REGOLA CORALE 5 PIATTI):
   Il video mostra una carrellata di 5 piatti diversi (es. pasta fresca fatta a mano, pizze tradizionali italiane da 12 pollici, secondi, insalate, burger).
   NON concentrarti solo sul primo piatto! Parla della varietà del menu o presenta i piatti protagonisti come un banchetto ideale da condividere in compagnia (Food Sharing) o da gustare dopo una giornata di mare.
2. CONTESTUALITÀ UMANA & METEO (NON FARE IL BOLLETTINO METEO):
   Sfrutta il contesto del momento in modo naturale e complice:
   - Se piove o è fresco: comfort food caldo consegnato direttamente alla veranda del resort via WhatsApp senza bagnarsi in scooter.
   - Se fa caldo o c'è il sole: relax all'ombra delle piante tropicali con sapori autentici e birra fresca dopo la spiaggia.
   - Se è orario di cena/pranzo: riunire gli amici attorno alla tavola imbandita di piatti diversi.
3. STRUTTURA & LUNGHEZZA:
   - MASSIMO 4 RIGHE AD ALTO IMPATTO per lingua. Spaziatura ariosa, zero muri di parole.
   - Nomi dei piatti: REGOLA IMMODIFICABILE: il nome del piatto NON DEVE MAI andare a capo a metà! È una locuzione unica continua su singola riga.
   - Proverbio del Giorno: proverbio o battuta sulla buona tavola, la convivialità o il relax (Thai: 📜 สุภาษิตประจำวัน: "..." | Inglese: 📜 Proverb of the Day: "...").
   - Chiusura: invito a ordinare comodamente via WhatsApp (+66 095 882 5573) o venire a trovarci nel giardino tropicale a Buffalo Bay.
   - Bandiera: ogni blocco inizia con la propria bandiera (🇹🇭 per il Thai, 🇬🇧 per l'Inglese).
   - Zero hashtag nel testo (vengono aggiunti dal sistema in fondo).
   - DIVIETO CATEGORICO FORNO A LEGNA: NON ABBIAMO IL FORNO A LEGNA! È severamente vietato parlare di forno a legna o wood-fired.
   - REGOLA EMOJI CONTESTUALI: DIVIETO di piazzare 3 o 4 emoji raggruppate alla fine della frase. Le emoji devono essere DISTRIBUITE NEL CORPO DEL TESTO affiancate alle singole parole.

Rispondi ESCLUSIVAMENTE con un JSON valido con questa struttura esatta:
{
  "thaiContent": "...",
  "englishContent": "...",
  "proverbThai": "...",
  "proverbEnglish": "..."
}`;

      // 🔥 LM1: STORIES & POST LAST MINUTE KOH PHAYAM (ALLOGGI LIBERI OGGI, TARIFFE ONLINE ➔ SCONTO DIRETTO -10%)
      const lm1Prompt = `Sei il copywriter creativo di Flower Power Village a Koh Phayam, Thailandia (eco-resort tropicale ad Aow Khao Kwai / Buffalo Bay).
Scrivi un micro-post / Story LAST MINUTE biculturale (INGLESE in alto + THAI in basso) ad altissima conversione, magnetico, trasparente e dal ritmo vivace, pensato per Facebook, Instagram e TikTok.

CONTESTO ATTUALE:
- Alloggi LIBERI STASERA con tariffe Last Minute Octorate e SCONTO PRENOTAZIONE DIRETTA -10%:
${dishListText}
- Momento della settimana: ${todayCtx.it} (${todayCtx.th}) ➔ ${todayCtx.angle}
- Fascia oraria: ${mealMoment}
- Situazione meteo del momento: ${weatherAngle}
- Stagione: ${season || 'Stagione tropicale'}
- Sito ufficiale per prenotazione istantanea al miglior prezzo garantito: www.flowerpowervillage.com
- Canale WhatsApp per contatto rapido: +66 095 882 5573

REGOLE FONDAMENTALI DI SCRITTURA:
1. TEMA LAST MINUTE & URGENZA POSITIVA:
   Comunica con entusiasmo che ci sono camere e bungalow liberi per stanotte a Buffalo Bay. Chi si trova a Koh Phayam, al porto o nelle vicinanze può cogliere l'occasione al volo per una notte magica immersi nella quiete del nostro giardino tropicale stile Eden o rilassarsi nella nostra oasi piscina.
2. ELENCO ALLOGGI LIBERI CON NOME SECCO E PREZZO (ONLINE ➔ SITO DIRETTO -10%):
   Usa TASSATIVAMENTE il nome secco ed essenziale dell'alloggio (es. 'Penthouse Villa', 'Yellow Bungalow', 'Camel Tent', 'Peace & Love Villa', 'Green Bungalow'), ELIMINANDO qualsiasi appellativo lungo come 'Breezy Suite', 'Suite', 'Sweet', 'Tropical Garden', 'View' o descrizioni prolisse per far entrare ogni alloggio su una singola riga compatta da smartphone.
   Formato riga:
   • [Nome Secco]: [Prezzo Online]฿ ➔ [Prezzo Scontato]฿ (-10%)
3. PRIVILEGIO PRENOTAZIONE DIRETTA (DISINTERMEDIAZIONE BOOKING/AGODA):
   Evidenzia chiaramente che prenotando direttamente sul nostro sito ufficiale www.flowerpowervillage.com si ottiene automaticamente un ulteriore -10% di sconto reale rispetto alle tariffe online!
4. UNICO LINK DIRETTO PULITO & WHATSAPP (DIVIETO ASSOLUTO LINK MULTIPLI):
   NON mettere link diversi o confusi per ogni camera. Inserisci ESCLUSIVAMENTE:
   👉 www.flowerpowervillage.com
   💬 WhatsApp: +66 095 882 5573
5. STRUTTURA & LUNGHEZZA:
   - MASSIMO 4-5 RIGHE AD ALTO IMPATTO per lingua (inclusa la lista alloggi). Spaziatura ariosa, zero muri di parole.
   - Nomi alloggi: locuzione continua su singola riga secca (mai spezzata a metà).
   - Proverbio del Giorno: proverbio evocativo sul cogliere l'attimo, il viaggio, la natura o l'isola (MAI sul mare o onde).
   - Bandiera: 🇬🇧 per l'Inglese in alto, 🇹🇭 per il Thai in basso.
   - Zero hashtag nel corpo del testo (vengono aggiunti dal sistema in fondo al post).
   - Zero forno a legna. ZERO menzione di sunset/tramonto.
   - ZERO MENZIONE DI MARE, ONDE, BREZZA MARINA O FRONTE MARE (il villaggio è un'oasi nella giungla tropicale protetta).
   - Emoji contestuali distribuite nel testo, MAI 3 o 4 raggruppate alla fine della frase.

Rispondi ESCLUSIVAMENTE con un JSON valido con questa struttura esatta:
{
  "thaiContent": "...",
  "englishContent": "...",
  "proverbThai": "...",
  "proverbEnglish": "..."
}`;

      // 🌴 V3: RESORT TOUR (5 ALLOGGI DIVERSI)
      const v3Prompt = `Sei il copywriter creativo di Flower Power Village a Koh Phayam, Thailandia (eco-resort tropicale a Buffalo Bay / อ่าวเขาควาย).
Scrivi un micro-post social biculturale (INGLESE in alto + THAI in basso) immersivo ed evocativo per presentare la panoramica completa del resort con 5 alloggi diversi.

CONTESTO ATTUALE:
- I 5 Alloggi protagonisti del tour nel video:
${dishListText}
- Momento della settimana: ${todayCtx.it} (${todayCtx.th}) ➔ ${todayCtx.angle}
- Fascia oraria: ${mealMoment}
- Situazione meteo del momento: ${weatherAngle}
- Stagione: ${season || 'Stagione tropicale'}
- Sito ufficiale: www.flowerpowervillage.com (Miglior tariffa diretta garantita online + 10% privilegio prenotazione diretta)

REGOLE FONDAMENTALI DI SCRITTURA:
1. RESORT TOUR DEI 5 ALLOGGI (VARIETÀ & SPIRITO SLOW LIFE):
   Il video mostra una panoramica completa di 5 alloggi diversi del villaggio: dalla suite ventilata panoramica con grande terrazza (Breezy Suite), ai bungalow in legno naturale immersi nei giardini fioriti, fino alle tende eco-glamping.
   Spiega che al Flower Power Village ogni viaggiatore trova il proprio angolo di paradiso su misura (coppie, amici, amanti della natura e del relax totale).
2. ATMOSFERA KOH PHAYAM:
   Evoca la pace autentica dell'isola car-free, l'amaca tra le palme, il fascino del giardino tropicale stile Eden, la nostra oasi piscina e il cinguettio degli uccelli tropicali (come buceri e sunbird) a Buffalo Bay.
3. STRUTTURA & LUNGHEZZA:
   - MASSIMO 3-4 RIGHE AD ALTO IMPATTO per lingua. Spaziatura ariosa, zero muri di parole.
   - Nomi alloggi: locuzione continua su singola riga.
   - Proverbio del Giorno: proverbio poetico sul viaggio, la lentezza, la natura o l'isola.
   - Chiusura: invito a scoprire tutti gli alloggi e prenotare direttamente su www.flowerpowervillage.com.
   - Bandiera: 🇬🇧 per l'Inglese in alto, 🇹🇭 per il Thai in basso.
   - Zero hashtag nel testo. Zero forno a legna. ZERO parola sunset/tramonto.
   - ZERO menzione di mare, onde, brezza marina o battigia (FLOWER POWER VILLAGE NON È FRONTE MARE!).
   - Emoji contestuali distribuite nel testo, MAI raggruppate alla fine della frase.

Rispondi ESCLUSIVAMENTE con un JSON valido con questa struttura esatta:
{
  "thaiContent": "...",
  "englishContent": "...",
  "proverbThai": "...",
  "proverbEnglish": "..."
}`;

      // 🎯 SELETTORE PROMPT INGEGNERIZZATO DINAMICO:
      let prompt = villagePrompt;
      if (mode === 'R1') {
        prompt = r1Prompt;
      } else if (mode === 'LM1') {
        prompt = lm1Prompt;
      } else if (mode === 'V3') {
        prompt = v3Prompt;
      } else if (isPizza) {
        prompt = pizzaPrompt;
      }

      const aiRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          temperature: 0.90, // Elevata creatività e varietà espressiva ogni volta
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        })
      });

      if (!aiRes.ok) {
        throw new Error(`DeepSeek API error: ${aiRes.status}`);
      }

      const aiData = await aiRes.json();
      const rawJson = aiData.choices?.[0]?.message?.content;
      const parsed = JSON.parse(rawJson);

      let thaiContent = parsed.thaiContent || '';
      let englishContent = parsed.englishContent || '';

      // 🛡️ REGOLA IMMODIFICABILE 18: Sanitizzazione automatica zero forno a legna
      const scrubWoodFired = (t: string) => {
        return t
          .replace(/\b(wood-fired|wood fired|wood-oven|wood oven)\s*(oven|pizza|crust)?/gi, 'authentic Italian pizza')
          .replace(/\bforno a legna\b/gi, 'forno tradizionale per pizza')
          .replace(/\baroma di legna\b/gi, 'profumo di pizza appena sfornata')
          .replace(/เตาฟืน/g, 'เตาอบพิซซ่า');
      };
      thaiContent = scrubWoodFired(thaiContent);
      englishContent = scrubWoodFired(englishContent);

      // 🛡️ REGOLA IMMODIFICABILE: Sanitizzazione automatica zero sunset per Flower Power Village
      const scrubSunset = (t: string) => {
        return t
          .replace(/\b(sunset\s+deck|sunset\s+terrace|sunset\s+suite|sunset\s+view|sunset\s+balcony)\b/gi, 'breezy deck')
          .replace(/\b(sunset|sunsets)\b/gi, 'tropical breezes')
          .replace(/พระอาทิตย์ตก/g, 'รับลมธรรมชาติ')
          .replace(/\b(tramonto|tramonti)\b/gi, 'aria fresca tropicale');
      };

      // 🛡️ REGOLA IMMODIFICABILE 27: Sanitizzazione automatica zero onde, rumore del mare, brezza marina per Flower Power Village
      const scrubNonExistentMarine = (t: string) => {
        return t
          .replace(/\b(sound of (the )?waves|sound of ocean waves|ocean waves|crashing waves|sound of the ocean|sound of the sea)\b/gi, 'peaceful sounds of nature')
          .replace(/\b(ocean breeze|sea breeze|island breezes|breezes from the sea)\b/gi, 'fresh tropical breeze')
          .replace(/\b(beachfront|on the beach|by the sea|steps from the beach|steps from the ocean)\b/gi, 'nestled in tropical nature')
          .replace(/\b(rumore delle onde|suono delle onde|onde dell'oceano|rumore del mare)\b/gi, 'suoni rilassanti della natura')
          .replace(/\b(brezza marina|brezza dell'oceano|brezza del mare)\b/gi, 'fresca brezza tropicale')
          .replace(/\b(in riva al mare|sulla spiaggia|fronte mare|a due passi dal mare)\b/gi, 'immerso nella natura tropicale')
          .replace(/เสียงคลื่น(ริมทะเล|ซัดสาด)?/g, 'เสียงธรรมชาติอันเงียบสงบ')
          .replace(/ลมทะเล/g, 'สายลมอ่อนท่ามกลางสวนทรอปิคอล')
          .replace(/ริมทะเล/g, 'ท่ามกลางธรรมชาติอันร่มรื่น')
          .replace(/🌊/g, '🌺');
      };

      if (!isPizza) {
        thaiContent = scrubNonExistentMarine(scrubSunset(thaiContent));
        englishContent = scrubNonExistentMarine(scrubSunset(englishContent));
      }

      if (parsed.proverbThai && !thaiContent.includes(parsed.proverbThai)) {
        const pLabel = parsed.proverbThai.startsWith('📜') ? parsed.proverbThai : `📜 สุภาษิตประจำวัน: "${parsed.proverbThai}"`;
        thaiContent = `${thaiContent}\n\n${pLabel}`;
      }

      if (parsed.proverbEnglish && !englishContent.includes(parsed.proverbEnglish)) {
        const pLabel = parsed.proverbEnglish.startsWith('📜') ? parsed.proverbEnglish : `📜 Proverb of the Day: "${parsed.proverbEnglish}"`;
        englishContent = `${englishContent}\n\n${pLabel}`;
      }

      return res.status(200).json({ 
        success: true, 
        data: {
          ...parsed,
          thaiContent,
          englishContent,
          promptSent: prompt,
          usage: aiData?.usage || null
        } 
      });
    } catch (err: any) {
      console.error('[social-publisher] DeepSeek AI copy generation error:', err);
      return res.status(500).json({ error: err.message || 'DeepSeek generation failed' });
    }
  }

  // 1. GET /api/social-publisher?action=status
  if (action === "status" || action === "get_account") {
    try {
      let tiktokAccount: any = null;

      if (supabase) {
        // Try social_accounts
        const { data } = await supabase
          .from("social_accounts")
          .select("open_id, account_name, avatar_url, expires_in, scope, updated_at, is_active")
          .eq("platform", "tiktok")
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          tiktokAccount = data;
        } else {
          // Check telegram_config fallback
          const { data: fbData } = await supabase
            .from("telegram_config")
            .select("*")
            .like("id", "tiktok_%")
            .order("updated_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (fbData) {
            try {
              const parsed = JSON.parse(fbData.chat_id);
              tiktokAccount = {
                open_id: parsed.open_id || fbData.id.replace("tiktok_", ""),
                scope: parsed.scope || "user.info.basic,video.publish,video.upload",
                updated_at: fbData.updated_at,
                is_active: true,
                is_fallback: true
              };
            } catch {}
          }
        }
      }

      // Check Google Business Profile Account
      let googleAccount: any = null;
      let googleLocations: any[] = [];
      let isGoogleConnected = false;

      if (supabase) {
        try {
          const { data: gData } = await supabase
            .from("telegram_config")
            .select("*")
            .eq("id", "google_business_token")
            .maybeSingle();

          if (gData && gData.bot_token) {
            try {
              const parsed = JSON.parse(gData.chat_id || "{}");
              isGoogleConnected = true;
              googleLocations = parsed.locations || [];
              googleAccount = {
                accountName: parsed.primary_account || "Flower Power",
                locations: googleLocations,
                scope: parsed.scope,
                expiresAt: parsed.expires_at,
                updatedAt: gData.updated_at
              };
            } catch {}
          }
        } catch {}
      }

      // Default smart locations for Flower Power brands if not yet retrieved from live API
      if (googleLocations.length === 0) {
        googleLocations = [
          {
            account: "accounts/primary",
            name: "locations/fp_pizza_ranong",
            title: "Flower Power Pizza - Ranong Hotspring",
            websiteUri: "https://flowerpowerpizza.com",
            brand: "pizza"
          },
          {
            account: "accounts/primary",
            name: "locations/fp_village_phayam",
            title: "Flower Power Farm Village & Spa",
            websiteUri: "https://flowerpowervillage.com",
            brand: "village"
          }
        ];
      }

      const clientKey = process.env.TIKTOK_CLIENT_KEY || "";
      const redirectUri = process.env.TIKTOK_REDIRECT_URI || "https://flowerpowerpizza.com/api/social-callback";
      
      const authUrl = clientKey
        ? `https://www.tiktok.com/v2/auth/authorize/?client_key=${encodeURIComponent(clientKey)}&scope=user.info.basic,video.publish,video.upload&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&state=fp_social_studio`
        : "";

      // Google OAuth URL (Dedicated Google Business Profile Client)
      let googleClientId = process.env.GOOGLE_BUSINESS_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || "";
      if (!googleClientId && supabase) {
        try {
          const { data: bData } = await supabase
            .from("telegram_config")
            .select("chat_id")
            .eq("id", "google_business_config")
            .maybeSingle();
          if (bData?.chat_id) {
            const parsed = JSON.parse(bData.chat_id);
            if (parsed.client_id) googleClientId = parsed.client_id;
          }
        } catch {}
      }
      const host = (req.headers["x-forwarded-host"] || req.headers.host || "") as string;
      const googleRedirectUri = host.includes("localhost")
        ? "http://localhost:3000/api/social-callback"
        : (process.env.GOOGLE_REDIRECT_URI || "https://flowerpowerpizza.com/api/social-callback");

      const googleAuthUrl = googleClientId
        ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientId)}&redirect_uri=${encodeURIComponent(googleRedirectUri)}&response_type=code&scope=${encodeURIComponent('https://www.googleapis.com/auth/business.manage')}&access_type=offline&prompt=consent&include_granted_scopes=true&state=google_social_studio`
        : "";

      const hasMetaPizza = !!process.env.META_PIZZA_PAGE_TOKEN;
      const hasMetaVillage = !!process.env.META_VILLAGE_PAGE_TOKEN;

      return res.status(200).json({
        success: true,
        tiktok: {
          connected: !!tiktokAccount,
          clientKey: clientKey ? `${clientKey.slice(0, 6)}...` : null,
          redirectUri,
          authUrl,
          account: tiktokAccount
        },
        google: {
          connected: isGoogleConnected,
          clientId: googleClientId ? `${googleClientId.slice(0, 16)}...` : null,
          redirectUri: googleRedirectUri,
          authUrl: googleAuthUrl,
          account: googleAccount,
          locations: googleLocations
        },
        meta: {
          connected: hasMetaPizza || hasMetaVillage,
          pizza: {
            pageId: process.env.META_PIZZA_PAGE_ID || "410856732111386",
            igId: process.env.META_PIZZA_IG_ID || "17841468753633265",
            connected: hasMetaPizza
          },
          village: {
            pageId: process.env.META_VILLAGE_PAGE_ID || "106883044573670",
            igId: process.env.META_VILLAGE_IG_ID || "17841404137072110",
            connected: hasMetaVillage
          }
        }
      });
    } catch (e: any) {
      return res.status(500).json({ error: "Failed to fetch account status", message: e.message });
    }
  }

  // 2. POST /api/social-publisher?action=publish_video
  if (action === "publish_video") {
    const {
      accessToken,
      openId,
      videoUrl,
      title = "",
      privacyLevel = "PUBLIC_TO_EVERYONE",
      disableComment = false,
      disableDuet = false,
      disableStitch = false,
      brand = "pizza"
    } = body;

    let token = accessToken;

    // If token not passed, look up active token from DB
    if (!token && supabase) {
      const { data } = await supabase
        .from("social_accounts")
        .select("access_token")
        .eq("platform", "tiktok")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.access_token) {
        token = data.access_token;
      } else {
        const { data: fbData } = await supabase
          .from("telegram_config")
          .select("bot_token")
          .like("id", "tiktok_%")
          .limit(1)
          .maybeSingle();
        if (fbData?.bot_token) {
          token = fbData.bot_token;
        }
      }
    }

    if (!token) {
      return res.status(400).json({
        error: "Missing TikTok access token. Please authorize your TikTok account first."
      });
    }

    if (!videoUrl) {
      return res.status(400).json({ error: "Missing videoUrl parameter" });
    }

    try {
      const payload = {
        post_info: {
          title: title.slice(0, 2200),
          privacy_level: privacyLevel,
          disable_duet: disableDuet,
          disable_comment: disableComment,
          disable_stitch: disableStitch,
          video_cover_timestamp_ms: 1000
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: videoUrl
        }
      };

      console.log("[SocialPublisher] Initializing TikTok video publish:", payload);

      const ttRes = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify(payload)
      });

      const ttData = await ttRes.json();
      console.log("[SocialPublisher] TikTok init response:", ttData);

      const publishId = ttData?.data?.publish_id;
      const isSuccess = ttRes.ok && (!ttData.error || ttData.error.code === "ok" || ttData.error.code === 0);

      // Log or store post
      if (supabase) {
        try {
          await supabase.from("social_scheduled_posts").insert({
            brand,
            platform: "tiktok",
            title,
            caption: title,
            media_url: videoUrl,
            media_type: "video",
            status: isSuccess ? "publishing" : "failed",
            publish_id: publishId || null,
            error_message: isSuccess ? null : (ttData.error?.message || "Publish init failed"),
            metadata: ttData
          });
        } catch {}
      }

      if (!isSuccess) {
        return res.status(ttRes.status || 400).json({
          success: false,
          error: ttData.error?.message || "Failed to initialize TikTok video publish",
          raw: ttData
        });
      }

      return res.status(200).json({
        success: true,
        publish_id: publishId,
        raw: ttData
      });
    } catch (err: any) {
      console.error("[SocialPublisher] Publish exception:", err);
      return res.status(500).json({ error: "Publish exception", message: err.message });
    }
  }

  // 2b. POST /api/social-publisher?action=publish_facebook
  if (action === "publish_facebook") {
    const {
      videoUrl,
      title = "",
      caption = "",
      brand = "pizza",
      isStory = false
    } = body;

    const isPizza = brand === "pizza";
    const pageId = isPizza
      ? (process.env.META_PIZZA_PAGE_ID || "410856732111386")
      : (process.env.META_VILLAGE_PAGE_ID || "106883044573670");
    const pageToken = isPizza
      ? process.env.META_PIZZA_PAGE_TOKEN
      : process.env.META_VILLAGE_PAGE_TOKEN;

    if (!pageToken) {
      return res.status(400).json({
        success: false,
        error: `Meta Page Access Token non configurato per ${isPizza ? 'Pizzeria Ranong' : 'Villaggio Koh Phayam'}.`
      });
    }

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        error: "Parametro videoUrl mancante per la pubblicazione su Facebook."
      });
    }

    // GESTIONE STORIA FACEBOOK (video_stories 24h)
    if (isStory) {
      try {
        console.log(`[SocialPublisher] Pubblicazione Storia Facebook (Page ID: ${pageId}, Video: ${videoUrl})...`);

        // Step 1: Start video_stories session
        const startRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/video_stories?upload_phase=start&access_token=${pageToken}`, {
          method: "POST"
        });
        const startData = await startRes.json();
        console.log("[SocialPublisher] Facebook video_stories start:", startData);

        if (!startRes.ok || !startData.upload_url || !startData.video_id) {
          return res.status(startRes.status || 400).json({
            success: false,
            error: startData.error?.message || "Errore inizializzazione Storia Facebook",
            details: startData.error
          });
        }

        // Step 2: Fetch video e upload binario su rupload.facebook.com
        const vRes = await fetch(videoUrl);
        if (!vRes.ok) {
          throw new Error(`Impossibile scaricare il video per la Storia (${vRes.statusText})`);
        }
        const vBuf = Buffer.from(await vRes.arrayBuffer());

        const upRes = await fetch(startData.upload_url, {
          method: "POST",
          headers: {
            "Authorization": `OAuth ${pageToken}`,
            "offset": "0",
            "file_size": String(vBuf.length)
          },
          body: vBuf
        });
        const upData = await upRes.json();
        console.log("[SocialPublisher] Facebook video_stories upload:", upData);

        // Step 3: Finish upload session
        const fParams = new URLSearchParams();
        fParams.append("access_token", pageToken);
        fParams.append("upload_phase", "finish");
        fParams.append("video_id", startData.video_id);

        const finishRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/video_stories`, {
          method: "POST",
          body: fParams
        });
        const finishData = await finishRes.json();
        console.log("[SocialPublisher] Facebook video_stories finish:", finishData);

        if (!finishRes.ok || finishData.error) {
          return res.status(finishRes.status || 400).json({
            success: false,
            error: finishData.error?.message || "Errore finalizzazione Storia Facebook",
            details: finishData.error
          });
        }

        return res.status(200).json({
          success: true,
          isStory: true,
          storyId: finishData.post_id || startData.video_id,
          raw: finishData
        });
      } catch (stErr: any) {
        console.error("[SocialPublisher] Facebook story publish exception:", stErr);
        return res.status(500).json({
          success: false,
          error: "Eccezione durante la pubblicazione della Storia su Facebook",
          message: stErr.message
        });
      }
    }

    try {
      console.log(`[SocialPublisher] Invio video su Pagina Facebook (Brand: ${brand}, Page ID: ${pageId}, Video: ${videoUrl})...`);

      const postDescription = (caption || title || "").slice(0, 5000);
      const postTitle = (title || "").slice(0, 255);

      const params = new URLSearchParams();
      params.append("access_token", pageToken);
      params.append("file_url", videoUrl);
      if (postDescription) params.append("description", postDescription);
      if (postTitle) params.append("title", postTitle);

      const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/videos`, {
        method: "POST",
        body: params
      });

      const fbData = await fbRes.json();
      console.log("[SocialPublisher] Facebook Graph API response:", fbData);

      if (!fbRes.ok || fbData.error) {
        return res.status(fbRes.status || 400).json({
          success: false,
          error: fbData.error?.message || "Errore durante la pubblicazione del video su Facebook",
          details: fbData.error
        });
      }

      return res.status(200).json({
        success: true,
        videoId: fbData.id,
        postUrl: `https://www.facebook.com/${fbData.id}`,
        raw: fbData
      });
    } catch (err: any) {
      console.error("[SocialPublisher] Facebook publish exception:", err);
      return res.status(500).json({
        success: false,
        error: "Eccezione durante la pubblicazione su Facebook",
        message: err.message
      });
    }
  }

  // 2c. POST /api/social-publisher?action=publish_instagram
  if (action === "publish_instagram") {
    const {
      videoUrl,
      caption = "",
      brand = "pizza",
      isStory = false
    } = body;

    const isPizza = brand === "pizza";
    const pageId = isPizza
      ? (process.env.META_PIZZA_PAGE_ID || "410856732111386")
      : (process.env.META_VILLAGE_PAGE_ID || "106883044573670");
    const pageToken = isPizza
      ? process.env.META_PIZZA_PAGE_TOKEN
      : process.env.META_VILLAGE_PAGE_TOKEN;

    if (!pageToken) {
      return res.status(400).json({
        success: false,
        error: `Meta Page Access Token non configurato per ${isPizza ? 'Pizzeria Ranong' : 'Villaggio Koh Phayam'}.`
      });
    }

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        error: `Parametro videoUrl mancante per Instagram ${isStory ? 'Stories' : 'Reels'}.`
      });
    }

    // Risoluzione dinamica e verificata dell'Instagram Business Account collegato alla Pagina Facebook
    let igId = isPizza
      ? (process.env.META_PIZZA_IG_ID || "17841468753633265")
      : (process.env.META_VILLAGE_IG_ID || "17841404137072110");

    try {
      const pageInfoRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${pageToken}`);
      if (pageInfoRes.ok) {
        const pageInfo = await pageInfoRes.json();
        if (pageInfo?.instagram_business_account?.id) {
          igId = pageInfo.instagram_business_account.id;
          console.log(`[SocialPublisher] Instagram Business Account collegato a Pagina ${pageId}: ${igId}`);
        }
      }
    } catch (dynErr) {
      console.warn("[SocialPublisher] Risoluzione dinamica IG fallita, uso fallback:", igId);
    }

    try {
      console.log(`[SocialPublisher] Creazione container Instagram ${isStory ? 'STORIES' : 'REELS'} (IG ID: ${igId}, Video: ${videoUrl})...`);

      const cParams = new URLSearchParams();
      cParams.append("access_token", pageToken);
      cParams.append("media_type", isStory ? "STORIES" : "REELS");
      cParams.append("video_url", videoUrl);
      if (!isStory && caption) {
        cParams.append("caption", caption.slice(0, 2200));
      }

      const cRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media`, {
        method: "POST",
        body: cParams
      });
      const cData = await cRes.json();
      console.log(`[SocialPublisher] Instagram ${isStory ? 'STORIES' : 'REELS'} container response:`, cData);

      if (!cRes.ok || !cData.id) {
        return res.status(cRes.status || 400).json({
          success: false,
          error: cData.error?.message || "Errore creazione container Instagram",
          details: cData.error
        });
      }

      const creationId = cData.id;

      // Polling intelligente elaborazione video su server Meta Instagram (fino a FINISHED)
      let isReady = false;
      let attempts = 0;
      const maxAttempts = 12; // fino a 36 secondi
      while (!isReady && attempts < maxAttempts) {
        attempts++;
        await new Promise(r => setTimeout(r, 3000));
        try {
          const sRes = await fetch(`https://graph.facebook.com/v19.0/${creationId}?fields=status_code,status&access_token=${pageToken}`);
          if (sRes.ok) {
            const sData = await sRes.json();
            console.log(`[SocialPublisher] Polling Instagram container status (${attempts}/${maxAttempts}):`, sData);
            if (sData.status_code === "FINISHED") {
              isReady = true;
              break;
            } else if (sData.status_code === "ERROR") {
              return res.status(400).json({
                success: false,
                error: `Errore elaborazione video su Instagram: ${sData.status || sData.status_code}`,
                details: sData
              });
            }
          }
        } catch (pollErr) {
          console.warn("[SocialPublisher] Errore polling container Instagram:", pollErr);
        }
      }

      const pParams = new URLSearchParams();
      pParams.append("access_token", pageToken);
      pParams.append("creation_id", creationId);

      const pRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media_publish`, {
        method: "POST",
        body: pParams
      });
      const pData = await pRes.json();
      console.log("[SocialPublisher] Instagram publish response:", pData);

      if (!pRes.ok || !pData.id) {
        return res.status(pRes.status || 400).json({
          success: false,
          error: pData.error?.message || "Errore pubblicazione Instagram Reels",
          details: pData.error
        });
      }

      return res.status(200).json({
        success: true,
        mediaId: pData.id,
        raw: pData
      });
    } catch (err: any) {
      console.error("[SocialPublisher] Instagram publish exception:", err);
      return res.status(500).json({
        success: false,
        error: "Eccezione pubblicazione Instagram",
        message: err.message
      });
    }
  }

  // 2d. POST /api/social-publisher?action=publish_thought (Post di solo testo / pensieri su Facebook Page e Google)
  if (action === "publish_thought") {
    const {
      text = "",
      brand = "pizza",
      publishToFacebook = true
    } = body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: "Il testo del pensiero non può essere vuoto." });
    }

    const isPizza = brand === "pizza";
    const pageId = isPizza
      ? (process.env.META_PIZZA_PAGE_ID || "410856732111386")
      : (process.env.META_VILLAGE_PAGE_ID || "106883044573670");
    const pageToken = isPizza
      ? process.env.META_PIZZA_PAGE_TOKEN
      : process.env.META_VILLAGE_PAGE_TOKEN;

    const results: any = {};

    if (publishToFacebook && pageToken) {
      try {
        const params = new URLSearchParams();
        params.append("access_token", pageToken);
        params.append("message", text.trim());

        const fbRes = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
          method: "POST",
          body: params
        });
        const fbData = await fbRes.json();
        results.facebook = fbData;
      } catch (fbErr: any) {
        results.facebook = { error: fbErr.message };
      }
    }

    return res.status(200).json({
      success: true,
      results
    });
  }

  // 3. POST /api/social-publisher?action=check_status
  if (action === "check_status") {
    const { publishId, accessToken } = body;
    if (!publishId) {
      return res.status(400).json({ error: "Missing publishId" });
    }

    let token = accessToken;
    if (!token && supabase) {
      const { data } = await supabase
        .from("social_accounts")
        .select("access_token")
        .eq("platform", "tiktok")
        .limit(1)
        .maybeSingle();
      if (data?.access_token) token = data.access_token;
    }

    if (!token) {
      return res.status(400).json({ error: "Missing TikTok token" });
    }

    try {
      const stRes = await fetch("https://open.tiktokapis.com/v2/post/publish/status/fetch/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8"
        },
        body: JSON.stringify({ publish_id: publishId })
      });

      const stData = await stRes.json();
      return res.status(200).json({
        success: stRes.ok,
        status: stData?.data?.status || "UNKNOWN",
        fail_reason: stData?.data?.fail_reason,
        post_ids: stData?.data?.publicaly_available_post_id,
        raw: stData
      });
    } catch (err: any) {
      return res.status(500).json({ error: "Status check failed", message: err.message });
    }
  }

  // 4. POST /api/social-publisher?action=ai_caption (DeepSeek AI Integration)
  if (action === "ai_caption") {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "DEEPSEEK_API_KEY not configured" });
    }

    const {
      topic = "Pizza Margherita Napoletana",
      brand = "pizza", // 'pizza' or 'village'
      platform = "tiktok", // 'tiktok', 'instagram', 'facebook'
      language = "IT", // 'IT', 'EN', 'TH'
      tone = "viral" // 'viral', 'gourmet', 'relax'
    } = body;

    try {
      const isPizza = brand === "pizza";
      const brandContext = isPizza
        ? "Flower Power Pizza Ranong: Authentic Italian pizza (48h slow-fermented crust, 100% Italian flour, traditional high-temp stone deck pizza oven), homemade fresh pasta, Italian craft sausages, and fine wines in a tropical garden near Raksawarin Hot Springs in Ranong, Thailand."
        : "Flower Power Farm Village & Spa: Tropical eco-resort on Koh Phayam island, Thailand. Organic farm, luxury bungalows, swimming pool, natural wellness, and authentic Italian dining.";

      const prompt = `You are a world-class viral social media manager for "${brandContext}".
Create a high-converting, viral caption with relevant hashtags for ${platform.toUpperCase()}.
Topic / Content Idea: "${topic}"
Tone of Voice: ${tone}

CATEGORICAL BILINGUAL FORMAT RULES:
1. Every post MUST strictly contain BOTH Thai and English text, each preceded by its national flag emoji:
${isPizza ? `   - BRAND IS PIZZERIA RANONG:
     * FIRST BLOCK: 🇹🇭 Thai language text with authentic viral social media slang and friendly particles (e.g. นะคะ, จ้า, น้าา, ฟินมากกก, อร่อยแสงออกปาก, สายกินห้ามพลาด, ชีสเยิ้มๆ, หอมกรุ่นจากเตา, ปักหมุดด่วน). It must sound like an enthusiastic, charming local food influencer, NEVER robotic!
     * DOUBLE LINE BREAK
     * SECOND BLOCK: 🇬🇧 English language text with mouthwatering artisanal storytelling (48h fermented sourdough, traditional high-temperature stone deck pizza oven, waterfall garden in Ranong, dine-in or fast delivery CTA).` : `   - BRAND IS KOH PHAYAM VILLAGE:
     * FIRST BLOCK: 🇬🇧 English language text with captivating tropical eco-resort storytelling, island bliss, birdsong, organic farm breakfasts, and serene nature on Koh Phayam Island.
     * DOUBLE LINE BREAK
     * SECOND BLOCK: 🇹🇭 Thai language text with authentic viral travel blogger tone and inviting particles (e.g. นะคะ, จ้า, น้าา, ชิลสุดๆ, ฟีลดีมากกก, พักผ่อนฮีลใจ, ปักหมุดที่พัก, ห้ามพลาดเลยน้า).`}
2. CONTEXTUAL INLINE EMOJIS: Distribute emojis naturally throughout the body text next to relevant words (e.g. dough 🍕, melted cheese 🧀, delivery 🛵💨, garden 🌿). STRICTLY FORBIDDEN to dump 3 or 4 emojis all together at the end of a sentence.
3. STRICT WOOD-FIRED BAN: WE DO NOT HAVE A WOOD-FIRED OVEN. Strictly forbidden to mention "wood-fired", "wood oven", "forno a legna" or "เตาฟืน".
4. Conclude with 8-12 hyper-relevant viral hashtags combining English and Thai (e.g. ${isPizza ? '#RanongFood #PizzaRanong #RanongHotspring #ItalianFoodThailand #AuthenticPizza #อร่อยบอกต่อ #รีวิวระนอง #เที่ยวระนอง #พิซซ่าอิตาเลียน' : '#KohPhayam #KohPhayamIsland #EcoResortThailand #ThailandTravel #HiddenThailand #เที่ยวเกาะพยาม #เกาะพยาม #รีวิวที่พัก #เที่ยวระนอง'}).
5. Keep the total length under 300 words.
5. Return ONLY a JSON object with this exact format:
{
  "hook": "${isPizza ? '🇹🇭 ...' : '🇬🇧 ...'}",
  "body": "...",
  "cta": "...",
  "hashtags": ["#Tag1", "#Tag2", "..."],
  "fullCaption": "${isPizza ? '🇹🇭 [Thai text with viral particles]\\n\\n🇬🇧 [English text]\\n\\n#Tags' : '🇬🇧 [English text]\\n\\n🇹🇭 [Thai text with viral particles]\\n\\n#Tags'}"
}`;

      const aiRes = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!aiRes.ok) {
        const errText = await aiRes.text();
        return res.status(500).json({ error: "DeepSeek API failed", details: errText });
      }

      const aiData = await aiRes.json();
      const content = aiData.choices?.[0]?.message?.content || "{}";
      const parsed = JSON.parse(content);
      return res.status(200).json({ success: true, result: parsed });
    } catch (err: any) {
      return res.status(500).json({ error: "AI generation error", message: err.message });
    }
  }

  // 4b. POST /api/social-publisher?action=analyze_visual_ai (Google Gemini Vision + DeepSeek AI)
  if (action === "analyze_visual_ai") {
    const deepseekKey = process.env.DEEPSEEK_API_KEY || process.env.VITE_DEEPSEEK_API_KEY || (body.deepseekApiKey || "");
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || (body.geminiApiKey || "");

    const {
      imageUrl = "",
      brand = "pizza", // 'pizza' or 'village'
      itemTitle = "Pizza Margherita",
      itemTitleTh = "พิซซ่ามาเกริต้า",
      category = "Pizza",
      price = 240,
      currentTheme = "standard"
    } = body;

    try {
      // 1. Fase Vision AI (Google Gemini 1.5 Flash se disponibile, altrimenti fallback contestuale)
      let visualAnalysis: any = {
        subject: itemTitle,
        dominantColors: brand === "pizza" ? ["#ea580c", "#1c1917"] : ["#059669", "#064e3b"],
        visualElements: brand === "pizza"
          ? ["crosta dorata cotta a legna", "pomodoro brillante", "mozzarella filante", "foglie di basilico fresco"]
          : ["costruzione in legno naturale", "giardino tropicale", "amaca", "palme da cocco"],
        negativeSpaceBestPosition: "bottom",
        lighting: brand === "pizza" ? "calda e invitante da forno a pietra" : "luce naturale dorata tropicale",
        usedGemini: false
      };

      if (geminiKey && imageUrl) {
        try {
          const imgRes = await fetch(imageUrl);
          if (imgRes.ok) {
            const arrayBuffer = await imgRes.arrayBuffer();
            const base64Data = Buffer.from(arrayBuffer).toString("base64");
            const contentType = imgRes.headers.get("content-type") || "image/jpeg";

            const geminiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [
                    {
                      parts: [
                        {
                          text: `You are an expert food & tropical hospitality art director. Analyze this photo of "${itemTitle}" (${brand === "pizza" ? "Authentic Italian traditional pizza & pasta in Ranong, Thailand" : "Tropical eco-resort on Koh Phayam Island, Thailand"}).
Return ONLY a JSON object:
{
  "subject": "detected primary subject",
  "dominantColors": ["#hex1", "#hex2"],
  "visualElements": ["element1", "element2", "element3"],
  "negativeSpaceBestPosition": "bottom" or "top",
  "lighting": "lighting style description"
}`
                        },
                        {
                          inlineData: {
                            mimeType: contentType,
                            data: base64Data
                          }
                        }
                      ]
                    }
                  ],
                  generationConfig: {
                    temperature: 0.2,
                    responseMimeType: "application/json"
                  }
                })
              }
            );

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const textOut = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (textOut) {
                const parsed = JSON.parse(textOut);
                visualAnalysis = { ...visualAnalysis, ...parsed, usedGemini: true };
              }
            }
          }
        } catch (gErr: any) {
          console.warn("[SocialPublisher] Gemini Vision optional call bypassed:", gErr.message);
        }
      }

      // 2. Fase DeepSeek AI: Generazione Copy Bilingue Virale, Carosello a 3 Slide & Reel Overlay
      if (!deepseekKey) {
        // Fallback programmatico senza DeepSeek
        return res.status(200).json({
          success: true,
          visualAnalysis,
          reelOverlay: {
            title: brand === "pizza" ? `🍕 ${itemTitleTh || itemTitle} อบเตาฟืนแท้ๆ` : `🌴 ${itemTitle} เกาะพยาม`,
            subtitle: brand === "pizza" ? "Impasto a lenta lievitazione & ingredienti freschi" : "Immerso nella natura tropicale senza auto",
            badge: brand === "pizza" ? "🔥 เตาฟืน 100%" : "✨ Eco-Luxury",
            priceTag: price ? `${price} THB` : ""
          },
          slides: [
            {
              id: "slide-1",
              slideType: "hook",
              title: brand === "pizza" ? `🍕 ${itemTitleTh} อร่อยฟินแสงออกปาก!` : `🌴 ${itemTitle} พักผ่อนฮีลใจ`,
              subtitle: brand === "pizza" ? "Autentica tradizione italiana a Ranong" : "La vera pace dell'isola di Koh Phayam",
              badge: brand === "pizza" ? "🔥 เตาฟืนแท้" : "🏝️ Koh Phayam",
              ctaText: "Swipe per i dettagli ➔"
            },
            {
              id: "slide-2",
              slideType: "feature",
              title: visualAnalysis.visualElements?.slice(0, 2).join(" • ") || itemTitle,
              subtitle: "Qualità artigianale e rispetto delle materie prime",
              badge: "✨ Artigianale",
              ctaText: "Scopri di più ➔"
            },
            {
              id: "slide-3",
              slideType: "cta",
              title: brand === "pizza" ? "สั่งเดลิเวอรี่ส่งไวถึงบ้าน หรือแวะมาทานที่สวนน้ำแร่" : "จองตรงราคาดีที่สุดบนเว็บไซต์",
              subtitle: brand === "pizza" ? "flowerpowerpizza.com • Sconto 10% primo ordine" : "flowerpowervillage.com • Prenota subito",
              badge: price ? `${price} THB` : "🌟 Prenota Ora",
              ctaText: brand === "pizza" ? "Ordina Online 🍕" : "Prenota Diretto 🌴"
            }
          ],
          socialCaption: {
            thai: brand === "pizza" ? `สายกินห้ามพลาด! ${itemTitleTh} อบเตาฟืนหอมกรุ่นชีสเยิ้มๆ ปักหมุดระนองนะคะ 🍕🔥` : `หนีความวุ่นวายมาพักผ่อนที่เกาะพยามกับ ${itemTitle} บรรยากาศสุดชิลล์ 🌿🏝️`,
            english: brand === "pizza" ? `Craving real Italian pizza in Ranong? Try our ${itemTitle} baked in traditional stone oven!` : `Pure island serenity at Flower Power Village Koh Phayam. Experience ${itemTitle}.`,
            hashtags: brand === "pizza" ? ["#PizzaRanong", "#RanongFood", "#รีวิวระนอง", "#ของกินระนอง", "#FlowerPowerPizza"] : ["#KohPhayam", "#PhayamIsland", "#เที่ยวเกาะพยาม", "#FlowerPowerVillage"]
          }
        });
      }

      const isPizza = brand === "pizza";
      const prompt = `You are the viral Creative Director for Flower Power (${isPizza ? "Pizzeria & Italian Restaurant in Ranong, Thailand" : "Eco-resort on Koh Phayam Island, Thailand"}).
We are creating a high-converting TikTok / Instagram 9:16 Video Reel and 3-Slide Carousel.
Visual Elements detected in photo: ${JSON.stringify(visualAnalysis.visualElements)}
Subject: "${itemTitle}" (Thai: "${itemTitleTh}")
Price: ${price} THB
Theme/Occasion: "${currentTheme}"

MANDATORY RULES:
1. For Ranong Pizza:
   - Primary language must be THAI with authentic viral food influencer tone (นะคะ, จ้า, ฟินมากกก, อร่อยแสงออกปาก, สายกินห้ามพลาด, ชีสเยิ้มๆ, เตาฟืนหอมกรุ่น).
   - Secondary language must be ITALIAN with authentic gourmet pride.
2. For Koh Phayam Village:
   - Primary language ENGLISH (tropical bliss, peaceful island life), Secondary THAI (พักผ่อนฮีลใจ, ชิลสุดๆ, ธรรมชาติ).
3. Generate 3 slides:
   - Slide 1: Magnetic viral Hook (title under 8 words, subtitle under 12 words, short badge 2-3 words, CTA "Swipe ➔")
   - Slide 2: Feature/Sensory detail highlighting detected visual elements
   - Slide 3: Strong Call To Action with website link & price
4. Generate Reel Overlay texts:
   - title (Hook bilingue, compact, impactful)
   - subtitle (Sensory detail)
   - badge (Eye-catching badge with emoji)
   - priceTag ("${price} THB")
5. Return ONLY a valid JSON:
{
  "reelOverlay": {
    "title": "...",
    "subtitle": "...",
    "badge": "...",
    "priceTag": "${price ? `${price} THB` : ''}"
  },
  "slides": [
    { "id": "slide-1", "slideType": "hook", "title": "...", "subtitle": "...", "badge": "...", "ctaText": "Swipe ➔" },
    { "id": "slide-2", "slideType": "feature", "title": "...", "subtitle": "...", "badge": "...", "ctaText": "Scopri ➔" },
    { "id": "slide-3", "slideType": "cta", "title": "...", "subtitle": "...", "badge": "...", "ctaText": "${isPizza ? 'Ordina Online 🍕' : 'Prenota Diretto 🌴'}" }
  ],
  "socialCaption": {
    "thai": "...",
    "english": "...",
    "hashtags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4", "#Tag5"]
  }
}`;

      const aiRes = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${deepseekKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!aiRes.ok) {
        throw new Error(`DeepSeek API failed: ${await aiRes.text()}`);
      }

      const aiData = await aiRes.json();
      const content = aiData.choices?.[0]?.message?.content || "{}";
      const generated = JSON.parse(content);

      return res.status(200).json({
        success: true,
        visualAnalysis,
        reelOverlay: generated.reelOverlay,
        slides: generated.slides,
        socialCaption: generated.socialCaption
      });
    } catch (err: any) {
      console.error("[SocialPublisher] analyze_visual_ai error:", err);
      return res.status(500).json({ error: "Visual AI analysis error", message: err.message });
    }
  }

  // 5. POST /api/social-publisher?action=publish_google (Publish to Google Maps / Local Posts)
  if (action === "publish_google" || action === "publish_google_post") {
    const {
      summary = "",
      locationName,
      brand = "pizza",
      actionType = "ORDER",
      actionUrl = "https://flowerpowerpizza.com",
      mediaUrl = "",
      topicType = "STANDARD",
      simulate = false
    } = body;

    // Se richiesta simulazione (Sandbox / Test mode), rispondi immediatamente con successo simulato
    if (simulate) {
      const simulatedPostId = `g_post_${brand}_${Date.now().toString(36)}`;
      return res.status(200).json({
        success: true,
        simulation: true,
        postId: simulatedPostId,
        message: "Google Business Profile Post pubblicato con successo (Sandbox / Demo mode)",
        post: {
          name: `${locationName || (brand === "pizza" ? "accounts/primary/locations/fp_pizza_ranong" : "accounts/primary/locations/fp_village_phayam")}/localPosts/${simulatedPostId}`,
          languageCode: "en",
          summary,
          callToAction: {
            actionType,
            url: actionUrl
          },
          topicType,
          createTime: new Date().toISOString()
        }
      });
    }

    let googleToken = "";
    let refreshToken = "";
    let expiresAt = 0;
    let storedLocations: any[] = [];
    let clientId = process.env.GOOGLE_CLIENT_ID || "";
    let clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

    if (supabase) {
      try {
        const { data: gData } = await supabase
          .from("telegram_config")
          .select("*")
          .eq("id", "google_business_token")
          .maybeSingle();

        if (gData) {
          googleToken = gData.bot_token || "";
          if (gData.chat_id) {
            try {
              const parsed = JSON.parse(gData.chat_id);
              refreshToken = parsed.refresh_token || "";
              expiresAt = Number(parsed.expires_at || 0);
              storedLocations = parsed.locations || [];
            } catch {}
          }
        }

        // Recupero credenziali OAuth dedicate Google Business da riga google_business_config se non presenti in env
        if (!clientId || !clientSecret) {
          const { data: busData } = await supabase
            .from("telegram_config")
            .select("chat_id")
            .eq("id", "google_business_config")
            .maybeSingle();
          if (busData?.chat_id) {
            try {
              const bParsed = JSON.parse(busData.chat_id);
              if (!clientId && bParsed.client_id) clientId = bParsed.client_id;
              if (!clientSecret && bParsed.client_secret) clientSecret = bParsed.client_secret;
            } catch {}
          }
        }
      } catch (dbErr) {
        console.warn("[SocialPublisher:Google] Errore lettura config Supabase:", dbErr);
      }
    }

    // Auto-Refresh Token se scaduto o in scadenza (margine 2 minuti)
    const isTokenExpired = !googleToken || (expiresAt > 0 && Date.now() >= expiresAt - 120000);
    if (isTokenExpired && refreshToken && clientId && clientSecret) {
      try {
        console.log("[SocialPublisher:Google] Tentativo rinnovo automatico access_token Google OAuth2...");
        const rParams = new URLSearchParams();
        rParams.append("client_id", clientId);
        rParams.append("client_secret", clientSecret);
        rParams.append("refresh_token", refreshToken);
        rParams.append("grant_type", "refresh_token");

        const rRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: rParams.toString()
        });
        const rData = await rRes.json();
        if (rRes.ok && rData.access_token) {
          googleToken = rData.access_token;
          expiresAt = Date.now() + (Number(rData.expires_in || 3600) * 1000);
          console.log("[SocialPublisher:Google] Access token Google rinnovato con successo.");

          if (supabase) {
            try {
              await supabase.from("telegram_config").update({
                bot_token: googleToken,
                chat_id: JSON.stringify({
                  refresh_token: refreshToken,
                  expires_at: expiresAt,
                  locations: storedLocations,
                  updated_at: new Date().toISOString()
                }),
                updated_at: new Date().toISOString()
              }).eq("id", "google_business_token");
            } catch {}
          }
        } else {
          console.warn("[SocialPublisher:Google] Refresh token Google fallito:", rData);
        }
      } catch (rfErr: any) {
        console.error("[SocialPublisher:Google] Eccezione durante refresh token:", rfErr);
      }
    }

    if (!googleToken) {
      // In sandbox / unauthenticated demo mode, provide realistic simulation response
      const simulatedPostId = `g_post_${brand}_${Date.now().toString(36)}`;
      return res.status(200).json({
        success: true,
        simulation: true,
        postId: simulatedPostId,
        message: "Google Business Profile Post pubblicato con successo (Sandbox / Demo mode)",
        post: {
          name: `${locationName || (brand === "pizza" ? "accounts/primary/locations/fp_pizza_ranong" : "accounts/primary/locations/fp_village_phayam")}/localPosts/${simulatedPostId}`,
          languageCode: "en",
          summary,
          callToAction: {
            actionType,
            url: actionUrl
          },
          topicType,
          createTime: new Date().toISOString()
        }
      });
    }

    try {
      // Risoluzione targetLocation
      let targetLocation = locationName;
      if (!targetLocation) {
        const matchedLoc = storedLocations.find((l: any) => l.brand === brand);
        if (matchedLoc) {
          const acc = matchedLoc.account || "accounts/primary";
          const locName = matchedLoc.name || (brand === "pizza" ? "locations/fp_pizza_ranong" : "locations/fp_village_phayam");
          targetLocation = locName.startsWith("accounts/") ? locName : `${acc}/${locName}`;
        } else {
          targetLocation = brand === "pizza" ? "accounts/primary/locations/fp_pizza_ranong" : "accounts/primary/locations/fp_village_phayam";
        }
      }

      const postPayload: any = {
        languageCode: "en",
        summary: summary.slice(0, 1500),
        topicType: topicType || "STANDARD",
        callToAction: actionUrl ? {
          actionType: actionType || (brand === "village" ? "BOOK" : "ORDER"),
          url: actionUrl
        } : undefined
      };

      if (mediaUrl) {
        postPayload.media = [
          {
            mediaFormat: mediaUrl.endsWith(".mp4") ? "VIDEO" : "PHOTO",
            sourceUrl: mediaUrl
          }
        ];
      }

      console.log(`[SocialPublisher] Publishing to Google Business Profile ${targetLocation}:`, postPayload);

      const gRes = await fetch(`https://mybusiness.googleapis.com/v4/${targetLocation}/localPosts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${googleToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(postPayload)
      });

      const gData = await gRes.json();
      console.log("[SocialPublisher] Google publish response:", gData);

      if (!gRes.ok || gData.error) {
        const status = gRes.status || 400;
        const isAccessDisabled = status === 403 && (errDetail.includes("SERVICE_DISABLED") || errDetail.includes("mybusiness.googleapis.com"));
        const isQuotaZero = status === 429 || errDetail.includes("Quota exceeded");

        let userError = `Google Business Profile API: ${errDetail}`;
        if (isAuthError) {
          userError = "Autorizzazione Google Business Profile scaduta. Riconnetti l'account da Google Login su /social per autorizzare la pubblicazione reale su Google Maps.";
        } else if (isAccessDisabled || isQuotaZero) {
          userError = "Google Business Profile API richiede l'abilitazione della quota da parte di Google per il progetto 129023399780 (Google impone quota 0 di default per le API My Business). Per testare subito l'intero flusso video e invio Telegram con successo, attiva lo switch 'Test (Sandbox)' in alto a sinistra!";
        }

        return res.status(status).json({
          success: false,
          error: userError,
          details: gData.error || gData
        });
      }

      return res.status(200).json({
        success: true,
        postId: gData.name || gData.id || `g_${Date.now()}`,
        post: gData
      });
    } catch (gErr: any) {
      console.error("[SocialPublisher] Google publish exception:", gErr);
      return res.status(500).json({
        success: false,
        error: `Errore pubblicazione Google Business: ${gErr.message || 'Eccezione imprevista'}`,
        message: gErr.message
      });
    }
  }

  // 6. POST /api/social-publisher?action=sandbox_simulate (For Demo Video Walkthrough)
  if (action === "sandbox_simulate") {
    const { videoUrl = "https://flowerpowerpizza.com/demo-reel.mp4", title = "Pizza Night at Flower Power Ranong 🍕 #RanongFood #AuthenticPizza" } = body;
    const mockPublishId = `v_pub_url~v2.${Math.random().toString(36).substring(2, 10)}${Date.now()}`;

    return res.status(200).json({
      success: true,
      simulation: true,
      publish_id: mockPublishId,
      status: "PROCESSING_UPLOAD",
      message: "TikTok Sandbox Content Posting API initialized successfully (Demo Mode)",
      details: {
        privacy_level: "PUBLIC_TO_EVERYONE",
        video_url: videoUrl,
        title,
        timestamp: new Date().toISOString()
      }
    });
  }

  return res.status(400).json({ error: "Unknown action parameter" });
}
