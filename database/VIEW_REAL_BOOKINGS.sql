-- ============================================
-- VIEW REAL BOOKINGS FROM SUPABASE
-- ============================================
-- Run these queries in Supabase SQL Editor to see your actual booking data

-- ============================================
-- 1. VIEW ALL BOOKINGS (Last 30 days)
-- ============================================
SELECT 
    id,
    customer_name,
    customer_email,
    customer_phone,
    tour_name,
    booking_date,
    tour_start_time,
    adults,
    children,
    hotel_name,
    status,
    channel,
    price,
    created_at
FROM public.bookings
WHERE created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 50;

-- ============================================
-- 2. VIEW UPCOMING BOOKINGS (Future dates only)
-- ============================================
SELECT 
    id,
    customer_name,
    customer_email,
    customer_phone,
    tour_name,
    booking_date,
    tour_start_time,
    adults,
    children,
    hotel_name,
    status,
    channel,
    created_at
FROM public.bookings
WHERE booking_date >= CURRENT_DATE
ORDER BY booking_date ASC, tour_start_time ASC;

-- ============================================
-- 3. VIEW CONFIRMED BOOKINGS ONLY
-- ============================================
SELECT 
    id,
    customer_name,
    customer_email,
    tour_name,
    booking_date,
    tour_start_time,
    status,
    created_at
FROM public.bookings
WHERE status = 'confirmed'
  AND booking_date >= CURRENT_DATE
ORDER BY booking_date ASC;

-- ============================================
-- 4. VIEW TOMORROW'S BOOKINGS (What n8n will fetch)
-- ============================================
SELECT 
    id,
    customer_name,
    customer_email,
    customer_phone,
    tour_name,
    booking_date,
    tour_start_time,
    adults,
    children,
    hotel_name,
    status
FROM public.bookings
WHERE booking_date = CURRENT_DATE + INTERVAL '1 day'
  AND status = 'confirmed'
ORDER BY tour_start_time ASC;

-- ============================================
-- 5. VIEW TODAY'S BOOKINGS
-- ============================================
SELECT 
    id,
    customer_name,
    customer_email,
    customer_phone,
    tour_name,
    booking_date,
    tour_start_time,
    adults,
    children,
    hotel_name,
    status
FROM public.bookings
WHERE booking_date = CURRENT_DATE
ORDER BY tour_start_time ASC;

-- ============================================
-- 6. COUNT BOOKINGS BY STATUS
-- ============================================
SELECT 
    status,
    COUNT(*) as count,
    SUM(price) as total_revenue
FROM public.bookings
WHERE booking_date >= CURRENT_DATE
GROUP BY status
ORDER BY count DESC;

-- ============================================
-- 7. COUNT BOOKINGS BY DATE (Next 7 days)
-- ============================================
SELECT 
    booking_date,
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
FROM public.bookings
WHERE booking_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
GROUP BY booking_date
ORDER BY booking_date ASC;

-- ============================================
-- 8. VIEW ALL COLUMNS OF BOOKINGS TABLE
-- ============================================
SELECT *
FROM public.bookings
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- 9. CHECK TABLE STRUCTURE
-- ============================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
ORDER BY ordinal_position;

-- ============================================
-- 10. COUNT TOTAL BOOKINGS
-- ============================================
SELECT 
    COUNT(*) as total_bookings,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
    MIN(booking_date) as earliest_booking,
    MAX(booking_date) as latest_booking
FROM public.bookings;
