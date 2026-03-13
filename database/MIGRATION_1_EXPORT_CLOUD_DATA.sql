-- ============================================
-- MIGRATION STEP 1: EXPORT DATA FROM SUPABASE CLOUD
-- ============================================
-- Run this script on your SUPABASE CLOUD instance
-- Copy the output and save it as a .sql file
-- This will generate INSERT statements for all your data
-- ============================================

-- First, let's identify all tables in your database
SELECT 
    'Table: ' || table_name || ' (Rows: ' || (
        SELECT COUNT(*) 
        FROM information_schema.tables t2 
        WHERE t2.table_name = t1.table_name 
        AND t2.table_schema = 'public'
    )::text || ')'
FROM information_schema.tables t1
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- EXPORT BOOKINGS TABLE
-- ============================================
SELECT 
    'INSERT INTO public.bookings (' ||
    string_agg(column_name, ', ' ORDER BY ordinal_position) ||
    ') VALUES' AS export_header
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'bookings';

-- Generate INSERT statements for bookings
SELECT 
    '(' ||
    string_agg(
        CASE 
            WHEN data_type IN ('text', 'character varying', 'uuid') THEN 
                COALESCE('''' || REPLACE(column_value, '''', '''''') || '''', 'NULL')
            WHEN data_type IN ('timestamp with time zone', 'timestamp without time zone', 'date') THEN
                COALESCE('''' || column_value || '''::' || data_type, 'NULL')
            WHEN data_type IN ('boolean') THEN
                COALESCE(column_value, 'NULL')
            WHEN data_type IN ('jsonb', 'json') THEN
                COALESCE('''' || REPLACE(column_value, '''', '''''') || '''::jsonb', 'NULL')
            WHEN data_type LIKE 'ARRAY%' OR data_type LIKE '%[]' THEN
                COALESCE('''' || column_value || '''::' || data_type, 'NULL')
            ELSE 
                COALESCE(column_value, 'NULL')
        END,
        ', '
    ) || '),'
FROM (
    SELECT 
        b.id,
        c.column_name,
        c.data_type,
        c.ordinal_position,
        CASE 
            WHEN c.column_name = 'id' THEN b.id::text
            WHEN c.column_name = 'user_id' THEN b.user_id::text
            WHEN c.column_name = 'tour_name' THEN b.tour_name
            WHEN c.column_name = 'customer_name' THEN b.customer_name
            WHEN c.column_name = 'customer_email' THEN b.customer_email
            WHEN c.column_name = 'customer_phone' THEN b.customer_phone
            WHEN c.column_name = 'booking_date' THEN b.booking_date::text
            WHEN c.column_name = 'booking_time' THEN b.booking_time::text
            WHEN c.column_name = 'number_of_guests' THEN b.number_of_guests::text
            WHEN c.column_name = 'status' THEN b.status
            WHEN c.column_name = 'price' THEN b.price::text
            WHEN c.column_name = 'notes' THEN b.notes
            WHEN c.column_name = 'created_at' THEN b.created_at::text
            WHEN c.column_name = 'updated_at' THEN b.updated_at::text
            WHEN c.column_name = 'duration' THEN b.duration::text
            WHEN c.column_name = 'google_calendar_event_id' THEN b.google_calendar_event_id
        END as column_value
    FROM public.bookings b
    CROSS JOIN information_schema.columns c
    WHERE c.table_schema = 'public' 
      AND c.table_name = 'bookings'
) subq
GROUP BY id
ORDER BY id;

-- ============================================
-- SIMPLIFIED APPROACH: Use COPY command
-- ============================================
-- This is a better approach - export each table to CSV
-- Then you can import using COPY on the VPS

-- For each table, run this command in psql or Supabase SQL Editor:
-- Note: You may need to use the Supabase CLI or API for this

-- Example for bookings:
\COPY (SELECT * FROM public.bookings) TO 'bookings.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.customers) TO 'customers.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.pilots) TO 'pilots.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.tour_packages) TO 'tour_packages.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.communications) TO 'communications.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.customer_interactions) TO 'customer_interactions.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.reviews) TO 'reviews.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.whatsapp_conversations) TO 'whatsapp_conversations.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.whatsapp_messages) TO 'whatsapp_messages.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.telegram_conversations) TO 'telegram_conversations.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.telegram_messages) TO 'telegram_messages.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.instagram_conversations) TO 'instagram_conversations.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.instagram_messages) TO 'instagram_messages.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.chatbot_conversations) TO 'chatbot_conversations.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.conversations) TO 'conversations.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.contact_submissions) TO 'contact_submissions.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.incoming_emails) TO 'incoming_emails.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.expenses) TO 'expenses.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.blog_posts) TO 'blog_posts.csv' WITH CSV HEADER;
\COPY (SELECT * FROM public.blog_categories) TO 'blog_categories.csv' WITH CSV HEADER;

-- ============================================
-- ALTERNATIVE: Generate INSERT statements
-- ============================================
-- If COPY doesn't work, use this to generate INSERT statements
-- Run each query and save the output

-- List all tables first
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- For each table, you'll need to manually create INSERT statements
-- Or use a tool like pg_dump (if you have access to the database server)

-- ============================================
-- RECOMMENDED APPROACH FOR SUPABASE FREE TIER
-- ============================================
-- Since you're on free tier and can't use pg_dump directly:
-- 1. Use Supabase Dashboard to export each table as CSV
-- 2. Or use the Supabase API to fetch all data
-- 3. Or run SELECT queries and manually save results

-- Example: Get all data from a table
SELECT * FROM public.bookings;
SELECT * FROM public.customers;
SELECT * FROM public.pilots;
-- etc...

-- Save each result as CSV from the Supabase dashboard
