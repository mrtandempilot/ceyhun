-- ============================================
-- MIGRATION STEP 4: VERIFY MIGRATION
-- ============================================
-- Run this script on your VPS SUPABASE instance
-- AFTER importing all data
-- ============================================

-- ============================================
-- PART 1: Check table row counts
-- ============================================

SELECT 
    'bookings' as table_name,
    COUNT(*) as row_count
FROM public.bookings
UNION ALL
SELECT 'customers', COUNT(*) FROM public.customers
UNION ALL
SELECT 'pilots', COUNT(*) FROM public.pilots
UNION ALL
SELECT 'tour_packages', COUNT(*) FROM public.tour_packages
UNION ALL
SELECT 'communications', COUNT(*) FROM public.communications
UNION ALL
SELECT 'customer_interactions', COUNT(*) FROM public.customer_interactions
UNION ALL
SELECT 'reviews', COUNT(*) FROM public.reviews
UNION ALL
SELECT 'whatsapp_conversations', COUNT(*) FROM public.whatsapp_conversations
UNION ALL
SELECT 'whatsapp_messages', COUNT(*) FROM public.whatsapp_messages
UNION ALL
SELECT 'telegram_conversations', COUNT(*) FROM public.telegram_conversations
UNION ALL
SELECT 'telegram_messages', COUNT(*) FROM public.telegram_messages
UNION ALL
SELECT 'instagram_conversations', COUNT(*) FROM public.instagram_conversations
UNION ALL
SELECT 'instagram_messages', COUNT(*) FROM public.instagram_messages
UNION ALL
SELECT 'chatbot_conversations', COUNT(*) FROM public.chatbot_conversations
UNION ALL
SELECT 'conversations', COUNT(*) FROM public.conversations
UNION ALL
SELECT 'contact_submissions', COUNT(*) FROM public.contact_submissions
UNION ALL
SELECT 'incoming_emails', COUNT(*) FROM public.incoming_emails
UNION ALL
SELECT 'expenses', COUNT(*) FROM public.expenses
UNION ALL
SELECT 'blog_categories', COUNT(*) FROM public.blog_categories
UNION ALL
SELECT 'blog_posts', COUNT(*) FROM public.blog_posts
ORDER BY table_name;

-- ============================================
-- PART 2: Verify foreign key integrity
-- ============================================

-- Check communications table
SELECT 
    'communications' as table_name,
    COUNT(*) as total_records,
    COUNT(customer_id) as records_with_customer,
    COUNT(*) FILTER (
        WHERE customer_id IS NOT NULL 
        AND NOT EXISTS (SELECT 1 FROM public.customers WHERE id = customer_id)
    ) as orphaned_records
FROM public.communications;

-- Check reviews table
SELECT 
    'reviews' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (
        WHERE customer_id IS NOT NULL 
        AND NOT EXISTS (SELECT 1 FROM public.customers WHERE id = customer_id)
    ) as orphaned_customer_refs,
    COUNT(*) FILTER (
        WHERE booking_id IS NOT NULL 
        AND NOT EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id)
    ) as orphaned_booking_refs,
    COUNT(*) FILTER (
        WHERE pilot_id IS NOT NULL 
        AND NOT EXISTS (SELECT 1 FROM public.pilots WHERE id = pilot_id)
    ) as orphaned_pilot_refs
FROM public.reviews;

-- Check messaging tables
SELECT 
    'whatsapp_messages' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (
        WHERE NOT EXISTS (SELECT 1 FROM public.whatsapp_conversations WHERE id = conversation_id)
    ) as orphaned_records
FROM public.whatsapp_messages;

SELECT 
    'telegram_messages' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (
        WHERE NOT EXISTS (SELECT 1 FROM public.telegram_conversations WHERE id = conversation_id)
    ) as orphaned_records
FROM public.telegram_messages;

SELECT 
    'instagram_messages' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (
        WHERE NOT EXISTS (SELECT 1 FROM public.instagram_conversations WHERE id = conversation_id)
    ) as orphaned_records
FROM public.instagram_messages;

-- ============================================
-- PART 3: Verify data types
-- ============================================

