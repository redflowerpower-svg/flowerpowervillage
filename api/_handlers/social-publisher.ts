import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { uploadFileToGoogleDrive } from "../_helpers/google-drive.js";
import { formatAllDatesToDMY } from "../_helpers/date-formatter.js";
import { Agent, setGlobalDispatcher } from "undici";
import { execFile, execSync, execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpegStatic from "ffmpeg-static";

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
  const ffmpegPath = process.env.FFMPEG_PATH || ffmpegStatic || ffmpegInstaller?.path;
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
  const ffmpegPath = process.env.FFMPEG_PATH || ffmpegStatic || "ffmpeg";
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
      limit: 50,
      sortBy: { column: "created_at", order: "asc" }
    });
    if (error || !files) return;

    const twelveHoursAgo = Date.now() - (12 * 60 * 60 * 1000);
    const toDelete: string[] = [];

    for (const file of files) {
      if (file.name && file.created_at) {
        const fileTime = new Date(file.created_at).getTime();
        if (fileTime < twelveHoursAgo && file.name.startsWith("story_video_")) {
          toDelete.push(`social_stories/${file.name}`);
        }
      }
    }

    if (toDelete.length > 0) {
      await supabase.storage.from("assets").remove(toDelete);
      console.log(`[social-publisher] Pulizia automatica: eliminati ${toDelete.length} video social più vecchi di 12 ore.`);
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
1. DIVIETO DI MONOTONIA:
   Varia sempre l'attacco: a volte il rumore del mare e la brezza marina, a volte la magia del bungalow in legno tra le palme, a volte la fuga dal caos cittadino (slow life), a volte il buon cibo all'ombra dei giardini tropicali.
2. CULTURA SLOW LIFE DI KOH PHAYAM:
   Evoca la pace autentica dell'isola, il dondolarsi sull'amaca nella brezza tropicale, la quiete a Buffalo Bay, il piacere di staccare la spina.
3. STRUTTURA & LUNGHEZZA:
   - MASSIMO 3-4 RIGHE per lingua. Spaziatura ariosa, zero muri di parole.
   - Nomi alloggi: REGOLA IMMODIFICABILE: il nome dell'alloggio NON DEVE MAI andare a capo a metà!
   - Proverbio del Giorno: saggio e suggestivo sul viaggio, la lentezza, la natura o il mare.
   - Chiusura: invito a prenotare su www.flowerpowervillage.com.
    - Hashtag: NON scrivere alcun hashtag (#) nei testi: vengono aggiunti dal sistema in fondo al post, dopo le due lingue.
    - Bandiera: ogni testo (thaiContent / englishContent) DEVE iniziare con la propria bandiera prima della prima lettera (🇹🇭 per il Thai, 🇬🇧 per l'Inglese).
    - DIVIETO CATEGORICO FORNO A LEGNA: NON ABBIAMO IL FORNO A LEGNA! È severamente vietato parlare di forno a legna o "wood-fired" o "เตาฟืน".
    - DIVIETO CATEGORICO E ASSOLUTO PAROLA SUNSET / TRAMONTO: IL NOSTRO VILLAGGIO NON VEDE IL TRAMONTO (ZERO SUNSET)! È TASSATIVAMENTE E SEVERAMENTE VIETATO usare le parole "sunset", "tramonto", "พระอาทิตย์ตก" o parlare di tramonto per Flower Power Village e per qualsiasi alloggio! Per la Villa Penthouse in particolare, parlare TASSATIVAMENTE di "Breezy Suite" / suite ventilata con terrazza panoramica fresca e arieggiata.
    - REGOLA EMOJI CONTESTUALI (DIVIETO EMOJI A FINE FRASE): DIVIETO ASSOLUTO di piazzare 3 o 4 emoji raggruppate alla fine della frase. Le emoji devono essere DISTRIBUITE IN MODO NATURALE NEL CORPO DEL TESTO, accompagnando le singole parole (es. "natura tropicale 🌴", "brezza sul mare 🌊", "suono delle onde 🌺", "relax sull'amaca 🥥").

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
   Comunica con entusiasmo che ci sono camere e bungalow liberi per stanotte a Buffalo Bay. Chi si trova a Koh Phayam, al porto o nelle vicinanze può cogliere l'occasione al volo per una notte magica tra palme tropicali e brezza marina.
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
   - Proverbio del Giorno: proverbio evocativo sul cogliere l'attimo, il viaggio, la natura o il mare (Thai: 📜 สุภาษิต: "..." | Inglese: 📜 Proverb: "...").
   - Bandiera: 🇬🇧 per l'Inglese in alto, 🇹🇭 per il Thai in basso.
   - Zero hashtag nel corpo del testo (vengono aggiunti dal sistema in fondo al post).
   - Zero forno a legna. ZERO menzione di sunset/tramonto.
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
   Evoca la pace autentica dell'isola car-free, l'amaca tra le palme, il cinguettio degli uccelli tropicali e il profumo dei fiori a Buffalo Bay.
3. STRUTTURA & LUNGHEZZA:
   - MASSIMO 3-4 RIGHE AD ALTO IMPATTO per lingua. Spaziatura ariosa, zero muri di parole.
   - Nomi alloggi: locuzione continua su singola riga.
   - Proverbio del Giorno: proverbio poetico sul viaggio, la lentezza, la natura o l'isola.
   - Chiusura: invito a scoprire tutti gli alloggi e prenotare direttamente su www.flowerpowervillage.com.
   - Bandiera: 🇬🇧 per l'Inglese in alto, 🇹🇭 per il Thai in basso.
   - Zero hashtag nel testo. Zero forno a legna. ZERO parola sunset/tramonto.
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
      if (!isPizza) {
        thaiContent = scrubSunset(thaiContent);
        englishContent = scrubSunset(englishContent);
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

      // Google OAuth URL
      const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
      const host = (req.headers["x-forwarded-host"] || req.headers.host || "") as string;
      const googleRedirectUri = host.includes("localhost")
        ? "http://localhost:3000/api/social-callback"
        : (process.env.GOOGLE_REDIRECT_URI || "https://flowerpowerpizza.com/api/social-callback");

      const googleAuthUrl = googleClientId
        ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientId)}&redirect_uri=${encodeURIComponent(googleRedirectUri)}&response_type=code&scope=${encodeURIComponent('https://www.googleapis.com/auth/business.manage')}&access_type=offline&prompt=consent&state=google_social_studio`
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
            igId: process.env.META_PIZZA_IG_ID || "17841469176521344",
            connected: hasMetaPizza
          },
          village: {
            pageId: process.env.META_VILLAGE_PAGE_ID || "106883044573670",
            igId: process.env.META_VILLAGE_IG_ID || "17841444373676743",
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
      brand = "pizza"
    } = body;

    const isPizza = brand === "pizza";
    const igId = isPizza
      ? (process.env.META_PIZZA_IG_ID || "17841469176521344")
      : (process.env.META_VILLAGE_IG_ID || "17841444373676743");
    const pageToken = isPizza
      ? process.env.META_PIZZA_PAGE_TOKEN
      : process.env.META_VILLAGE_PAGE_TOKEN;

    if (!pageToken || !igId) {
      return res.status(400).json({
        success: false,
        error: `Credenziali Instagram non configurate per ${isPizza ? 'Pizzeria Ranong' : 'Villaggio Koh Phayam'}.`
      });
    }

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        error: "Parametro videoUrl mancante per Instagram Reels."
      });
    }

    try {
      console.log(`[SocialPublisher] Creazione container Instagram Reels (IG ID: ${igId}, Video: ${videoUrl})...`);

      const cParams = new URLSearchParams();
      cParams.append("access_token", pageToken);
      cParams.append("media_type", "REELS");
      cParams.append("video_url", videoUrl);
      if (caption) cParams.append("caption", caption.slice(0, 2200));

      const cRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media`, {
        method: "POST",
        body: cParams
      });
      const cData = await cRes.json();
      console.log("[SocialPublisher] Instagram container response:", cData);

      if (!cRes.ok || !cData.id) {
        return res.status(cRes.status || 400).json({
          success: false,
          error: cData.error?.message || "Errore creazione container Instagram",
          details: cData.error
        });
      }

      const creationId = cData.id;

      // Attesa breve elaborazione video su server Meta Instagram
      await new Promise(r => setTimeout(r, 3500));

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
      topicType = "STANDARD"
    } = body;

    let googleToken = "";
    if (supabase) {
      try {
        const { data: gData } = await supabase
          .from("telegram_config")
          .select("*")
          .eq("id", "google_business_token")
          .maybeSingle();
        if (gData?.bot_token) {
          googleToken = gData.bot_token;
        }
      } catch {}
    }

    if (!googleToken) {
      // In sandbox / unauthenticated demo mode, provide realistic simulation response
      const simulatedPostId = `g_post_${brand}_${Date.now().toString(36)}`;
      return res.status(200).json({
        success: true,
        simulation: true,
        postId: simulatedPostId,
        message: "Google Business Profile Post published successfully (Sandbox / Demo mode)",
        post: {
          name: `${locationName || 'locations/fp_pizza_ranong'}/localPosts/${simulatedPostId}`,
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
      const targetLocation = locationName || (brand === "pizza" ? "locations/fp_pizza_ranong" : "locations/fp_village_phayam");
      const postPayload: any = {
        languageCode: "en",
        summary: summary.slice(0, 1500),
        topicType,
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
        return res.status(400).json({
          error: "Google Business Profile API error",
          details: gData.error || gData
        });
      }

      return res.status(200).json({
        success: true,
        post: gData
      });
    } catch (gErr: any) {
      return res.status(500).json({ error: "Google publish exception", message: gErr.message });
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
