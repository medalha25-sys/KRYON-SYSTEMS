-- ==============================================================================
-- KRYON SYSTEMS SAAS — APLICAÇÃO DE NOT NULL EM public.customers.tenant_id
-- BANCO: Sistemas Kryon (pgpobxvkojawrstadrel.supabase.co)
-- DATA: 05/09/2026
-- ESCOPO: Exclusivamente public.customers.tenant_id
-- ==============================================================================

-- 1. VERIFICAÇÃO DEFENSIVA DE PRÉ-CONDIÇÃO (BLOQUEIA SE HOUVER NULOS)
DO $$
DECLARE
    v_null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_null_count 
    FROM public.customers 
    WHERE tenant_id IS NULL;
    
    IF v_null_count > 0 THEN
        RAISE EXCEPTION 'ABORTANDO: Foram encontrados % registros com tenant_id NULL em public.customers. Nenhuma alteração foi realizada.', v_null_count;
    ELSE
        RAISE NOTICE 'PRÉ-CONDIÇÃO ATENDIDA: 0 registros com tenant_id NULL em public.customers. Prosseguindo com ALTER TABLE.';
    END IF;
END $$;

-- 2. APLICAÇÃO ATÔMICA DA CONSTRAINT NOT NULL
ALTER TABLE public.customers 
    ALTER COLUMN tenant_id SET NOT NULL;

-- 3. VERIFICAÇÃO PÓS-EXECUÇÃO (CONFIRMAÇÃO DO SCHEMA)
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'customers' 
  AND column_name = 'tenant_id';
