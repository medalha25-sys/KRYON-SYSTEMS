-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan_type TEXT DEFAULT 'free',
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Create Organization Members Table
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'professional', 'secretary')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(organization_id, user_id)
);

-- 3. Add organization_id to Agenda tables
-- Helper function to add column safely
DO $$ 
BEGIN 
    -- agenda_clients
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_clients' AND column_name = 'organization_id') THEN
        ALTER TABLE agenda_clients ADD COLUMN organization_id UUID REFERENCES organizations(id);
    END IF;

    -- agenda_appointments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_appointments' AND column_name = 'organization_id') THEN
        ALTER TABLE agenda_appointments ADD COLUMN organization_id UUID REFERENCES organizations(id);
    END IF;

    -- agenda_professionals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_professionals' AND column_name = 'organization_id') THEN
        ALTER TABLE agenda_professionals ADD COLUMN organization_id UUID REFERENCES organizations(id);
    END IF;

    -- agenda_services
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_services' AND column_name = 'organization_id') THEN
        ALTER TABLE agenda_services ADD COLUMN organization_id UUID REFERENCES organizations(id);
    END IF;

    -- agenda_work_schedules
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'agenda_work_schedules' AND column_name = 'organization_id') THEN
        ALTER TABLE agenda_work_schedules ADD COLUMN organization_id UUID REFERENCES organizations(id);
    END IF;
END $$;

-- 4. Enable Row Level Security (if not already enabled, usually is for existing tables)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_work_schedules ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Organizations
CREATE POLICY "Users can view own organizations" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Organization Members
CREATE POLICY "Members view members" ON organization_members
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Agenda Tables Policy Template
-- "Users can view data linked to their organization"

-- agenda_clients
CREATE POLICY "Org members view clients" ON agenda_clients
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );
  
CREATE POLICY "Org members manage clients" ON agenda_clients
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- agenda_appointments
CREATE POLICY "Org members view appointments" ON agenda_appointments
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org members manage appointments" ON agenda_appointments
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Note: existing 'tenant_id' based policies might conflict or be redundant. 
-- Ideally, you should migrate to organization_id fully.
-- For now, we ADD policies. Supabase (Postgres) uses OR for multiple policies (permissive).
-- If you have Restrictive policies, that's different. Assuming default permissive.
