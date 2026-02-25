-- CLEANUP AND SETUP CONCRETE ERP (PROD READY)
-- WARNING: This will truncate current delivery and order data to clear conflicts.

BEGIN;

-- 1. Limpar tabelas de logística e pedidos para evitar conflitos de IDs antigos
TRUNCATE TABLE public.erp_deliveries CASCADE;
TRUNCATE TABLE public.erp_orders CASCADE;
TRUNCATE TABLE public.erp_order_items CASCADE;

-- 2. Garantir que as tabelas essenciais tenham os campos corretos (caso algum não tenha sido aplicado)
ALTER TABLE public.erp_deliveries ADD COLUMN IF NOT EXISTS motorista_id UUID REFERENCES auth.users(id);
ALTER TABLE public.erp_deliveries ADD COLUMN IF NOT EXISTS placa_caminhao TEXT;

-- 3. Resetar status de assinaturas experimentais (opcional, mas recomendado para limpeza)
-- UPDATE public.subscriptions SET status = 'active' WHERE product_slug = 'concrete-erp';

-- 4. Criar índices para performance na agenda
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON public.erp_deliveries(data_entrega);
CREATE INDEX IF NOT EXISTS idx_deliveries_org ON public.erp_deliveries(organization_id);

COMMIT;
