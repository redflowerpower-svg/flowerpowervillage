-- Migration: Create payment_settings singleton table for Multi-Gateway Management
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id text PRIMARY KEY DEFAULT 'singleton' CHECK (id = 'singleton'),
  active_primary_gateway text NOT NULL DEFAULT 'ksher',
  paypal_enabled boolean NOT NULL DEFAULT true,
  stripe_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  ksher_config jsonb NOT NULL DEFAULT '{"appId": "mch39593", "merchantName": "Flower Power Koh Phayam & Ranong", "mode": "live", "supportPromptPay": true, "supportCard": true, "supportWechatAlipay": false}'::jsonb,
  omise_config jsonb NOT NULL DEFAULT '{"publicKey": "", "secretKey": "", "mode": "test", "supportPromptPay": true, "supportCard": true, "supportTrueMoney": false}'::jsonb,
  paypal_config jsonb NOT NULL DEFAULT '{"enabled": true, "receiverEmail": "payments@flowerpowerphayam.com", "clientId": "", "clientSecret": "", "mode": "sandbox", "surchargePercent": 10}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read
CREATE POLICY "Allow public select payment_settings"
  ON public.payment_settings
  FOR SELECT
  TO public
  USING (true);

-- Policy 2: Allow authenticated admins or service role to manage payment_settings
CREATE POLICY "Allow authenticated insert/update payment_settings"
  ON public.payment_settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert initial singleton record if not existing
INSERT INTO public.payment_settings (id, active_primary_gateway, paypal_enabled, ksher_config)
VALUES ('singleton', 'ksher', true, '{"appId": "mch39593", "merchantName": "Flower Power Koh Phayam & Ranong", "mode": "live", "supportPromptPay": true, "supportCard": true, "supportWechatAlipay": false}'::jsonb)
ON CONFLICT (id) DO NOTHING;
