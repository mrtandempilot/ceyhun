-- Disable the automatic calendar sync trigger to fix memory issues
-- The trigger was causing problems because:
-- 1. Booking API already creates calendar events directly
-- 2. The trigger then calls /api/calendar/sync which tries to sync ALL bookings
-- 3. This causes memory overflow and infinite loops

-- Drop the trigger
DROP TRIGGER IF EXISTS auto_sync_calendar ON bookings;

-- Drop the function
DROP FUNCTION IF EXISTS sync_booking_to_calendar();

-- ✅ After running this:
-- - New bookings will still be synced to Google Calendar via the booking API
-- - No more infinite loops or memory issues
-- - You can still manually sync old bookings using /api/calendar/sync if needed
