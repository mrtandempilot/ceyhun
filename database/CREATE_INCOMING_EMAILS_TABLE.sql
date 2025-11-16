-- ============================================
-- INCOMING EMAILS TABLE
-- For storing emails received by admins
-- ============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.incoming_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Email metadata
    message_id TEXT UNIQUE NOT NULL,
    from_email TEXT NOT NULL,
    from_name TEXT,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Email content
    plain_text TEXT,
    html_content TEXT,
    raw_content TEXT,

    -- Processing status
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    is_spam BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

    -- Attachments (stored as JSON array of file metadata)
    attachments JSONB DEFAULT '[]'::jsonb,

    -- Admin handling
    assigned_to UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,

    -- Email forwarding
    forwarded_to TEXT[],
    forwarded_at TIMESTAMP WITH TIME ZONE,

    -- Auto-reply settings
    auto_replied BOOLEAN DEFAULT false,
    auto_reply_template TEXT,

    -- Metadata
    email_provider TEXT, -- e.g., 'gmail', 'outlook', 'sendgrid'
    webhook_data JSONB, -- Raw webhook data for debugging

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_incoming_emails_received_at ON public.incoming_emails(received_at DESC);
CREATE INDEX IF NOT EXISTS idx_incoming_emails_from_email ON public.incoming_emails(from_email);
CREATE INDEX IF NOT EXISTS idx_incoming_emails_is_read ON public.incoming_emails(is_read);
CREATE INDEX IF NOT EXISTS idx_incoming_emails_is_archived ON public.incoming_emails(is_archived);
CREATE INDEX IF NOT EXISTS idx_incoming_emails_assigned_to ON public.incoming_emails(assigned_to);
CREATE INDEX IF NOT EXISTS idx_incoming_emails_message_id ON public.incoming_emails(message_id);

-- Full-text search index on subject and content
CREATE INDEX IF NOT EXISTS idx_incoming_emails_search ON public.incoming_emails
USING GIN (to_tsvector('english', COALESCE(subject, '') || ' ' || COALESCE(plain_text, '') || ' ' || COALESCE(from_email, '')));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS incoming_emails_updated_at ON public.incoming_emails;
CREATE TRIGGER incoming_emails_updated_at
    BEFORE UPDATE ON public.incoming_emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE public.incoming_emails ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Authenticated users can view incoming emails" ON public.incoming_emails;
DROP POLICY IF EXISTS "Authenticated users can insert incoming emails" ON public.incoming_emails;
DROP POLICY IF EXISTS "Authenticated users can update incoming emails" ON public.incoming_emails;

CREATE POLICY "Authenticated users can view incoming emails"
    ON public.incoming_emails FOR SELECT
    USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert incoming emails"
    ON public.incoming_emails FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update incoming emails"
    ON public.incoming_emails FOR UPDATE
    USING (auth.uid() IS NOT NULL);

-- Grants
GRANT ALL ON public.incoming_emails TO authenticated;
GRANT ALL ON public.incoming_emails TO service_role;

-- ============================================
-- EMAIL FORWARDING CONFIGURATION TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.email_forwarding_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Configuration details
    name TEXT NOT NULL,
    description TEXT,

    -- Forwarding rules
    from_domains TEXT[], -- Domains to forward from (empty array means all)
    to_emails TEXT[] NOT NULL, -- Where to forward emails
    conditions JSONB DEFAULT '{}'::jsonb, -- Additional conditions (subject patterns, etc.)

    -- Processing options
    auto_archive BOOLEAN DEFAULT false,
    auto_reply_enabled BOOLEAN DEFAULT false,
    auto_reply_template TEXT,

    -- Status
    is_active BOOLEAN DEFAULT true,

    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_forwarding_config_active ON public.email_forwarding_config(is_active);
CREATE INDEX IF NOT EXISTS idx_email_forwarding_config_domains ON public.email_forwarding_config USING GIN(from_domains);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS email_forwarding_config_updated_at ON public.email_forwarding_config;
CREATE TRIGGER email_forwarding_config_updated_at
    BEFORE UPDATE ON public.email_forwarding_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE public.email_forwarding_config ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Authenticated users can manage email forwarding config" ON public.email_forwarding_config;

CREATE POLICY "Authenticated users can manage email forwarding config"
    ON public.email_forwarding_config FOR ALL
    USING (auth.uid() IS NOT NULL);

-- Grants
GRANT ALL ON public.email_forwarding_config TO authenticated;
GRANT ALL ON public.email_forwarding_config TO service_role;
