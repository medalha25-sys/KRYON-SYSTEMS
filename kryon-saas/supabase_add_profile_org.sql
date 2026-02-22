-- Add missing organization_id to profiles (for context switching)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- Refresh the schema cache (optional but good practice)
NOTIFY pgrst, 'reload config';
