-- ============================================
-- SYNC SCHEMA: Supabase Cloud → VPS Server
-- ============================================
-- This ensures your VPS server has the same column types as Supabase Cloud
-- Run this on your VPS Supabase instance BEFORE importing CSV data

-- Step 1: Check current schema on VPS
SELECT
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
ORDER BY ordinal_position;

-- Step 2: Update VPS schema to match Cloud version
-- These are the correct types based on your supabase-bookings-table.sql

-- Fix price column (should be DECIMAL/NUMERIC, not BIGINT)
ALTER TABLE public.bookings 
ALTER COLUMN price TYPE numeric(10,2);

-- Fix any other numeric columns that might be bigint
-- Uncomment if these columns exist and are causing issues:

-- ALTER TABLE public.bookings 
-- ALTER COLUMN total_amount TYPE numeric(10,2);

-- ALTER TABLE public.bookings 
-- ALTER COLUMN deposit TYPE numeric(10,2);

-- ALTER TABLE public.bookings 
-- ALTER COLUMN discount TYPE numeric(10,2);

-- ALTER TABLE public.bookings 
-- ALTER COLUMN passenger_weight TYPE numeric(5,2);

-- Step 3: Verify the schema is now correct
SELECT
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'bigint' AND column_name LIKE '%price%' THEN '❌ Wrong type for money'
        WHEN data_type = 'bigint' AND column_name LIKE '%amount%' THEN '❌ Wrong type for money'
        WHEN data_type = 'bigint' AND column_name LIKE '%total%' THEN '❌ Wrong type for money'
        WHEN data_type LIKE 'numeric%' OR data_type LIKE 'decimal%' THEN '✅ Correct'
        ELSE '✓ OK'
    END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
ORDER BY ordinal_position;
