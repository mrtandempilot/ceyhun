-- ============================================
-- TEST 1: Identify all BIGINT columns in bookings table
-- ============================================
-- This will show us which columns are defined as bigint
-- and might be causing the import error

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN data_type = 'bigint' THEN '⚠️ BIGINT - Cannot store decimals'
        WHEN data_type LIKE 'numeric%' OR data_type LIKE 'decimal%' THEN '✅ Can store decimals'
        WHEN data_type IN ('real', 'double precision') THEN '✅ Can store decimals'
        ELSE '❓ Other type'
    END as decimal_support
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
ORDER BY ordinal_position;

-- Show a sample of existing data to see what values are currently stored
SELECT *
FROM public.bookings
LIMIT 3;
