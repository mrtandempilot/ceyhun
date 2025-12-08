-- ============================================
-- MIGRATION STEP 3: IMPORT DATA TO VPS
-- ============================================
-- Run this script on your VPS SUPABASE instance
-- AFTER you have run MIGRATION_2 and MIGRATION_2B
-- ============================================

-- IMPORTANT: Import order matters due to foreign key constraints
-- 1. Independent tables first (no foreign keys)
-- 2. Then tables that reference them

-- ============================================
-- METHOD 1: Import from CSV files
-- ============================================
-- If you exported data as CSV files, use these commands:

-- Disable triggers temporarily for faster import
SET session_replication_role = replica;

-- Import independent tables first
\COPY public.customers FROM 'customers.csv' WITH CSV HEADER;
\COPY public.pilots FROM 'pilots.csv' WITH CSV HEADER;
\COPY public.tour_packages FROM 'tour_packages.csv' WITH CSV HEADER;
\COPY public.blog_categories FROM 'blog_categories.csv' WITH CSV HEADER;

-- Import bookings (references customers via user_id, but it's optional)
\COPY public.bookings FROM 'bookings.csv' WITH CSV HEADER;

-- Import dependent tables
\COPY public.communications FROM 'communications.csv' WITH CSV HEADER;
\COPY public.customer_interactions FROM 'customer_interactions.csv' WITH CSV HEADER;
\COPY public.reviews FROM 'reviews.csv' WITH CSV HEADER;
\COPY public.blog_posts FROM 'blog_posts.csv' WITH CSV HEADER;

-- Import messaging tables
\COPY public.whatsapp_conversations FROM 'whatsapp_conversations.csv' WITH CSV HEADER;
\COPY public.whatsapp_messages FROM 'whatsapp_messages.csv' WITH CSV HEADER;
\COPY public.telegram_conversations FROM 'telegram_conversations.csv' WITH CSV HEADER;
\COPY public.telegram_messages FROM 'telegram_messages.csv' WITH CSV HEADER;
\COPY public.instagram_conversations FROM 'instagram_conversations.csv' WITH CSV HEADER;
\COPY public.instagram_messages FROM 'instagram_messages.csv' WITH CSV HEADER;
\COPY public.chatbot_conversations FROM 'chatbot_conversations.csv' WITH CSV HEADER;
\COPY public.conversations FROM 'conversations.csv' WITH CSV HEADER;

-- Import other tables
\COPY public.contact_submissions FROM 'contact_submissions.csv' WITH CSV HEADER;
\COPY public.incoming_emails FROM 'incoming_emails.csv' WITH CSV HEADER;
\COPY public.expenses FROM 'expenses.csv' WITH CSV HEADER;

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- ============================================
-- METHOD 2: Import from INSERT statements
-- ============================================
-- If you have INSERT statements, paste them here
-- Make sure to import in the correct order:

-- Example:
-- INSERT INTO public.customers (id, first_name, last_name, email, ...) VALUES
-- ('uuid-1', 'John', 'Doe', 'john@example.com', ...),
-- ('uuid-2', 'Jane', 'Smith', 'jane@example.com', ...);

-- ============================================
-- METHOD 3: Import using Supabase Dashboard
-- ============================================
-- 1. Go to your VPS Supabase Dashboard
-- 2. Navigate to Table Editor
-- 3. Select each table
-- 4. Click "Insert" > "Import data from CSV"
-- 5. Upload your CSV files in the correct order

-- ============================================
-- POST-IMPORT: Update sequences
-- ============================================
-- This is only needed if you have any SERIAL columns
-- (Most of your tables use UUID, so this may not be needed)

-- Example for tables with SERIAL columns:
-- SELECT setval('public.some_table_id_seq', (SELECT MAX(id) FROM public.some_table));

-- ============================================
-- POST-IMPORT: Verify foreign key integrity
-- ============================================

-- Check for orphaned records in communications
SELECT COUNT(*) as orphaned_communications
FROM public.communications c
WHERE c.customer_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM public.customers WHERE id = c.customer_id);

-- Check for orphaned records in reviews
SELECT COUNT(*) as orphaned_reviews
FROM public.reviews r
WHERE r.customer_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM public.customers WHERE id = r.customer_id);

-- Check for orphaned messages
SELECT COUNT(*) as orphaned_whatsapp_messages
FROM public.whatsapp_messages m
WHERE NOT EXISTS (SELECT 1 FROM public.whatsapp_conversations WHERE id = m.conversation_id);

-- If any orphaned records are found, you may need to:
-- 1. Import missing parent records
-- 2. Or delete the orphaned records

-- ============================================
-- POST-IMPORT: Update customer metrics
-- ============================================
-- Recalculate customer statistics

UPDATE public.customers c
SET 
    total_bookings = (
        SELECT COUNT(*) 
        FROM public.bookings b 
        WHERE b.user_id = c.user_id
    ),
    total_spent = (
        SELECT COALESCE(SUM(price), 0) 
        FROM public.bookings b 
        WHERE b.user_id = c.user_id 
          AND b.status = 'completed'
    ),
    last_booking_date = (
        SELECT MAX(booking_date) 
        FROM public.bookings b 
        WHERE b.user_id = c.user_id
    );

UPDATE public.customers
SET 
    average_booking_value = CASE 
        WHEN total_bookings > 0 THEN total_spent / total_bookings 
        ELSE 0 
    END,
    lifetime_value = total_spent;

-- ============================================
-- POST-IMPORT: Update pilot metrics
-- ============================================
-- Recalculate pilot statistics

UPDATE public.pilots p
SET 
    total_reviews = (
        SELECT COUNT(*) 
        FROM public.reviews r 
        WHERE r.pilot_id = p.id
    ),
    average_rating = (
        SELECT COALESCE(AVG(pilot_rating), 0) 
        FROM public.reviews r 
        WHERE r.pilot_id = p.id 
          AND r.status = 'approved'
    );

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
SELECT 'Data import completed! Please run MIGRATION_4_VERIFY.sql to verify the migration.' as message;
