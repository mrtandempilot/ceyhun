-- Drop existing tables if they exist to ensure clean setup
DROP TABLE IF EXISTS instagram_messages CASCADE;
DROP TABLE IF EXISTS instagram_conversations CASCADE;

-- Instagram Conversations Table
CREATE TABLE instagram_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram_id TEXT NOT NULL, -- Instagram user ID
  username TEXT, -- Instagram username if available
  customer_name TEXT,
  customer_email TEXT,
  contact_id UUID REFERENCES customers(id),
  status TEXT DEFAULT 'active', -- active, archived, closed
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instagram Messages Table
CREATE TABLE instagram_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES instagram_conversations(id) ON DELETE CASCADE,
  message_id TEXT UNIQUE, -- Instagram message ID
  sender TEXT NOT NULL, -- 'customer' or 'business'
  message_type TEXT DEFAULT 'text', -- text, image, document, etc.
  content TEXT NOT NULL,
  media_url TEXT,
  status TEXT DEFAULT 'sent', -- sent, delivered, read, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_instagram_conversations_instagram_id ON instagram_conversations(instagram_id);
CREATE INDEX IF NOT EXISTS idx_instagram_conversations_status ON instagram_conversations(status);
CREATE INDEX IF NOT EXISTS idx_instagram_conversations_last_message ON instagram_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_conversation ON instagram_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_instagram_messages_created ON instagram_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE instagram_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_messages ENABLE ROW LEVEL SECURITY;

-- Policies: Allow admin to see everything
CREATE POLICY "Allow admin full access to instagram_conversations"
  ON instagram_conversations
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Allow admin full access to instagram_messages"
  ON instagram_messages
  FOR ALL
  TO authenticated
  USING (true);

-- Function to update conversation's last_message_at
CREATE OR REPLACE FUNCTION update_instagram_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE instagram_conversations
  SET last_message_at = NEW.created_at,
      updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation timestamp when new message added
DROP TRIGGER IF EXISTS trigger_update_instagram_conversation_timestamp ON instagram_messages;
CREATE TRIGGER trigger_update_instagram_conversation_timestamp
  AFTER INSERT ON instagram_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_instagram_conversation_timestamp();

-- Grant permissions
GRANT ALL ON instagram_conversations TO anon, authenticated, service_role;
GRANT ALL ON instagram_messages TO anon, authenticated, service_role;
