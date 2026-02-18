-- Add columns to agenda_clients
ALTER TABLE agenda_clients
ADD COLUMN IF NOT EXISTS consent_lgpd BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Create index for search
CREATE INDEX IF NOT EXISTS idx_agenda_clients_search ON agenda_clients(name, cpf, email, phone);

-- Update RLS Policies for agenda_clients

-- Drop existing generic policy
DROP POLICY IF EXISTS "Org view clients" ON agenda_clients;

-- Helpers
-- (Assuming get_auth_organization_id is already defined)

-- 1. Admin & Secretary: View/Edit ALL in Organization
CREATE POLICY "Admin/Secretary full access clients" ON agenda_clients
FOR ALL
USING (
    organization_id = get_auth_organization_id() 
    AND (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'secretary')
        )
    )
);

-- 2. Professional: View ONLY Linked Clients (appointments exists)
-- Logic: Can view if they have at least one appointment with this client.
-- OR if they created the client? (Maybe not needed if secretary creates).
CREATE POLICY "Professional view linked clients" ON agenda_clients
FOR SELECT
USING (
    organization_id = get_auth_organization_id()
    AND (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'professional'
        )
    )
    AND (
        EXISTS (
            SELECT 1 FROM agenda_appointments 
            WHERE client_id = agenda_clients.id 
            AND professional_id = auth.uid()
        )
    )
);

-- 3. Professional: Insert/Update? 
-- If a Professional creates an appointment for a NEW client, they need to create the client.
-- Allowing INSERT for Professionals in their Org.
CREATE POLICY "Professional insert clients" ON agenda_clients
FOR INSERT
WITH CHECK (
    organization_id = get_auth_organization_id()
    AND (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'professional'
        )
    )
);

-- 4. Professional: Update Linked Clients?
CREATE POLICY "Professional update linked clients" ON agenda_clients
FOR UPDATE
USING (
    organization_id = get_auth_organization_id()
    AND (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'professional'
        )
    )
    AND (
        EXISTS (
            SELECT 1 FROM agenda_appointments 
            WHERE client_id = agenda_clients.id 
            AND professional_id = auth.uid()
        )
    )
);
