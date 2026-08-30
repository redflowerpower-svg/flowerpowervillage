import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

let url = process.env.SUPABASE_URL || '';
let key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !key) {
  const content = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
  for (const line of content.split('\n')) {
    if (line.startsWith('SUPABASE_URL=')) url = line.split('=')[1].trim();
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
  }
}

const supabase = createClient(url, key);

async function inspectTokens() {
  const { data, error } = await supabase.from('octorate_tokens').select('*');
  console.log('All rows in octorate_tokens table:\n', JSON.stringify(data, null, 2));
  if (error) console.error('Error querying octorate_tokens:', error);
}

inspectTokens();
