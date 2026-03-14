-- Add location, coords, and global_role to profiles table
DO $$ 
BEGIN
    -- Add location
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE public.profiles ADD COLUMN location TEXT;
    END IF;

    -- Add coords
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'coords') THEN
        ALTER TABLE public.profiles ADD COLUMN coords JSONB;
    END IF;

    -- Add global_role
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'global_role') THEN
        ALTER TABLE public.profiles ADD COLUMN global_role TEXT DEFAULT 'User';
    END IF;

END $$;
