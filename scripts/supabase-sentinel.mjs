/**
 * 🛡️ SUPABASE QUOTA SENTINEL & HEALTH WATCHDOG
 *
 * Monitora periodicamente lo stato delle risorse Supabase per prevenire sforamenti del piano Free:
 * 1. Misura lo Storage totale e di ciascun bucket (Soglia d'allerta: 500 MB (50% di 1000 MB)).
 * 2. Monitora la cartella 'assets/social_stories': auto-healing immediato se ci sono più di 4 video o buffer > 200 MB.
 * 3. Se rileva anomalie o file orfani, li bonifica e invia un report di allerta preventivo su Telegram Topic 301 (Failed/Alerts).
 *
 * Uso:
 *   node scripts/supabase-sentinel.mjs [--fix] [--alert]
 */
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const env = { ...process.env };
if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*?)\s*$/);
    if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL || 'https://gjqevgkbjkharczhikcl.supabase.co';
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('[sentinel] Credenziali Supabase mancanti in .env');
  process.exit(1);
}
const sb = createClient(supabaseUrl, supabaseKey);

const chatId = '-1004492692624';
const TOPIC_FAILED = 301;
let telegramToken = env.TELEGRAM_SOCIAL_BOT_TOKEN;

async function getTelegramToken() {
  if (telegramToken) return telegramToken;
  try {
    const { data } = await sb.from('telegram_config').select('bot_token').eq('id', 'social').maybeSingle();
    telegramToken = data?.bot_token;
  } catch {}
  return telegramToken;
}

async function sendTelegramAlert(text) {
  const token = await getTelegramToken();
  if (!token) {
    console.warn('[sentinel] Token Telegram non disponibile per allerta');
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_thread_id: TOPIC_FAILED,
        text,
        parse_mode: 'HTML'
      })
    });
  } catch (err) {
    console.warn('[sentinel] Errore invio alert Telegram:', err.message);
  }
}

async function scanBucket(bucketName, prefix = '') {
  let totalBytes = 0;
  let fileCount = 0;
  const filesList = [];

  async function recurse(p) {
    const { data: items, error } = await sb.storage.from(bucketName).list(p, { limit: 100 });
    if (!items || error) return;
    for (const item of items) {
      if (item.id === null) {
        await recurse(p ? `${p}/${item.name}` : item.name);
      } else {
        const sz = item.metadata?.size || 0;
        totalBytes += sz;
        fileCount++;
        filesList.push({
          path: p ? `${p}/${item.name}` : item.name,
          size: sz,
          created_at: item.created_at
        });
      }
    }
  }

  await recurse(prefix);
  return { bucketName, fileCount, totalBytes, totalMb: (totalBytes / 1024 / 1024).toFixed(2), filesList };
}

