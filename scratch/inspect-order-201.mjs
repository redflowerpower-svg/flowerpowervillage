import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envVars = {};
  const files = ['.env.local', '.env'];
  for (const file of files) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0 && !envVars[key.trim()]) {
            const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
            envVars[key.trim()] = val;
            process.env[key.trim()] = val;
          }
        }
      }
    }
  }
  return envVars;
}

const envVars = loadEnv();
const supabase = createClient(envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY);

async function inspectOrder201() {
  const { data, error } = await supabase
    .from('pizza_orders')
    .select('*')
    .eq('id', 201)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== DETTAGLIO COMPLETO ORDINE #201 ===');
  console.log(JSON.stringify(data, null, 2));
}

inspectOrder201().catch(console.error);
