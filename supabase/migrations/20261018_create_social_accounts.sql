-- ==============================================================================
-- MIGRATION: Social Media Studio & Publisher (Reparto Stagno /social)
-- Tables: social_accounts, social_scheduled_posts, social_logs
-- Compliance: Supabase Data API Permissions (explicit GRANTs)
-- ==============================================================================

-- 1. Tabella Profili Social Collegati (OAuth Tokens: TikTok, Meta, Instagram)
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL DEFAULT 'tiktok', -- 'tiktok', 'instagram', 'facebook'
  brand TEXT NOT NULL DEFAULT 'pizza', -- 'pizza' (Pizzeria Ranong), 'village' (Koh Phayam)
  open_id TEXT NOT NULL UNIQUE,
  account_name TEXT,
  avatar_url TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_in INTEGER,
  refresh_expires_in INTEGER,
  scope TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per lookup rapido
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON public.social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_accounts_open_id ON public.social_accounts(open_id);

-- 2. Tabella Post Programmati & Pubblicati
CREATE TABLE IF NOT EXISTS public.social_scheduled_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL DEFAULT 'pizza',
  platform TEXT NOT NULL DEFAULT 'tiktok',
  title TEXT,
  caption TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT DEFAULT 'video', -- 'video', 'image', 'carousel'
  scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'publishing', 'published', 'failed'
  publish_id TEXT,
  published_url TEXT,
  error_message TEXT,
  privacy_level TEXT DEFAULT 'PUBLIC_TO_EVERYONE',
  disable_duet BOOLEAN DEFAULT false,
  disable_comment BOOLEAN DEFAULT false,
  disable_stitch BOOLEAN DEFAULT false,
  is_ai_generated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_posts_status ON public.social_scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_for ON public.social_scheduled_posts(scheduled_for);

-- 3. Tabella Log & Auditing Social
CREATE TABLE IF NOT EXISTS public.social_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_logs ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Service Role ha accesso completo su tutte le tabelle
DROP POLICY IF EXISTS "Service role full access on social_accounts" ON public.social_accounts;
CREATE POLICY "Service role full access on social_accounts" ON public.social_accounts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on social_scheduled_posts" ON public.social_scheduled_posts;
CREATE POLICY "Service role full access on social_scheduled_posts" ON public.social_scheduled_posts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on social_logs" ON public.social_logs;
CREATE POLICY "Service role full access on social_logs" ON public.social_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated (Admin) ha accesso in lettura e scrittura
DROP POLICY IF EXISTS "Authenticated users manage social_accounts" ON public.social_accounts;
CREATE POLICY "Authenticated users manage social_accounts" ON public.social_accounts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users manage social_scheduled_posts" ON public.social_scheduled_posts;
CREATE POLICY "Authenticated users manage social_scheduled_posts" ON public.social_scheduled_posts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anon access per lettura di base (se necessario)
DROP POLICY IF EXISTS "Anon read social_scheduled_posts" ON public.social_scheduled_posts;
CREATE POLICY "Anon read social_scheduled_posts" ON public.social_scheduled_posts
  FOR SELECT TO anon USING (status = 'published');

-- 6. TASSATIVO: GRANT Espliciti per Supabase Data API (Regola D'oro Post-30 Ottobre)
GRANT SELECT ON public.social_accounts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_accounts TO service_role;

GRANT SELECT ON public.social_scheduled_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_scheduled_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_scheduled_posts TO service_role;

GRANT SELECT ON public.social_logs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_logs TO service_role;
