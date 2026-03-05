-- Migration: Global Notifications Table
-- Purpose: Store system-wide broadcasts for real-time synchronization

CREATE TABLE IF NOT EXISTS global_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('success', 'error', 'warning', 'info')),
    title TEXT NOT NULL,
    body TEXT, -- Markdown supported
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE global_notifications;

-- Enable RLS
ALTER TABLE global_notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can view global notifications" 
ON global_notifications FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can broadcast" 
ON global_notifications FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = true
    )
);
