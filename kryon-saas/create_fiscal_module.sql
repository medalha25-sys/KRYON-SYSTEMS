-- SQL: ERP Fiscal Module

CREATE TABLE IF NOT EXISTS erp_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    numero_nota INTEGER NOT NULL,
    serie TEXT DEFAULT '1',
    pedido_id UUID REFERENCES erp_orders(id),
    entrega_id UUID REFERENCES erp_deliveries(id),
    cliente_id UUID REFERENCES erp_clients(id),
    valor_total DECIMAL(12,2) NOT NULL,
    valor_icms DECIMAL(12,2) DEFAULT 0,
    valor_pis DECIMAL(12,2) DEFAULT 0,
    valor_cofins DECIMAL(12,2) DEFAULT 0,
    valor_iss DECIMAL(12,2) DEFAULT 0,
    status TEXT CHECK (status IN ('emitida', 'cancelada')) DEFAULT 'emitida',
    xml_gerado TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure uniqueness of note number per series and organization
    UNIQUE(organization_id, numero_nota, serie)
);

-- Policies
ALTER TABLE erp_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's invoices"
    ON erp_invoices FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert their organization's invoices"
    ON erp_invoices FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- Grant access to public (for simulated downloads if needed) or restricted as usual
