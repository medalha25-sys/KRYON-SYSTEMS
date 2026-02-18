-- Add missing logo_url column to organizations table
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Also add it to the select query policy if needed, but RLS is per row/table, not column usually (unless security definer function), 
-- but we just need the column to exist.
