-- =====================================================
-- CREATE TEST BOOKING TO TEST THE TRIGGER
-- =====================================================

-- Step 1: Create a new booking with status = 'pending'
-- Replace the phone number with YOUR phone to test WhatsApp
INSERT INTO bookings (
  customer_name, 
  customer_email, 
  customer_phone,
  tour_name,
  booking_date,
  tour_start_time,
  adults,
  children,
  status,
  total_amount,
  channel
) VALUES (
  'Test Trigger Customer',
  'test@example.com',
  '+905364616674',  -- REPLACE with your WhatsApp number!
  'Ölüdeniz Boat Tour',  -- tour name
  '2025-11-25',     -- booking date
  '10:00',          -- tour start time
  2,                -- adults
  0,                -- children
  'pending',        -- IMPORTANT: Start as pending!
  100.00,           -- total amount
  'manual'          -- channel
);

-- Step 2: Get the ID of the booking we just created
SELECT 
  id,
  customer_name, 
  customer_phone, 
  status, 
  ticket_id,
  created_at
FROM bookings 
WHERE customer_name = 'Test Trigger Customer'
ORDER BY created_at DESC 
LIMIT 1;

-- =====================================================
-- COPY THE ID FROM ABOVE, THEN RUN STEP 3
-- =====================================================

-- Step 3: Update to confirmed (THIS WILL TRIGGER THE AUTOMATION!)
-- REPLACE 'PASTE_ID_FROM_STEP2' with the actual ID from Step 2
UPDATE bookings 
SET status = 'confirmed' 
WHERE id = 'PASTE_ID_FROM_STEP2';

-- =====================================================
-- IMMEDIATELY AFTER RUNNING STEP 3:
-- 1. Go to: https://skywalkers.app.n8n.cloud
-- 2. Click "Executions"
-- 3. You should see a NEW execution appear!
-- =====================================================

-- Step 4: Check the booking again
SELECT 
  id,
  customer_name, 
  customer_phone, 
  status, 
  ticket_id,  -- Should have a ticket ID now!
  updated_at
FROM bookings 
WHERE customer_name = 'Test Trigger Customer'
ORDER BY created_at DESC 
LIMIT 1;

-- =====================================================
-- EXPECTED RESULTS:
-- ✅ n8n execution should appear immediately
-- ✅ ticket_id should be populated
-- ✅ WhatsApp message should be sent to the phone number
-- =====================================================
