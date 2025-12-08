-- ============================================
-- COMPREHENSIVE FIX - Find and fix ALL bigint columns
-- ============================================
-- Run this on your VPS to see ALL columns and their types

SELECT
    column_name,
    data_type,
    CASE 
        WHEN numeric_precision IS NOT NULL AND numeric_scale IS NOT NULL 
        THEN data_type || '(' || numeric_precision || ',' || numeric_scale || ')'
        WHEN character_maximum_length IS NOT NULL 
        THEN data_type || '(' || character_maximum_length || ')'
        ELSE data_type
    END as full_type,
    CASE 
        WHEN data_type = 'bigint' THEN '⚠️ BIGINT - Will fail on decimals like "100.00"'
        WHEN data_type LIKE 'numeric%' OR data_type LIKE 'decimal%' THEN '✅ Can handle decimals'
        ELSE '✓ OK'
    END as decimal_support
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
ORDER BY ordinal_position;

-- Look at the output above and identify ALL columns marked with ⚠️
-- Common culprits: price, deposit, total_amount, discount, passenger_weight, etc.
