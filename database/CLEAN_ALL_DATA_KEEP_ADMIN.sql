-- =====================================================
-- CLEAN ALL CUSTOMER DATA - KEEP ADMIN ONLY
-- =====================================================
-- This script deletes ALL customer data but keeps admin user
-- Admin email: mrtandempilot@gmail.com
-- ⚠️ WARNING: This will permanently delete all customer data!
-- =====================================================

-- Step 1: Delete all bookings
DELETE FROM bookings;

-- Step 2: Delete all customers
DELETE FROM customers;

-- Step 3: Delete all invoices
DELETE FROM invoices;

-- Step 4: Delete all conversations (WhatsApp/Email)
DELETE FROM conversations;

-- Step 5: Delete all incoming emails
DELETE FROM incoming_emails;

-- Step 6: Delete all pilots EXCEPT those associated with admin
-- (Skip if you want to keep pilot data)
-- DELETE FROM pilots WHERE user_id != (SELECT id FROM auth.users WHERE email = 'mrtandempilot@gmail.com');

-- Step 7: Delete all expenses (optional)
-- DELETE FROM expenses;

-- Step 8: Delete all non-admin users from auth.users
-- ⚠️ BE CAREFUL: This deletes user accounts
DELETE FROM auth.users 
WHERE email != 'mrtandempilot@gmail.com';

-- Step 9: Reset auto-increment sequences
ALTER SEQUENCE IF EXISTS bookings_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS customers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS invoices_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS conversations_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS incoming_emails_id_seq RESTART WITH 1;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check remaining data
SELECT 
  'Bookings' as table_name,
  COUNT(*) as count
FROM bookings
UNION ALL
SELECT 
  'Customers',
  COUNT(*)
FROM customers
UNION ALL
SELECT 
  'Invoices',
  COUNT(*)
FROM invoices
UNION ALL
SELECT 
  'Conversations',
  COUNT(*)
FROM conversations
UNION ALL
SELECT 
  'Users (should be 1 - admin)',
  COUNT(*)
FROM auth.users;

-- Verify admin user still exists
SELECT 
  email,
  created_at,
  'Admin user still exists ✅' as status
FROM auth.users
WHERE email = 'mrtandempilot@gmail.com';

-- =====================================================
-- NOTES
-- =====================================================
-- After running this script:
-- 1. All customer bookings deleted
-- 2. All customer accounts deleted
-- 3. All invoices deleted
-- 4. All conversations deleted
-- 5. Admin user (mrtandempilot@gmail.com) preserved
-- 6. ID counters reset to 1
-- 7. Ready for fresh production data
-- =====================================================
