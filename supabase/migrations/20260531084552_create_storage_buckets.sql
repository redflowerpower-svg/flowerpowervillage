/*
  # Storage buckets per immagini e ricevute

  ## Buckets creati
  - `accommodation-images` — immagini degli alloggi, pubblico in lettura
  - `receipts` — ricevute pagamento PromptPay, pubblico in lettura

  ## Policy
  - Lettura pubblica su entrambi i bucket
  - Upload e delete riservati agli utenti autenticati (admin)
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('accommodation-images', 'accommodation-images', true, 10485760,
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('receipts', 'receipts', true, 5242880,
   ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Lettura pubblica accommodation-images
CREATE POLICY "Public can read accommodation images"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'accommodation-images');

-- Upload autenticati accommodation-images
CREATE POLICY "Authenticated users can upload accommodation images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'accommodation-images');

-- Delete autenticati accommodation-images
CREATE POLICY "Authenticated users can delete accommodation images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'accommodation-images');

-- Lettura pubblica receipts
CREATE POLICY "Public can read receipts"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'receipts');

-- Upload anonimo receipts (i clienti caricano le ricevute senza account)
CREATE POLICY "Anon can upload receipts"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'receipts');
