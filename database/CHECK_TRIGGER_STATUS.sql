-- =====================================================
-- CHECK IF TRIGGER IS ACTUALLY INSTALLED
-- =====================================================

-- 1. Check if trigger exists
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'trigger_auto_generate_ticket';

-- Should return: trigger_auto_generate_ticket on bookings table

-- =====================================================

-- 2. Check current booking status
SELECT 
  id,
  status,
  ticket_id,
  customer_phone,
  updated_at
FROM bookings 
WHERE id = '1c760c22-986c-4897-ba5e-76da8d668608';

-- =====================================================

-- 3. Check if function has correct URL
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'auto_generate_ticket';

-- Should show 'https://skywalkers.app.n8n.cloud/webhook/payment-received'

-- =====================================================
-- TELL ME WHAT EACH QUERY RETURNS!
-- =====================================================
