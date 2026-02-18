-- 20260217000009_fix_rls.sql

-- Fix RLS Recursion on organization_members
-- The existing policy "Members view members" might cause recursion when a user tries to list their own memberships.
-- We add a simple policy for users to always see their OWN rows.

DROP POLICY IF EXISTS "Users can view own membership" ON public.organization_members;
CREATE POLICY "Users can view own membership" ON public.organization_members
    FOR SELECT USING (
        user_id = auth.uid()
    );

-- Ensure "Members view members" avoids infinite recursion if possible, but the above policy covers the "list my orgs" case perfectly.
-- The "Members view members" is useful to see *other* members in the same org.

-- Let's also ensure organizations are visible.
-- The existing policy uses EXISTS with organization_members. With the new policy above, that check should be stable.

-- Optional: Fix potential issue with profiles RLS if not exists
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (id = auth.uid());
