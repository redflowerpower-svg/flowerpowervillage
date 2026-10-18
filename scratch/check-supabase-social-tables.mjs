import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Node 20+ supports --env-file, or parse manual fallback
if (!process.env.SUPABASE_SERVICE_ROLE_KEY && fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf-8');
  content.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
  });
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('social_accounts').select('*').limit(1);
  if (error) {
    console.log("social_accounts check error / not found:", error.message, error.code);
  } else {
    console.log("social_accounts table exists! Count:", data?.length);
  }

  const { data: posts, error: errPosts } = await supabase.from('social_scheduled_posts').select('*').limit(1);
  if (errPosts) {
    console.log("social_scheduled_posts check error / not found:", errPosts.message, errPosts.code);
  } else {
    console.log("social_scheduled_posts table exists! Count:", posts?.length);
  }
}

check();
