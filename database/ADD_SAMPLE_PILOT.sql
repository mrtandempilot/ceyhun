-- ============================================
-- ADD SAMPLE PILOT DATA
-- Run this in Supabase SQL Editor
-- ============================================

-- Insert a sample pilot (if pilots table is empty)
INSERT INTO public.pilots (name, email, phone, license_number, experience_years, status)
VALUES 
  ('John Smith', 'john@skywalkers.com', '+90 555 123 4567', 'PG-12345', 5, 'active'),
  ('Ahmet Yılmaz', 'ahmet@skywalkers.com', '+90 555 234 5678', 'PG-23456', 8, 'active'),
  ('Sarah Johnson', 'sarah@skywalkers.com', '+90 555 345 6789', 'PG-34567', 3, 'active')
ON CONFLICT (email) DO NOTHING;

-- Verify pilots were added
SELECT id, name, email, status FROM public.pilots;

-- ============================================
-- COMPLETE!
-- ============================================
