-- Relax status check constraint to support 'delivering' and 'completed' statuses
ALTER TABLE pizza_orders DROP CONSTRAINT IF EXISTS pizza_orders_status_check;
ALTER TABLE pizza_orders ADD CONSTRAINT pizza_orders_status_check CHECK (status IN ('new', 'preparing', 'ready', 'delivering', 'completed'));

-- Add latitude and longitude columns
ALTER TABLE pizza_orders ADD COLUMN IF NOT EXISTS latitude numeric(10,8);
ALTER TABLE pizza_orders ADD COLUMN IF NOT EXISTS longitude numeric(11,8);
