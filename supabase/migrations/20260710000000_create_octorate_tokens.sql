-- Create octorate_tokens table to store the OAuth tokens singleton
CREATE TABLE IF NOT EXISTS octorate_tokens (
    id text PRIMARY KEY DEFAULT 'singleton' CHECK (id = 'singleton'),
    access_token text NOT NULL,
    refresh_token text NOT NULL,
    expires_in integer NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE octorate_tokens ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for availability checks from guest browsers)
CREATE POLICY "Allow public read access to octorate_tokens" 
ON octorate_tokens FOR SELECT 
USING (true);

-- Allow public write/update access (for guest-triggered refresh or admin-triggered login)
CREATE POLICY "Allow public insert access to octorate_tokens" 
ON octorate_tokens FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to octorate_tokens" 
ON octorate_tokens FOR UPDATE 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow public delete access to octorate_tokens" 
ON octorate_tokens FOR DELETE 
USING (true);
