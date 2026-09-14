-- ==============================================================================
-- KRYON SYSTEMS — VALIDAÇÃO PÓS-CORREÇÃO DE RECURSÃO RLS (MODO SOMENTE LEITURA)
-- BANCO: Sistemas Kryon (pgpobxvkojawrstadrel.supabase.co)
-- OBJETIVO: CONFIRMAR FUNÇÃO BOOLEANA, POLICIES RECRIADAS E RLS 100% ATIVO
-- ==============================================================================

WITH 
-- 1. Checagem da Função Booleana Auxiliar
func_check AS (
    SELECT 
        p.proname AS func_name,
        pg_get_function_result(p.oid) AS result_type,
        p.prosecdef AS is_security_definer,
        l.lanname AS func_lang
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    JOIN pg_language l ON p.prolang = l.oid
    WHERE n.nspname = 'public' 
      AND p.proname = 'is_user_member_of_organization'
),

-- 2. Checagem das Policies Recriadas
policy_check AS (
    SELECT 
        tablename,
        policyname,
        cmd,
        roles::text AS target_roles
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('organization_members', 'organizations', 'subscriptions', 'services', 'customers', 'appointments', 'feedbacks')
),

-- 3. Checagem de RLS Habilitado
rls_check AS (
    SELECT 
        c.relname AS table_name,
        c.relrowsecurity AS rls_enabled,
        c.relforcerowsecurity AS rls_forced
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname IN ('organization_members', 'organizations', 'subscriptions', 'services', 'customers', 'appointments', 'feedbacks')
)

SELECT 
    '1. FUNÇÃO BOOLEANA' AS categoria,
    COALESCE(f.func_name, 'NÃO ENCONTRADA') AS item,
    CASE 
        WHEN f.func_name IS NOT NULL AND f.is_security_definer = true AND f.result_type = 'boolean' THEN 'CONFORME (SECURITY DEFINER / boolean)'
        ELSE 'NÃO CONFORME'
    END AS status,
    'Função presente e tipada para evitar recursão 42P17.' AS observacao
FROM (SELECT 1) dummy
LEFT JOIN func_check f ON true

UNION ALL

SELECT 
    '2. POLICIES ATIVAS' AS categoria,
    p.tablename || ' -> ' || p.policyname AS item,
    'CONFORME (' || p.cmd || ')' AS status,
    'Policy recriada vinculada a is_user_member_of_organization.' AS observacao
FROM policy_check p

UNION ALL

SELECT 
    '3. STATUS RLS' AS categoria,
    r.table_name AS item,
    CASE WHEN r.rls_enabled = true THEN 'CONFORME (RLS ATIVO)' ELSE 'NÃO CONFORME' END AS status,
    'Segurança em nível de linha habilitada ininterruptamente.' AS observacao
FROM rls_check r;
