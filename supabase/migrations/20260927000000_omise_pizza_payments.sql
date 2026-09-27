-- Migration: Support Omise Online Payments for Pizza Delivery (/pizza)
-- Adds payment_status, omise_charge_id, and ensures status constraints allow online payment flows

ALTER TABLE public.pizza_orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE public.pizza_orders ADD COLUMN IF NOT EXISTS omise_charge_id text;

-- Update status constraint to include online paid statuses while retaining existing pipeline
ALTER TABLE public.pizza_orders DROP CONSTRAINT IF EXISTS pizza_orders_status_check;
ALTER TABLE public.pizza_orders ADD CONSTRAINT pizza_orders_status_check 
  CHECK (status IN ('new', 'paid', 'confirmed', 'preparing', 'delivering', 'completed', 'rejected'));

-- Index for fast Omise charge lookups
CREATE INDEX IF NOT EXISTS pizza_orders_omise_charge_idx ON public.pizza_orders (omise_charge_id);

-- Explicit Supabase Data API Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pizza_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pizza_orders TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.pizza_orders TO anon;
