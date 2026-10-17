import fs from 'fs';
import path from 'path';

// Load env
['.env', '.env.local'].forEach(file => {
  const filePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...rest] = trimmed.split('=');
        if (key && !process.env[key.trim()]) {
          process.env[key.trim()] = rest.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }
});

import { runResortSentinelAudit } from '../api/_handlers/resort-sentinel.js';

async function testSentinel() {
  console.log('🛡️ ESECUZIONE TEST RESORT SENTINEL & AUTO-HEALER LIVE...');
  const result = await runResortSentinelAudit({ sendTelegram: true, forceReport: true });
  console.log('\n--- RISULTATO AUDIT ---');
  console.log(JSON.stringify(result, null, 2));
}

testSentinel().catch(console.error);
