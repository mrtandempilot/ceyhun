-- =====================================================
-- TEST IF PG_NET CAN CALL YOUR N8N WEBHOOK
-- =====================================================

-- Test 1: Direct call from SQL (not from trigger)
SELECT net.http_post(
  url := 'https://skywalkers.app.n8n.cloud/webhook/payment-received',
  headers := '{"Content-Type": "application/json"}'::jsonb,
  body := '{"body":{"booking_id":"1c760c22-986c-4897-ba5e-76da8d668608","payment_status":"succeeded","amount":100}}'::jsonb
) as direct_call_result;

-- Check the result - what's the status code?
-- 200 = Success
-- 404 = Workflow not found
-- Any response = pg_net can reach n8n

-- =====================================================
-- If this works but the trigger doesn't, 
-- the problem is the trigger logic or payload format
-- =====================================================
