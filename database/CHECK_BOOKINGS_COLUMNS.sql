-- ============================================
-- CHECK BOOKINGS TABLE COLUMNS
-- ============================================
-- Run this first to see what columns exist in your bookings table

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
ORDER BY ordinal_position;

-- Check for any references to booking_time in functions/triggers
SELECT
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_definition ILIKE '%booking_time%';

-- Check for any triggers on bookings table
SELECT
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'bookings';

-- Show recent bookings data
SELECT
    id,
    customer_name,
    booking_date,
    status
FROM public.bookings
ORDER BY created_at DESC
LIMIT 5;
