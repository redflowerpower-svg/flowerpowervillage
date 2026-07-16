-- Allow public updates on pizza_orders so the local API route can flag telegram_notified without RLS blocks
DROP POLICY IF EXISTS "Allow public updates on pizza_orders" ON pizza_orders;
CREATE POLICY "Allow public updates on pizza_orders"
  ON pizza_orders
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);
