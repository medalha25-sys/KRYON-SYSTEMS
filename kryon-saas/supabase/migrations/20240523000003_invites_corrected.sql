-- Create organization_invites table for pending invitations
CREATE TABLE IF NOT EXISTS organization_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'professional', 'secretary')),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  UNIQUE(organization_id, email)
);

-- RLS for invites
ALTER TABLE organization_invites ENABLE ROW LEVEL SECURITY;

-- Admins can view/create invites for their org
CREATE POLICY "Admins manage invites" ON organization_invites
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Public access to read invite by token (for checking validity on acceptance page)
-- Security: Only lookup by token, limited columns?
-- Ideally we use a secure function, but for simplicity we can allow public select on token match?
-- Dangerous if tokens are guessable (UUIDs are fine).
-- Better: Create a stored function `get_invite_by_token(token)`.

CREATE OR REPLACE FUNCTION get_invite_by_token(lookup_token TEXT)
RETURNS TABLE (
  organization_name TEXT,
  email TEXT,
  role TEXT,
  is_valid BOOLEAN
) 
SECURITY DEFINER
AS $$
DECLARE
  invite_record RECORD;
  org_name TEXT;
BEGIN
  SELECT * INTO invite_record FROM organization_invites WHERE token = lookup_token AND status = 'pending' AND expires_at > now();
  
  IF invite_record IS NULL THEN
    RETURN QUERY SELECT NULL::TEXT, NULL::TEXT, NULL::TEXT, FALSE;
  ELSE
    SELECT name INTO org_name FROM organizations WHERE id = invite_record.organization_id;
    RETURN QUERY SELECT org_name, invite_record.email, invite_record.role, TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql;
