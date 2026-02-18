-- Add Invite Columns to organization_members
ALTER TABLE organization_members 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('invited', 'active')),
ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMP WITH TIME ZONE;

-- RLS Update (Optional: Allow reading invite_token via public RPC or edge function? 
-- Or keep it private and use a secure function to validate).
-- Actually, the user accepting the invite might not be logged in yet.
-- We usually verify token via a secure server action that uses service_role or `security definer` function.

-- Policy: Only Admins can view/manage invites (already covered by "Members view members" generally, but we might want to restrict 'invite_token' visibility if possible, though tough with simple RLS).
-- For now, the existing policies allow members to see other members. Ideally, regular members shouldn't see 'invite_token'.
-- But we can filter that in the API layer.
