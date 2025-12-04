-- Telegram Conversations Table
CREATE TABLE IF NOT EXISTS telegram_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_chat_id BIGINT NOT NULL UNIQUE,
    customer_name TEXT,
    customer_username TEXT,
    customer_phone TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Telegram Messages Table
CREATE TABLE IF NOT EXISTS telegram_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES telegram_conversations(id) ON DELETE CASCADE,
    telegram_message_id BIGINT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
    message_text TEXT,
    message_type TEXT DEFAULT 'text',
    media_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_telegram_conversations_chat_id ON telegram_conversations(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_conversation_id ON telegram_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_created_at ON telegram_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE telegram_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow authenticated users to access all data)
CREATE POLICY "Allow authenticated users to manage telegram conversations"
    ON telegram_conversations FOR ALL
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage telegram messages"
    ON telegram_messages FOR ALL
    USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON telegram_conversations TO authenticated;
GRANT ALL ON telegram_messages TO authenticated;
