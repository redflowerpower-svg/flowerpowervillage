-- ARCHIVIATO: contiene credenziali in chiaro non più valide, sostituite da
-- creazione utente via dashboard Supabase. Non applicare.

/*
# Fix auth user — update password and verify identity
*/
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@flowerpowerphayam.com';
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  UPDATE auth.users SET
    encrypted_password = crypt('[REDACTED]', gen_salt('bf', 10)),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    raw_app_meta_data = '{"provider": "email", "providers": ["email"]}'::jsonb,
    raw_user_meta_data = '{}'::jsonb,
    is_super_admin = false,
    updated_at = now()
  WHERE id = v_user_id;

  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at,
    provider_id
  )
  VALUES (
    gen_random_uuid(),
    v_user_id,
    json_build_object('sub', v_user_id::text, 'email', 'admin@flowerpowerphayam.com')::jsonb,
    'email',
    NULL,
    now(),
    now(),
    v_user_id::text
  )
  ON CONFLICT (provider_id, provider) DO UPDATE
    SET identity_data = json_build_object('sub', v_user_id::text, 'email', 'admin@flowerpowerphayam.com')::jsonb,
        updated_at = now();

  RAISE NOTICE 'User fixed: %', v_user_id;
END $$;
