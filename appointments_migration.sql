-- PLANNER & CALENDAR MIGRATION

-- 1. Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    date DATE NOT NULL,
    location TEXT DEFAULT '',
    is_google_synced BOOLEAN DEFAULT false,
    google_event_id TEXT,
    color TEXT DEFAULT 'indigo',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policiesa
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
CREATE POLICY "Users can view their own appointments" ON public.appointments
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own appointments" ON public.appointments;
CREATE POLICY "Users can create their own appointments" ON public.appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
CREATE POLICY "Users can update their own appointments" ON public.appointments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;
CREATE POLICY "Users can delete their own appointments" ON public.appointments
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Indices for performance
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON public.appointments(user_id, date);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);

-- 5. Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
