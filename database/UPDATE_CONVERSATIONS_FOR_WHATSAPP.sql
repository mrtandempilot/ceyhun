-- ============================================
-- WhatsApp Integration - Database Migration
-- ============================================
-- This script updates the conversations table to support 
-- multi-channel messaging (web, WhatsApp, email, phone)

-- Add channel column to track message source
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'web' 
CHECK (channel IN ('web', 'whatsapp', 'email', 'phone'));

-- Add WhatsApp-specific fields
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_phone_number TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_profile_name TEXT,
ADD COLUMN IF NOT EXISTS media_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_whatsapp_phone 
ON conversations(whatsapp_phone_number) 
WHERE channel = 'whatsapp';

CREATE INDEX IF NOT EXISTS idx_conversations_channel 
ON conversations(channel);

CREATE INDEX IF NOT EXISTS idx_conversations_whatsapp_message_id 
ON conversations(whatsapp_message_id) 
WHERE whatsapp_message_id IS NOT NULL;

-- Add helpful comments
COMMENT ON COLUMN conversations.channel IS 'Message source: web, whatsapp, email, phone';
COMMENT ON COLUMN conversations.whatsapp_message_id IS 'WhatsApp message ID for tracking and preventing duplicates';
COMMENT ON COLUMN conversations.whatsapp_phone_number IS 'Customer WhatsApp phone number (international format)';
COMMENT ON COLUMN conversations.whatsapp_profile_name IS 'WhatsApp profile display name';
COMMENT ON COLUMN conversations.media_url IS 'URL for media attachments (images, videos, documents)';
COMMENT ON COLUMN conversations.media_type IS 'Type of media: image, video, document, audio';

-- Update existing rows to set channel='web' if NULL
UPDATE conversations 
SET channel = 'web' 
WHERE channel IS NULL;

-- Verify the migration
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN ('channel', 'whatsapp_message_id', 'whatsapp_phone_number', 'whatsapp_profile_name', 'media_url', 'media_type')
ORDER BY ordinal_position;

-- Show index information
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'conversations'
  AND (indexname LIKE '%whatsapp%' OR indexname LIKE '%channel%');

-- ============================================
-- Migration completed successfully! ✅
-- ============================================
