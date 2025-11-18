-- =====================================================
-- CHECK IF AUTO TRIGGER IS INSTALLED
-- =====================================================

-- 1. Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation as "fires_on",
  event_object_table as "table_name",
  action_statement as "function"
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_generate_ticket';

-- Expected result: Should show 1 row if trigger exists
-- If no rows: Trigger is NOT installed yet

-- =====================================================

-- 2. Check if the function exists
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'auto_generate_ticket';

-- Expected result: Should show the function if it exists
-- If no rows: Function is NOT created yet

-- =====================================================

-- 3. Check if pg_net extension is enabled
SELECT 
  extname as "extension_name",
  extversion as "version"
FROM pg_extension
WHERE extname = 'pg_net';

-- Expected result: Should show pg_net if enabled
-- If no rows: pg_net is NOT enabled yet

-- =====================================================
-- RESULTS INTERPRETATION:
-- =====================================================

-- IF ALL 3 SHOW RESULTS:
--   ✅ Everything is installed correctly
--   Problem is elsewhere (WhatsApp, workflow, etc.)

-- IF TRIGGER OR FUNCTION MISSING:
--   ❌ You need to run: database/AUTO_TICKET_GENERATION.sql

-- IF PG_NET MISSING:
--   ❌ You need to enable pg_net extension in Supabase first

-- =====================================================
