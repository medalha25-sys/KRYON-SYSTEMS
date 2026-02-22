-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR

-- 1. Super Admin Logs
CREATE TABLE IF NOT EXISTS public.super_admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL, -- 'organization', 'user', 'subscription', 'system'
    target_id TEXT, 
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    ip_address TEXT
);

-- 2. Impersonation Logs
CREATE TABLE IF NOT EXISTS public.impersonation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id),
    target_user_id UUID REFERENCES auth.users(id),
    started_at TIMESTAMPTZ DEFAULT now(),
    ended_at TIMESTAMPTZ,
    reason TEXT,
    session_metadata JSONB 
);

-- 3. Update Profiles for Super Admin Flag
-- Add column if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_super_admin') THEN 
        ALTER TABLE public.profiles ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE; 
    END IF; 
END $$;

-- 4. Update Organizations for Admin Control
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='manual_status') THEN 
        ALTER TABLE public.organizations ADD COLUMN manual_status TEXT DEFAULT 'active'; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='manual_plan_override') THEN 
        ALTER TABLE public.organizations ADD COLUMN manual_plan_override TEXT; 
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='admin_notes') THEN 
        ALTER TABLE public.organizations ADD COLUMN admin_notes TEXT; 
    END IF;
END $$;

-- 5. Enable RLS
ALTER TABLE public.super_admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impersonation_logs ENABLE ROW LEVEL SECURITY;

-- 6. Policies (Drop first to avoid errors on rerun)
DROP POLICY IF EXISTS "Super Admins can view logs" ON public.super_admin_logs;
CREATE POLICY "Super Admins can view logs" ON public.super_admin_logs
FOR SELECT USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

DROP POLICY IF EXISTS "Super Admins can view impersonation logs" ON public.impersonation_logs;
CREATE POLICY "Super Admins can view impersonation logs" ON public.impersonation_logs
FOR SELECT USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

DROP POLICY IF EXISTS "Super Admins can insert logs" ON public.super_admin_logs;
CREATE POLICY "Super Admins can insert logs" ON public.super_admin_logs
FOR INSERT WITH CHECK (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

-- 7. Grant Super Admin to specific user (medalha25)
UPDATE public.profiles 
SET is_super_admin = TRUE 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'medalha25@gmail.com');
