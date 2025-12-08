-- ============================================
-- TEST 3: Verify the fix worked
-- ============================================
-- Run this after applying Test 2 to verify everything is working

-- 1. Check the column type was changed
SELECT
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN data_type = 'bigint' THEN '❌ Still BIGINT'
        WHEN data_type LIKE 'numeric%' OR data_type LIKE 'decimal%' THEN '✅ Fixed - Can store decimals'
        ELSE data_type
    END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
  AND column_name IN ('price', 'total_amount', 'deposit', 'passenger_weight')
ORDER BY column_name;

-- 2. Try inserting a test row with decimal values
INSERT INTO public.bookings (
    customer_name,
    customer_email,
    customer_phone,
    booking_date,
    booking_time,
    tour_type,
    number_of_guests,
    price,
    status
) VALUES (
    'Test Customer',
    'test@example.com',
    '+1234567890',
    CURRENT_DATE + INTERVAL '1 day',
    '10:00',
    'Tandem Flight',
    1,
    840.00, -- This should work now!
    'pending'
);

-- 3. Verify the test data was inserted
SELECT 
    id,
    customer_name,
    price,
    status,
    created_at
FROM public.bookings
WHERE customer_name = 'Test Customer'
ORDER BY created_at DESC
LIMIT 1;

-- 4. Clean up test data (optional)
-- DELETE FROM public.bookings WHERE customer_name = 'Test Customer';
