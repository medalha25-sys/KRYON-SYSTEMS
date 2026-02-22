-- Criar tabela de ordens de produção
CREATE TABLE IF NOT EXISTS public.erp_production_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    pedido_id UUID REFERENCES public.erp_orders(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES public.erp_products(id) ON DELETE CASCADE,
    quantidade_m3 DECIMAL(10,3) NOT NULL,
    data_producao TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    status TEXT DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'produzindo', 'finalizado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.erp_production_orders ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Users can view their organization's production orders"
    ON public.erp_production_orders FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can insert production orders for their organization"
    ON public.erp_production_orders FOR INSERT
    WITH CHECK (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

CREATE POLICY "Users can update their organization's production orders"
    ON public.erp_production_orders FOR UPDATE
    USING (organization_id IN (
        SELECT organization_id FROM public.profiles WHERE id = auth.uid()
    ));

-- Grant permissions
GRANT ALL ON public.erp_production_orders TO authenticated;
GRANT ALL ON public.erp_production_orders TO service_role;
