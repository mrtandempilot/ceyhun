-- ============================================
-- TEST 2: Fix by changing column type
-- ============================================
-- Run this AFTER you've identified the problematic column in Test 1
-- Replace 'COLUMN_NAME' with the actual column name

-- EXAMPLE 1: If the column is 'price'
ALTER TABLE public.bookings 
ALTER COLUMN price TYPE numeric(10,2);

-- EXAMPLE 2: If the column is 'total_amount'
-- ALTER TABLE public.bookings 
-- ALTER COLUMN total_amount TYPE numeric(10,2);

-- EXAMPLE 3: If the column is 'deposit'
-- ALTER TABLE public.bookings 
-- ALTER COLUMN deposit TYPE numeric(10,2);

-- EXAMPLE 4: If the column is 'passenger_weight'
-- ALTER TABLE public.bookings 
-- ALTER COLUMN passenger_weight TYPE numeric(5,2);

-- Verify the change
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
  AND column_name = 'price' -- Change this to your column name
ORDER BY ordinal_position;
