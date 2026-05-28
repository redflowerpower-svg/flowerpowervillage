/*
  # Add payment_method to pizza_orders

  1. Changes
    - `pizza_orders`: new column `payment_method` (text, default 'promptpay')
      - Values: 'promptpay' | 'cash'
      - NOT NULL with default so existing rows stay valid
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pizza_orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE pizza_orders ADD COLUMN payment_method text NOT NULL DEFAULT 'promptpay';
  END IF;
END $$;
