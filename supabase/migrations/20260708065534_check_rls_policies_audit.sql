
/*
# RLS Policy Audit — read-only diagnostic
This migration only SELECTs from pg_policies and creates a temporary view for inspection.
No schema changes are made.
*/
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT
      tablename,
      policyname,
      roles::text,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname = 'public'
    ORDER BY tablename, cmd
  LOOP
    RAISE NOTICE 'TABLE=% | POLICY=% | ROLES=% | CMD=% | USING=% | WITH_CHECK=%',
      r.tablename, r.policyname, r.roles, r.cmd, r.qual, r.with_check;
  END LOOP;
END $$;
