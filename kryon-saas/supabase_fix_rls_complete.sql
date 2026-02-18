-- COMPREHENSIVE RLS FIX
-- Run this entire script in the Supabase SQL Editor to reset policies.

-- 1. Reset organization_members policies
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members view members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view own membership" ON public.organization_members;
DROP POLICY IF EXISTS "Org members view profiles" ON public.organization_members;

-- Simple, safe policy: User can see rows where they are the user
CREATE POLICY "Users can view own membership" ON public.organization_members
    FOR SELECT USING (user_id = auth.uid());

-- 2. Reset organizations policies
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own organizations" ON public.organizations;
DROP POLICY IF EXISTS "Public organizations" ON public.organizations;

-- Policy: User can see organizations they are a member of
-- Using a semi-join that relies on the safe policy above
CREATE POLICY "Users can view own organizations" ON public.organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id 
            FROM public.organization_members 
            WHERE user_id = auth.uid()
        )
    );

-- 3. Reset profiles policies (just in case)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());
