-- Create Shuttles Table
CREATE TABLE IF NOT EXISTS public.shuttles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_name TEXT,
    vehicle_plate TEXT,
    capacity INT DEFAULT 14, -- Standard shuttle capacity
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'boarding', 'departed', 'completed', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add shuttle_id to assignments table safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'assignments' AND column_name = 'shuttle_id') THEN
        ALTER TABLE public.assignments ADD COLUMN shuttle_id UUID REFERENCES public.shuttles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable RLS for shuttles
ALTER TABLE public.shuttles ENABLE ROW LEVEL SECURITY;

-- Create policies (drop if exists to avoid errors)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.shuttles;
CREATE POLICY "Enable read access for all users" ON public.shuttles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.shuttles;
CREATE POLICY "Enable insert access for authenticated users" ON public.shuttles FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.shuttles;
CREATE POLICY "Enable update access for authenticated users" ON public.shuttles FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.shuttles;
CREATE POLICY "Enable delete access for authenticated users" ON public.shuttles FOR DELETE USING (auth.role() = 'authenticated');
