-- 1. CLIENTES (erp_clients)
CREATE TABLE IF NOT EXISTS erp_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('interno', 'externo')) DEFAULT 'externo',
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS erp_clients
ALTER TABLE erp_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view clients in their organization" ON erp_clients FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage clients in their organization" ON erp_clients FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- 2. PRODUTOS (erp_products)
CREATE TABLE IF NOT EXISTS erp_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price_m3 DECIMAL(10,2) DEFAULT 0,
    cost_m3 DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS erp_products
ALTER TABLE erp_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view products in their organization" ON erp_products FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage products in their organization" ON erp_products FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- 3. ORÇAMENTOS (erp_quotes)
CREATE TABLE IF NOT EXISTS erp_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_id UUID REFERENCES erp_clients(id) ON DELETE SET NULL,
    product_id UUID REFERENCES erp_products(id) ON DELETE SET NULL,
    
    -- Dimensions
    length FLOAT DEFAULT 0,
    width FLOAT DEFAULT 0,
    height FLOAT DEFAULT 0,
    volume_m3 FLOAT DEFAULT 0,
    
    -- Pricing
    unit_price DECIMAL(10,2) DEFAULT 0,
    km DECIMAL(10,2) DEFAULT 0,
    km_rate DECIMAL(10,2) DEFAULT 0,
    freight_value DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    estimated_profit DECIMAL(10,2) DEFAULT 0,
    
    -- Metadata
    status TEXT CHECK (status IN ('pendente', 'fechado', 'perdido', 'negociacao')) DEFAULT 'pendente',
    loss_reason TEXT,
    signature_base64 TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS erp_quotes
ALTER TABLE erp_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view quotes in their organization" ON erp_quotes FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage quotes in their organization" ON erp_quotes FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- 4. ENTREGAS (erp_deliveries)
CREATE TABLE IF NOT EXISTS erp_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    quote_id UUID REFERENCES erp_quotes(id) ON DELETE CASCADE,
    delivery_date TIMESTAMPTZ,
    status TEXT CHECK (status IN ('programada', 'transporte', 'entregue', 'cancelada')) DEFAULT 'programada',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS erp_deliveries
ALTER TABLE erp_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view deliveries in their organization" ON erp_deliveries FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage deliveries in their organization" ON erp_deliveries FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- 5. ESTOQUE (erp_inventory)
CREATE TABLE IF NOT EXISTS erp_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity FLOAT DEFAULT 0,
    unit TEXT, -- e.g. kg, t, m3
    min_stock FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS erp_inventory
ALTER TABLE erp_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view inventory in their organization" ON erp_inventory FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can manage inventory in their organization" ON erp_inventory FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- 6. TRIGGER: Auto-create delivery when quote is closed
CREATE OR REPLACE FUNCTION auto_create_delivery()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'fechado' AND (OLD.status IS NULL OR OLD.status != 'fechado')) THEN
        INSERT INTO erp_deliveries (organization_id, quote_id, status)
        VALUES (NEW.organization_id, NEW.id, 'programada');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_create_delivery
    AFTER UPDATE ON erp_quotes
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_delivery();

-- 7. PERMISSIONS
GRANT ALL ON erp_clients TO authenticated;
GRANT ALL ON erp_products TO authenticated;
GRANT ALL ON erp_quotes TO authenticated;
GRANT ALL ON erp_deliveries TO authenticated;
GRANT ALL ON erp_inventory TO authenticated;
