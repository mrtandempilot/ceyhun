-- ============================================
-- CONTACT FORM SUBMISSIONS TABLE ONLY
-- ============================================
-- Run this FIRST before the full CRM schema
-- This creates just the contact_submissions table without dependencies

CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID, -- Optional link to customers table if user has account

    -- Contact details
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,

    -- Status & handling
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed', 'spam')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),

    -- Assignment (optional - can be added later when users/staff are set up)
    assigned_to UUID, -- References auth.users(id) when staff system is ready
    assigned_by UUID, -- References auth.users(id) when staff system is ready

    -- Response tracking
    response TEXT,
    response_by UUID, -- References auth.users(id) when staff system is ready
    response_at TIMESTAMP WITH TIME ZONE,

    -- Follow-up
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    follow_up_notes TEXT,

    -- Technical data (for analytics and spam prevention)
    ip_address INET,
    user_agent TEXT,
    referer_url TEXT,

    -- Source tracking (for marketing analytics)
    source TEXT DEFAULT 'contact_form', -- contact_form, landing_page, etc
    campaign_id TEXT, -- For marketing campaigns
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,

    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES (for performance)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_submitted_at ON public.contact_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_priority ON public.contact_submissions(priority);

-- ============================================
-- TRIGGER (for updated_at field)
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contact_submissions_updated_at ON public.contact_submissions;
CREATE TRIGGER contact_submissions_updated_at BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can submit contact forms (public access)
CREATE POLICY "Anyone can submit contact forms" ON public.contact_submissions FOR INSERT WITH CHECK (true);

-- Policy: Authenticated users can view and manage contact submissions
CREATE POLICY "Authenticated users can manage contact submissions" ON public.contact_submissions FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================
-- GRANTS
-- ============================================
GRANT INSERT ON public.contact_submissions TO anon; -- Public can submit
GRANT ALL ON public.contact_submissions TO authenticated; -- Staff can manage

-- ============================================
-- SUCCESS CHECK
-- ============================================
-- Test query to verify table creation:
-- SELECT COUNT(*) FROM public.contact_submissions;
-- Should return: 0 (empty table ready for submissions)
