-- Add has_whatsapp and has_line to pizza_orders
ALTER TABLE pizza_orders ADD COLUMN IF NOT EXISTS has_whatsapp boolean NOT NULL DEFAULT false;
ALTER TABLE pizza_orders ADD COLUMN IF NOT EXISTS has_line boolean NOT NULL DEFAULT false;

-- Drop and recreate the status check constraint to enforce 4 states
ALTER TABLE pizza_orders DROP CONSTRAINT IF EXISTS pizza_orders_status_check;
ALTER TABLE pizza_orders ADD CONSTRAINT pizza_orders_status_check CHECK (status IN ('new', 'delivering', 'completed', 'rejected'));
