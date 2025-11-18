-- WhatsApp Conversations Table
CREATE TABLE IF NOT EXISTS whatsapp_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  contact_id UUID REFERENCES customers(id),
  status TEXT DEFAULT 'active', -- active, archived, closed
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WhatsApp Messages Table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES whatsapp_conversations(id) ON DELETE CASCADE,
  message_id TEXT UNIQUE, -- WhatsApp message ID
  sender TEXT NOT NULL, -- 'customer' or 'business'
  message_type TEXT DEFAULT 'text', -- text, image, document, etc.
  content TEXT NOT NULL,
  media_url TEXT,
  status TEXT DEFAULT 'sent', -- sent, delivered, read, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_phone ON whatsapp_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_status ON whatsapp_conversations(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_conversations_last_message ON whatsapp_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_conversation ON whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created ON whatsapp_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Policies: Allow admin to see everything
CREATE POLICY "Allow admin full access to whatsapp_conversations"
  ON whatsapp_conversations
  FOR ALL
  USING (true);

CREATE POLICY "Allow admin full access to whatsapp_messages"
  ON whatsapp_messages
  FOR ALL
  USING (true);

-- Function to update conversation's last_message_at
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE whatsapp_conversations
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp when new message added
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON whatsapp_messages;
CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Grant permissions
GRANT ALL ON whatsapp_conversations TO anon, authenticated, service_role;
GRANT ALL ON whatsapp_messages TO anon, authenticated, service_role;
