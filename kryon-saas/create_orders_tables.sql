-- SQL: ERP Orders Module

CREATE TABLE IF NOT EXISTS erp_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    orcamento_id UUID REFERENCES erp_budgets(id),
    cliente_id UUID REFERENCES erp_clients(id),
    numero_pedido SERIAL,
    valor_total DECIMAL(12,2) DEFAULT 0,
    status TEXT CHECK (status IN ('pendente', 'em_producao', 'pronto', 'entregue', 'cancelado')) DEFAULT 'pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID REFERENCES erp_orders(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES erp_products(id),
    quantidade_m3 DECIMAL(12,4) NOT NULL,
    preco_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policies
ALTER TABLE erp_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization's orders"
    ON erp_orders FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert their organization's orders"
    ON erp_orders FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update their organization's orders"
    ON erp_orders FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- Items logic
CREATE POLICY "Users can view their organization's order items"
    ON erp_order_items FOR SELECT
    USING (pedido_id IN (
        SELECT id FROM erp_orders WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can insert their organization's order items"
    ON erp_order_items FOR INSERT
    WITH CHECK (pedido_id IN (
        SELECT id FROM erp_orders WHERE organization_id IN (
            SELECT organization_id FROM profiles WHERE id = auth.uid()
        )
    ));
