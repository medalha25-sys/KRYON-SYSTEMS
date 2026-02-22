-- MODULE: Accounts Receivable (Financeiro)

-- Table for Accounts Receivable
CREATE TABLE IF NOT EXISTS erp_accounts_receivable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES erp_clients(id),
    pedido_id UUID REFERENCES erp_orders(id),
    entrega_id UUID REFERENCES erp_deliveries(id),
    valor DECIMAL(12,2) NOT NULL,
    data_emissao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_vencimento TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT CHECK (status IN ('pendente', 'pago', 'vencido')) DEFAULT 'pendente',
    forma_pagamento TEXT,
    data_pagamento TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE erp_accounts_receivable ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their organization's accounts receivable"
    ON erp_accounts_receivable FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert accounts receivable for their organization"
    ON erp_accounts_receivable FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update their organization's accounts receivable"
    ON erp_accounts_receivable FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
    ));

-- Function to handle status auto-update on select (or we can use a periodic cron, but simple logic in actions.ts is easier)
-- For the sake of automation, let's create a view or a function that checks for expired titles
CREATE OR REPLACE FUNCTION update_expired_status() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'pendente' AND NEW.data_vencimento < NOW() THEN
        NEW.status := 'vencido';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_expired_ar
BEFORE INSERT OR UPDATE ON erp_accounts_receivable
FOR EACH ROW
EXECUTE FUNCTION update_expired_status();
