-- ============================================
-- VERIFY WhatsApp Integration Setup
-- ============================================
-- Run this to confirm everything is configured correctly

-- 1. Check if all WhatsApp columns exist
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'conversations'
ORDER BY ordinal_position;

-- 2. Check indexes (should see these 3)
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'conversations'
  AND (indexname LIKE '%whatsapp%' OR indexname LIKE '%channel%');

-- 3. Test insert a sample WhatsApp message
INSERT INTO conversations (
  session_id,
  channel,
  message,
  sender,
  whatsapp_phone_number,
  whatsapp_profile_name
) VALUES (
  'test_whatsapp_session',
  'whatsapp',
  'Test WhatsApp message',
  'user',
  '1234567890',
  'Test User'
);

-- 4. Verify the test message was inserted
SELECT 
  id,
  session_id,
  channel,
  message,
  sender,
  whatsapp_phone_number,
  whatsapp_profile_name,
  created_at
FROM conversations
WHERE session_id = 'test_whatsapp_session';

-- 5. Clean up test message
DELETE FROM conversations WHERE session_id = 'test_whatsapp_session';

-- ============================================
-- Expected Results:
-- ============================================
-- Query 1: Should show columns including:
--   - channel
--   - whatsapp_message_id
--   - whatsapp_phone_number
--   - whatsapp_profile_name
--   - media_url
--   - media_type
--
-- Query 2: Should show 3 indexes:
--   - idx_conversations_whatsapp_phone
--   - idx_conversations_channel
--   - idx_conversations_whatsapp_message_id
--
-- Query 3: Should insert successfully
--
-- Query 4: Should show the test message with all WhatsApp fields
--
-- If all queries work, your database is ready! ✅
-- ============================================
