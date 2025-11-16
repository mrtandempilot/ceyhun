-- Drop existing table to fix schema
DROP TABLE IF EXISTS conversations CASCADE;

-- Create conversations table for chatbot with email tracking
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  visitor_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_customer_email ON conversations(customer_email);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for chatbot)
CREATE POLICY "Allow public insert" ON conversations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to read all (for admin dashboard)
CREATE POLICY "Allow authenticated read" ON conversations
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Service role has full access
CREATE POLICY "Service role has full access" ON conversations
  TO service_role
  USING (true)
  WITH CHECK (true);
