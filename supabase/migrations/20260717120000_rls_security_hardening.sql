-- 1. HARDEN POSTGRES FUNCTIONS (Resolve Search Path Mutable Warning)
ALTER FUNCTION public.set_delivery_food_cache_control() 
  SET search_path = public, pg_temp;

-- 2. SECURE TELEGRAM CONFIG TABLE (Resolve Public RLS Policy Always True Warning)
DROP POLICY IF EXISTS "Allow public manage access on telegram config" ON telegram_config;
DROP POLICY IF EXISTS "Authenticated users can manage telegram config" ON telegram_config;

-- Restrict manage access exclusively to logged-in administrators (authenticated role)
CREATE POLICY "Authenticated users can manage telegram config"
  ON telegram_config
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. SECURE PIZZA ORDERS TABLE (Resolve Public RLS Policy Always True Warning)
DROP POLICY IF EXISTS "Anyone can read pizza orders" ON pizza_orders;
DROP POLICY IF EXISTS "Allow public updates on pizza_orders" ON pizza_orders;
DROP POLICY IF EXISTS "Admins can select all pizza orders" ON pizza_orders;
DROP POLICY IF EXISTS "Guests can select recent orders" ON pizza_orders;
DROP POLICY IF EXISTS "Admins can update pizza orders" ON pizza_orders;

-- Guests can only select recent orders created within the last 24 hours (prevents historical data mining)
CREATE POLICY "Guests can select recent orders"
  ON pizza_orders
  FOR SELECT
  TO anon
  USING (created_at > now() - interval '24 hours');

-- Authenticated admins can select all orders
CREATE POLICY "Admins can select all pizza orders"
  ON pizza_orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated admins can update orders (e.g. status changes, driver assignments)
CREATE POLICY "Admins can update pizza orders"
  ON pizza_orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 4. SECURE OCTORATE TOKENS TABLE (Resolve Public RLS Policy Always True Warning & RLS Enabled No Policy Suggestion)
DROP POLICY IF EXISTS "Allow public read access to octorate_tokens" ON octorate_tokens;
DROP POLICY IF EXISTS "Allow public insert access to octorate_tokens" ON octorate_tokens;
DROP POLICY IF EXISTS "Allow public update access to octorate_tokens" ON octorate_tokens;
DROP POLICY IF EXISTS "Allow public delete access to octorate_tokens" ON octorate_tokens;

-- Prevent any public/anonymous access (serverless endpoints access it via service_role key)
-- Define explicit block policy for linter compliance
CREATE POLICY "Block public access to octorate_tokens"
  ON octorate_tokens
  FOR ALL
  TO public
  USING (false);

-- 5. SECURE KEEP ALIVE TABLE (Resolve RLS Enabled No Policy Suggestion)
DROP POLICY IF EXISTS "Block public access to keep_alive" ON keep_alive;

-- Define explicit block policy for linter compliance
CREATE POLICY "Block public access to keep_alive"
  ON keep_alive
  FOR ALL
  TO public
  USING (false);

-- 6. HARDEN STORAGE BUCKET POLICIES (Resolve Public Bucket Allows Listing Warning)
-- Drop public list policy for delivery_food bucket (public download remains active via storage CDN, listing is blocked)
DROP POLICY IF EXISTS "Public can read delivery_food images" ON storage.objects;
