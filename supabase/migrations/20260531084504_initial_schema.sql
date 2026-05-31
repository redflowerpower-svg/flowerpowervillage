/*
  # Schema iniziale — Flower Power Farm Village & Pizza

  ## Panoramica
  Questo script crea lo schema completo del database per due moduli:
  1. Pizza Delivery — tabella `pizza_orders` per la gestione degli ordini
  2. Accommodations — tabella `accommodations` per gli alloggi del resort

  ## Tabelle create

  ### `pizza_orders`
  Registra ogni ordine ricevuto tramite il modulo di consegna pizza.
  - `id` — UUID primary key generato automaticamente
  - `created_at` — timestamp di creazione
  - `customer_name` — nome del cliente
  - `phone` — numero di telefono
  - `address` — indirizzo di consegna
  - `items` — array JSON degli articoli del carrello
  - `total` — totale ordine in THB
  - `status` — stato ordine: new | preparing | ready
  - `payment_method` — metodo di pagamento: promptpay | cash
  - `receipt_url` — URL della ricevuta caricata su Storage (solo PromptPay)
  - `telegram_notified` — flag notifica Telegram inviata

  ### `accommodations`
  Catalogo degli alloggi del resort, gestito dall'admin.
  - `id` — UUID primary key
  - `slug` — identificatore URL unico (es. jungle-villa)
  - `name` — nome display dell'alloggio
  - `type` — categoria: villa | bungalow | room | lodge | tent
  - `description` — descrizione testuale
  - `capacity` — numero massimo di ospiti
  - `rooms` — numero di camere
  - `bathrooms` — numero di bagni
  - `beds` — descrizione configurazione letti
  - `features` — array JSON delle dotazioni
  - `price_per_night` — prezzo per notte in THB (0 = da configurare)
  - `images` — array JSON di URL immagini (Supabase Storage)
  - `is_available` — visibilità pubblica
  - `created_at` / `updated_at` — timestamp

  ## Sicurezza
  - RLS abilitato su entrambe le tabelle
  - `pizza_orders`: inserimento pubblico (clienti), lettura/aggiornamento solo admin
  - `accommodations`: lettura pubblica solo unità disponibili, scrittura solo admin
*/

-- ============================================================
-- TABELLA: pizza_orders
-- ============================================================
CREATE TABLE IF NOT EXISTS pizza_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  customer_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'preparing', 'ready')),
  payment_method text NOT NULL DEFAULT 'promptpay'
    CHECK (payment_method IN ('promptpay', 'cash')),
  receipt_url text,
  telegram_notified boolean NOT NULL DEFAULT false
);

ALTER TABLE pizza_orders ENABLE ROW LEVEL SECURITY;

-- Clienti possono inserire nuovi ordini senza autenticazione
CREATE POLICY "Public can insert pizza orders"
  ON pizza_orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Solo utenti autenticati (admin) possono leggere tutti gli ordini
CREATE POLICY "Authenticated users can read all orders"
  ON pizza_orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Solo utenti autenticati (admin) possono aggiornare lo stato degli ordini
CREATE POLICY "Authenticated users can update orders"
  ON pizza_orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indice per ordinare per data di creazione (usato nella dashboard admin)
CREATE INDEX IF NOT EXISTS pizza_orders_created_at_idx ON pizza_orders (created_at DESC);

-- ============================================================
-- TABELLA: accommodations
-- ============================================================
CREATE TABLE IF NOT EXISTS accommodations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  slug text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'room'
    CHECK (type IN ('villa', 'bungalow', 'room', 'lodge', 'tent')),
  description text NOT NULL DEFAULT '',
  capacity integer NOT NULL DEFAULT 2,
  rooms integer NOT NULL DEFAULT 1,
  bathrooms integer NOT NULL DEFAULT 1,
  beds text NOT NULL DEFAULT '',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  price_per_night numeric(10,2) NOT NULL DEFAULT 0,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_available boolean NOT NULL DEFAULT true
);

ALTER TABLE accommodations ENABLE ROW LEVEL SECURITY;

-- Chiunque può leggere gli alloggi disponibili (pagine pubbliche del sito)
CREATE POLICY "Public can read available accommodations"
  ON accommodations
  FOR SELECT
  TO anon
  USING (is_available = true);

-- Utenti autenticati possono leggere tutti gli alloggi inclusi quelli non disponibili
CREATE POLICY "Authenticated users can read all accommodations"
  ON accommodations
  FOR SELECT
  TO authenticated
  USING (true);

-- Solo admin può inserire nuovi alloggi
CREATE POLICY "Authenticated users can insert accommodations"
  ON accommodations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Solo admin può aggiornare gli alloggi
CREATE POLICY "Authenticated users can update accommodations"
  ON accommodations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Indice per ricerca veloce per slug (usato nelle pagine dettaglio)
CREATE INDEX IF NOT EXISTS accommodations_slug_idx ON accommodations (slug);
CREATE INDEX IF NOT EXISTS accommodations_type_idx ON accommodations (type);

-- Trigger per aggiornare updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_accommodations_updated_at
  BEFORE UPDATE ON accommodations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
