-- Add telegram_message_id to pizza_orders to track and update the Telegram message inline
ALTER TABLE pizza_orders ADD COLUMN IF NOT EXISTS telegram_message_id bigint;
