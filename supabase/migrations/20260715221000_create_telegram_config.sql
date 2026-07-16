-- Create telegram_config table to store dynamic webhook credentials
CREATE TABLE IF NOT EXISTS telegram_config (
  id text PRIMARY KEY DEFAULT 'default',
  bot_token text NOT NULL,
  chat_id text NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE telegram_config ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (admin) to read and write the config
CREATE POLICY "Authenticated users can manage telegram config"
  ON telegram_config
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
