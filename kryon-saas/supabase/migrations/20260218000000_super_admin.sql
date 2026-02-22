-- Migration: Super Admin & Control Center
-- Description: Adds tables for logging super admin actions and impersonation events. 
-- Adds control fields to organizations and super admin flag to profiles.

-- 1. Super Admin Logs
CREATE TABLE IF NOT EXISTS public.super_admin_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL, -- 'organization', 'user', 'subscription', 'system'
    target_id TEXT, -- UUID mixed with other IDs sometimes, keeping versatile or strictly UUID? Let's use UUID for now but cast if needed. 
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
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- 4. Update Organizations for Admin Control
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS manual_status TEXT DEFAULT 'active', -- 'active', 'suspended', 'archived'
ADD COLUMN IF NOT EXISTS manual_plan_override TEXT, -- 'enterprise', 'custom'
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 5. Enable RLS
ALTER TABLE public.super_admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impersonation_logs ENABLE ROW LEVEL SECURITY;

-- 6. Policies
-- Only Super Admins can VIEW logs
CREATE POLICY "Super Admins can view logs" ON public.super_admin_logs
FOR SELECT USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

CREATE POLICY "Super Admins can view impersonation logs" ON public.impersonation_logs
FOR SELECT USING (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

-- Only Super Admins (or Server Role) can INSERT logs
CREATE POLICY "Super Admins can insert logs" ON public.super_admin_logs
FOR INSERT WITH CHECK (
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = TRUE
);

-- Allow reading super admin status
-- Profiles is usually public-read or self-read. We need to ensure we can read `is_super_admin` for checking permissions.
-- Existing profiles policies usually handle this.

-- 7. Grant access for dashboard (Service Role usually bypasses, but good to have)
