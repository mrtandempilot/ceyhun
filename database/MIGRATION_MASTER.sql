-- ============================================
-- MASTER MIGRATION SCRIPT
-- ============================================
-- This is a consolidated script that combines:
-- - MIGRATION_2_SETUP_VPS_SCHEMA.sql
-- - MIGRATION_2B_INDEXES_TRIGGERS_RLS.sql
-- 
-- Run this ENTIRE script on your VPS SUPABASE instance
-- to set up the complete database schema
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- SECTION 1: CREATE ALL TABLES
-- ============================================

-- BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    tour_name TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    booking_date DATE NOT NULL,
    booking_time TIME,
    number_of_guests INTEGER DEFAULT 1,
    duration INTEGER DEFAULT 120,
    google_calendar_event_id TEXT,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    country TEXT,
    city TEXT,
    address TEXT,
    date_of_birth DATE,
    passport_number TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    customer_type TEXT DEFAULT 'individual' CHECK (customer_type IN ('individual', 'group', 'corporate')),
    vip_status BOOLEAN DEFAULT false,
    tags TEXT[],
    preferred_language TEXT DEFAULT 'en',
    marketing_consent BOOLEAN DEFAULT false,
    newsletter_subscribed BOOLEAN DEFAULT false,
    communication_preferences JSONB DEFAULT '{"email": true, "sms": false, "phone": false}'::jsonb,
    total_bookings INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    lifetime_value DECIMAL(10,2) DEFAULT 0.00,
    average_booking_value DECIMAL(10,2) DEFAULT 0.00,
    last_booking_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    internal_notes TEXT,
    source TEXT,
    referral_source TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_customer_email UNIQUE(email)
);

