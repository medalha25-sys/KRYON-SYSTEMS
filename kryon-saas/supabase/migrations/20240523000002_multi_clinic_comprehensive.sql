-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ensure Organizations Tables Exist
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan_type TEXT DEFAULT 'free',
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'professional', 'secretary')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(organization_id, user_id)
);

-- 2. Ensure Agenda Tables Exist (Schema Synchronization)

-- agenda_clients
CREATE TABLE IF NOT EXISTS agenda_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  tenant_id UUID REFERENCES auth.users(id) -- Legacy field, kept for compatibility
);

-- agenda_services
CREATE TABLE IF NOT EXISTS agenda_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  tenant_id UUID REFERENCES auth.users(id)
);

-- agenda_professionals
CREATE TABLE IF NOT EXISTS agenda_professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  specialty TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  tenant_id UUID REFERENCES auth.users(id)
);

-- agenda_appointments
CREATE TABLE IF NOT EXISTS agenda_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES agenda_clients(id),
  service_id UUID REFERENCES agenda_services(id),
  professional_id UUID REFERENCES agenda_professionals(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  product_slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  tenant_id UUID REFERENCES auth.users(id)
);

-- agenda_work_schedules
CREATE TABLE IF NOT EXISTS agenda_work_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES agenda_professionals(id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL, -- 0=Sun, 6=Sat
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_start TIME,
  break_end TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  tenant_id UUID REFERENCES auth.users(id)
);

-- 3. Add organization_id to Agenda tables (Multi-Clinic Migration)
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

-- 4. Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_work_schedules ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Idempotent: Drop before create)

-- Organizations
DROP POLICY IF EXISTS "Users can view own organizations" ON organizations;
CREATE POLICY "Users can view own organizations" ON organizations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM organization_members WHERE organization_members.organization_id = organizations.id AND organization_members.user_id = auth.uid())
  );

-- Organization Members
DROP POLICY IF EXISTS "Members view members" ON organization_members;
CREATE POLICY "Members view members" ON organization_members
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

-- Agenda Tables Policies
-- agenda_clients
DROP POLICY IF EXISTS "Org members view clients" ON agenda_clients;
CREATE POLICY "Org members view clients" ON agenda_clients
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );
  
DROP POLICY IF EXISTS "Org members manage clients" ON agenda_clients;
CREATE POLICY "Org members manage clients" ON agenda_clients
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

-- agenda_appointments
DROP POLICY IF EXISTS "Org members view appointments" ON agenda_appointments;
CREATE POLICY "Org members view appointments" ON agenda_appointments
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Org members manage appointments" ON agenda_appointments;
CREATE POLICY "Org members manage appointments" ON agenda_appointments
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );
  
-- agenda_services
DROP POLICY IF EXISTS "Org members view services" ON agenda_services;
CREATE POLICY "Org members view services" ON agenda_services
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Org members manage services" ON agenda_services;
CREATE POLICY "Org members manage services" ON agenda_services
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );
  
-- agenda_professionals
DROP POLICY IF EXISTS "Org members view professionals" ON agenda_professionals;
CREATE POLICY "Org members view professionals" ON agenda_professionals
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Org members manage professionals" ON agenda_professionals;
CREATE POLICY "Org members manage professionals" ON agenda_professionals
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );
  
-- agenda_work_schedules
DROP POLICY IF EXISTS "Org members view schedules" ON agenda_work_schedules;
CREATE POLICY "Org members view schedules" ON agenda_work_schedules
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Org members manage schedules" ON agenda_work_schedules;
CREATE POLICY "Org members manage schedules" ON agenda_work_schedules
  FOR ALL USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
  );
