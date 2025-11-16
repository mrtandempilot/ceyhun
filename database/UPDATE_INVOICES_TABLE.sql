-- ============================================
-- UPDATE INVOICES TABLE FOR PARAGLIDING BUSINESS
-- Add paragliding-specific fields
-- ============================================

-- Add new columns to invoices table
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS pilot_id UUID REFERENCES public.pilots(id),
ADD COLUMN IF NOT EXISTS pilot_name TEXT,
ADD COLUMN IF NOT EXISTS flight_date DATE,
ADD COLUMN IF NOT EXISTS flight_time TIME,
ADD COLUMN IF NOT EXISTS flight_duration_minutes INTEGER,
ADD COLUMN IF NOT EXISTS tour_type TEXT CHECK (tour_type IN ('Solo', 'Tandem', 'VIP')),
ADD COLUMN IF NOT EXISTS payment_method_detail TEXT,
ADD COLUMN IF NOT EXISTS qr_code_data TEXT,
ADD COLUMN IF NOT EXISTS customer_signature TEXT, -- base64 image data
ADD COLUMN IF NOT EXISTS invoice_language TEXT DEFAULT 'en' CHECK (invoice_language IN ('tr', 'en')),
ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_pilot ON public.invoices(pilot_id);
CREATE INDEX IF NOT EXISTS idx_invoices_flight_date ON public.invoices(flight_date);
CREATE INDEX IF NOT EXISTS idx_invoices_tour_type ON public.invoices(tour_type);

-- Update existing invoices to have default values
UPDATE public.invoices
SET invoice_language = 'en'
WHERE invoice_language IS NULL;

COMMENT ON COLUMN public.invoices.pilot_id IS 'Reference to pilot who conducted the flight';
COMMENT ON COLUMN public.invoices.pilot_name IS 'Cached pilot name for display';
COMMENT ON COLUMN public.invoices.flight_date IS 'Date of the flight';
COMMENT ON COLUMN public.invoices.flight_time IS 'Time of the flight';
COMMENT ON COLUMN public.invoices.flight_duration_minutes IS 'Flight duration in minutes';
COMMENT ON COLUMN public.invoices.tour_type IS 'Type of tour: Solo, Tandem, or VIP';
COMMENT ON COLUMN public.invoices.payment_method_detail IS 'Detailed payment method information';
COMMENT ON COLUMN public.invoices.qr_code_data IS 'QR code data (payment link or verification)';
COMMENT ON COLUMN public.invoices.customer_signature IS 'Base64 encoded customer signature image';
COMMENT ON COLUMN public.invoices.invoice_language IS 'Invoice language: tr (Turkish) or en (English)';
COMMENT ON COLUMN public.invoices.company_logo_url IS 'URL or base64 data for company logo';

-- ============================================
-- COMPLETE!
-- ============================================
