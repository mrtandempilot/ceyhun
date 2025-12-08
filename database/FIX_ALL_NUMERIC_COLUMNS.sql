-- ============================================
-- FIX ALL NUMERIC COLUMNS AT ONCE
-- ============================================
-- Run this on your VPS Supabase to fix ALL columns that might contain decimals

-- Common monetary/numeric columns that should be numeric(10,2) instead of bigint
-- Uncomment the ones that exist in your table (check with FIND_ALL_BIGINT_COLUMNS.sql first)

-- Price-related columns
ALTER TABLE public.bookings ALTER COLUMN price TYPE numeric(10,2);

-- If you have these columns, uncomment them:
-- ALTER TABLE public.bookings ALTER COLUMN total_amount TYPE numeric(10,2);
-- ALTER TABLE public.bookings ALTER COLUMN deposit TYPE numeric(10,2);
-- ALTER TABLE public.bookings ALTER COLUMN discount TYPE numeric(10,2);
-- ALTER TABLE public.bookings ALTER COLUMN discount_amount TYPE numeric(10,2);
-- ALTER TABLE public.bookings ALTER COLUMN subtotal TYPE numeric(10,2);
-- ALTER TABLE public.bookings ALTER COLUMN tax TYPE numeric(10,2);
-- ALTER TABLE public.bookings ALTER COLUMN commission TYPE numeric(10,2);
-- ALTER TABLE public.bookings ALTER COLUMN refund_amount TYPE numeric(10,2);

-- Weight/measurement columns
-- ALTER TABLE public.bookings ALTER COLUMN passenger_weight TYPE numeric(5,2);
-- ALTER TABLE public.bookings ALTER COLUMN baggage_weight TYPE numeric(5,2);

-- Verify all changes
SELECT
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'bigint' THEN '❌ Still BIGINT'
        WHEN data_type LIKE 'numeric%' THEN '✅ Fixed to NUMERIC'
        ELSE '✓ ' || data_type
    END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
ORDER BY ordinal_position;
