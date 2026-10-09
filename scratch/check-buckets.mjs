import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

let url = '', key = '';
for (const fn of ['.env.local', '.env']) {
  if (fs.existsSync(fn)) {
    const c = fs.readFileSync(fn, 'utf8');
    for (const l of c.split('\n')) {
      const trimmed = l.trim();
      if (trimmed.startsWith('VITE_SUPABASE_URL=')) url = trimmed.split('=')[1].trim().replace(/['"]/g, '');
      if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = trimmed.split('=')[1].trim().replace(/['"]/g, '');
      else if (!key && trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) key = trimmed.split('=')[1].trim().replace(/['"]/g, '');
    }
  }
}

const supabase = createClient(url, key);

async function check() {
  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  console.log('Buckets:', buckets?.map(b => b.name) || bErr);

  const { data: files, error: fErr } = await supabase.storage.from('site-images').list();
  console.log('Files in site-images:', files?.map(f => f.name) || fErr);
}

check().catch(console.error);
