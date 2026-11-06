-- Migration: Create concierge_memory table for AI Booking Concierge CRM & Self-Learning Memory
CREATE TABLE IF NOT EXISTS public.concierge_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL DEFAULT 'rule', -- 'rule' | 'faq' | 'accommodation' | 'policy' | 'golden_example'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast retrieval of active rules
CREATE INDEX IF NOT EXISTS idx_concierge_memory_active ON public.concierge_memory (active, category);

-- Enable RLS
ALTER TABLE public.concierge_memory ENABLE ROW LEVEL SECURITY;

-- Allow public read of active rules / knowledge
CREATE POLICY "Allow public select concierge_memory" ON public.concierge_memory
  FOR SELECT USING (true);

-- Allow service role & authenticated full management
CREATE POLICY "Allow service role all concierge_memory" ON public.concierge_memory
  FOR ALL USING (true);

