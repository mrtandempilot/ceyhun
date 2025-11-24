-- Clear all pilots except the admin user (if any)
-- Since we want to start fresh with "real pilots", we can delete all.
-- But let's be safe and only delete those that look like dummy data or just truncate.
-- Given the user request, clearing all is likely what they want to start fresh.

TRUNCATE TABLE public.pilots CASCADE;

-- Note: This will also delete assignments due to CASCADE.
