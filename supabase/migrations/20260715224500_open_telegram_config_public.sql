-- Drop restrictive policies
DROP POLICY IF EXISTS "Authenticated users can manage telegram config" ON telegram_config;
DROP POLICY IF EXISTS "Allow public select access on telegram config" ON telegram_config;
DROP POLICY IF EXISTS "Allow public select access on telegram config" ON telegram_config;

-- Allow public read and write access to telegram_config
CREATE POLICY "Allow public manage access on telegram config"
  ON telegram_config
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
