import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import fetch from 'node-fetch';

let dbUrl = process.env.NEON_DATABASE_URL;
if (!dbUrl && fs.existsSync('.env')) {
  for (const l of fs.readFileSync('.env', 'utf8').split('\n')) {
    const m = l.match(/^\s*NEON_DATABASE_URL\s*=\s*(.*?)\s*$/);
    if (m) dbUrl = m[1].replace(/^["']|["']$/g, '');
  }
}

async function run() {
  const sql = neon(dbUrl);
  const rows = await sql`SELECT bot_token FROM telegram_config WHERE id = 'social' LIMIT 1;`;
  const token = rows?.[0]?.bot_token;
  if (!token) return console.log('No token');
  
  const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=20`);
  const data = await res.json();
  console.log('getUpdates:', JSON.stringify(data, null, 2));
}
run();
