-- ==============================================================================
-- KRYON SYSTEMS — DIAGNÓSTICO SOMENTE LEITURA: TENANTS, ORGANIZATIONS & PROFILES
-- BANCO: Sistemas Kryon (pgpobxvkojawrstadrel.supabase.co)
-- OBJETIVO: LEVANTAMENTO COMPLETO DA RELAÇÃO ENTRE PROFILES, ORGANIZATIONS E TENANTS
-- ==============================================================================

-- 1. Foreign Key de profiles.tenant_id
SELECT 
    '1. PROFILES FOREIGN KEYS' AS categoria,
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_schema AS foreign_table_schema, 
    ccu.table_name AS foreign_table_name, 
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints tc 
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema 
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema 
WHERE tc.table_schema = 'public' 
  AND tc.table_name = 'profiles' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- 2. Schema da Relação tenants
SELECT 
    '2. TENANTS COLUMNS' AS categoria,
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'tenants' 
ORDER BY ordinal_position;

-- 3. Estado Atual de Registros em tenants
SELECT '3. CONTAGEM TENANTS' AS categoria, COUNT(*) AS total_tenants FROM public.tenants;

-- 4. Estado Atual de Registros em organizations
SELECT '4. CONTAGEM ORGANIZATIONS' AS categoria, COUNT(*) AS total_organizations FROM public.organizations;

-- 5. Estado Atual de Registros em profiles
SELECT 
    '5. CONTAGEM PROFILES' AS categoria,
    COUNT(*) AS total_profiles, 
    COUNT(*) FILTER (WHERE tenant_id IS NOT NULL) AS profiles_with_tenant 
FROM public.profiles;

-- 6. Definição do Trigger handle_new_organization_owner
SELECT 
    '6. FUNCAO TRIGGER OWNER' AS categoria,
    p.proname AS function_name, 
    pg_get_functiondef(p.oid) AS function_definition 
FROM pg_proc p 
JOIN pg_namespace n ON n.oid = p.pronamespace 
WHERE n.nspname = 'public' 
  AND p.proname = 'handle_new_organization_owner';

-- 7. Triggers Ativos na Tabela organizations
SELECT 
    '7. TRIGGERS EM ORGANIZATIONS' AS categoria,
    trigger_name, 
    event_manipulation, 
    action_timing, 
    action_statement 
FROM information_schema.triggers 
WHERE event_object_schema = 'public' 
  AND event_object_table = 'organizations' 
ORDER BY trigger_name;

-- 8. Tipo da Relação tenants (Tabela Física ou View)
SELECT 
    '8. TIPO DE RELACAO TENANTS' AS categoria,
    c.relname, 
    CASE c.relkind 
        WHEN 'r' THEN 'BASE TABLE (Tabela Física)' 
        WHEN 'v' THEN 'VIEW (Visão)' 
        WHEN 'm' THEN 'MATERIALIZED VIEW' 
        ELSE c.relkind::text 
    END AS relation_type 
FROM pg_class c 
JOIN pg_namespace n ON n.oid = c.relnamespace 
WHERE n.nspname = 'public' 
  AND c.relname = 'tenants';
