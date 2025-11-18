-- =====================================================
-- CLEAN ALL BOOKINGS - START FRESH WITH REAL DATA
-- =====================================================
-- This script will delete ALL bookings from your database
-- Run this in Supabase SQL Editor to start fresh
-- ⚠️ WARNING: This will permanently delete all booking data!
-- =====================================================

-- Step 1: Delete all bookings
DELETE FROM bookings;

-- Step 2: Verify deletion
SELECT COUNT(*) as remaining_bookings FROM bookings;

-- Step 3: Reset the auto-increment ID (optional)
-- This will reset the ID counter back to 1
ALTER SEQUENCE IF EXISTS bookings_id_seq RESTART WITH 1;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if bookings table is empty
SELECT 
  'Bookings cleaned successfully!' as message,
  COUNT(*) as total_bookings 
FROM bookings;

-- Check table structure is still intact
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- =====================================================
-- NOTES
-- =====================================================
-- After running this script:
-- 1. All test/old bookings will be deleted
-- 2. The table structure remains intact
-- 3. You can now add real bookings
-- 4. The ID counter will start from 1 for new bookings
-- =====================================================
