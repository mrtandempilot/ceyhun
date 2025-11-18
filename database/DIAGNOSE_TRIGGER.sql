-- =====================================================
-- DIAGNOSE AUTO-TICKET TRIGGER
-- =====================================================
-- Run this to see why the trigger isn't firing
-- =====================================================

-- Step 1: Check if pg_net extension is enabled
SELECT 
  'pg_net Extension Status' as check_name,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') 
    THEN '✅ ENABLED' 
    ELSE '❌ NOT ENABLED - Enable it in Database → Extensions' 
  END as status;

-- Step 2: Check if trigger exists
SELECT 
  'Trigger Status' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'trigger_auto_generate_ticket'
    ) 
    THEN '✅ EXISTS' 
    ELSE '❌ NOT FOUND - Run AUTO_TICKET_GENERATION.sql' 
  END as status;

-- Step 3: Check if function exists
SELECT 
  'Function Status' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc 
      WHERE proname = 'auto_generate_ticket'
    ) 
    THEN '✅ EXISTS' 
    ELSE '❌ NOT FOUND - Run AUTO_TICKET_GENERATION.sql' 
  END as status;

-- Step 4: View the trigger details
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_generate_ticket';

-- Step 5: Check recent bookings
SELECT 
  id,
  customer_name,
  customer_phone,
  status,
  ticket_id,
  created_at,
  updated_at
FROM bookings
ORDER BY updated_at DESC
LIMIT 5;

-- =====================================================
-- MANUAL TEST OF WEBHOOK
-- =====================================================
-- If everything above shows ✅, test the webhook manually:
-- Copy the command below and run in a NEW query:

-- SELECT net.http_post(
--   url := 'https://mvt36n7e.rpcld.com/webhook/payment-received',
--   headers := '{"Content-Type": "application/json"}'::jsonb,
--   body := '{"body":{"body":{"booking_id":1,"payment_status":"succeeded","amount":100}}}'::jsonb
-- );

-- =====================================================
-- RESULTS INTERPRETATION
-- =====================================================
-- ✅ All checks pass → Trigger is installed correctly
-- ❌ pg_net not enabled → Go to Database → Extensions → Enable pg_net
-- ❌ Trigger/Function not found → Run AUTO_TICKET_GENERATION.sql
-- =====================================================
