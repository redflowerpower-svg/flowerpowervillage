
/*
# RLS Policy Export — creates audit table for inspection
Creates a temporary table populated with all policy details.
*/
CREATE TABLE IF NOT EXISTS _rls_audit_temp (
  tablename text,
  policyname text,
  roles text,
  cmd text,
  qual text,
  with_check text
);

DELETE FROM _rls_audit_temp;

INSERT INTO _rls_audit_temp
SELECT
  tablename,
  policyname,
  roles::text,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
