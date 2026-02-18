-- CORRECTION for RLS Recursion
-- We must DROP the old recursive policy which is causing the error.
-- The policy name found in migrations is "Members view members".

DROP POLICY IF EXISTS "Members view members" ON public.organization_members;

-- Ensure our new safe policy exists (if you ran the previous script, this is fine to run again)
-- If you haven't ran it, this creates it.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'organization_members' 
        AND policyname = 'Users can view own membership'
    ) THEN
        CREATE POLICY "Users can view own membership" ON public.organization_members
            FOR SELECT USING (
                user_id = auth.uid()
            );
    END IF;
END
$$;
