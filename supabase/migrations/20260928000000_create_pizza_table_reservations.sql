-- Migration: Create table for Pizza Table & Hut Reservations
-- Description: Independent table schema with full GRANT permissions for Supabase Data API

CREATE TABLE IF NOT EXISTS public.pizza_table_reservations (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  email TEXT,
  guests INTEGER DEFAULT 2,
  reservation_date TEXT NOT NULL,
  reservation_time TEXT NOT NULL,
  seating_area TEXT DEFAULT 'any',
  occasion TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending',
  lang TEXT DEFAULT 'IT',
  telegram_message_id BIGINT,
  telegram_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Permessi per utenti anonimi
GRANT SELECT ON public.pizza_table_reservations TO anon;

-- Permessi per utenti autenticati (Admin / Staff)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pizza_table_reservations TO authenticated;

-- Permessi per chiamate serverless backend
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pizza_table_reservations TO service_role;
