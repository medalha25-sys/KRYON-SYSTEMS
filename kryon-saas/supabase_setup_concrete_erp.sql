-- Create erp_concrete_mixes table
CREATE TABLE IF NOT EXISTS erp_concrete_mixes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL, -- e.g., FCK30-S10
    name TEXT NOT NULL, -- e.g., Concreto FCK 30 MPA Slump 10
    fck_value INTEGER, -- MPA
    slump_value INTEGER, -- mm
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for erp_concrete_mixes
ALTER TABLE erp_concrete_mixes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view mixes in their organization" ON erp_concrete_mixes
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage mixes in their organization" ON erp_concrete_mixes
    FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Create erp_concrete_trucks table
CREATE TABLE IF NOT EXISTS erp_concrete_trucks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plate TEXT NOT NULL,
    model TEXT,
    capacity_m3 DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'in_delivery', 'loading')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for erp_concrete_trucks
ALTER TABLE erp_concrete_trucks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view trucks in their organization" ON erp_concrete_trucks
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage trucks in their organization" ON erp_concrete_trucks
    FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Create erp_concrete_orders table
CREATE TABLE IF NOT EXISTS erp_concrete_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    order_number SERIAL,
    client_name TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    mix_id UUID REFERENCES erp_concrete_mixes(id),
    volume_m3 DECIMAL(10,2) NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_production', 'delivering', 'completed', 'canceled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for erp_concrete_orders
ALTER TABLE erp_concrete_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view orders in their organization" ON erp_concrete_orders
    FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage orders in their organization" ON erp_concrete_orders
    FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Register the new product
INSERT INTO products (slug, name, description, active)
VALUES ('concrete-erp', 'Concrete ERP Brasil', 'Sistema especializado para concreteiras: gestão de traços, frota e logística de entrega.', true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Grant permissions
GRANT ALL ON erp_concrete_mixes TO authenticated;
GRANT ALL ON erp_concrete_trucks TO authenticated;
GRANT ALL ON erp_concrete_orders TO authenticated;