-- Check for any columns that might have type issues
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
      'bookings', 'customers', 'pilots', 'tour_packages',
      'communications', 'customer_interactions', 'reviews',
      'whatsapp_conversations', 'whatsapp_messages',
      'telegram_conversations', 'telegram_messages',
      'instagram_conversations', 'instagram_messages',
      'chatbot_conversations', 'conversations',
      'contact_submissions', 'incoming_emails', 'expenses',
      'blog_categories', 'blog_posts'
  )
ORDER BY table_name, ordinal_position;

-- ============================================
-- PART 4: Verify indexes
-- ============================================

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================
-- PART 5: Verify RLS policies
-- ============================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- PART 6: Verify triggers
-- ============================================

SELECT 
    event_object_schema,
    event_object_table,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ============================================
-- PART 7: Sample data verification
-- ============================================

-- Check a few sample records from each main table
SELECT 'bookings' as table_name, COUNT(*) as count, 
       MIN(created_at) as earliest, MAX(created_at) as latest
FROM public.bookings;

SELECT 'customers' as table_name, COUNT(*) as count,
       MIN(created_at) as earliest, MAX(created_at) as latest
FROM public.customers;

SELECT 'pilots' as table_name, COUNT(*) as count,
       MIN(created_at) as earliest, MAX(created_at) as latest
FROM public.pilots;

-- ============================================
-- PART 8: Check for NULL values in critical columns
-- ============================================

-- Bookings
SELECT 
    'bookings' as table_name,
    COUNT(*) FILTER (WHERE tour_name IS NULL) as null_tour_name,
    COUNT(*) FILTER (WHERE customer_name IS NULL) as null_customer_name,
    COUNT(*) FILTER (WHERE customer_email IS NULL) as null_customer_email,
    COUNT(*) FILTER (WHERE booking_date IS NULL) as null_booking_date
FROM public.bookings;

-- Customers
SELECT 
    'customers' as table_name,
    COUNT(*) FILTER (WHERE first_name IS NULL) as null_first_name,
    COUNT(*) FILTER (WHERE last_name IS NULL) as null_last_name,
    COUNT(*) FILTER (WHERE email IS NULL) as null_email
FROM public.customers;

-- Pilots
SELECT 
    'pilots' as table_name,
    COUNT(*) FILTER (WHERE first_name IS NULL) as null_first_name,
    COUNT(*) FILTER (WHERE last_name IS NULL) as null_last_name,
    COUNT(*) FILTER (WHERE email IS NULL) as null_email,
    COUNT(*) FILTER (WHERE license_number IS NULL) as null_license
FROM public.pilots;

-- ============================================
-- PART 9: Verify storage buckets
-- ============================================
-- Note: This needs to be checked manually in Supabase Dashboard
-- Go to Storage section and verify these buckets exist:
-- - tour-images
-- - blog-images
-- - Any other custom buckets

SELECT 'VERIFICATION COMPLETE!' as status,
       'Please review the results above and check storage buckets manually in the dashboard.' as next_steps;

-- ============================================
-- COMPARISON CHECKLIST
-- ============================================
-- Compare these counts with your Cloud instance:
-- 
-- [ ] bookings count matches
-- [ ] customers count matches
-- [ ] pilots count matches
-- [ ] tour_packages count matches
-- [ ] communications count matches
-- [ ] customer_interactions count matches
-- [ ] reviews count matches
-- [ ] whatsapp_conversations count matches
-- [ ] whatsapp_messages count matches
-- [ ] telegram_conversations count matches
-- [ ] telegram_messages count matches
-- [ ] instagram_conversations count matches
-- [ ] instagram_messages count matches
-- [ ] chatbot_conversations count matches
-- [ ] conversations count matches
-- [ ] contact_submissions count matches
-- [ ] incoming_emails count matches
-- [ ] expenses count matches
-- [ ] blog_categories count matches
-- [ ] blog_posts count matches
-- [ ] No orphaned foreign key references
-- [ ] All indexes created
-- [ ] All RLS policies in place
-- [ ] All triggers working
-- [ ] Storage buckets migrated
-- [ ] Sample data looks correct
