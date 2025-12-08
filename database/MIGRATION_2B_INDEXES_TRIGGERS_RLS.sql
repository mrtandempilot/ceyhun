-- ============================================
-- MIGRATION STEP 2B: INDEXES, TRIGGERS, AND RLS
-- ============================================
-- This is a continuation of MIGRATION_2_SETUP_VPS_SCHEMA.sql
-- Run this AFTER running the schema setup
-- ============================================

-- ============================================
-- INDEXES
-- ============================================

-- Bookings indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON public.bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at);
CREATE INDEX IF NOT EXISTS idx_customers_tags ON public.customers USING GIN(tags);

-- Pilots indexes
CREATE INDEX IF NOT EXISTS idx_pilots_email ON public.pilots(email);
CREATE INDEX IF NOT EXISTS idx_pilots_status ON public.pilots(status);
CREATE INDEX IF NOT EXISTS idx_pilots_license ON public.pilots(license_number);

-- Tour packages indexes
CREATE INDEX IF NOT EXISTS idx_tour_packages_status ON public.tour_packages(status);
CREATE INDEX IF NOT EXISTS idx_tour_packages_slug ON public.tour_packages(slug);

-- Communications indexes
CREATE INDEX IF NOT EXISTS idx_communications_customer ON public.communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_communications_booking ON public.communications(booking_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON public.communications(type);
CREATE INDEX IF NOT EXISTS idx_communications_created_at ON public.communications(created_at);

-- Interactions indexes
CREATE INDEX IF NOT EXISTS idx_interactions_customer ON public.customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_interactions_date ON public.customer_interactions(interaction_date);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON public.reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_pilot ON public.reviews(pilot_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);

-- Messaging indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_conv_phone ON public.whatsapp_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_msg_conv ON public.whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_telegram_conv_chat ON public.telegram_conversations(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_msg_conv ON public.telegram_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_instagram_conv_user ON public.instagram_conversations(instagram_user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_msg_conv ON public.instagram_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON public.conversations(type);
CREATE INDEX IF NOT EXISTS idx_conversations_external ON public.conversations(external_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
DROP TRIGGER IF EXISTS bookings_updated_at ON public.bookings;
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS customers_updated_at ON public.customers;
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS pilots_updated_at ON public.pilots;
CREATE TRIGGER pilots_updated_at BEFORE UPDATE ON public.pilots
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS tour_packages_updated_at ON public.tour_packages;
CREATE TRIGGER tour_packages_updated_at BEFORE UPDATE ON public.tour_packages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS reviews_updated_at ON public.reviews;
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS expenses_updated_at ON public.expenses;
CREATE TRIGGER expenses_updated_at BEFORE UPDATE ON public.expenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS whatsapp_conv_updated_at ON public.whatsapp_conversations;
CREATE TRIGGER whatsapp_conv_updated_at BEFORE UPDATE ON public.whatsapp_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS telegram_conv_updated_at ON public.telegram_conversations;
CREATE TRIGGER telegram_conv_updated_at BEFORE UPDATE ON public.telegram_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS instagram_conv_updated_at ON public.instagram_conversations;
CREATE TRIGGER instagram_conv_updated_at BEFORE UPDATE ON public.instagram_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS chatbot_conv_updated_at ON public.chatbot_conversations;
CREATE TRIGGER chatbot_conv_updated_at BEFORE UPDATE ON public.chatbot_conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS conversations_updated_at ON public.conversations;
CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
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

-- Messaging policies (authenticated users only)
CREATE POLICY "Authenticated users manage whatsapp_conversations" ON public.whatsapp_conversations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage whatsapp_messages" ON public.whatsapp_messages FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage telegram_conversations" ON public.telegram_conversations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage telegram_messages" ON public.telegram_messages FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage instagram_conversations" ON public.instagram_conversations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage instagram_messages" ON public.instagram_messages FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage chatbot_conversations" ON public.chatbot_conversations FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage conversations" ON public.conversations FOR ALL USING (auth.uid() IS NOT NULL);

-- Other tables policies
CREATE POLICY "Authenticated users manage contact_submissions" ON public.contact_submissions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage incoming_emails" ON public.incoming_emails FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage expenses" ON public.expenses FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Anyone can view blog_categories" ON public.blog_categories FOR SELECT USING (true);
CREATE POLICY "Authenticated users manage blog_categories" ON public.blog_categories FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "Anyone can view published blog_posts" ON public.blog_posts FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users manage blog_posts" ON public.blog_posts FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================
-- GRANTS
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

-- Service role has full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
