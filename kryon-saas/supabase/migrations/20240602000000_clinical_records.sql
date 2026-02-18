-- 20240602000000_clinical_records.sql

CREATE TABLE clinical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES agenda_clients(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES agenda_professionals(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES agenda_appointments(id) ON DELETE SET NULL,
    content JSONB DEFAULT '{}'::jsonb, -- Structured data: anamnesis, diagnosis, etc.
    free_notes TEXT, -- Free text notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable RLS
ALTER TABLE clinical_records ENABLE ROW LEVEL SECURITY;

-- Policies
-- Reuse get_auth_organization_id() from previous migrations

CREATE POLICY "Org view clinical_records" ON clinical_records
    FOR SELECT USING (organization_id = get_auth_organization_id());

CREATE POLICY "Org manage clinical_records" ON clinical_records
    FOR ALL USING (organization_id = get_auth_organization_id());

-- Create index for faster lookups
CREATE INDEX idx_clinical_records_client_id ON clinical_records(client_id);
CREATE INDEX idx_clinical_records_appointment_id ON clinical_records(appointment_id);
