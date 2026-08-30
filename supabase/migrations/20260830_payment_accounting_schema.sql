-- ==============================================================================
-- FLOWER POWER MULTI-GATEWAY & ACCOUNTING SCHEMA
-- Reparti Stagni: Resort (Koh Phayam), Pizzeria (Ranong), e Registro Commercialista
-- ==============================================================================

-- 1. Tabella Impostazioni Gateway (Singleton)
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  active_primary_gateway TEXT DEFAULT 'ksher',
  paypal_enabled BOOLEAN DEFAULT true,
  stripe_config JSONB DEFAULT '{}'::jsonb,
  ksher_config JSONB DEFAULT '{}'::jsonb,
  omise_config JSONB DEFAULT '{}'::jsonb,
  paypal_config JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabella Prenotazioni Resort (Reparto Stagno /villaggio)
CREATE TABLE IF NOT EXISTS public.village_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_ref TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  accommodation_id TEXT,
  accommodation_name TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INTEGER NOT NULL,
  guests INTEGER DEFAULT 2,
  base_price NUMERIC(12, 2) NOT NULL,
  vat_amount NUMERIC(12, 2) DEFAULT 0.00,
  processing_cost NUMERIC(12, 2) DEFAULT 0.00,
  total_paid NUMERIC(12, 2) NOT NULL,
  balance_due NUMERIC(12, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'THB',
  gateway TEXT NOT NULL, -- 'ksher', 'paypal', 'bank_transfer'
  payment_channel TEXT DEFAULT 'card', -- 'card', 'promptpay', 'paypal_wallet'
  transaction_id TEXT,
  status TEXT DEFAULT 'PAID', -- 'PAID', 'PENDING', 'CANCELLED', 'REFUNDED'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabella Registro Fiscale Commercialista (Unificato / Filtrabile)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id TEXT PRIMARY KEY, -- es. 'INV-2026-001'
  department TEXT NOT NULL, -- 'resort' | 'pizza'
  order_no TEXT NOT NULL, -- 'FP-RESORT-...' o 'FP-PIZZA-...'
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  service_description TEXT NOT NULL, -- es. 'Jungle Villa (Koh Phayam) - Soggiorno Saldato (2 Notti)'
  gateway TEXT NOT NULL, -- 'ksher', 'paypal', 'bank_transfer'
  payment_channel TEXT NOT NULL, -- 'card', 'promptpay', 'paypal_wallet'
  gross_amount NUMERIC(12, 2) NOT NULL, -- in THB
  gateway_fee NUMERIC(12, 2) DEFAULT 0.00, -- in THB
  net_amount NUMERIC(12, 2) NOT NULL, -- in THB
  vat_rate NUMERIC(4, 2) DEFAULT 0.07, -- 7%
  currency TEXT DEFAULT 'THB',
  transaction_id TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'PAID', -- 'PAID', 'REFUNDED'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Indici per performance e filtri veloci
CREATE INDEX IF NOT EXISTS idx_village_bookings_date ON public.village_bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_village_bookings_ref ON public.village_bookings(booking_ref);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_dept ON public.payment_transactions(department);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway ON public.payment_transactions(gateway);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_date ON public.payment_transactions(date);

-- 5. RLS Policies
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.village_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read payment settings" ON public.payment_settings FOR SELECT USING (true);
CREATE POLICY "Allow service role all payment settings" ON public.payment_settings FOR ALL USING (true);

CREATE POLICY "Allow authenticated read village_bookings" ON public.village_bookings FOR SELECT USING (true);
CREATE POLICY "Allow service role all village_bookings" ON public.village_bookings FOR ALL USING (true);

CREATE POLICY "Allow authenticated read payment_transactions" ON public.payment_transactions FOR SELECT USING (true);
CREATE POLICY "Allow service role all payment_transactions" ON public.payment_transactions FOR ALL USING (true);
