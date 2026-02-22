-- FIX INFINITE RECURSION IN RLS POLICIES
-- This script fixes the "infinite recursion detected in policy" error by using SECURITY DEFINER functions.

-- 1. SAFE ORG ID LOOKUP
-- Runs as 'postgres' (owner) to bypass RLS checks inside the function
CREATE OR REPLACE FUNCTION get_auth_org_id_safe()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$;

-- 2. SAFE SUPER ADMIN CHECK
CREATE OR REPLACE FUNCTION is_super_admin_safe()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(is_super_admin, FALSE) FROM profiles WHERE id = auth.uid();
$$;

-- 3. CLEANUP OLD POLICIES
-- Drop policies on 'profiles' to clear the circular dependency
DROP POLICY IF EXISTS "Users view org profiles" ON public.profiles;
DROP POLICY IF EXISTS "Org view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Super Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

-- 4. CREATE NEW CLEAN POLICIES
-- a) Select: Own Profile (Fastest, no subquery)
CREATE POLICY "profiles_select_self" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- b) Select: Org Members (Uses safe function to break recursion)
CREATE POLICY "profiles_select_org" ON public.profiles
FOR SELECT USING (organization_id = get_auth_org_id_safe());

-- c) Select: Super Admin Bypass
CREATE POLICY "profiles_select_super" ON public.profiles
FOR SELECT USING (is_super_admin_safe());

-- d) Update: Own Profile
CREATE POLICY "profiles_update_self" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

-- 5. RE-SYNC PERMISSIONS
UPDATE public.profiles 
SET is_super_admin = TRUE, role = 'admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'medalha25@gmail.com');
