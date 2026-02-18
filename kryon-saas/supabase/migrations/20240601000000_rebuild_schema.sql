-- CLEAN SLATE MIGRATION (Rebuild Schema)
-- 20240601000000_rebuild_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. DROP EVERYTHING (Clean State)
DROP TABLE IF EXISTS financial_transactions CASCADE;
DROP TABLE IF EXISTS financial_categories CASCADE;
DROP TABLE IF EXISTS agenda_appointments CASCADE;
DROP TABLE IF EXISTS agenda_work_schedules CASCADE;
DROP TABLE IF EXISTS agenda_services CASCADE;
DROP TABLE IF EXISTS agenda_professionals CASCADE;
DROP TABLE IF EXISTS agenda_clients CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- 1. Core Tables: Organizations & Profiles

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    logo_url TEXT,
    white_label_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'professional', 'secretary', 'user')),
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 2. Domain Tables (Agenda)

CREATE TABLE agenda_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE agenda_professionals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialty TEXT,
    active BOOLEAN DEFAULT true,
    user_id UUID REFERENCES auth.users(id), -- Optional link to auth user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE agenda_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price DECIMAL(10,2),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE agenda_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES agenda_clients(id) ON DELETE CASCADE,
    professional_id UUID REFERENCES agenda_professionals(id) ON DELETE CASCADE,
    service_id UUID REFERENCES agenda_services(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'canceled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 3. Domain Tables (Financial)

CREATE TABLE financial_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category_id UUID REFERENCES financial_categories(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'canceled')),
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- 4. Enable RLS on ALL Tables

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Helper function to get current user's organization_id
CREATE OR REPLACE FUNCTION get_auth_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Organizations: Users can view their own organization
CREATE POLICY "Users view own organization" ON organizations
    FOR SELECT USING (id = get_auth_organization_id());

-- Profiles: Users can view profiles in their organization (and their own)
CREATE POLICY "Users view org profiles" ON profiles
    FOR SELECT USING (organization_id = get_auth_organization_id() OR id = auth.uid());

CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Agenda Clients
CREATE POLICY "Org view clients" ON agenda_clients
    FOR SELECT USING (organization_id = get_auth_organization_id());
CREATE POLICY "Org manage clients" ON agenda_clients
    FOR ALL USING (organization_id = get_auth_organization_id());

-- Agenda Professionals
CREATE POLICY "Org view professionals" ON agenda_professionals
    FOR SELECT USING (organization_id = get_auth_organization_id());
CREATE POLICY "Org manage professionals" ON agenda_professionals
    FOR ALL USING (organization_id = get_auth_organization_id());

-- Agenda Services
CREATE POLICY "Org view services" ON agenda_services
    FOR SELECT USING (organization_id = get_auth_organization_id());
CREATE POLICY "Org manage services" ON agenda_services
    FOR ALL USING (organization_id = get_auth_organization_id());

-- Agenda Appointments
CREATE POLICY "Org view appointments" ON agenda_appointments
    FOR SELECT USING (organization_id = get_auth_organization_id());
CREATE POLICY "Org manage appointments" ON agenda_appointments
    FOR ALL USING (organization_id = get_auth_organization_id());

-- Financial Categories
CREATE POLICY "Org view categories" ON financial_categories
    FOR SELECT USING (organization_id = get_auth_organization_id());
CREATE POLICY "Org manage categories" ON financial_categories
    FOR ALL USING (organization_id = get_auth_organization_id());

-- Financial Transactions
CREATE POLICY "Org view transactions" ON financial_transactions
    FOR SELECT USING (organization_id = get_auth_organization_id());
CREATE POLICY "Org manage transactions" ON financial_transactions
    FOR ALL USING (organization_id = get_auth_organization_id());

-- 6. Storage Bucket Setup (via SQL is tricky, usually API, but we can set policies)
-- Assuming bucket 'organization-assets' exists.

-- Policy for Storage objects (Conceptual, requires actual bucket creation in dashboard)
-- CREATE POLICY "Org read assets" ON storage.objects FOR SELECT USING ( bucket_id = 'organization-assets' AND (storage.foldername(name))[1] = get_auth_organization_id()::text );
-- CREATE POLICY "Org upload assets" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'organization-assets' AND (storage.foldername(name))[1] = get_auth_organization_id()::text );
