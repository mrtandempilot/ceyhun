-- ============================================
-- COMPARE SCHEMAS: Cloud vs VPS
-- ============================================
-- Run this on BOTH your Cloud and VPS instances to compare

-- This will show you the exact schema differences
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
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
ORDER BY ordinal_position;

-- Save the output from both Cloud and VPS
-- Compare them side-by-side to find differences
