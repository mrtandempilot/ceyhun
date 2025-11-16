-- Automatic Calendar Sync Trigger for Supabase
-- This will automatically sync new bookings to Google Calendar

-- Step 1: Create a function that calls our sync API
CREATE OR REPLACE FUNCTION sync_booking_to_calendar()
RETURNS TRIGGER AS $$
DECLARE
  response_status INTEGER;
BEGIN
  -- Only sync if google_calendar_event_id is NULL (new booking without calendar event)
  IF NEW.google_calendar_event_id IS NULL THEN
    -- Call the calendar sync API endpoint
    -- Note: Replace 'YOUR_VERCEL_URL' with your actual deployed URL
    PERFORM net.http_post(
      url := 'YOUR_VERCEL_URL/api/calendar/sync',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := '{}'::jsonb
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create trigger that fires after INSERT on bookings table
DROP TRIGGER IF EXISTS auto_sync_calendar ON bookings;

CREATE TRIGGER auto_sync_calendar
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION sync_booking_to_calendar();

-- Note: Make sure the 'pg_net' extension is enabled in Supabase
-- Go to: Database > Extensions > Enable 'pg_net'
