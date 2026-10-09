import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envVars = {};
for (const envFile of ['.env.local', '.env']) {
  const p = path.resolve(process.cwd(), envFile);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [k, ...v] = trimmed.split('=');
        if (k && v.length > 0 && !envVars[k.trim()]) {
          envVars[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  }
}

const supabaseUrl = envVars.VITE_SUPABASE_URL || envVars.SUPABASE_URL || '';
const anonKey = envVars.VITE_SUPABASE_ANON_KEY || '';

console.log('Testing upload with ANON key...');
const anonSupabase = createClient(supabaseUrl, anonKey);

async function testAnonUpload() {
  const { data, error } = await anonSupabase.storage
    .from('site-images')
    .upload('test_anon.json', Buffer.from('{"test":true}'), { upsert: true, contentType: 'application/json' });
  
  if (error) {
    console.log('❌ Anon upload failed:', error.message);
  } else {
    console.log('✅ Anon upload SUCCESS:', data);
  }
}

testAnonUpload();
