-- Update pilots table with new columns for Auto-Dispatch
ALTER TABLE public.pilots 
ADD COLUMN IF NOT EXISTS weight_limit_min INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS weight_limit_max INTEGER DEFAULT 120,
ADD COLUMN IF NOT EXISTS daily_flight_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '["tandem"]';

-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    pilot_id UUID REFERENCES public.pilots(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('assigned', 'accepted', 'completed', 'cancelled')) DEFAULT 'assigned',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for assignments
CREATE POLICY "Admins can view all assignments" ON public.assignments
    FOR SELECT USING (true); -- Adjust based on actual admin logic if needed

CREATE POLICY "Admins can insert assignments" ON public.assignments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update assignments" ON public.assignments
    FOR UPDATE USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_assignments_booking_id ON public.assignments(booking_id);
CREATE INDEX IF NOT EXISTS idx_assignments_pilot_id ON public.assignments(pilot_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.assignments(status);
