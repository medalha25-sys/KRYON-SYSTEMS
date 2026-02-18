-- Add logo_url and white_label_enabled to organizations
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS white_label_enabled BOOLEAN DEFAULT false;

-- Storage Policy Update (if using Supabase Storage)
-- We need a bucket 'organization-logos' or similar.
-- Ensuring bucket exists is usually done via API/Dashboard, but we can try to insert into storage.buckets?
-- Supabase Storage policies needed.

-- For now, just the column.
