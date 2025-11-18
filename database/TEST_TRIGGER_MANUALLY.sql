-- =====================================================
-- MANUAL TRIGGER TEST
-- =====================================================
-- Run this to test if the trigger works
-- =====================================================

-- First, let's see if we can update a booking to "confirmed"
-- This will test if the trigger fires

-- Step 1: Pick a booking to test (using the one from your CSV)
UPDATE bookings 
SET 
  status = 'confirmed',
  ticket_id = NULL  -- Remove ticket_id so trigger will fire
WHERE id = '1c760c22-986c-4897-ba5e-76da8d668608';

-- Step 2: Check if it updated
SELECT 
  id,
  customer_name,
  status,
  ticket_id,
  updated_at
FROM bookings 
WHERE id = '1c760c22-986c-4897-ba5e-76da8d668608';

-- =====================================================
-- If trigger fired, you should see:
-- - n8n execution in https://mvt36n7e.rpcld.com
-- - WhatsApp message on phone
-- - Telegram notification
-- =====================================================

-- If nothing happened:
-- 1. Check n8n workflow is ACTIVE
-- 2. Run: database/DIAGNOSE_TRIGGER.sql (all checks)
-- 3. Make sure pg_net is enabled
-- =====================================================
