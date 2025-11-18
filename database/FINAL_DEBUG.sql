-- =====================================================
-- FINAL DEBUG - Find the exact problem
-- =====================================================

-- TEST 1: Can Supabase reach ANY external URL?
SELECT net.http_get(
  url := 'https://httpbin.org/get'
) as can_reach_internet;

-- If this returns data, pg_net works and can reach internet ✅
-- If this fails, pg_net has network issues ❌

-- =====================================================

-- TEST 2: Can Supabase reach your n8n domain?
SELECT net.http_get(
  url := 'https://mvt36n7e.rpcld.com'
) as can_reach_n8n_domain;

-- If this returns data, n8n domain is reachable ✅
-- If this fails, n8n URL is wrong or blocked ❌

-- =====================================================

-- TEST 3: Call the actual webhook
SELECT net.http_post(
  url := 'https://mvt36n7e.rpcld.com/webhook/payment-received',
  headers := '{"Content-Type": "application/json"}'::jsonb,
  body := '{"test": true}'::jsonb
) as webhook_call_result;

-- Check the response:
-- - If status 200-299: Webhook works! ✅
-- - If status 404: Workflow not active ❌
-- - If status 500: Workflow has an error ❌
-- - If no response: Network blocked ❌

-- =====================================================
-- RUN ALL 3 TESTS ABOVE
-- Tell me what each one returns!
-- =====================================================
