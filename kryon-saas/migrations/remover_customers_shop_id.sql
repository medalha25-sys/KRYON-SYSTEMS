-- =================================================================================
-- MIGRAÇÃO TRANSACIONAL: REMOÇÃO DA DEPENDÊNCIA LEGADA CUSTOMERS.SHOP_ID
-- AMBIENTE: Sistemas Kryon (Produção Supabase - pgpobxvkojawrstadrel.supabase.co)
-- DATA: 05/09/2026
-- OBJETIVO: Desacoplar public.customers de public.shops para homologação multi-tenant
-- =================================================================================

BEGIN;

-- 1. Remover policy legada que utiliza shop_id
DROP POLICY IF EXISTS "Owners can manage their customers" ON public.customers;

-- 2. Remover Foreign Key para public.shops dinamicamente
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_schema = 'public'
          AND tc.table_name = 'customers'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'shops'
    ) LOOP
        EXECUTE format('ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS %I', r.constraint_name);
        RAISE NOTICE 'Constraint FK removida: %', r.constraint_name;
    END LOOP;
END $$;

-- 3. Remover a coluna shop_id de public.customers
ALTER TABLE public.customers DROP COLUMN IF EXISTS shop_id CASCADE;

-- 4. Validação Rigorosa de Sanidade e Integridade Pós-Remoção
DO $$
BEGIN
    -- [Validação 1] Validar que shop_id foi removido
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'shop_id'
    ) THEN
        RAISE EXCEPTION 'FALHA DE SANIDADE: A coluna customers.shop_id ainda existe!';
    END IF;

    -- [Validação 2] Validar que tenant_id continua existindo
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'tenant_id'
    ) THEN
        RAISE EXCEPTION 'FALHA DE SANIDADE: A coluna customers.tenant_id foi removida indevidamente!';
    END IF;

    -- [Validação 3] Validar que a FK para organizations(id) continua intacta
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_schema = 'public'
          AND tc.table_name = 'customers'
          AND tc.constraint_type = 'FOREIGN KEY'
          AND ccu.table_name = 'organizations'
    ) THEN
        RAISE EXCEPTION 'FALHA DE SANIDADE: A Foreign Key para public.organizations não foi encontrada!';
    END IF;

    -- [Validação 4] Validar que o RLS continua ativo
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = 'customers' AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'FALHA DE SANIDADE: RLS em public.customers não está habilitado!';
    END IF;

    -- [Validação 5] Validar que a policy moderna continua presente
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'customers' AND policyname = 'Membros gerenciam clientes da sua organização'
    ) THEN
        RAISE EXCEPTION 'FALHA DE SANIDADE: A policy moderna de organizations em customers não foi encontrada!';
    END IF;

    RAISE NOTICE 'SUCESSO TOTAL: public.customers agora é 100%% multi-tenant e desacoplada de shops!';
END $$;

COMMIT;
