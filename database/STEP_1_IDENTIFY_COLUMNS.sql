-- ============================================
-- STEP 1: IDENTIFY EXACT COLUMNS IN YOUR VPS BOOKINGS TABLE
-- ============================================
-- Run this FIRST to see what columns you actually have

SELECT
    column_name,
    data_type,
    CASE 
        WHEN numeric_precision IS NOT NULL AND numeric_scale IS NOT NULL 
        THEN data_type || '(' || numeric_precision || ',' || numeric_scale || ')'
        ELSE data_type
    END as full_type,
    CASE 
        WHEN data_type = 'bigint' THEN '⚠️ PROBLEM - Cannot accept decimals like "100.00"'
        WHEN data_type LIKE 'numeric%' OR data_type LIKE 'decimal%' THEN '✅ OK - Can accept decimals'
        ELSE '✓ OK'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
ORDER BY ordinal_position;

-- INSTRUCTIONS:
-- 1. Run this query on your VPS
-- 2. Look for ANY columns marked with ⚠️ PROBLEM
-- 3. Copy the column names that have ⚠️
-- 4. Then run STEP_2_FIX_ONLY_EXISTING_COLUMNS.sql with those column names
