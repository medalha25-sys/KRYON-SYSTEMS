-- Criar tabela de caminhões
CREATE TABLE IF NOT EXISTS public.erp_trucks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    placa TEXT NOT NULL,
    modelo TEXT NOT NULL,
    capacidade_m3 DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'manutencao', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Criar tabela de motoristas
CREATE TABLE IF NOT EXISTS public.erp_drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    telefone TEXT,
    cnh TEXT,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Criar tabela de entregas
CREATE TABLE IF NOT EXISTS public.erp_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    ordem_producao_id UUID REFERENCES public.erp_production_orders(id) ON DELETE SET NULL,
    caminhao_id UUID REFERENCES public.erp_trucks(id) ON DELETE SET NULL,
    motorista_id UUID REFERENCES public.erp_drivers(id) ON DELETE SET NULL,
    data_saida TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    data_entrega TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_transporte', 'entregue', 'cancelada')),
    volume_transportado_m3 DECIMAL(10,3) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.erp_trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_deliveries ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Caminhões
CREATE POLICY "Users can view their organization's trucks"
    ON public.erp_trucks FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their organization's trucks"
    ON public.erp_trucks FOR ALL
    WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Políticas de RLS para Motoristas
CREATE POLICY "Users can view their organization's drivers"
    ON public.erp_drivers FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their organization's drivers"
    ON public.erp_drivers FOR ALL
    WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Políticas de RLS para Entregas
CREATE POLICY "Users can view their organization's deliveries"
    ON public.erp_deliveries FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their organization's deliveries"
    ON public.erp_deliveries FOR ALL
    WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Grant permissions
GRANT ALL ON public.erp_trucks TO authenticated;
GRANT ALL ON public.erp_drivers TO authenticated;
GRANT ALL ON public.erp_deliveries TO authenticated;
