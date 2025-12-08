-- ============================================
-- FIX REMAINING BIGINT COLUMNS (except price which is already fixed)
-- ============================================
-- Run this on your VPS to fix other columns that might contain decimals

-- Try to fix common columns one by one
-- If a column doesn't exist, you'll get an error - just skip it and try the next one

-- Total/Amount columns
ALTER TABLE public.bookings ALTER COLUMN total_amount TYPE numeric(10,2);
