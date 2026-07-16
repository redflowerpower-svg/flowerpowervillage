-- Allow public read-only (SELECT) access to telegram_config
CREATE POLICY "Allow public select access on telegram config"
  ON telegram_config
  FOR SELECT
  TO public
  USING (true);
