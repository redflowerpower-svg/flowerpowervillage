-- Add telegram_notified column to pizza_orders to prevent duplicate notification loop
ALTER TABLE pizza_orders ADD COLUMN IF NOT EXISTS telegram_notified boolean NOT NULL DEFAULT false;
