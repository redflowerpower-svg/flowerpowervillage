/**
 * 🚨 SOCIAL EMERGENCY ALERT DISPATCHER (Topic 301)
 * Invia una notifica di emergenza a Telegram Topic 301 quando un job GitHub Actions fallisce.
 * Utilizza il bot ufficiale del Social Studio salvato in Neon Database.
 */
import fs from 'fs';
import { neon } from '@neondatabase/serverless';

let dbUrl = process.env.NEON_DATABASE_URL;
if (!dbUrl && fs.existsSync('.env')) {
  for (const l of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = l.match(/^\s*NEON_DATABASE_URL\s*=\s*(.*?)\s*$/);
    if (m) dbUrl = m[1].replace(/^["']|["']$/g, '');
  }
}

async function getSocialBotToken() {
  if (dbUrl) {
    try {
      const sql = neon(dbUrl);
      const rows = await sql`SELECT bot_token FROM telegram_config WHERE id = 'social' LIMIT 1;`;
      if (rows?.[0]?.bot_token) return rows[0].bot_token;
    } catch (e) {
      console.warn('[emergency-alert] Avviso lettura Neon:', e.message);
    }
  }
  return null;
}

async function main() {
  const token = await getSocialBotToken();
  if (!token) {
    console.error('[emergency-alert] ERRORE: Impossibile recuperare il Social Bot Token da Neon.');
    process.exit(1);
  }

  const runId = process.env.GITHUB_RUN_ID || 'manual';
  const repo = process.env.GITHUB_REPOSITORY || 'redflowerpower-svg/flowerpowervillage';
  const workflow = process.env.GITHUB_WORKFLOW || 'Social Media Studio Scheduler (24/7 Serverless)';
  const runUrl = `https://github.com/${repo}/actions/runs/${runId}`;

  const text = `🚨 <b>[FP SOCIAL STUDIO · ALLARME RUNNER CLOUD]</b>\n\n` +
    `❌ <b>Il Workflow GitHub Actions è fallito nel Cloud!</b>\n` +
    `📋 <b>Workflow:</b> <code>${workflow}</code>\n` +
    `🆔 <b>Run ID:</b> <a href="${runUrl}">${runId}</a>\n\n` +
    `⚠️ <i>Uno o più step del runner sono falliti prima o durante il dispatching. Cliccare sul link per visualizzare i dettagli tecnici del log.</i>`;

  console.log('[emergency-alert] Invio alert su Topic 301...');
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: '-1004492692624',
      message_thread_id: 301,
      text: text,
      parse_mode: 'HTML'
    })
  });

  const data = await res.json();
  console.log('[emergency-alert] Risultato Telegram:', data);
  if (!data.ok) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[emergency-alert] Errore imprevisto:', err);
  process.exit(1);
});

