-- ============================================
-- ADD SAMPLE PILOT DATA
-- Run this in Supabase SQL Editor
-- ============================================

-- Insert a sample pilot (if pilots table is empty)
INSERT INTO public.pilots (first_name, last_name, email, phone, license_number, license_type, license_expiry, years_experience, status)
VALUES
  ('John', 'Smith', 'john@skywalkers.com', '+90 555 123 4567', 'PG-12345', 'PPL', '2025-12-31', 5, 'active'),
  ('Ahmet', 'Yılmaz', 'ahmet@skywalkers.com', '+90 555 234 5678', 'PG-23456', 'CPL', '2026-06-15', 8, 'active'),
  ('Sarah', 'Johnson', 'sarah@skywalkers.com', '+90 555 345 6789', 'PG-34567', 'PPL', '2024-08-20', 3, 'active')
ON CONFLICT (email) DO NOTHING;

-- Verify pilots were added
SELECT id, first_name, last_name, email, status FROM public.pilots;

-- ============================================
-- COMPLETE!
-- ============================================
