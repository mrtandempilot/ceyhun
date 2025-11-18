-- ============================================
-- INSERT TEST BOOKINGS FOR N8N WORKFLOW TESTING
-- ============================================
-- This script creates test bookings for tomorrow's date
-- so your n8n Pre-Flight Reminders workflow will return data

-- Clean up existing test bookings (optional)
-- DELETE FROM public.bookings WHERE customer_name LIKE 'Test Customer%';

-- ============================================
-- TEST BOOKINGS FOR TOMORROW
-- ============================================

-- Booking #1: Confirmed booking for tomorrow at 10:00 AM
INSERT INTO public.bookings (
    customer_name,
    customer_email,
    customer_phone,
    tour_name,
    booking_date,
    tour_start_time,
    adults,
    children,
    hotel_name,
    channel,
    status,
    price,
    created_at
) VALUES (
    'Test Customer 1',
    'test1@example.com',
    '+905551234567',
    'Classic Tandem Flight',
    CURRENT_DATE + INTERVAL '1 day',  -- Tomorrow's date
    '10:00',
    2,
    0,
    'Grand Hotel Fethiye',
    'website',
    'confirmed',
    150.00,
    NOW()
);

-- Booking #2: Confirmed booking for tomorrow at 2:00 PM with children
INSERT INTO public.bookings (
    customer_name,
    customer_email,
    customer_phone,
    tour_name,
    booking_date,
    tour_start_time,
    adults,
    children,
    hotel_name,
    channel,
    status,
    price,
    created_at
) VALUES (
    'Test Customer 2',
    'test2@example.com',
    '+905559876543',
    'Sunset Flight',
    CURRENT_DATE + INTERVAL '1 day',  -- Tomorrow's date
    '14:00',
    2,
    1,
    'Ölüdeniz Resort',
    'whatsapp',
    'confirmed',
    225.00,
    NOW()
);

-- Booking #3: Confirmed booking for tomorrow at 9:00 AM - No hotel pickup
INSERT INTO public.bookings (
    customer_name,
    customer_email,
    customer_phone,
    tour_name,
    booking_date,
    tour_start_time,
    adults,
    children,
    hotel_name,
    channel,
    status,
    price,
    created_at
) VALUES (
    'Test Customer 3',
    'test3@example.com',
    '+905554567890',
    'Morning Flight',
    CURRENT_DATE + INTERVAL '1 day',  -- Tomorrow's date
    '09:00',
    1,
    0,
    NULL,  -- Meeting at office
    'website',
    'confirmed',
    75.00,
    NOW()
);

-- ============================================
-- OPTIONAL: Test booking with assigned pilot
-- (Requires pilots table to exist with a pilot)
-- ============================================

-- First, create a test pilot if pilots table exists
INSERT INTO public.pilots (
    first_name,
    last_name,
    email,
    phone,
    license_number,
    license_type,
    license_expiry,
    status,
    years_experience,
    total_flights,
    average_rating
) VALUES (
    'Ahmet',
    'Yılmaz',
    'ahmet@skywalkers.com',
    '+905551111111',
    'TR-PILOT-2024-001',
    'Tandem Instructor',
    '2027-12-31',
    'active',
    8,
    1250,
    4.8
)
ON CONFLICT (email) DO NOTHING;

-- Now create a booking (pilot assignment columns removed - they don't exist in your schema)
INSERT INTO public.bookings (
    customer_name,
    customer_email,
    customer_phone,
    tour_name,
    booking_date,
    tour_start_time,
    adults,
    children,
    hotel_name,
    channel,
    status,
    price,
    created_at
) VALUES (
    'Test Customer 4',
    'test4@example.com',
    '+905552345678',
    'Premium Flight Package',
    CURRENT_DATE + INTERVAL '1 day',  -- Tomorrow's date
    '11:30',
    2,
    0,
    'Lykia World Hotel',
    'website',
    'confirmed',
    180.00,
    NOW()
);

-- ============================================
-- VERIFY THE DATA
-- ============================================

-- Check all tomorrow's confirmed bookings
SELECT 
    id,
    customer_name,
    customer_email,
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
ORDER BY tour_start_time;

-- ============================================
-- CLEANUP (Run this to remove test data)
-- ============================================
-- Uncomment the lines below to delete test bookings

-- DELETE FROM public.bookings 
-- WHERE customer_email LIKE 'test%@example.com';

-- DELETE FROM public.pilots
-- WHERE email = 'ahmet@skywalkers.com';
