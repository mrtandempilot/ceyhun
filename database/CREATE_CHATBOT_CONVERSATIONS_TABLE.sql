-- Create chatbot_conversations table for web chatbot interactions

CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  channel TEXT DEFAULT 'web',
  visitor_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for chatbot_conversations
CREATE POLICY "Anyone can insert chatbot messages" ON chatbot_conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view all chatbot conversations" ON chatbot_conversations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view their own chatbot conversations" ON chatbot_conversations
  FOR SELECT USING (auth.jwt() ->> 'email' = customer_email);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session_id ON chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_customer_email ON chatbot_conversations(customer_email);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_created_at ON chatbot_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_channel ON chatbot_conversations(channel);