export async function runSupabaseQuotaSentinel({ autoFix = true, notifyTelegram = true } = {}) {
  console.log('🛡️ [sentinel] Avvio scansione sanitaria quote Supabase Storage & Egress Guard...');

  const { data: buckets, error: bErr } = await sb.storage.listBuckets();
  if (bErr || !buckets) {
    console.error('[sentinel] Errore listBuckets:', bErr);
    return { ok: false, error: bErr };
  }

  let grandTotalBytes = 0;
  let grandTotalFiles = 0;
  const bucketReports = [];

  for (const b of buckets) {
    const rep = await scanBucket(b.name);
    grandTotalBytes += rep.totalBytes;
    grandTotalFiles += rep.fileCount;
    bucketReports.push(rep);
  }

  const grandTotalMb = (grandTotalBytes / 1024 / 1024).toFixed(2);
  console.log(`[sentinel] Spazio totale occupato: ${grandTotalMb} MB su 1000 MB (File totali: ${grandTotalFiles})`);

  // 1. Ispezione specifica su 'assets/social_stories'
  const assetsRep = bucketReports.find(b => b.bucketName === 'assets');
  const socialFiles = assetsRep ? assetsRep.filesList.filter(f => f.path.startsWith('social_stories/')) : [];
  const socialBytes = socialFiles.reduce((acc, f) => acc + f.size, 0);
  const socialMb = (socialBytes / 1024 / 1024).toFixed(2);

  let cleanedFilesCount = 0;
  let freedBytes = 0;

  // 2. Auto-healing se la cartella social_stories accumula file (> 4 file o file orfani > 2 ore)
  if (autoFix && socialFiles.length > 0) {
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    const toDelete = [];

    // Elimina file temporanei con più di 2 ore
    for (const f of socialFiles) {
      const fTime = f.created_at ? new Date(f.created_at).getTime() : 0;
      if (fTime > 0 && fTime < twoHoursAgo) {
        toDelete.push(f.path);
        freedBytes += f.size;
      }
    }

    // Se rimangono più di 4 video, tieni solo i 4 più recenti
    const remaining = socialFiles.filter(f => !toDelete.includes(f.path));
    if (remaining.length > 4) {
      remaining.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      const excess = remaining.slice(0, remaining.length - 4);
      for (const ef of excess) {
        toDelete.push(ef.path);
        freedBytes += ef.size;
      }
    }

    if (toDelete.length > 0) {
      const { error: delErr } = await sb.storage.from('assets').remove(toDelete);
      if (!delErr) {
        cleanedFilesCount = toDelete.length;
        console.log(`🧹 [sentinel] Auto-healing eseguito: eliminati ${cleanedFilesCount} file orfani (${(freedBytes / 1024 / 1024).toFixed(1)} MB liberati).`);
      }
    }
  }

  // 3. Ricalcolo effettivo post auto-healing
  const postHealingSocialBytes = Math.max(0, socialBytes - freedBytes);
  const postHealingSocialMb = (postHealingSocialBytes / 1024 / 1024).toFixed(2);
  const postHealingGrandTotalBytes = Math.max(0, grandTotalBytes - freedBytes);
  const postHealingGrandTotalMb = (postHealingGrandTotalBytes / 1024 / 1024).toFixed(2);

  // 4. Soglie critiche equilibrate (Anti-Stress / Zero Spam):
  // - Storage Totale: 500 MB (50% del piano gratuito Supabase di 1000 MB)
  // - Buffer Video Social: 200 MB (invece di soli 35 MB)
  const STORAGE_LIMIT_WARN_MB = 500; 
  const SOCIAL_BUFFER_WARN_MB = 200; 
  const isStorageWarn = parseFloat(postHealingGrandTotalMb) > STORAGE_LIMIT_WARN_MB;
  const isSocialWarn = parseFloat(postHealingSocialMb) > SOCIAL_BUFFER_WARN_MB;

  if ((isStorageWarn || isSocialWarn) && notifyTelegram) {
    let alertMsg = `⚠️ <b>[SUPABASE QUOTA SENTINEL · ALERT PREVENTIVO]</b>\n\n`;
    alertMsg += `📊 <b>Stato Storage:</b> ${postHealingGrandTotalMb} MB / 1000 MB (Limite Free)\n`;
    alertMsg += `🎬 <b>Buffer Video Social:</b> ${postHealingSocialMb} MB\n`;
    if (cleanedFilesCount > 0) {
      alertMsg += `🧹 <b>Auto-Healing:</b> rimossi automaticamente ${cleanedFilesCount} file temporanei.\n`;
    }
    alertMsg += `\n🔍 <b>Dettaglio Bucket:</b>\n`;
    for (const b of bucketReports) {
      if (parseFloat(b.totalMb) > 0.1) {
        alertMsg += `▫️ <code>${b.bucketName}</code>: ${b.totalMb} MB (${b.fileCount} file)\n`;
      }
    }
    alertMsg += `\n🛡️ <i>Tutti i video continuano a essere archiviati in sicurezza su Google Drive 5TB a costo zero.</i>`;

    await sendTelegramAlert(alertMsg);
  }

  console.log(`✅ [sentinel] Scansione completata. Stato: ${isStorageWarn || isSocialWarn ? 'ATTENZIONE' : 'OTTIMALE 🟢'}`);
  return {
    ok: true,
    grandTotalMb: postHealingGrandTotalMb,
    grandTotalFiles: grandTotalFiles - cleanedFilesCount,
    socialMb: postHealingSocialMb,
    cleanedFilesCount,
    freedMb: (freedBytes / 1024 / 1024).toFixed(2),
    bucketReports: bucketReports.map(b => ({ name: b.bucketName, mb: b.totalMb, count: b.fileCount }))
  };
}

// Esecuzione standalone via CLI
if (process.argv[1] && process.argv[1].endsWith('supabase-sentinel.mjs')) {
  runSupabaseQuotaSentinel().then(res => {
    console.log('[sentinel] Risultato CLI:', JSON.stringify(res, null, 2));
    process.exit(0);
  }).catch(err => {
    console.error('[sentinel] Errore fatale:', err);
    process.exit(1);
  });
}

