-- ==============================================================================
-- KRYON SYSTEMS — ETAPA 4: FORMALIZAÇÃO DO VÍNCULO ORGANIZAÇÃO x ESTABELECIMENTO
-- DATA: 14/09/2026
-- OBJETIVO: Formalizar a arquitetura relacional organizations -> shops -> lava_rapido_orders
-- MODO: NÃO-DESTRUTIVO / IDEMPOTENTE / CHAVE ESTRANGEIRA COM ON DELETE RESTRICT
-- ==============================================================================

BEGIN;

-- 1. Adicionar coluna organization_id na tabela shops (NULLABLE para compatibilidade estrita)
ALTER TABLE public.shops 
ADD COLUMN IF NOT EXISTS organization_id UUID NULL REFERENCES public.organizations(id) ON DELETE RESTRICT;

-- 2. Criar índice para alta performance em queries de relacionamento
CREATE INDEX IF NOT EXISTS idx_shops_organization_id ON public.shops(organization_id);

-- 3. Documentação estrutural da coluna
COMMENT ON COLUMN public.shops.organization_id IS 'Chave estrangeira apontando para a organização proprietária (public.organizations.id)';

-- 4. Associação unívoca e comprovável: vincular shops cuja owner_id corresponda a uma única organização
UPDATE public.shops s
SET organization_id = o.id
FROM public.organizations o
WHERE s.organization_id IS NULL
  AND s.owner_id IS NOT NULL
  AND o.owner_id = s.owner_id
  AND (
    SELECT count(*) 
    FROM public.organizations o2 
    WHERE o2.owner_id = s.owner_id
  ) = 1;

COMMIT;
