import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function inspectRates() {
  const { data: tokenData } = await supabase.from('octorate_tokens').select('access_token').eq('id', 'singleton').single();
  const token = tokenData.access_token;

  const res = await fetch('https://api.octorate.com/connect/rest/v1/roomrates/366879', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  });

  const data = await res.json();
  const rates = Array.isArray(data) ? data : (data.roomRates || data.rates || []);

  const rateNamesSet = new Set();
  const details = [];

  for (const r of rates) {
    const name = r.name || r.title || r.roomRateName || '';
    if (name) {
      rateNamesSet.add(name);
      details.push({ id: r.id, name, roomName: r.roomName || r.room_name });
    }
  }

  console.log(`\n📌 UNICHE TARIFFE RILEVATE SU OCTORATE (${rateNamesSet.size}):`);
  console.log(Array.from(rateNamesSet));

  fs.writeFileSync('scratch/octorate-all-rates.json', JSON.stringify(details, null, 2));
}

inspectRates();
