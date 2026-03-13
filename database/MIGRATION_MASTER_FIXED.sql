-- ============================================
-- MASTER MIGRATION SCRIPT - FIXED VERSION
-- ============================================
-- This version drops existing tables first to avoid conflicts
-- Run this ENTIRE script on your VPS SUPABASE instance
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- SECTION 0: DROP EXISTING TABLES (if any)
-- ============================================
-- This ensures a clean slate. Comment out if you want to keep existing data.

DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.customer_interactions CASCADE;
DROP TABLE IF EXISTS public.communications CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.blog_categories CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.incoming_emails CASCADE;
DROP TABLE IF EXISTS public.contact_submissions CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.chatbot_conversations CASCADE;
DROP TABLE IF EXISTS public.instagram_messages CASCADE;
DROP TABLE IF EXISTS public.instagram_conversations CASCADE;
DROP TABLE IF EXISTS public.telegram_messages CASCADE;
DROP TABLE IF EXISTS public.telegram_conversations CASCADE;
DROP TABLE IF EXISTS public.whatsapp_messages CASCADE;
DROP TABLE IF EXISTS public.whatsapp_conversations CASCADE;
DROP TABLE IF EXISTS public.tour_packages CASCADE;
DROP TABLE IF EXISTS public.pilots CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;

-- ============================================
-- SECTION 1: CREATE ALL TABLES
-- ============================================

-- CUSTOMERS TABLE (create first - no dependencies)
CREATE TABLE public.customers (
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

-- PILOTS TABLE (create second - no dependencies)
CREATE TABLE public.pilots (
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

-- TOUR PACKAGES TABLE (create third - no dependencies)
CREATE TABLE public.tour_packages (
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

-- BOOKINGS TABLE
CREATE TABLE public.bookings (
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

-- COMMUNICATIONS LOG TABLE
CREATE TABLE public.communications (
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
CREATE TABLE public.customer_interactions (
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
CREATE TABLE public.reviews (
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
CREATE TABLE public.whatsapp_conversations (
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

CREATE TABLE public.whatsapp_messages (
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
CREATE TABLE public.telegram_conversations (
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

CREATE TABLE public.telegram_messages (
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
CREATE TABLE public.instagram_conversations (
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

CREATE TABLE public.instagram_messages (
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
CREATE TABLE public.chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_identifier TEXT,
    messages JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GENERAL CONVERSATIONS
CREATE TABLE public.conversations (
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
CREATE TABLE public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INCOMING EMAILS
CREATE TABLE public.incoming_emails (
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
CREATE TABLE public.expenses (
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
CREATE TABLE public.blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BLOG POSTS
CREATE TABLE public.blog_posts (
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

-- Continue with indexes, triggers, and RLS in the same file...
-- (Rest of the script remains the same as MIGRATION_MASTER.sql)
