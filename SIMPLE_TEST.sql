-- =====================================================
-- RUN THESE ONE AT A TIME IN SUPABASE
-- =====================================================

-- STEP 1: Create test booking (change phone number to yours!)
-- Copy and run this:

INSERT INTO bookings (customer_name, customer_email, customer_phone, tour_name, booking_date, tour_start_time, adults, children, status, total_amount, channel) 
VALUES ('Test Trigger', 'test@test.com', '+905364616674', 'Ölüdeniz Boat Tour', '2025-11-25', '10:00', 2, 0, 'pending', 100.00, 'manual');


-- =====================================================

-- STEP 2: Get the booking ID
-- Copy and run this:

SELECT id, customer_name, status, ticket_id FROM bookings WHERE customer_name = 'Test Trigger' ORDER BY created_at DESC LIMIT 1;


-- =====================================================
-- COPY THE ID FROM ABOVE RESULT!
-- =====================================================

-- STEP 3: Confirm the booking (REPLACE 'xxx' with actual ID from step 2)
-- Copy and run this AFTER replacing ID:

UPDATE bookings SET status = 'confirmed' WHERE id = 'xxx';


-- =====================================================
-- IMMEDIATELY GO TO N8N AND CHECK EXECUTIONS!
-- https://skywalkers.app.n8n.cloud
-- =====================================================
