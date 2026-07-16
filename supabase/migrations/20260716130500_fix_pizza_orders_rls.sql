-- Drop old restrictive insert policy
DROP POLICY IF EXISTS "Public can insert pizza orders" ON pizza_orders;

-- Allow both anonymous and authenticated users to insert orders
CREATE POLICY "Anyone can insert pizza orders"
  ON pizza_orders
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow both anonymous and authenticated users to select orders
-- (Necessary for .select() to successfully return the inserted row during checkout)
DROP POLICY IF EXISTS "Authenticated users can read all orders" ON pizza_orders;
DROP POLICY IF EXISTS "Allow public read access on pizza_orders" ON pizza_orders;

CREATE POLICY "Anyone can read pizza orders"
  ON pizza_orders
  FOR SELECT
  TO public
  USING (true);
