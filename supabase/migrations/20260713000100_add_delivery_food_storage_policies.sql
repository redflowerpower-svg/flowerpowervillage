-- ==========================================
-- STORAGE BUCKET AND POLICIES FOR DELIVERY FOOD
-- ==========================================

-- Assicura che il bucket 'delivery_food' esista ed sia pubblico
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'delivery_food', 
  'delivery_food', 
  true, 
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS Policy: Consenti la lettura pubblica degli oggetti nel bucket 'delivery_food'
CREATE POLICY "Public can read delivery_food images"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'delivery_food');

-- RLS Policy: Consenti agli utenti autenticati (admin) di gestire gli oggetti
CREATE POLICY "Admins can manage delivery_food images"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'delivery_food')
  WITH CHECK (bucket_id = 'delivery_food');

-- ==========================================
-- CACHE-CONTROL AUTOMATION FOR DELIVERY FOOD
-- ==========================================

-- 1. Funzione per impostare automaticamente il Cache-Control nel JSONB 'metadata'
CREATE OR REPLACE FUNCTION public.set_delivery_food_cache_control()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bucket_id = 'delivery_food' THEN
    NEW.metadata := jsonb_set(COALESCE(NEW.metadata, '{}'::jsonb), '{cacheControl}', '"public, max-age=31536000, immutable"');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Creazione del trigger BEFORE INSERT OR UPDATE
DROP TRIGGER IF EXISTS set_delivery_food_cache_control_trigger ON storage.objects;
CREATE TRIGGER set_delivery_food_cache_control_trigger
  BEFORE INSERT OR UPDATE ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_delivery_food_cache_control();

-- 3. Applicazione retroattiva per i file già caricati modificando il metadata JSONB
UPDATE storage.objects
SET metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{cacheControl}', '"public, max-age=31536000, immutable"')
WHERE bucket_id = 'delivery_food';
