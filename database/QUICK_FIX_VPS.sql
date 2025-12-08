-- ============================================
-- QUICK FIX FOR VPS - Run this on your VPS Supabase
-- ============================================
-- This fixes the most common columns that cause "invalid input syntax for type bigint" errors

-- Fix price column
ALTER TABLE public.bookings 
ALTER COLUMN price TYPE numeric(10,2);

-- Fix other common monetary columns (uncomment if they exist in your table)
-- ALTER TABLE public.bookings 
-- ALTER COLUMN total_amount TYPE numeric(10,2);

-- ALTER TABLE public.bookings 
-- ALTER COLUMN deposit TYPE numeric(10,2);

-- ALTER TABLE public.bookings 
-- ALTER COLUMN discount TYPE numeric(10,2);

-- Verify the fix
SELECT
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'bigint' AND (
            column_name LIKE '%price%' OR 
            column_name LIKE '%amount%' OR 
            column_name LIKE '%total%' OR
            column_name LIKE '%deposit%'
        ) THEN '❌ Still needs fixing'
        WHEN data_type LIKE 'numeric%' OR data_type LIKE 'decimal%' THEN '✅ Fixed'
        ELSE '✓ OK'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
ORDER BY ordinal_position;

-- After running this, try importing your CSV again!
