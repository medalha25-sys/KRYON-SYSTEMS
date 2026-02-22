-- Módulo de Controle de Estoque de Matérias-Primas

-- 1. Tabela de Matérias-Primas
CREATE TABLE IF NOT EXISTS public.erp_raw_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    unidade TEXT NOT NULL CHECK (unidade IN ('kg', 'm3', 'litro', 'unidade')),
    estoque_atual DECIMAL(12,3) DEFAULT 0,
    estoque_minimo DECIMAL(12,3) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela de Receitas de Produção (Traço)
CREATE TABLE IF NOT EXISTS public.erp_production_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID REFERENCES public.erp_products(id) ON DELETE CASCADE,
    materia_prima_id UUID REFERENCES public.erp_raw_materials(id) ON DELETE CASCADE,
    quantidade_por_m3 DECIMAL(12,4) NOT NULL, -- Quanto deste insumo vai em 1m3 do produto
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(produto_id, materia_prima_id)
);

-- 3. Tabela de Movimentações de Estoque
CREATE TABLE IF NOT EXISTS public.erp_inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    materia_prima_id UUID REFERENCES public.erp_raw_materials(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    quantidade DECIMAL(12,3) NOT NULL,
    referencia_id UUID, -- Pode ser ID de Ordem de Produção ou Compra
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.erp_raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_production_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.erp_inventory_movements ENABLE ROW LEVEL SECURITY;

-- Políticas para Matérias-Primas
CREATE POLICY "Users can view their organization's raw materials"
    ON public.erp_raw_materials FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their organization's raw materials"
    ON public.erp_raw_materials FOR ALL
    WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Políticas para Movimentações
CREATE POLICY "Users can view their organization's inventory movements"
    ON public.erp_inventory_movements FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can manage their organization's inventory movements"
    ON public.erp_inventory_movements FOR ALL
    WITH CHECK (organization_id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid()));

-- Políticas para Receitas (Visíveis para todos da mesma org via produto_id)
CREATE POLICY "Users can view recipes for their organization's products"
    ON public.erp_production_recipes FOR SELECT
    USING (produto_id IN (
        SELECT id FROM public.erp_products WHERE organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    ));

CREATE POLICY "Users can manage recipes for their organization's products"
    ON public.erp_production_recipes FOR ALL
    WITH CHECK (produto_id IN (
        SELECT id FROM public.erp_products WHERE organization_id IN (
            SELECT organization_id FROM public.profiles WHERE id = auth.uid()
        )
    ));
