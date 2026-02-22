-- MASTER FIX: CONCRETE ERP TABLES CONSOLIDATION
-- Order of execution matters due to Foreign Keys

-- 1. ORÇAMENTOS (Budgets)
CREATE TABLE IF NOT EXISTS erp_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES erp_clients(id),
    numero_orcamento SERIAL,
    valor_total DECIMAL(12,2) DEFAULT 0,
    custo_total DECIMAL(12,2) DEFAULT 0,
    lucro_total DECIMAL(12,2) DEFAULT 0,
    status TEXT CHECK (status IN ('rascunho', 'enviado', 'aprovado', 'cancelado')) DEFAULT 'rascunho',
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS erp_budget_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orcamento_id UUID REFERENCES erp_budgets(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES erp_products(id),
    quantidade_m3 DECIMAL(12,4) NOT NULL,
    preco_unitario DECIMAL(12,2) NOT NULL,
    custo_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    custo_subtotal DECIMAL(12,2) NOT NULL,
    lucro_item DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PEDIDOS (Orders)
CREATE TABLE IF NOT EXISTS erp_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    orcamento_id UUID REFERENCES erp_budgets(id) ON DELETE SET NULL,
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

-- 3. NOTAS FISCAIS (Invoices)
CREATE TABLE IF NOT EXISTS erp_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    numero_nota INTEGER NOT NULL,
    serie TEXT DEFAULT '1',
    pedido_id UUID REFERENCES erp_orders(id),
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
    UNIQUE(organization_id, numero_nota, serie)
);

-- RLS POLICIES
ALTER TABLE erp_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_invoices ENABLE ROW LEVEL SECURITY;

-- SIMPLE ORGANIZATION FILTER POLICY TEMPLATE
-- Budgets
CREATE POLICY "Users browse own budgets" ON erp_budgets FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users write own budgets" ON erp_budgets FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Orders
CREATE POLICY "Users browse own orders" ON erp_orders FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users write own orders" ON erp_orders FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Invoices
CREATE POLICY "Users browse own invoices" ON erp_invoices FOR SELECT USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users write own invoices" ON erp_invoices FOR ALL USING (organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid()));

-- Sub-items access (simplificado)
CREATE POLICY "Access budget items" ON erp_budget_items FOR ALL USING (true);
CREATE POLICY "Access order items" ON erp_order_items FOR ALL USING (true);

-- Permissions
GRANT ALL ON erp_budgets TO authenticated;
GRANT ALL ON erp_budget_items TO authenticated;
GRANT ALL ON erp_orders TO authenticated;
GRANT ALL ON erp_order_items TO authenticated;
GRANT ALL ON erp_invoices TO authenticated;
