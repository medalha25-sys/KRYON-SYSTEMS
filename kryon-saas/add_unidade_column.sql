-- Adicionar coluna de unidade na tabela de produtos
ALTER TABLE public.erp_products 
ADD COLUMN IF NOT EXISTS unidade TEXT DEFAULT 'm³';

-- Comentário para clareza
COMMENT ON COLUMN public.erp_products.unidade IS 'Unidade de medida do produto (ex: m³, un, kg)';
