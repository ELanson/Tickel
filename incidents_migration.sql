-- System Incidents: Real-time status reporting for Support Hub
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.system_incidents (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT DEFAULT '',
    severity    TEXT NOT NULL DEFAULT 'minor'
                CHECK (severity IN ('minor','major','critical')),
    status      TEXT NOT NULL DEFAULT 'investigating'
                CHECK (status IN ('resolved','investigating','identified')),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.system_incidents ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view incidents" ON public.system_incidents;
CREATE POLICY "Anyone can view incidents" 
    ON public.system_incidents FOR SELECT 
    USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can manage incidents" ON public.system_incidents;
CREATE POLICY "Admins can manage incidents" 
    ON public.system_incidents FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Seed some initial data
INSERT INTO public.system_incidents (title, description, severity, status, created_at, resolved_at)
VALUES 
    ('AI Service elevated latency', 'Yukime AI service experienced 2x normal latency for approximately 18 minutes due to a cold-start issue. Resolved by scaling the inference cluster.', 'minor', 'resolved', '2026-02-20 14:00:00+00', '2026-02-20 14:18:00+00'),
    ('Database connection pool exhaustion', 'A query that wasn''t using connection pooling correctly caused temporary connection errors for ~5 minutes.', 'major', 'resolved', '2026-02-14 09:30:00+00', '2026-02-14 09:35:00+00')
ON CONFLICT DO NOTHING;
