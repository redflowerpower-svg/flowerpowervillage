
/*
# Auth user diagnostic
Capture auth user record details into audit table for inspection.
*/
DELETE FROM _rls_audit_temp WHERE tablename = '__auth_diag__';

INSERT INTO _rls_audit_temp (tablename, policyname, roles, cmd, qual, with_check)
SELECT
  '__auth_diag__',
  id::text,
  email,
  aud,
  email_confirmed_at::text,
  encrypted_password
FROM auth.users
WHERE email = 'admin@flowerpowerphayam.com';
