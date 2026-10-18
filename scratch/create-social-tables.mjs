import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

const supabaseUrl = envVars.SUPABASE_URL || envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('📌 Executing SQL to create social tables...');
  const sql = `
    CREATE TABLE IF NOT EXISTS public.social_accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      platform TEXT NOT NULL DEFAULT 'tiktok',
      account_name TEXT,
      open_id TEXT UNIQUE NOT NULL,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      expires_in INTEGER,
      refresh_expires_in INTEGER,
      scope TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    GRANT SELECT ON public.social_accounts TO anon;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_accounts TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_accounts TO service_role;

    CREATE TABLE IF NOT EXISTS public.social_scheduled_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reparto TEXT NOT NULL DEFAULT 'pizza',
      platforms TEXT[] NOT NULL DEFAULT ARRAY['tiktok'],
      post_type TEXT NOT NULL DEFAULT 'video',
      title TEXT,
      caption TEXT,
      media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
      status TEXT NOT NULL DEFAULT 'scheduled',
      scheduled_at TIMESTAMPTZ NOT NULL,
      published_at TIMESTAMPTZ,
      error_message TEXT,
      publish_id TEXT,
      metadata JSONB DEFAULT '{}'::JSONB,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    GRANT SELECT ON public.social_scheduled_posts TO anon;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_scheduled_posts TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_scheduled_posts TO service_role;
  `;

  const { data, error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.error('exec_sql error:', error);
  } else {
    console.log('✅ exec_sql success:', data);
  }

  // Verification
  const checkAccounts = await supabase.from('social_accounts').select('*').limit(1);
  console.log('social_accounts check:', checkAccounts.error ? `Error: ${checkAccounts.error.message}` : `Table exists! Count: ${checkAccounts.data?.length}`);

  const checkPosts = await supabase.from('social_scheduled_posts').select('*').limit(1);
  console.log('social_scheduled_posts check:', checkPosts.error ? `Error: ${checkPosts.error.message}` : `Table exists! Count: ${checkPosts.data?.length}`);
}

run();
