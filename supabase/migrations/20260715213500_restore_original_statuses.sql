-- Drop and recreate the status check constraint to include 'preparing'
ALTER TABLE pizza_orders DROP CONSTRAINT IF EXISTS pizza_orders_status_check;
ALTER TABLE pizza_orders ADD CONSTRAINT pizza_orders_status_check CHECK (status IN ('new', 'preparing', 'delivering', 'completed', 'rejected'));
