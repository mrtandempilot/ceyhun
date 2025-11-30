-- ============================================
-- FIX: Column "booking_time" Error
-- ============================================
-- If your database still has an old "booking_time" column,
-- run this to ensure proper column naming

-- Check if booking_time column exists and needs to be renamed
DO $$
DECLARE
    column_exists boolean;
BEGIN
    -- Check if booking_time column exists
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'bookings'
        AND column_name = 'booking_time'
    ) INTO column_exists;

    IF column_exists THEN
        -- Rename booking_time to tour_start_time
        ALTER TABLE public.bookings RENAME COLUMN booking_time TO tour_start_time;

        -- Make sure tour_start_time is TEXT type (not TIME)
        ALTER TABLE public.bookings ALTER COLUMN tour_start_time TYPE TEXT;

        RAISE NOTICE 'Renamed booking_time column to tour_start_time';
    ELSE
        RAISE NOTICE 'booking_time column does not exist - no changes needed';
    END IF;
END $$;

-- Ensure tour_start_time column exists with correct type
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS tour_start_time TEXT;

-- Update any NULL values in tour_start_time to a default time
UPDATE public.bookings
SET tour_start_time = '09:00'
WHERE tour_start_time IS NULL;

-- Check the current structure
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'bookings'
  AND column_name IN ('booking_date', 'tour_start_time', 'booking_time')
ORDER BY ordinal_position;

-- Check for any views/triggers that might reference booking_time
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (routine_definition ILIKE '%booking_time%' OR routine_name ILIKE '%booking_time%');

-- Show current data to verify
SELECT
    id,
    customer_name,
    booking_date,
    tour_start_time,
    status
FROM public.bookings
WHERE booking_date >= CURRENT_DATE - INTERVAL '1 day'
ORDER BY booking_date DESC, tour_start_time ASC
LIMIT 10;
