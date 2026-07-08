
/*
# Delete and recreate admin user from scratch
The existing user record may have been created with an incomplete schema.
This migration deletes it and re-inserts with all required GoTrue fields.
*/
DO $$
DECLARE
  v_uid uuid := gen_random_uuid();
BEGIN
  -- Delete existing identities first (FK constraint)
  DELETE FROM auth.identities
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'admin@flowerpowerphayam.com'
  );

  -- Delete the user
  DELETE FROM auth.users WHERE email = 'admin@flowerpowerphayam.com';

  -- Re-insert with full GoTrue-compatible schema
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    v_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@flowerpowerphayam.com',
    crypt('Xp3!mKr9#nQv2bYw', gen_salt('bf', 10)),
    now(),
    NULL,
    NULL,
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- Insert the matching identity record
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at,
    provider_id
  ) VALUES (
    gen_random_uuid(),
    v_uid,
    json_build_object('sub', v_uid::text, 'email', 'admin@flowerpowerphayam.com')::jsonb,
    'email',
    NULL,
    now(),
    now(),
    v_uid::text
  );

  RAISE NOTICE 'Admin user recreated with id: %', v_uid;
END $$;
