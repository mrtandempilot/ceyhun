-- ============================================
-- MIGRATION STEP 2: SETUP SCHEMA ON VPS SUPABASE
-- ============================================
-- Run this script on your VPS SUPABASE instance
-- This will create all tables, indexes, triggers, and RLS policies
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PART 1: UPDATE/CREATE BOOKINGS TABLE
-- ============================================

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

-- ============================================
-- PART 2: CREATE CRM TABLES
-- ============================================

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

-- ============================================
-- PART 3: CREATE MESSAGING TABLES
-- ============================================

-- WhatsApp Tables
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

-- Telegram Tables
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

-- Instagram Tables
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

-- Chatbot Conversations
CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    user_identifier TEXT,
    messages JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- General Conversations
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

-- ============================================
-- PART 4: CREATE OTHER TABLES
-- ============================================

-- Contact Submissions
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incoming Emails
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

-- Expenses
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

-- Blog Categories
CREATE TABLE IF NOT EXISTS public.blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts
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

-- Continue in next file due to length...
