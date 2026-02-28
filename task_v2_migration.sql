DO $$ 
BEGIN
    -- 1. Ensure the tasks table has all required columns in the public schema
    -- Add assignee_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'assignee_id') THEN
        ALTER TABLE public.tasks ADD COLUMN assignee_id UUID REFERENCES public.profiles(id);
    END IF;

    -- Add due_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'due_date') THEN
        ALTER TABLE public.tasks ADD COLUMN due_date TIMESTAMPTZ;
    END IF;

    -- Add start_date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'start_date') THEN
        ALTER TABLE public.tasks ADD COLUMN start_date TIMESTAMPTZ;
    END IF;

    -- Add subtasks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'subtasks') THEN
        ALTER TABLE public.tasks ADD COLUMN subtasks JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add dependencies
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'dependencies') THEN
        ALTER TABLE public.tasks ADD COLUMN dependencies JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add tags
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'tags') THEN
        ALTER TABLE public.tasks ADD COLUMN tags TEXT[] DEFAULT '{}';
    END IF;

    -- Add attachments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'attachments') THEN
        ALTER TABLE public.tasks ADD COLUMN attachments JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add watchers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'watchers') THEN
        ALTER TABLE public.tasks ADD COLUMN watchers UUID[] DEFAULT '{}';
    END IF;

    -- Add repeat_config
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'repeat_config') THEN
        ALTER TABLE public.tasks ADD COLUMN repeat_config JSONB;
    END IF;

    -- Add is_private
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'is_private') THEN
        ALTER TABLE public.tasks ADD COLUMN is_private BOOLEAN DEFAULT false;
    END IF;

    -- Add budget
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'budget') THEN
        ALTER TABLE public.tasks ADD COLUMN budget NUMERIC(10, 2);
    END IF;

    -- Add cost
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'cost') THEN
        ALTER TABLE public.tasks ADD COLUMN cost NUMERIC(10, 2);
    END IF;

    -- Add location
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'location') THEN
        ALTER TABLE public.tasks ADD COLUMN location JSONB;
    END IF;

    -- 2. Update Update Priority Check Constraint
    ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_priority_check;
    ALTER TABLE public.tasks ADD CONSTRAINT tasks_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

END $$;

-- 3. Trigger PostgREST Refresh
COMMENT ON TABLE public.tasks IS 'Task intelligence table v2.1';
