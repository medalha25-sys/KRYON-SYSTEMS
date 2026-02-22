-- Create law_cases table
CREATE TABLE IF NOT EXISTS law_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    case_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    client_name TEXT NOT NULL,
    court TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for law_cases
ALTER TABLE law_cases ENABLE ROW LEVEL SECURITY;

-- Policies for law_cases
CREATE POLICY "Users can view cases in their organization" ON law_cases
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert cases in their organization" ON law_cases
    FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update cases in their organization" ON law_cases
    FOR UPDATE USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Create law_deadlines table
CREATE TABLE IF NOT EXISTS law_deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    case_id UUID REFERENCES law_cases(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for law_deadlines
ALTER TABLE law_deadlines ENABLE ROW LEVEL SECURITY;

-- Policies for law_deadlines
CREATE POLICY "Users can view deadlines in their organization" ON law_deadlines
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert deadlines in their organization" ON law_deadlines
    FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update deadlines in their organization" ON law_deadlines
    FOR UPDATE USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Create law_documents table
CREATE TABLE IF NOT EXISTS law_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    case_id UUID REFERENCES law_cases(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    size INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for law_documents
ALTER TABLE law_documents ENABLE ROW LEVEL SECURITY;

-- Policies for law_documents
CREATE POLICY "Users can view documents in their organization" ON law_documents
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can insert documents in their organization" ON law_documents
    FOR INSERT WITH CHECK (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Register the new product
INSERT INTO products (slug, name, description, active)
VALUES ('kryon-law', 'Kryon Law', 'Sistema de gestão jurídica completo com controle de processos, prazos e documentos.', true)
ON CONFLICT (slug) DO NOTHING;

-- Grant permissions to authenticated users
GRANT ALL ON law_cases TO authenticated;
GRANT ALL ON law_deadlines TO authenticated;
GRANT ALL ON law_documents TO authenticated;
