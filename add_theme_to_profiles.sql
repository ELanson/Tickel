-- Add theme column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme text DEFAULT 'Kuro';

-- Update handle_new_user to include theme if needed (or just let default handle it)
-- Since it has a default, existing rows will be 'Kuro'.
