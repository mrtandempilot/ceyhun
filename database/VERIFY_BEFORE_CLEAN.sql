-- =====================================================
-- VERIFICATION BEFORE CLEANUP
-- =====================================================
-- Run this FIRST to see what will be deleted
-- =====================================================

-- Check current admin user
SELECT 
  'ADMIN USER TO KEEP' as info,
  email,
  id,
  created_at
FROM auth.users
WHERE email = 'mrtandempilot@gmail.com';

-- Check all users that WILL BE DELETED
SELECT 
  'USERS TO BE DELETED' as info,
  email,
  id,
  created_at
FROM auth.users
WHERE email != 'mrtandempilot@gmail.com';

-- Count of data that will be deleted
SELECT 
  'Bookings to delete' as item,
  COUNT(*) as count
FROM bookings
UNION ALL
SELECT 
  'Customers to delete',
  COUNT(*)
FROM customers
UNION ALL
SELECT 
  'Invoices to delete',
  COUNT(*)
FROM invoices
UNION ALL
SELECT 
  'Conversations to delete',
  COUNT(*)
FROM conversations
UNION ALL
SELECT 
  'Users to delete (excluding admin)',
  COUNT(*)
FROM auth.users
WHERE email != 'mrtandempilot@gmail.com';

-- =====================================================
-- REVIEW THE RESULTS ABOVE BEFORE PROCEEDING
-- =====================================================
-- If everything looks correct:
-- 1. The admin user shows up in the first result
-- 2. You're okay with deleting the data shown above
-- 3. Then run: CLEAN_ALL_DATA_KEEP_ADMIN.sql
-- =====================================================