-- PILOTS TABLE
CREATE TABLE IF NOT EXISTS public.pilots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    license_number TEXT NOT NULL UNIQUE,
    license_type TEXT NOT NULL,
    license_expiry DATE NOT NULL,
    certifications TEXT[],
    specializations TEXT[],
    years_experience INTEGER,
    total_flights INTEGER DEFAULT 0,
    total_tandem_flights INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave', 'suspended')),
    available_days TEXT[] DEFAULT ARRAY['monday','tuesday','wednesday','thursday','friday','saturday','sunday'],
    max_flights_per_day INTEGER DEFAULT 4,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    equipment_owned TEXT[],
    commission_rate DECIMAL(5,2) DEFAULT 0.00,
    payment_method TEXT DEFAULT 'bank_transfer',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TOUR PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.tour_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    seasonal_pricing JSONB,
    min_participants INTEGER DEFAULT 1,
    max_participants INTEGER DEFAULT 1,
    min_age INTEGER,
    max_age INTEGER,
    max_weight DECIMAL(5,2),
    fitness_level TEXT,
    restrictions TEXT[],
    includes TEXT[],
    equipment_provided TEXT[],
    meeting_point TEXT,
    available_days TEXT[],
    available_times TEXT[],
    seasonal_availability JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'seasonal')),
    featured BOOLEAN DEFAULT false,
    slug TEXT UNIQUE,
    image_urls TEXT[],
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- COMMUNICATIONS LOG TABLE
CREATE TABLE IF NOT EXISTS public.communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'phone', 'whatsapp', 'in_person', 'other')),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    subject TEXT,
    message TEXT NOT NULL,
    sent_by UUID REFERENCES auth.users(id),
    sent_by_name TEXT,
    received_by TEXT,
    status TEXT DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'delivered', 'failed', 'read')),
    attachments JSONB,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CUSTOMER INTERACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.customer_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('inquiry', 'booking', 'complaint', 'feedback', 'support', 'follow_up', 'other')),
    summary TEXT NOT NULL,
    details TEXT,
    outcome TEXT,
    action_required BOOLEAN DEFAULT false,
    action_taken TEXT,
    handled_by UUID REFERENCES auth.users(id),
    handled_by_name TEXT,
    interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    follow_up_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- REVIEWS & RATINGS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    pilot_id UUID REFERENCES public.pilots(id) ON DELETE SET NULL,
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    pilot_rating INTEGER CHECK (pilot_rating >= 1 AND pilot_rating <= 5),
    experience_rating INTEGER CHECK (experience_rating >= 1 AND experience_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    title TEXT,
    comment TEXT,
    photos TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
    featured BOOLEAN DEFAULT false,
    response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WHATSAPP TABLES
CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    contact_name TEXT,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
    message_id TEXT,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    message_text TEXT,
    media_url TEXT,
    status TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TELEGRAM TABLES
CREATE TABLE IF NOT EXISTS public.telegram_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id BIGINT NOT NULL UNIQUE,
    username TEXT,
    first_name TEXT,
    last_name TEXT,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.telegram_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.telegram_conversations(id) ON DELETE CASCADE,
    message_id BIGINT,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    message_text TEXT,
    media_url TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INSTAGRAM TABLES
CREATE TABLE IF NOT EXISTS public.instagram_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instagram_user_id TEXT NOT NULL,
    username TEXT,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.instagram_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.instagram_conversations(id) ON DELETE CASCADE,
    message_id TEXT,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    message_text TEXT,
    media_url TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CHATBOT CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_identifier TEXT,
    messages JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GENERAL CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT CHECK (type IN ('whatsapp', 'telegram', 'instagram', 'chatbot', 'email', 'other')),
    external_id TEXT,
    contact_name TEXT,
    contact_identifier TEXT,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    unread_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONTACT SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INCOMING EMAILS
CREATE TABLE IF NOT EXISTS public.incoming_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_email TEXT NOT NULL,
    to_email TEXT NOT NULL,
    subject TEXT,
    body_text TEXT,
    body_html TEXT,
    attachments JSONB,
    status TEXT DEFAULT 'unread',
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EXPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    expense_date DATE NOT NULL,
    payment_method TEXT,
    receipt_url TEXT,
    status TEXT DEFAULT 'pending',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BLOG CATEGORIES
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BLOG POSTS
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    category_id UUID REFERENCES public.blog_categories(id),
    author_id UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SECTION 2: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_tags ON public.customers USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_pilots_email ON public.pilots(email);
CREATE INDEX IF NOT EXISTS idx_pilots_status ON public.pilots(status);
CREATE INDEX IF NOT EXISTS idx_pilots_license ON public.pilots(license_number);

CREATE INDEX IF NOT EXISTS idx_tour_packages_status ON public.tour_packages(status);
CREATE INDEX IF NOT EXISTS idx_tour_packages_slug ON public.tour_packages(slug);

CREATE INDEX IF NOT EXISTS idx_communications_customer ON public.communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_communications_booking ON public.communications(booking_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON public.communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON public.communications(created_at);

CREATE INDEX IF NOT EXISTS idx_interactions_customer ON public.customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON public.customer_interactions(interaction_date);

CREATE INDEX IF NOT EXISTS idx_reviews_booking ON public.reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_pilot ON public.reviews(pilot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);

CREATE INDEX IF NOT EXISTS idx_whatsapp_conv_phone ON public.whatsapp_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_msg_conv ON public.whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_telegram_conv_chat ON public.telegram_conversations(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_msg_conv ON public.telegram_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_instagram_conv_user ON public.instagram_conversations(instagram_user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_msg_conv ON public.instagram_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON public.conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_external ON public.conversations(external_id);

-- ============================================
-- SECTION 3: CREATE TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS bookings_updated_at ON public.bookings;
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS customers_updated_at ON public.customers;
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS pilots_updated_at ON public.pilots;
CREATE TRIGGER pilots_updated_at BEFORE UPDATE ON public.pilots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tour_packages_updated_at ON public.tour_packages;
CREATE TRIGGER tour_packages_updated_at BEFORE UPDATE ON public.tour_packages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS reviews_updated_at ON public.reviews;
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS expenses_updated_at ON public.expenses;
CREATE TRIGGER expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS whatsapp_conv_updated_at ON public.whatsapp_conversations;
CREATE TRIGGER whatsapp_conv_updated_at BEFORE UPDATE ON public.whatsapp_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS telegram_conv_updated_at ON public.telegram_conversations;
CREATE TRIGGER telegram_conv_updated_at BEFORE UPDATE ON public.telegram_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS instagram_conv_updated_at ON public.instagram_conversations;
CREATE TRIGGER instagram_conv_updated_at BEFORE UPDATE ON public.instagram_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS chatbot_conv_updated_at ON public.chatbot_conversations;
CREATE TRIGGER chatbot_conv_updated_at BEFORE UPDATE ON public.chatbot_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS conversations_updated_at ON public.conversations;
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- SECTION 4: ENABLE RLS AND CREATE POLICIES
-- ============================================

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instagram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incoming_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Bookings policies
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can delete own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can create own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookings" ON public.bookings FOR DELETE USING (auth.uid() = user_id);

-- Customers policies
DROP POLICY IF EXISTS "Anyone can view customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can update customers" ON public.customers;
CREATE POLICY "Anyone can view customers" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update customers" ON public.customers FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Pilots policies
DROP POLICY IF EXISTS "Anyone can view active pilots" ON public.pilots;
DROP POLICY IF EXISTS "Authenticated users can manage pilots" ON public.pilots;
CREATE POLICY "Anyone can view active pilots" ON public.pilots FOR SELECT USING (status = 'active' OR auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage pilots" ON public.pilots FOR ALL USING (auth.uid() IS NOT NULL);

-- Tour packages policies
DROP POLICY IF EXISTS "Anyone can view active tour packages" ON public.tour_packages;
DROP POLICY IF EXISTS "Authenticated users can manage tour packages" ON public.tour_packages;
CREATE POLICY "Anyone can view active tour packages" ON public.tour_packages FOR SELECT USING (status = 'active' OR auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can manage tour packages" ON public.tour_packages FOR ALL USING (auth.uid() IS NOT NULL);

-- Communications policies
DROP POLICY IF EXISTS "Authenticated users can view communications" ON public.communications;
DROP POLICY IF EXISTS "Authenticated users can insert communications" ON public.communications;
CREATE POLICY "Authenticated users can view communications" ON public.communications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can insert communications" ON public.communications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Customer interactions policies
DROP POLICY IF EXISTS "Authenticated users can manage interactions" ON public.customer_interactions;
CREATE POLICY "Authenticated users can manage interactions" ON public.customer_interactions FOR ALL USING (auth.uid() IS NOT NULL);

-- Reviews policies
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Customers can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can manage reviews" ON public.reviews;
CREATE POLICY "Anyone can view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved' OR auth.uid() IS NOT NULL);
CREATE POLICY "Customers can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.customers WHERE id = customer_id));
CREATE POLICY "Authenticated users can manage reviews" ON public.reviews FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Messaging policies
DROP POLICY IF EXISTS "Authenticated users manage whatsapp_conversations" ON public.whatsapp_conversations;
DROP POLICY IF EXISTS "Authenticated users manage whatsapp_messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Authenticated users manage telegram_conversations" ON public.telegram_conversations;
DROP POLICY IF EXISTS "Authenticated users manage telegram_messages" ON public.telegram_messages;
DROP POLICY IF EXISTS "Authenticated users manage instagram_conversations" ON public.instagram_conversations;
DROP POLICY IF EXISTS "Authenticated users manage instagram_messages" ON public.instagram_messages;
DROP POLICY IF EXISTS "Authenticated users manage chatbot_conversations" ON public.chatbot_conversations;
DROP POLICY IF EXISTS "Authenticated users manage conversations" ON public.conversations;
CREATE POLICY "Authenticated users manage whatsapp_conversations" ON public.whatsapp_conversations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage whatsapp_messages" ON public.whatsapp_messages FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage telegram_conversations" ON public.telegram_conversations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage telegram_messages" ON public.telegram_messages FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage instagram_conversations" ON public.instagram_conversations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage instagram_messages" ON public.instagram_messages FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage chatbot_conversations" ON public.chatbot_conversations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage conversations" ON public.conversations FOR ALL USING (auth.uid() IS NOT NULL);

-- Other tables policies
DROP POLICY IF EXISTS "Authenticated users manage contact_submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Authenticated users manage incoming_emails" ON public.incoming_emails;
DROP POLICY IF EXISTS "Authenticated users manage expenses" ON public.expenses;
DROP POLICY IF EXISTS "Anyone can view blog_categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Authenticated users manage blog_categories" ON public.blog_categories;
DROP POLICY IF EXISTS "Anyone can view published blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated users manage blog_posts" ON public.blog_posts;
CREATE POLICY "Authenticated users manage contact_submissions" ON public.contact_submissions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage incoming_emails" ON public.incoming_emails FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage expenses" ON public.expenses FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Anyone can view blog_categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage blog_categories" ON public.blog_categories FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Anyone can view published blog_posts" ON public.blog_posts FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage blog_posts" ON public.blog_posts FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================
-- SECTION 5: GRANTS
-- ============================================

GRANT ALL ON public.bookings TO authenticated;
GRANT ALL ON public.customers TO authenticated;
GRANT SELECT ON public.customers TO anon;
GRANT ALL ON public.pilots TO authenticated;
GRANT SELECT ON public.pilots TO anon;
GRANT ALL ON public.tour_packages TO authenticated;
GRANT SELECT ON public.tour_packages TO anon;
GRANT ALL ON public.communications TO authenticated;
GRANT ALL ON public.customer_interactions TO authenticated;
GRANT ALL ON public.reviews TO authenticated;
GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.whatsapp_conversations TO authenticated;
GRANT ALL ON public.whatsapp_messages TO authenticated;
GRANT ALL ON public.telegram_conversations TO authenticated;
GRANT ALL ON public.telegram_messages TO authenticated;
GRANT ALL ON public.instagram_conversations TO authenticated;
GRANT ALL ON public.instagram_messages TO authenticated;
GRANT ALL ON public.chatbot_conversations TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.contact_submissions TO authenticated;
GRANT ALL ON public.incoming_emails TO authenticated;
GRANT ALL ON public.expenses TO authenticated;
GRANT ALL ON public.blog_categories TO authenticated;
GRANT SELECT ON public.blog_categories TO anon;
GRANT ALL ON public.blog_posts TO authenticated;
GRANT SELECT ON public.blog_posts TO anon;

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
SELECT 'Schema setup complete! Now you can import your data using MIGRATION_3_IMPORT_DATA.sql' as message;
